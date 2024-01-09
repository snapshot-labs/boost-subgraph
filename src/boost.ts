import {
  Burn as BurnEvent,
  Claim as ClaimEvent,
  Deposit as DepositEvent,
  Mint as MintEvent,
} from "../generated/boost/boost"
import {
  Boost as BoostEntity,
  Claim as ClaimEntity,
  Deposit as DepositEntity,
  Distribution as DistributionEntity,
  Eligibility as EligibilityEntity,
  ProposalParams as ProposalParamsEntity,
  Proposal as ProposalEntity,
  Token as TokenEntity,
  ProposalStrategy as ProposalStrategyEntity
} from "../generated/schema"
import { erc20 } from "../generated/boost/ERC20"
import { JSONValue, TypedMap, log } from '@graphprotocol/graph-ts'
import {
  ipfs, json,
  BigInt,
} from "@graphprotocol/graph-ts";

export function handleBurn(event: BurnEvent): void {
  let boostEntity = BoostEntity.load(event.params.boostId.toHexString())
  if (boostEntity == null) {
    log.error("failed to load boost entity", [event.params.boostId.toHexString()])
    return;
  }
  boostEntity.isBurnt = true
  boostEntity.save()
}

export function handleClaim(event: ClaimEvent): void {
  let boostId = event.params.claim.boostId.toHexString()

  let entity = new ClaimEntity(
    boostId + "." + event.params.claim.recipient.toHexString()
  )

  entity.recipient = event.params.claim.recipient
  entity.amount = event.params.claim.amount
  entity.boost = boostId
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDeposit(event: DepositEvent): void {
  let entity = new DepositEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toString() // TODO
  )

  let boostId = event.params.boostId.toHexString()

  entity.boost = boostId
  entity.sender = event.params.sender
  entity.amount = event.params.amount.toString()

  let boostEntity = BoostEntity.load(boostId)
  if (boostEntity == null) {
    log.error("deposit failed to load boost entity", [boostId])
    return ;
  }
  let prev = BigInt.fromString(boostEntity.poolSize.toString());
  let poolSize = prev.plus(event.params.amount);
  boostEntity.poolSize = poolSize.toString();
  boostEntity.save();

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

function createEligibilityEntity(event: MintEvent, params: TypedMap<string, JSONValue>): EligibilityEntity | null {
  let eligibility = new EligibilityEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  let maybeEli = params.get('eligibility');
  if (maybeEli == null) return null;
  let eli = maybeEli.toObject();

  let maybeEligiblityType = eli.get('type');
  if (maybeEligiblityType == null) {
    eligibility.type = "incentive";
  } else {
    eligibility.type = maybeEligiblityType.toString();
    if (eligibility.type == "bribe") {
      let maybeChoice = params.get('choice');
      if (maybeChoice == null ) return null;
      eligibility.choice = maybeChoice.toBigInt().toI32();
    } else if (eligibility.type != "incentive") {
      log.error("unknown eligibility type", []);
      return null;
    }
  }

  eligibility.save();
  return eligibility
}

function createDistributionEntity(event: MintEvent, params: TypedMap<string, JSONValue>): DistributionEntity | null {
  let distribution = new DistributionEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  let maybeDistrib = params.get('distribution');
  if (maybeDistrib == null) return null;
  let distrib = maybeDistrib.toObject();
  let maybeDistributionType = distrib.get('type');
  if (maybeDistributionType == null) return null;
  distribution.type = maybeDistributionType.toString();

  distribution.save();
  return distribution;
}

function createProposalParamsEntity(event: MintEvent, params: TypedMap<string, JSONValue>): ProposalParamsEntity | null {
  let proposalParams = new ProposalParamsEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  let maybeVersion = params.get('version');
  if (maybeVersion == null) return null;
  proposalParams.version = maybeVersion.toString();

  let maybeProposal = params.get('proposal');
  if (maybeProposal == null) return null;
  proposalParams.proposal = maybeProposal.toString();

  let eligibility = createEligibilityEntity(event, params);
  if (eligibility == null) return null;
  proposalParams.eligibility = eligibility.id;
  
  let distribution = createDistributionEntity(event, params);
  if (distribution == null) return null;
  proposalParams.distribution = distribution.id;

  proposalParams.save();
  return proposalParams;
}

function createStrategyEntity(event: MintEvent, obj: TypedMap<string, JSONValue>): ProposalStrategyEntity | null {
  let strategy = obj.get('name');
  let maybeParams = obj.get('params');
  if (maybeParams == null) return null;
  let params = maybeParams.toObject();

  let name: string;

  if (strategy === null) {
    log.error("strategy is null", []);
    return null;
  }
  name = strategy.toString();

  if (params == null) {
    log.error("params is null", []);
    return null
  }

  let proposalParams = createProposalParamsEntity(event, params);
  if (proposalParams == null) return null;

  let strat = new ProposalStrategyEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  strat.name = name;
  strat.params = proposalParams.id;

  strat.save();
  return strat
}

export function handleMint(event: MintEvent): void {
  const boostId = event.params.boostId
  const tokenAddress = event.params.boost.token.toHexString()

  let token = TokenEntity.load(tokenAddress)
  if (token === null) {
    const tokenContract = erc20.bind(event.params.boost.token)
    token = new TokenEntity(tokenAddress)
    token.name = tokenContract.name()
    token.symbol = tokenContract.symbol()
    token.decimals = tokenContract.decimals().toString()
    token.save()
  }

  const strategyData = ipfs.cat(event.params.strategyURI)

  if (strategyData === null) {
    log.error("data is null", []);
    return
  }

  const value = json.try_fromBytes(strategyData)
  const obj = value.value.toObject()

  const strategy = createStrategyEntity(event, obj);
  if (strategy == null) return;

  const boostEntity = new BoostEntity(boostId.toString())
  boostEntity.strategyURI = event.params.strategyURI
  boostEntity.isBurnt = false
  boostEntity.strategy = strategy.id;
  boostEntity.chainId = "11155111"
  boostEntity.token = tokenAddress
  boostEntity.poolSize = event.params.boost.balance.toString()
  boostEntity.guard = event.params.boost.guard
  boostEntity.start = event.params.boost.start.toI32()
  boostEntity.end = event.params.boost.end.toI32()
  boostEntity.owner = event.params.owner
  boostEntity.blockNumber = event.block.number
  boostEntity.save()

  const proposalParams = ProposalParamsEntity.load(strategy.params)
  if (proposalParams == null) {
    log.error("proposalParams is null", []);
    return
  }

  let proposalEntity = ProposalEntity.load(proposalParams.proposal);
  if (proposalEntity == null) {
    proposalEntity = new ProposalEntity(proposalParams.proposal);
    proposalEntity.boosts = [boostId.toString()];
  } else {
    proposalEntity.boosts.push(boostId.toString());
  }
  proposalEntity.save();

  let depositEntity = new DepositEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  depositEntity.boost = boostId.toString()
  depositEntity.sender = event.transaction.from
  depositEntity.amount = event.params.boost.balance.toString()
  depositEntity.blockNumber = event.block.number
  depositEntity.blockTimestamp = event.block.timestamp
  depositEntity.transactionHash = event.transaction.hash
  depositEntity.save()
}
