"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var cg_teams_exports = {};
__export(cg_teams_exports, {
  default: () => TeamGenerator,
  levelUpdateInterval: () => levelUpdateInterval
});
module.exports = __toCommonJS(cg_teams_exports);
var import_sim = require("../sim");
var import_cg_team_data = require("./cg-team-data");
const MAX_WEAK_TO_SAME_TYPE = 3;
const levelOverride = {};
let levelUpdateInterval = null;
async function updateLevels(database) {
  const updateSpecies = await database.prepare(
    "UPDATE gen9computergeneratedteams SET wins = 0, losses = 0, level = ? WHERE species_id = ?"
  );
  const updateHistory = await database.prepare(
    `INSERT INTO gen9_historical_levels (level, species_id, timestamp) VALUES (?, ?, ${Date.now()})`
  );
  const data = await database.all("SELECT species_id, wins, losses, level FROM gen9computergeneratedteams");
  for (let { species_id, wins, losses, level } of data) {
    const total = wins + losses;
    if (total > 10) {
      if (wins / total >= 0.55)
        level--;
      if (wins / total <= 0.45)
        level++;
      level = Math.max(1, Math.min(100, level));
      await updateSpecies?.run([level, species_id]);
      await updateHistory?.run([level, species_id]);
    }
    levelOverride[species_id] = level;
  }
}
if (global.Config && Config.usesqlite && Config.usesqliteleveling) {
  const database = (0, import_sim.SQL)(module, { file: "./databases/battlestats.db" });
  void updateLevels(database);
  levelUpdateInterval = setInterval(() => void updateLevels(database), 1e3 * 60 * 60 * 2);
}
class TeamGenerator {
  constructor(format, seed) {
    this.dex = import_sim.Dex.forFormat(format);
    this.format = import_sim.Dex.formats.get(format);
    this.teamSize = this.format.ruleTable?.maxTeamSize || 6;
    this.prng = seed instanceof import_sim.PRNG ? seed : new import_sim.PRNG(seed);
    this.itemPool = this.dex.items.all().filter((i) => i.exists && i.isNonstandard !== "Past" && !i.isPokeball);
    const rules = import_sim.Dex.formats.getRuleTable(this.format);
    if (rules.adjustLevel)
      this.forceLevel = rules.adjustLevel;
  }
  getTeam() {
    let speciesPool = this.dex.species.all().filter((s) => {
      if (!s.exists)
        return false;
      if (s.isNonstandard || s.isNonstandard === "Unobtainable")
        return false;
      if (s.nfe)
        return false;
      if (s.battleOnly && !s.requiredItems?.length)
        return false;
      return true;
    });
    const teamStats = {
      hazardSetters: {},
      typeWeaknesses: {}
    };
    const team = [];
    while (team.length < this.teamSize && speciesPool.length) {
      const species = this.prng.sample(speciesPool);
      const haveRoomToReject = speciesPool.length >= this.teamSize - team.length;
      const isGoodFit = this.speciesIsGoodFit(species, teamStats);
      if (haveRoomToReject && !isGoodFit)
        continue;
      speciesPool = speciesPool.filter((s) => s.baseSpecies !== species.baseSpecies);
      team.push(this.makeSet(species, teamStats));
    }
    return team;
  }
  makeSet(species, teamStats) {
    const abilityPool = Object.values(species.abilities);
    const abilityWeights = abilityPool.map((a) => this.getAbilityWeight(this.dex.abilities.get(a)));
    const ability = this.weightedRandomPick(abilityPool, abilityWeights);
    const moves = [];
    let learnset = this.dex.species.getLearnset(species.id);
    let movePool = [];
    let learnsetSpecies = species;
    if (!learnset || species.id === "gastrodoneast") {
      learnsetSpecies = this.dex.species.get(species.baseSpecies);
      learnset = this.dex.species.getLearnset(learnsetSpecies.id);
    }
    if (learnset) {
      movePool = Object.keys(learnset).filter(
        (moveid) => learnset[moveid].find((learned) => learned.startsWith("9"))
      );
    }
    if (learnset && learnsetSpecies === species && species.changesFrom) {
      const changesFrom = this.dex.species.get(species.changesFrom);
      learnset = this.dex.species.getLearnset(changesFrom.id);
      for (const moveid in learnset) {
        if (!movePool.includes(moveid) && learnset[moveid].some((source) => source.startsWith("9"))) {
          movePool.push(moveid);
        }
      }
    }
    const evoRegion = learnsetSpecies.evoRegion;
    while (learnsetSpecies.prevo) {
      learnsetSpecies = this.dex.species.get(learnsetSpecies.prevo);
      for (const moveid in learnset) {
        if (!movePool.includes(moveid) && learnset[moveid].some((source) => source.startsWith("9") && !evoRegion)) {
          movePool.push(moveid);
        }
      }
    }
    if (!movePool.length)
      throw new Error(`No moves for ${species.id}`);
    const numberOfMovesToConsider = Math.min(movePool.length, Math.max(15, Math.trunc(movePool.length * 0.3)));
    let movePoolIsTrimmed = false;
    while (moves.length < 4 && movePool.length) {
      let weights;
      if (!movePoolIsTrimmed) {
        const interimMovePool = [];
        for (const move of movePool) {
          const weight = this.getMoveWeight(this.dex.moves.get(move), teamStats, species, moves, ability);
          interimMovePool.push({ move, weight });
        }
        interimMovePool.sort((a, b) => b.weight - a.weight);
        movePool = [];
        weights = [];
        for (let i = 0; i < numberOfMovesToConsider; i++) {
          movePool.push(interimMovePool[i].move);
          weights.push(interimMovePool[i].weight);
        }
        movePoolIsTrimmed = true;
      } else {
        weights = movePool.map((m) => this.getMoveWeight(this.dex.moves.get(m), teamStats, species, moves, ability));
      }
      const moveID = this.weightedRandomPick(movePool, weights, { remove: true });
      const pairedMove = import_cg_team_data.MOVE_PAIRINGS[moveID];
      const alreadyHavePairedMove = moves.some((m) => m.id === pairedMove);
      if (moves.length < 3 && pairedMove && !alreadyHavePairedMove && // We don't check movePool because sometimes paired moves are bad.
      this.dex.species.getLearnset(species.id)?.[pairedMove]) {
        moves.push(this.dex.moves.get(pairedMove));
        movePool.splice(movePool.indexOf(pairedMove), 1);
      }
      moves.push(this.dex.moves.get(moveID));
    }
    let item = "";
    if (species.requiredItem) {
      item = species.requiredItem;
    } else if (species.requiredItems) {
      item = this.prng.sample(species.requiredItems.filter((i) => !this.dex.items.get(i).isNonstandard));
    } else if (moves.every((m) => m.id !== "acrobatics")) {
      const weights = [];
      const items = [];
      for (const i of this.itemPool) {
        if (i.itemUser?.includes(species.name)) {
          item = i.name;
          break;
        }
        const weight = this.getItemWeight(i, teamStats, species, moves, ability);
        if (weight !== 0) {
          weights.push(weight);
          items.push(i.name);
        }
      }
      if (!item)
        item = this.weightedRandomPick(items, weights);
    } else if (["Quark Drive", "Protosynthesis"].includes(ability)) {
      item = "Booster Energy";
    }
    const ivs = {
      hp: 31,
      atk: moves.some((move) => this.dex.moves.get(move).category === "Physical") ? 31 : 0,
      def: 31,
      spa: 31,
      spd: 31,
      spe: 31
    };
    const level = this.forceLevel || TeamGenerator.getLevel(species);
    let teraType;
    const nonStatusMoves = moves.filter((move) => this.dex.moves.get(move).category !== "Status");
    if (!moves.some((m) => m.id === "terablast") && nonStatusMoves.length) {
      teraType = this.prng.sample(nonStatusMoves.map((move) => this.dex.moves.get(move).type));
    } else {
      teraType = this.prng.sample([...this.dex.types.all()]).name;
    }
    return {
      name: species.name,
      species: species.name,
      item,
      ability,
      moves: moves.map((m) => m.name),
      nature: "Quirky",
      gender: species.gender,
      evs: { hp: 84, atk: 84, def: 84, spa: 84, spd: 84, spe: 84 },
      ivs,
      level,
      teraType,
      shiny: this.prng.randomChance(1, 1024),
      happiness: 255
    };
  }
  /**
   * @returns true if the Pokémon is a good fit for the team so far, and no otherwise
   */
  speciesIsGoodFit(species, stats) {
    for (const type of this.dex.types.all()) {
      const effectiveness = this.dex.getEffectiveness(type.name, species.types);
      if (effectiveness === 1) {
        if (stats.typeWeaknesses[type.name] === void 0) {
          stats.typeWeaknesses[type.name] = 0;
        }
        if (stats.typeWeaknesses[type.name] >= MAX_WEAK_TO_SAME_TYPE) {
          return false;
        }
      }
    }
    for (const type of this.dex.types.all()) {
      const effectiveness = this.dex.getEffectiveness(type.name, species.types);
      if (effectiveness === 1) {
        stats.typeWeaknesses[type.name]++;
      }
    }
    return true;
  }
  /**
   * @returns A weighting for the Pokémon's ability.
   */
  getAbilityWeight(ability) {
    return ability.rating + 1;
  }
  /**
   * @returns A weight for a given move on a given Pokémon.
   */
  getMoveWeight(move, teamStats, species, movesSoFar, ability) {
    if (!move.exists)
      return 0;
    if (move.target === "adjacentAlly")
      return 0;
    if (move.category === "Status") {
      let weight2 = 2500;
      if (move.status)
        weight2 *= TeamGenerator.statusWeight(move.status) * 2;
      const isHazard = (m) => m.sideCondition && m.target === "foeSide";
      if (isHazard(move) && (teamStats.hazardSetters[move.id] || 0) < 1) {
        weight2 *= move.id === "spikes" ? 12 : 16;
        if (movesSoFar.some((m) => isHazard(m)))
          weight2 *= 2;
        teamStats.hazardSetters[move.id]++;
      }
      weight2 *= this.boostWeight(move, movesSoFar, species) * 2;
      weight2 *= this.opponentDebuffWeight(move) * 2;
      if (species.baseStats.def >= 100 || species.baseStats.spd >= 100 || species.baseStats.hp >= 100) {
        switch (move.volatileStatus) {
          case "endure":
            weight2 *= 3;
            break;
          case "protect":
          case "kingsshield":
          case "silktrap":
            weight2 *= 4;
            break;
          case "banefulbunker":
          case "spikyshield":
            weight2 *= 5;
            break;
          default:
            break;
        }
      }
      if (move.id in import_cg_team_data.HARDCODED_MOVE_WEIGHTS)
        weight2 *= import_cg_team_data.HARDCODED_MOVE_WEIGHTS[move.id];
      const goodAttacker = species.baseStats.atk > 80 || species.baseStats.spa > 80;
      if (goodAttacker && movesSoFar.filter((m) => m.category !== "Status").length < 2) {
        weight2 *= 0.3;
      }
      return weight2;
    }
    const isWeirdPowerMove = import_cg_team_data.WEIGHT_BASED_MOVES.includes(move.id);
    let basePower = isWeirdPowerMove ? 60 : move.basePower;
    if (import_cg_team_data.SPEED_BASED_MOVES.includes(move.id))
      basePower = species.baseStats.spe / 2;
    const baseStat = move.category === "Physical" ? species.baseStats.atk : species.baseStats.spa;
    const accuracy = move.accuracy === true ? 1.1 : move.accuracy / 100;
    let powerEstimate = basePower * baseStat * accuracy;
    if (species.types.includes(move.type))
      powerEstimate *= ability === "Adaptability" ? 2 : 1.5;
    if (ability === "Technician" && move.basePower <= 60)
      powerEstimate *= 1.5;
    if (ability === "Steely Spirit" && move.type === "Steel")
      powerEstimate *= 1.5;
    if (move.multihit) {
      const numberOfHits = Array.isArray(move.multihit) ? ability === "Skill Link" ? move.multihit[1] : (move.multihit[0] + move.multihit[1]) / 2 : move.multihit;
      powerEstimate *= numberOfHits;
    }
    const hasSpecialSetup = movesSoFar.some((m) => m.boosts?.spa || m.self?.boosts?.spa || m.selfBoost?.boosts?.spa);
    const hasPhysicalSetup = movesSoFar.some((m) => m.boosts?.atk || m.self?.boosts?.atk || m.selfBoost?.boosts?.atk);
    if (move.category === "Physical" && hasSpecialSetup)
      powerEstimate *= 0.7;
    if (move.category === "Special" && hasPhysicalSetup)
      powerEstimate *= 0.7;
    const abilityBonus = ((import_cg_team_data.ABILITY_MOVE_BONUSES[ability] || {})[move.id] || 1) * ((import_cg_team_data.ABILITY_MOVE_TYPE_BONUSES[ability] || {})[move.type] || 1);
    let weight = powerEstimate * abilityBonus;
    if (move.id in import_cg_team_data.HARDCODED_MOVE_WEIGHTS)
      weight *= import_cg_team_data.HARDCODED_MOVE_WEIGHTS[move.id];
    if (move.priority > 0)
      weight *= Math.max(130 - species.baseStats.spe, 0) / 130 * 0.5 + 1;
    if (move.priority < 0)
      weight *= Math.min(1 / species.baseStats.spe * 30, 1);
    if (move.flags.charge || move.flags.recharge && ability !== "Truant")
      weight *= 0.5;
    if (move.flags.contact) {
      if (ability === "Tough Claws")
        weight *= 1.3;
      if (ability === "Unseen Fist")
        weight *= 1.1;
    }
    if (move.flags.bite && ability === "Strong Jaw")
      weight *= 1.5;
    if (move.flags.bypasssub)
      weight *= 1.1;
    if (move.flags.pulse && ability === "Mega Launcher")
      weight *= 1.5;
    if (move.flags.punch && ability === "Iron Fist")
      weight *= 1.2;
    if (!move.flags.protect)
      weight *= 1.1;
    if (move.flags.slicing && ability === "Sharpness")
      weight *= 1.5;
    weight *= this.boostWeight(move, movesSoFar, species);
    if (move.secondary?.status) {
      weight *= TeamGenerator.statusWeight(move.secondary.status, (move.secondary.chance || 100) / 100);
    }
    if (move.self?.volatileStatus)
      weight *= 0.8;
    if (movesSoFar.some((m) => m.category !== "Status" && m.type === move.type && m.basePower >= 60))
      weight *= 0.3;
    if (move.selfdestruct)
      weight *= 0.3;
    if (move.recoil)
      weight *= 1 - move.recoil[0] / move.recoil[1];
    if (move.mindBlownRecoil)
      weight *= 0.25;
    if (move.flags["futuremove"])
      weight *= 0.3;
    if (move.willCrit)
      weight *= 1.45;
    if (move.drain) {
      const drainedFraction = move.drain[0] / move.drain[1];
      weight *= 1 + drainedFraction * 0.5;
    }
    if (move.heal && movesSoFar.some((m) => m.heal))
      weight *= 0.5;
    return weight;
  }
  /**
   * @returns A multiplier to a move weighting based on the status it inflicts.
   */
  static statusWeight(status, chance = 1) {
    if (chance !== 1)
      return 1 + (TeamGenerator.statusWeight(status) - 1) * chance;
    switch (status) {
      case "brn":
        return 1.5;
      case "frz":
        return 5;
      case "par":
        return 1.5;
      case "psn":
        return 1.5;
      case "tox":
        return 4;
      case "slp":
        return 4;
    }
    return 1;
  }
  /**
   * @returns A multiplier to a move weighting based on the boosts it produces for the user.
   */
  boostWeight(move, movesSoFar, species) {
    const physicalIsRelevant = move.category === "Physical" || movesSoFar.some((m) => m.category === "Physical");
    const specialIsRelevant = move.category === "Special" || movesSoFar.some((m) => m.category === "Special");
    let weight = 1;
    for (const { chance, boosts } of [
      { chance: 1, boosts: move.boosts },
      { chance: 1, boosts: move.self?.boosts },
      { chance: 1, boosts: move.selfBoost?.boosts },
      {
        chance: move.secondary ? (move.secondary.chance || 100) / 100 : 0,
        boosts: move.target === "self" ? move.secondary?.boosts : move.secondary?.self?.boosts
      }
    ]) {
      if (!boosts || chance === 0)
        continue;
      if (boosts.atk && physicalIsRelevant)
        weight += (chance || 1) * 0.5 * boosts.atk;
      if (boosts.spa && specialIsRelevant)
        weight += (chance || 1) * 0.5 * boosts.spa;
      if (boosts.def)
        weight += (chance || 1) * 0.5 * boosts.def * (species.baseStats.def > 75 ? 1 : 0.5);
      if (boosts.spd)
        weight += (chance || 1) * 0.5 * boosts.spd * (species.baseStats.spd > 75 ? 1 : 0.5);
      if (boosts.spe)
        weight += (chance || 1) * 0.5 * boosts.spe * (species.baseStats.spe > 120 ? 0.5 : 1);
    }
    return weight;
  }
  /**
   * @returns A weight for a move based on how much it will reduce the opponent's stats.
   */
  opponentDebuffWeight(move) {
    if (!["allAdjacentFoes", "allAdjacent", "foeSide", "normal"].includes(move.target))
      return 1;
    let averageNumberOfDebuffs = 0;
    for (const { chance, boosts } of [
      { chance: 1, boosts: move.boosts },
      {
        chance: move.secondary ? (move.secondary.chance || 100) / 100 : 0,
        boosts: move.secondary?.boosts
      }
    ]) {
      if (!boosts || chance === 0)
        continue;
      const numBoosts = Object.values(boosts).filter((x) => x < 0).length;
      averageNumberOfDebuffs += chance * numBoosts;
    }
    return 1 + 0.25 * averageNumberOfDebuffs;
  }
  /**
   * @returns A weight for an item.
   */
  getItemWeight(item, teamStats, species, moves, ability) {
    let weight;
    switch (item.id) {
      case "choiceband":
        return moves.every((x) => x.category === "Physical") ? 50 : 0;
      case "choicespecs":
        return moves.every((x) => x.category === "Special") ? 50 : 0;
      case "choicescarf":
        if (moves.some((x) => x.category === "Status"))
          return 0;
        if (species.baseStats.spe > 65 && species.baseStats.spe < 120)
          return 50;
        return 10;
      case "lifeorb":
        return moves.filter((x) => x.category !== "Status").length * 8;
      case "focussash":
        if (ability === "Sturdy")
          return 0;
        if (species.baseStats.hp < 80 && species.baseStats.def < 80 && species.baseStats.spd < 80)
          return 35;
        return 10;
      case "heavydutyboots":
        switch (this.dex.getEffectiveness("Rock", species)) {
          case 1:
            return 30;
          case 0:
            return 10;
        }
        return 5;
      case "assaultvest":
        if (moves.some((x) => x.category === "Status"))
          return 0;
        return 30;
      case "flameorb":
        weight = ability === "Guts" && !species.types.includes("Fire") ? 30 : 0;
        if (moves.some((m) => m.id === "facade"))
          weight *= 2;
        return weight;
      case "toxicorb":
        if (species.types.includes("Poison"))
          return 0;
        weight = 0;
        if (ability === "Poison Heal")
          weight += 25;
        if (moves.some((m) => m.id === "facade"))
          weight += 25;
        return weight;
      case "leftovers":
        return 20;
      case "blacksludge":
        return species.types.includes("Poison") ? 40 : 0;
      case "sitrusberry":
      case "magoberry":
        return 20;
      case "throatspray":
        if (moves.some((m) => m.flags.sound) && moves.some((m) => m.category === "Special"))
          return 30;
        return 0;
      default:
        return 0;
    }
  }
  /**
   * @returns The level a Pokémon should be.
   */
  static getLevel(species) {
    if (levelOverride[species.id])
      return levelOverride[species.id];
    switch (species.tier) {
      case "Uber":
        return 70;
      case "OU":
      case "Unreleased":
        return 80;
      case "UU":
        return 90;
      case "LC":
      case "NFE":
        return 100;
    }
    return 100;
  }
  /**
   * Picks a choice from `choices` based on the weights in `weights`.
   * `weights` must be the same length as `choices`.
   */
  weightedRandomPick(choices, weights, options) {
    if (!choices.length)
      throw new Error(`Can't pick from an empty list`);
    if (choices.length !== weights.length)
      throw new Error(`Choices and weights must be the same length`);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let randomWeight = this.prng.next(0, totalWeight);
    for (let i = 0; i < choices.length; i++) {
      randomWeight -= weights[i];
      if (randomWeight < 0) {
        const choice = choices[i];
        if (options?.remove)
          choices.splice(i, 1);
        return choice;
      }
    }
    if (options?.remove && choices.length)
      return choices.pop();
    return choices[choices.length - 1];
  }
  setSeed(seed) {
    this.prng.seed = seed;
  }
}
//# sourceMappingURL=cg-teams.js.map
