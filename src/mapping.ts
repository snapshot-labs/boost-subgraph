import { BigInt } from "@graphprotocol/graph-ts"
import {
  Boost as BoostContract,
  BoostClaimed,
  BoostCreated,
  BoostDeposited,
  BoostWithdrawn
} from "../generated/Boost/Boost"
import {
  Boost as BoostEntity,
  Deposit as DepositEntity,
  Claim as ClaimEntity,
} from "../generated/schema"

export function handleBoostCreated(event: BoostCreated): void {
  let boostEntity = new BoostEntity(event.params.id.toHex())

  let contract = BoostContract.bind(event.address)
  let createdBoost = contract.boosts(event.params.id)

  boostEntity.ref = createdBoost.value0
  boostEntity.token = createdBoost.value1
  boostEntity.balance = createdBoost.value2
  boostEntity.amountPerAccount = createdBoost.value3
  boostEntity.guard = createdBoost.value4
  boostEntity.expires = createdBoost.value5
  boostEntity.owner = createdBoost.value6
  boostEntity.save()
}

export function handleBoostDeposited(event: BoostDeposited): void {
  let depositEntity = new DepositEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  depositEntity.boost = event.params.id.toHex()
  depositEntity.sender = event.params.sender
  depositEntity.amount = event.params.amount
  depositEntity.save()

  let contract = BoostContract.bind(event.address)
  let boost = contract.boosts(event.params.id)
  let boostEntity = BoostEntity.load(event.params.id.toHex())
  if (boostEntity != null) {
    boostEntity.balance = boost.value3
    boostEntity.save()
  }
}

export function handleBoostClaimed(event: BoostClaimed): void {
  let claimEntity = new ClaimEntity(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  claimEntity.boost = event.params.id.toHex()
  claimEntity.recipient = event.params.recipient
  claimEntity.save()

  let contract = BoostContract.bind(event.address)
  let boost = contract.boosts(event.params.id)
  let boostEntity = BoostEntity.load(event.params.id.toHex())
  if (boostEntity != null) {
    boostEntity.balance = boost.value3
    boostEntity.save()
  }
}

export function handleBoostWithdrawn(event: BoostWithdrawn): void {
  let boostEntity = BoostEntity.load(event.params.id.toHex())
  if (boostEntity != null) {
    boostEntity.balance = BigInt.fromString("0")
    boostEntity.save()
  }
}
