import { BigInt, ipfs, json } from '@graphprotocol/graph-ts'
import {
  BoostCreated,
  TokensClaimed,
  TokensDeposited,
  RemainingTokensWithdrawn
} from "../generated/Boost/Boost"
import {
  Boost as BoostEntity,
  Deposit as DepositEntity,
  Claim as ClaimEntity
} from "../generated/schema"

export function handleBoostCreated(event: BoostCreated): void {
  const boostId = event.params.boostId.toHex()
  const boostEntity = new BoostEntity(boostId)

  boostEntity.strategyURI = event.params.boost.strategyURI

  const strategyData = ipfs.cat(boostEntity.strategyURI)

  if (strategyData === null) return

  const value = json.try_fromBytes(strategyData)
  const obj = value.value.toObject()
  const tag = obj.get('tag')

  if (tag === null) return

  boostEntity.tag = tag.toString()
  boostEntity.token = event.params.boost.token
  boostEntity.balance = event.params.boost.balance
  boostEntity.guard = event.params.boost.guard
  boostEntity.start = event.params.boost.start.toI32()
  boostEntity.end = event.params.boost.end.toI32()
  boostEntity.owner = event.params.boost.owner
  boostEntity.blockNumber = event.block.number
  boostEntity.save()

  let depositEntity = new DepositEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  depositEntity.boost = boostId
  depositEntity.sender = event.params.boost.owner
  depositEntity.amount = event.params.boost.balance
  depositEntity.blockNumber = event.block.number
  depositEntity.save()
}

export function handleTokensClaimed(event: TokensClaimed): void {
  const boostId = event.params.claim.boostId.toHex()

  let claimEntity = new ClaimEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  claimEntity.boost = boostId
  claimEntity.recipient = event.params.claim.recipient
  claimEntity.amount = event.params.claim.amount
  claimEntity.blockNumber = event.block.number
  claimEntity.save()

  let boostEntity = BoostEntity.load(boostId)
  if (boostEntity != null) {
    boostEntity.balance = boostEntity.balance.minus(claimEntity.amount)
    boostEntity.save()
  }
}

export function handleTokensDeposited(event: TokensDeposited): void {
  const boostId = event.params.boostId.toHex()
  
  let depositEntity = new DepositEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  depositEntity.boost = boostId
  depositEntity.sender = event.params.sender
  depositEntity.amount = event.params.amount
  depositEntity.save()

  let boostEntity = BoostEntity.load(boostId)
  if (boostEntity != null) {
    boostEntity.balance = boostEntity.balance.plus(event.params.amount)
    boostEntity.save()
  }
}

export function handleRemainingTokensWithdrawn(event: RemainingTokensWithdrawn): void {
  let boostEntity = BoostEntity.load(event.params.boostId.toHex())
  if (boostEntity != null) {
    boostEntity.balance = BigInt.fromString("0")
    boostEntity.save()
  }
}
