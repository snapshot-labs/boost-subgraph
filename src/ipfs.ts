import {
  Distribution as DistributionEntity,
  Eligibility as EligibilityEntity,
  ProposalStrategy as ProposalStrategyEntity
} from "../generated/schema"
import { JSONValue, TypedMap, dataSource, log } from '@graphprotocol/graph-ts'
import {
  json,
  Bytes,
  BigInt,
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
      if (maybeChoice == null) {
        log.error("keyword 'choice' not found", []);
        return null
      };
      eligibility.choice = maybeChoice.toString();
    } else if (eligibility.type == "incentive") {
      // do nothing
    } else if (eligibility.type == "prediction") {
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
  log.error("maybeDistrib", []);
  if (maybeDistrib == null) return null;
  let distrib = maybeDistrib.toObject();

  let maybeDistributionType = distrib.get('type');
  log.error("distribution type", []);
  if (maybeDistributionType == null) return null;
  distribution.type = maybeDistributionType.toString();

  if (distribution.type == 'weighted') {
    let maybeDistributionLimit = distrib.get('limit');
    if (maybeDistributionLimit !== null) {
      log.error("weighted distribution limit", []);
      distribution.limit = maybeDistributionLimit.toString();
    }
  } else if (distribution.type == 'lottery') {
    let maybeNumWinners = distrib.get('numWinners');
    if (maybeNumWinners !== null) {
      log.error("distribution num winners", []);
      distribution.numWinners = maybeNumWinners.toString();
    }

    let maybeDistributionLimit = distrib.get('limit');
    if (maybeDistributionLimit !== null) {
      log.error("limit", []);
      distribution.limit = maybeDistributionLimit.toString();
    }
  } else {
    log.error("Unknown distribution type", []);
    return null;
  }

  distribution.save();
  return distribution;
}

export function handleStrategyMetadata(content: Bytes): void {
  let obj = json.fromBytes(content).toObject();
  let strat = new ProposalStrategyEntity(dataSource.stringParam())
  if (obj) {
    let maybeName = obj.get('strategyName');
    if (maybeName == null) {
      log.error("strategy is null", []);
      return;
    }
    let name = maybeName.toString();

    let maybeParams = obj.get('params');
    if (maybeParams == null) return;
    let params = maybeParams.toObject();
    if (params == null) {
      log.error("params is null", []);
      return;
    }

    let maybeVersion = params.get('version');
    if (maybeVersion == null) return;
    strat.version = maybeVersion.toString();

    let maybeProposal = params.get('proposal');
    if (maybeProposal == null) return;
    strat.proposal = maybeProposal.toString();

    let maybeEnv = params.get('env');
    if (maybeEnv == null) return;
    strat.env = maybeEnv.toString();

    let eligibility = createEligibilityEntity(params);
    if (eligibility == null) return;
    strat.eligibility = eligibility.id;

    let distribution = createDistributionEntity(params);
    if (distribution == null) return;
    strat.distribution = distribution.id;

    strat.name = name;
  } else {
    log.error("failed to fetch content or parse json", []);
  }

  strat.save();
  return;
}