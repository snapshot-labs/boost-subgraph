import {
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  Burn as BurnEvent,
  Claim as ClaimEvent,
  Deposit as DepositEvent,
  EthFeeSet as EthFeeSetEvent,
  EthFeesCollected as EthFeesCollectedEvent,
  Mint as MintEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  TokenFeeSet as TokenFeeSetEvent,
  TokenFeesCollected as TokenFeesCollectedEvent,
  Transfer as TransferEvent
} from "../generated/boost/boost"
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
} from "../generated/schema"

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.approved = event.params.approved
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.operator = event.params.operator
  entity.approved = event.params.approved

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBurn(event: BurnEvent): void {
  let entity = new Burn(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.boostId = event.params.boostId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleClaim(event: ClaimEvent): void {
  let entity = new Claim(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.claim_boostId = event.params.claim.boostId
  entity.claim_recipient = event.params.claim.recipient
  entity.claim_amount = event.params.claim.amount
  entity.claim_ref = event.params.claim.ref

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDeposit(event: DepositEvent): void {
  let entity = new Deposit(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.boostId = event.params.boostId
  entity.sender = event.params.sender
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleEthFeeSet(event: EthFeeSetEvent): void {
  let entity = new EthFeeSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.ethFee = event.params.ethFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleEthFeesCollected(event: EthFeesCollectedEvent): void {
  let entity = new EthFeesCollected(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.recipient = event.params.recipient

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMint(event: MintEvent): void {
  let entity = new Mint(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.boostId = event.params.boostId
  entity.boost_token = event.params.boost.token
  entity.boost_balance = event.params.boost.balance
  entity.boost_guard = event.params.boost.guard
  entity.boost_start = event.params.boost.start
  entity.boost_end = event.params.boost.end

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokenFeeSet(event: TokenFeeSetEvent): void {
  let entity = new TokenFeeSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenFee = event.params.tokenFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokenFeesCollected(event: TokenFeesCollectedEvent): void {
  let entity = new TokenFeesCollected(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.token = event.params.token
  entity.recipient = event.params.recipient

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
