"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var random_teams_exports = {};
__export(random_teams_exports, {
  RandomGen1Teams: () => RandomGen1Teams,
  default: () => random_teams_default
});
module.exports = __toCommonJS(random_teams_exports);
var import_random_teams = __toESM(require("../gen2/random-teams"));
var import_lib = require("../../../lib");
var import_random_teams2 = require("../gen8/random-teams");
class RandomGen1Teams extends import_random_teams.default {
  constructor() {
    super(...arguments);
    this.randomData = require("./random-data.json");
  }
  // Challenge Cup or CC teams are basically fully random teams.
  randomCCTeam() {
    this.enforceNoDirectCustomBanlistChanges();
    const team = [];
    const randomN = this.randomNPokemon(this.maxTeamSize, this.forceMonotype);
    for (const pokemon of randomN) {
      const species = this.dex.species.get(pokemon);
      const learnset = this.dex.species.getLearnset(species.id);
      const mbstmin = 1307;
      const stats = species.baseStats;
      let mbst = stats["hp"] * 2 + 30 + 63 + 100 + 10;
      mbst += stats["atk"] * 2 + 30 + 63 + 100 + 5;
      mbst += stats["def"] * 2 + 30 + 63 + 100 + 5;
      mbst += stats["spa"] * 2 + 30 + 63 + 100 + 5;
      mbst += stats["spd"] * 2 + 30 + 63 + 100 + 5;
      mbst += stats["spe"] * 2 + 30 + 63 + 100 + 5;
      let level;
      if (this.adjustLevel) {
        level = this.adjustLevel;
      } else {
        level = Math.floor(100 * mbstmin / mbst);
        while (level < 100) {
          mbst = Math.floor((stats["hp"] * 2 + 30 + 63 + 100) * level / 100 + 10);
          mbst += Math.floor(((stats["atk"] * 2 + 30 + 63 + 100) * level / 100 + 5) * level / 100);
          mbst += Math.floor((stats["def"] * 2 + 30 + 63 + 100) * level / 100 + 5);
          mbst += Math.floor(((stats["spa"] * 2 + 30 + 63 + 100) * level / 100 + 5) * level / 100);
          mbst += Math.floor((stats["spd"] * 2 + 30 + 63 + 100) * level / 100 + 5);
          mbst += Math.floor((stats["spe"] * 2 + 30 + 63 + 100) * level / 100 + 5);
          if (mbst >= mbstmin)
            break;
          level++;
        }
      }
      const ivs = {
        hp: 0,
        atk: this.random(16),
        def: this.random(16),
        spa: this.random(16),
        spd: 0,
        spe: this.random(16)
      };
      ivs["hp"] = ivs["atk"] % 2 * 16 + ivs["def"] % 2 * 8 + ivs["spe"] % 2 * 4 + ivs["spa"] % 2 * 2;
      ivs["atk"] *= 2;
      ivs["def"] *= 2;
      ivs["spa"] *= 2;
      ivs["spd"] = ivs["spa"];
      ivs["spe"] *= 2;
      const evs = { hp: 255, atk: 255, def: 255, spa: 255, spd: 255, spe: 255 };
      const pool = [];
      if (learnset) {
        for (const move in learnset) {
          if (this.dex.moves.get(move).gen !== 1)
            continue;
          if (learnset[move].some((learned) => learned.startsWith("1"))) {
            pool.push(move);
          }
        }
      }
      team.push({
        name: species.baseSpecies,
        species: species.name,
        moves: this.multipleSamplesNoReplace(pool, 4),
        gender: false,
        ability: "No Ability",
        evs,
        ivs,
        item: "",
        level,
        happiness: 0,
        shiny: false,
        nature: "Serious"
      });
    }
    return team;
  }
  // Random team generation for Gen 1 Random Battles.
  randomTeam() {
    this.enforceNoDirectCustomBanlistChanges();
    const seed = this.prng.seed;
    const ruleTable = this.dex.formats.getRuleTable(this.format);
    const pokemon = [];
    const isMonotype = !!this.forceMonotype || ruleTable.has("sametypeclause");
    const typePool = this.dex.types.names();
    const type = this.forceMonotype || this.sample(typePool);
    const rejectedButNotInvalidPool = [];
    const nuTiers = ["UU", "UUBL", "NFE", "LC", "NU"];
    const uuTiers = ["NFE", "UU", "UUBL", "NU"];
    const typeCount = {};
    const weaknessCount = { Electric: 0, Psychic: 0, Water: 0, Ice: 0, Ground: 0 };
    let uberCount = 0;
    let nuCount = 0;
    const pokemonPool = this.getPokemonPool(type, pokemon, isMonotype);
    while (pokemonPool.length && pokemon.length < this.maxTeamSize) {
      const species = this.dex.species.get(this.sampleNoReplace(pokemonPool));
      if (!species.exists || !this.randomData[species.id]?.moves)
        continue;
      if (species.id === "ditto" && this.battleHasDitto)
        continue;
      const limitFactor = Math.round(this.maxTeamSize / 6) || 1;
      const tier = species.tier;
      switch (tier) {
        case "LC":
        case "NFE":
          if (nuCount >= 4 * limitFactor || this.randomChance(1, 3))
            continue;
          break;
        case "Uber":
          if (uberCount >= 1 * limitFactor)
            continue;
          break;
        default:
          if (uuTiers.includes(tier) && pokemonPool.length > 1 && (nuCount >= 4 * limitFactor && this.randomChance(1, 2))) {
            continue;
          }
      }
      let skip = false;
      if (!isMonotype && !this.forceMonotype) {
        for (const typeName of species.types) {
          if (typeCount[typeName] >= 2 * limitFactor || typeCount[typeName] >= 1 * limitFactor && this.randomChance(1, 2) && pokemonPool.length > 1) {
            skip = true;
            break;
          }
        }
        if (skip) {
          rejectedButNotInvalidPool.push(species.id);
          continue;
        }
      }
      const pokemonWeaknesses = [];
      for (const typeName in weaknessCount) {
        const increaseCount = this.dex.getImmunity(typeName, species) && this.dex.getEffectiveness(typeName, species) > 0;
        if (!increaseCount)
          continue;
        if (weaknessCount[typeName] >= 2 * limitFactor) {
          skip = true;
          break;
        }
        pokemonWeaknesses.push(typeName);
      }
      if (skip) {
        rejectedButNotInvalidPool.push(species.id);
        continue;
      }
      pokemon.push(this.randomSet(species));
      for (const typeName of species.types) {
        if (typeCount[typeName]) {
          typeCount[typeName]++;
        } else {
          typeCount[typeName] = 1;
        }
      }
      for (const weakness of pokemonWeaknesses) {
        weaknessCount[weakness]++;
      }
      if (tier === "Uber") {
        uberCount++;
      } else if (nuTiers.includes(tier)) {
        nuCount++;
      }
      if (species.id === "ditto")
        this.battleHasDitto = true;
    }
    while (pokemon.length < this.maxTeamSize && rejectedButNotInvalidPool.length) {
      const species = this.sampleNoReplace(rejectedButNotInvalidPool);
      pokemon.push(this.randomSet(species));
    }
    if (pokemon.length < this.maxTeamSize && pokemon.length < 12 && !isMonotype) {
      throw new Error(`Could not build a random team for ${this.format} (seed=${seed})`);
    }
    return pokemon;
  }
  shouldCullMove(move, types, moves, counter) {
    switch (move.id) {
      case "hydropump":
        return { cull: moves.has("surf") };
      case "surf":
        return { cull: moves.has("hydropump") };
      case "selfdestruct":
        return { cull: moves.has("rest") };
      case "rest":
        return { cull: moves.has("selfdestruct") };
      case "sharpen":
      case "swordsdance":
        return { cull: counter.get("Special") > counter.get("Physical") || !counter.get("Physical") || moves.has("growth") };
      case "growth":
        return { cull: counter.get("Special") < counter.get("Physical") || !counter.get("Special") || moves.has("swordsdance") };
      case "poisonpowder":
      case "stunspore":
      case "sleeppowder":
      case "toxic":
        return { cull: counter.get("Status") > 1 };
    }
    return { cull: false };
  }
  /**
   * Random set generation for Gen 1 Random Battles.
   */
  randomSet(species) {
    species = this.dex.species.get(species);
    if (!species.exists)
      species = this.dex.species.get("pikachu");
    const data = this.randomData[species.id];
    const movePool = data.moves?.slice() || [];
    const moves = /* @__PURE__ */ new Set();
    const types = new Set(species.types);
    const counter = new import_random_teams2.MoveCounter();
    const PhysicalSetup = ["swordsdance", "sharpen"];
    const SpecialSetup = ["amnesia", "growth"];
    if (data.comboMoves && data.comboMoves.length <= this.maxMoveCount && this.randomChance(1, 2)) {
      for (const m of data.comboMoves)
        moves.add(m);
    }
    if (moves.size < this.maxMoveCount && data.exclusiveMoves) {
      moves.add(this.sample(data.exclusiveMoves));
    }
    if (moves.size < this.maxMoveCount && data.essentialMove) {
      moves.add(data.essentialMove);
    }
    while (moves.size < this.maxMoveCount && movePool.length) {
      while (moves.size < this.maxMoveCount && movePool.length) {
        const moveid = this.sampleNoReplace(movePool);
        moves.add(moveid);
      }
      if (movePool.length) {
        for (const setMoveid of moves) {
          const move = this.dex.moves.get(setMoveid);
          const moveid = move.id;
          if (!move.damage && !move.damageCallback)
            counter.add(move.category);
          if (PhysicalSetup.includes(moveid))
            counter.add("physicalsetup");
          if (SpecialSetup.includes(moveid))
            counter.add("specialsetup");
        }
        for (const moveid of moves) {
          if (moveid === data.essentialMove)
            continue;
          const move = this.dex.moves.get(moveid);
          if ((!data.essentialMove || moveid !== data.essentialMove) && this.shouldCullMove(move, types, moves, counter).cull) {
            moves.delete(moveid);
            break;
          }
          counter.add(move.category);
        }
      }
    }
    const levelScale = {
      LC: 88,
      NFE: 80,
      PU: 77,
      NU: 77,
      NUBL: 76,
      UU: 74,
      UUBL: 71,
      OU: 68,
      Uber: 65
    };
    const level = this.adjustLevel || data.level || levelScale[species.tier] || 80;
    const evs = { hp: 255, atk: 255, def: 255, spa: 255, spd: 255, spe: 255 };
    const ivs = { hp: 30, atk: 30, def: 30, spa: 30, spd: 30, spe: 30 };
    if (moves.has("substitute")) {
      while (evs.hp > 3) {
        const hp = Math.floor(Math.floor(2 * species.baseStats.hp + ivs.hp + Math.floor(evs.hp / 4) + 100) * level / 100 + 10);
        if (hp % 4 !== 0)
          break;
        evs.hp -= 4;
      }
    }
    return {
      name: species.name,
      species: species.name,
      moves: Array.from(moves),
      ability: "No Ability",
      evs,
      ivs,
      item: "",
      level,
      shiny: false,
      gender: false
    };
  }
  randomHCTeam() {
    this.enforceNoDirectCustomBanlistChanges();
    const team = [];
    const movePool = [...this.dex.moves.all()];
    const typesPool = ["Bird", ...this.dex.types.names()];
    const randomN = this.randomNPokemon(this.maxTeamSize);
    const hackmonsCup = {};
    for (const forme of randomN) {
      const species = this.dex.species.get(forme);
      if (!hackmonsCup[species.id]) {
        hackmonsCup[species.id] = {
          types: [this.sample(typesPool), this.sample(typesPool)],
          baseStats: {
            hp: import_lib.Utils.clampIntRange(this.random(256), 1),
            atk: import_lib.Utils.clampIntRange(this.random(256), 1),
            def: import_lib.Utils.clampIntRange(this.random(256), 1),
            spa: import_lib.Utils.clampIntRange(this.random(256), 1),
            spd: 0,
            spe: import_lib.Utils.clampIntRange(this.random(256), 1)
          }
        };
        if (this.forceMonotype && !hackmonsCup[species.id].types.includes(this.forceMonotype)) {
          hackmonsCup[species.id].types[1] = this.forceMonotype;
        }
        hackmonsCup[species.id].baseStats.spd = hackmonsCup[species.id].baseStats.spa;
      }
      if (hackmonsCup[species.id].types[0] === hackmonsCup[species.id].types[1]) {
        hackmonsCup[species.id].types.splice(1, 1);
      }
      const moves = [];
      do {
        const move = this.sampleNoReplace(movePool);
        if (move.gen <= this.gen && !move.isNonstandard && !move.name.startsWith("Hidden Power ")) {
          moves.push(move.id);
        }
      } while (moves.length < this.maxMoveCount);
      const evs = {
        hp: this.random(256),
        atk: this.random(256),
        def: this.random(256),
        spa: this.random(256),
        spd: 0,
        spe: this.random(256)
      };
      evs["spd"] = evs["spa"];
      const ivs = {
        hp: 0,
        atk: this.random(16),
        def: this.random(16),
        spa: this.random(16),
        spd: 0,
        spe: this.random(16)
      };
      ivs["hp"] = ivs["atk"] % 2 * 16 + ivs["def"] % 2 * 8 + ivs["spe"] % 2 * 4 + ivs["spa"] % 2 * 2;
      for (const iv in ivs) {
        if (iv === "hp" || iv === "spd")
          continue;
        ivs[iv] *= 2;
      }
      ivs["spd"] = ivs["spa"];
      const mbstmin = 425;
      const baseStats = hackmonsCup[species.id].baseStats;
      const calcStat = (statName, lvl) => {
        if (lvl) {
          return Math.floor(Math.floor(2 * baseStats[statName] + ivs[statName] + Math.floor(evs[statName] / 4)) * lvl / 100 + 5);
        }
        return Math.floor(2 * baseStats[statName] + ivs[statName] + Math.floor(evs[statName] / 4)) + 5;
      };
      let mbst = 0;
      for (const statName of Object.keys(baseStats)) {
        mbst += calcStat(statName);
        if (statName === "hp")
          mbst += 5;
      }
      let level;
      if (this.adjustLevel) {
        level = this.adjustLevel;
      } else {
        level = Math.floor(100 * mbstmin / mbst);
        while (level < 100) {
          for (const statName of Object.keys(baseStats)) {
            mbst += calcStat(statName, level);
            if (statName === "hp")
              mbst += 5;
          }
          if (mbst >= mbstmin)
            break;
          level++;
        }
        if (level > 100)
          level = 100;
      }
      team.push({
        name: species.baseSpecies,
        species: species.name,
        gender: species.gender,
        item: "",
        ability: "No Ability",
        moves,
        evs,
        ivs,
        nature: "",
        level,
        shiny: false,
        // Hacky but the only way to communicate stats/level generation properly
        hc: hackmonsCup[species.id]
      });
    }
    return team;
  }
}
var random_teams_default = RandomGen1Teams;
//# sourceMappingURL=random-teams.js.map
