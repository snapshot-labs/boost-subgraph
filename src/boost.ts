import {
  Claim as ClaimEvent,
  Deposit as DepositEvent,
  Mint as MintEvent,
  Burn as BurnEvent,
} from "../generated/boost/boost";
import {
  StrategyMetadata as StrategyMetadataTemplate,
} from "../generated/templates";
import {
  Boost as BoostEntity,
  Claim as ClaimEntity,
  Deposit as DepositEntity,
  Proposal as ProposalEntity,
  Token as TokenEntity,
  ProposalStrategy as ProposalStrategyEntity
} from "../generated/schema"
import { erc20 } from "../generated/boost/ERC20"
import { log } from '@graphprotocol/graph-ts'
import {
  BigInt,
} from "@graphprotocol/graph-ts";

export function handleBurn(event: BurnEvent): void {
  let boostId = event.params.boostId.toString()

  let boost = BoostEntity.load(boostId)
  if (boost !== null) {
    boost.currentBalance = "0";
    boost.save()
  } else {
    log.error("burn: boost is null", [boostId]);
  }
}

export function handleClaim(event: ClaimEvent): void {
  let boostId = event.params.claim.boostId.toString()

  let entity = new ClaimEntity(
    event.transaction.hash.toString()
  )

  entity.recipient = event.params.claim.recipient
  entity.amount = event.params.claim.amount
  entity.boost = boostId
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  let boost = BoostEntity.load(boostId)
  if (boost !== null) {
    // Update currentBalance
    let balance = BigInt.fromString(boost.currentBalance);
    balance = balance.minus(event.params.claim.amount);
    boost.currentBalance = balance.toString();
    boost.save();

    // Try to fetch the proposal
    let maybeStrategy = boost.strategy;
    if (maybeStrategy !== null) {
      log.error("strategy is null", [boostId])
      let strategy = ProposalStrategyEntity.load(maybeStrategy);
      if (strategy !== null) {
        log.error("strategy is null 2", [boostId])
        entity.proposal = strategy.proposal;
      }
    }
  } else {
    log.error("boost is null", [boostId])
  }


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
  boostEntity.currentBalance = boostEntity.poolSize;
  boostEntity.save();

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
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

  StrategyMetadataTemplate.create(event.params.strategyURI);

  const boostEntity = new BoostEntity(boostId.toString())
  boostEntity.strategyURI = event.params.strategyURI
  boostEntity.strategy = event.params.strategyURI
  boostEntity.chainId = "11155111"
  boostEntity.token = tokenAddress
  boostEntity.poolSize = event.params.boost.balance.toString()
  boostEntity.currentBalance = boostEntity.poolSize;
  boostEntity.guard = event.params.boost.guard
  boostEntity.start = event.params.boost.start.toString()
  boostEntity.end = event.params.boost.end.toString()
  boostEntity.owner = event.params.owner
  boostEntity.blockNumber = event.block.number
  boostEntity.transaction = event.transaction.hash
  boostEntity.save()

  let depositEntity = new DepositEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  depositEntity.boost = boostId.toString()
  depositEntity.sender = event.transaction.from
  depositEntity.amount = event.params.boost.balance.toString()
  depositEntity.blockNumber = event.block.number
  depositEntity.blockTimestamp = event.block.timestamp
  depositEntity.transactionHash = event.transaction.hash
  depositEntity.save()
}
