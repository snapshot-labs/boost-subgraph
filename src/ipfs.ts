import {
    Distribution as DistributionEntity,
    Eligibility as EligibilityEntity,
    ProposalParam as ProposalParamEntity,
    ProposalStrategy as ProposalStrategyEntity
} from "../generated/schema"
import { JSONValue, TypedMap, dataSource, log } from '@graphprotocol/graph-ts'
import {
    json,
    Bytes
} from "@graphprotocol/graph-ts";

function createEligibilityEntity(params: TypedMap<string, JSONValue>): EligibilityEntity | null {
  let eligibility = new EligibilityEntity(dataSource.stringParam());

  let maybeEli = params.get('eligibility');
  if (maybeEli == null) return null;
  let eli = maybeEli.toObject();

  let maybeEligiblityType = eli.get('type');
  if (maybeEligiblityType == null) {
    eligibility.type = "incentive";
  } else {
    eligibility.type = maybeEligiblityType.toString();
    if (eligibility.type == "bribe") {
      let maybeChoice = eli.get("choice");
      if (maybeChoice == null ) {
        log.error("keyword 'choice' not found", []);
        return null
      };
      eligibility.choice = maybeChoice.toBigInt().toI32();
    } else if (eligibility.type == "incentive") {
      // do nothing
    } else {
      log.error("unknown eligibility type", []);
      return null
    }
  }

  eligibility.save();
  return eligibility
}

function createDistributionEntity(params: TypedMap<string, JSONValue>): DistributionEntity | null {
  let distribution = new DistributionEntity(dataSource.stringParam());
  let maybeDistrib = params.get('distribution');
  if (maybeDistrib == null) return null;
  let distrib = maybeDistrib.toObject();
  let maybeDistributionType = distrib.get('type');
  if (maybeDistributionType == null) return null;
  distribution.type = maybeDistributionType.toString();

  distribution.save();
  return distribution;
}

function createProposalParamEntity(params: TypedMap<string, JSONValue>): ProposalParamEntity | null {
  let proposalParams = new ProposalParamEntity(dataSource.stringParam());

  let maybeVersion = params.get('version');
  if (maybeVersion == null) return null;
  proposalParams.version = maybeVersion.toString();

  let maybeProposal = params.get('proposal');
  if (maybeProposal == null) return null;
  proposalParams.proposal = maybeProposal.toString();

  let eligibility = createEligibilityEntity(params);
  if (eligibility == null) return null;
  proposalParams.eligibility = eligibility.id;
  
  let distribution = createDistributionEntity(params);
  if (distribution == null) return null;
  proposalParams.distribution = distribution.id;

  proposalParams.save();
  return proposalParams;
}

export function handleStrategyMetadata(content: Bytes): void {
    let obj = json.fromBytes(content).toObject();
    let strat = new ProposalStrategyEntity(dataSource.stringParam())
    if (obj) {
        let strategy = obj.get('name');

        let name: string;
        if (strategy === null) {
          log.error("strategy is null", []);
          return;
        }
        name = strategy.toString();

        let maybeParams = obj.get('params');
        if (maybeParams == null) return;
        let params = maybeParams.toObject();
        if (params == null) {
          log.error("params is null", []);
          return;
        }

        let proposalParams = createProposalParamEntity(params);
        if (proposalParams == null) return;

        strat.name = name;
        strat.params = proposalParams.id;
    } else {
        log.error("failed to fetch content or parse json", []);
    }

    strat.save();
    return;
}