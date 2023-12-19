import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Approval,
  ApprovalForAll,
  Burn,
  Claim,
  Deposit,
  EthFeeSet,
  EthFeesCollected,
  Mint,
  OwnershipTransferred,
  TokenFeeSet,
  TokenFeesCollected,
  Transfer
} from "../generated/boost/boost"

export function createApprovalEvent(
  owner: Address,
  approved: Address,
  tokenId: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromAddress(approved))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return approvalEvent
}

export function createApprovalForAllEvent(
  owner: Address,
  operator: Address,
  approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent())

  approvalForAllEvent.parameters = new Array()

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return approvalForAllEvent
}

export function createBurnEvent(boostId: BigInt): Burn {
  let burnEvent = changetype<Burn>(newMockEvent())

  burnEvent.parameters = new Array()

  burnEvent.parameters.push(
    new ethereum.EventParam(
      "boostId",
      ethereum.Value.fromUnsignedBigInt(boostId)
    )
  )

  return burnEvent
}

export function createClaimEvent(claim: ethereum.Tuple): Claim {
  let claimEvent = changetype<Claim>(newMockEvent())

  claimEvent.parameters = new Array()

  claimEvent.parameters.push(
    new ethereum.EventParam("claim", ethereum.Value.fromTuple(claim))
  )

  return claimEvent
}

export function createDepositEvent(
  boostId: BigInt,
  sender: Address,
  amount: BigInt
): Deposit {
  let depositEvent = changetype<Deposit>(newMockEvent())

  depositEvent.parameters = new Array()

  depositEvent.parameters.push(
    new ethereum.EventParam(
      "boostId",
      ethereum.Value.fromUnsignedBigInt(boostId)
    )
  )
  depositEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  depositEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return depositEvent
}

export function createEthFeeSetEvent(ethFee: BigInt): EthFeeSet {
  let ethFeeSetEvent = changetype<EthFeeSet>(newMockEvent())

  ethFeeSetEvent.parameters = new Array()

  ethFeeSetEvent.parameters.push(
    new ethereum.EventParam("ethFee", ethereum.Value.fromUnsignedBigInt(ethFee))
  )

  return ethFeeSetEvent
}

export function createEthFeesCollectedEvent(
  recipient: Address
): EthFeesCollected {
  let ethFeesCollectedEvent = changetype<EthFeesCollected>(newMockEvent())

  ethFeesCollectedEvent.parameters = new Array()

  ethFeesCollectedEvent.parameters.push(
    new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  )

  return ethFeesCollectedEvent
}

export function createMintEvent(boostId: BigInt, boost: ethereum.Tuple): Mint {
  let mintEvent = changetype<Mint>(newMockEvent())

  mintEvent.parameters = new Array()

  mintEvent.parameters.push(
    new ethereum.EventParam(
      "boostId",
      ethereum.Value.fromUnsignedBigInt(boostId)
    )
  )
  mintEvent.parameters.push(
    new ethereum.EventParam("boost", ethereum.Value.fromTuple(boost))
  )

  return mintEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createTokenFeeSetEvent(tokenFee: BigInt): TokenFeeSet {
  let tokenFeeSetEvent = changetype<TokenFeeSet>(newMockEvent())

  tokenFeeSetEvent.parameters = new Array()

  tokenFeeSetEvent.parameters.push(
    new ethereum.EventParam(
      "tokenFee",
      ethereum.Value.fromUnsignedBigInt(tokenFee)
    )
  )

  return tokenFeeSetEvent
}

export function createTokenFeesCollectedEvent(
  token: Address,
  recipient: Address
): TokenFeesCollected {
  let tokenFeesCollectedEvent = changetype<TokenFeesCollected>(newMockEvent())

  tokenFeesCollectedEvent.parameters = new Array()

  tokenFeesCollectedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  tokenFeesCollectedEvent.parameters.push(
    new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  )

  return tokenFeesCollectedEvent
}

export function createTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return transferEvent
}
