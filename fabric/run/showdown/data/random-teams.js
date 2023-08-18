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
var random_teams_exports = {};
__export(random_teams_exports, {
  MoveCounter: () => MoveCounter,
  RandomTeams: () => RandomTeams,
  default: () => random_teams_default
});
module.exports = __toCommonJS(random_teams_exports);
var import_dex = require("../sim/dex");
var import_lib = require("../lib");
var import_prng = require("../sim/prng");
var import_tags = require("./tags");
class MoveCounter extends import_lib.Utils.Multiset {
  constructor() {
    super();
    this.damagingMoves = /* @__PURE__ */ new Set();
    this.stabCounter = 0;
    this.ironFist = 0;
  }
  get(key) {
    return super.get(key) || 0;
  }
}
const RecoveryMove = [
  "healorder",
  "milkdrink",
  "moonlight",
  "morningsun",
  "recover",
  "roost",
  "shoreup",
  "slackoff",
  "softboiled",
  "strengthsap",
  "synthesis"
];
const ContraryMoves = [
  "armorcannon",
  "closecombat",
  "leafstorm",
  "makeitrain",
  "overheat",
  "spinout",
  "superpower",
  "vcreate"
];
const PhysicalSetup = [
  "bellydrum",
  "bulkup",
  "coil",
  "curse",
  "dragondance",
  "honeclaws",
  "howl",
  "meditate",
  "poweruppunch",
  "swordsdance",
  "tidyup"
];
const SpecialSetup = [
  "calmmind",
  "chargebeam",
  "geomancy",
  "nastyplot",
  "quiverdance",
  "tailglow",
  "torchsong"
];
const MixedSetup = [
  "clangoroussoul",
  "growth",
  "happyhour",
  "holdhands",
  "noretreat",
  "shellsmash",
  "workup"
];
const SpeedSetup = [
  "agility",
  "autotomize",
  "rockpolish"
];
const Setup = [
  "acidarmor",
  "agility",
  "autotomize",
  "bellydrum",
  "bulkup",
  "calmmind",
  "coil",
  "curse",
  "dragondance",
  "flamecharge",
  "growth",
  "honeclaws",
  "howl",
  "irondefense",
  "meditate",
  "nastyplot",
  "noretreat",
  "poweruppunch",
  "quiverdance",
  "rockpolish",
  "shellsmash",
  "shiftgear",
  "swordsdance",
  "tailglow",
  "tidyup",
  "trailblaze",
  "workup"
];
const NoStab = [
  "accelerock",
  "aquajet",
  "beakblast",
  "bounce",
  "breakingswipe",
  "chatter",
  "chloroblast",
  "clearsmog",
  "dragontail",
  "eruption",
  "explosion",
  "fakeout",
  "flamecharge",
  "flipturn",
  "iceshard",
  "icywind",
  "incinerate",
  "machpunch",
  "meteorbeam",
  "mortalspin",
  "pluck",
  "pursuit",
  "quickattack",
  "rapidspin",
  "reversal",
  "selfdestruct",
  "shadowsneak",
  "skydrop",
  "snarl",
  "suckerpunch",
  "uturn",
  "watershuriken",
  "vacuumwave",
  "voltswitch",
  "waterspout"
];
const Hazards = [
  "spikes",
  "stealthrock",
  "stickyweb",
  "toxicspikes"
];
const MovePairs = [
  ["lightscreen", "reflect"],
  ["sleeptalk", "rest"],
  ["protect", "wish"],
  ["leechseed", "protect"]
];
const PriorityPokemon = [
  "banette",
  "breloom",
  "brutebonnet",
  "cacturne",
  "giratinaorigin",
  "lycanrocdusk",
  "mimikyu",
  "scizor"
];
function sereneGraceBenefits(move) {
  return move.secondary?.chance && move.secondary.chance > 20 && move.secondary.chance < 100;
}
class RandomTeams {
  constructor(format, prng) {
    // TODO: Make types for this
    this.randomSets = require("./random-sets.json");
    this.randomDoublesSets = require("./random-sets.json");
    format = import_dex.Dex.formats.get(format);
    this.dex = import_dex.Dex.forFormat(format);
    this.gen = this.dex.gen;
    this.noStab = NoStab;
    const ruleTable = import_dex.Dex.formats.getRuleTable(format);
    this.maxTeamSize = ruleTable.maxTeamSize;
    this.adjustLevel = ruleTable.adjustLevel;
    this.maxMoveCount = ruleTable.maxMoveCount;
    const forceMonotype = ruleTable.valueRules.get("forcemonotype");
    this.forceMonotype = forceMonotype && this.dex.types.get(forceMonotype).exists ? this.dex.types.get(forceMonotype).name : void 0;
    this.factoryTier = "";
    this.format = format;
    this.prng = prng && !Array.isArray(prng) ? prng : new import_prng.PRNG(prng);
    this.moveEnforcementCheckers = {
      Bug: (movePool) => movePool.includes("megahorn"),
      Dark: (movePool, moves, abilities, types, counter) => !counter.get("Dark"),
      Dragon: (movePool, moves, abilities, types, counter) => !counter.get("Dragon") && !movePool.includes("dualwingbeat"),
      Electric: (movePool, moves, abilities, types, counter) => !counter.get("Electric"),
      Fairy: (movePool, moves, abilities, types, counter) => !counter.get("Fairy"),
      Fighting: (movePool, moves, abilities, types, counter) => !counter.get("Fighting"),
      Fire: (movePool, moves, abilities, types, counter, species) => !counter.get("Fire"),
      Flying: (movePool, moves, abilities, types, counter) => !counter.get("Flying"),
      Ghost: (movePool, moves, abilities, types, counter) => !counter.get("Ghost"),
      Grass: (movePool, moves, abilities, types, counter, species) => !counter.get("Grass") && (movePool.includes("leafstorm") || species.baseStats.atk >= 100 || types.includes("Electric") || abilities.has("Seed Sower")),
      Ground: (movePool, moves, abilities, types, counter) => !counter.get("Ground"),
      Ice: (movePool, moves, abilities, types, counter) => movePool.includes("freezedry") || !counter.get("Ice"),
      Normal: (movePool, moves, types, counter) => movePool.includes("boomburst") || movePool.includes("hypervoice"),
      Poison: (movePool, moves, abilities, types, counter) => {
        if (types.includes("Ground"))
          return false;
        return !counter.get("Poison");
      },
      Psychic: (movePool, moves, abilities, types, counter) => {
        if (counter.get("Psychic"))
          return false;
        if (movePool.includes("calmmind") || movePool.includes("psychicfangs") || movePool.includes("psychocut"))
          return true;
        return abilities.has("Psychic Surge") || types.includes("Fire") || types.includes("Electric");
      },
      Rock: (movePool, moves, abilities, types, counter, species) => !counter.get("Rock") && species.baseStats.atk >= 80,
      Steel: (movePool, moves, abilities, types, counter, species) => {
        if (species.baseStats.atk <= 95 && !movePool.includes("makeitrain"))
          return false;
        return !counter.get("Steel");
      },
      Water: (movePool, moves, abilities, types, counter, species) => {
        if (types.includes("Ground"))
          return false;
        return !counter.get("Water");
      }
    };
  }
  setSeed(prng) {
    this.prng = prng && !Array.isArray(prng) ? prng : new import_prng.PRNG(prng);
  }
  getTeam(options) {
    const generatorName = typeof this.format.team === "string" && this.format.team.startsWith("random") ? this.format.team + "Team" : "";
    return this[generatorName || "randomTeam"](options);
  }
  randomChance(numerator, denominator) {
    return this.prng.randomChance(numerator, denominator);
  }
  sample(items) {
    return this.prng.sample(items);
  }
  sampleIfArray(item) {
    if (Array.isArray(item)) {
      return this.sample(item);
    }
    return item;
  }
  random(m, n) {
    return this.prng.next(m, n);
  }
  /**
   * Remove an element from an unsorted array significantly faster
   * than .splice
   */
  fastPop(list, index) {
    const length = list.length;
    if (index < 0 || index >= list.length) {
      throw new Error(`Index ${index} out of bounds for given array`);
    }
    const element = list[index];
    list[index] = list[length - 1];
    list.pop();
    return element;
  }
  /**
   * Remove a random element from an unsorted array and return it.
   * Uses the battle's RNG if in a battle.
   */
  sampleNoReplace(list) {
    const length = list.length;
    if (length === 0)
      return null;
    const index = this.random(length);
    return this.fastPop(list, index);
  }
  /**
   * Removes n random elements from an unsorted array and returns them.
   * If n is less than the array's length, randomly removes and returns all the elements
   * in the array (so the returned array could have length < n).
   */
  multipleSamplesNoReplace(list, n) {
    const samples = [];
    while (samples.length < n && list.length) {
      samples.push(this.sampleNoReplace(list));
    }
    return samples;
  }
  /**
   * Check if user has directly tried to ban/unban/restrict things in a custom battle.
   * Doesn't count bans nested inside other formats/rules.
   */
  hasDirectCustomBanlistChanges() {
    if (this.format.banlist.length || this.format.restricted.length || this.format.unbanlist.length)
      return true;
    if (!this.format.customRules)
      return false;
    for (const rule of this.format.customRules) {
      for (const banlistOperator of ["-", "+", "*"]) {
        if (rule.startsWith(banlistOperator))
          return true;
      }
    }
    return false;
  }
  /**
   * Inform user when custom bans are unsupported in a team generator.
   */
  enforceNoDirectCustomBanlistChanges() {
    if (this.hasDirectCustomBanlistChanges()) {
      throw new Error(`Custom bans are not currently supported in ${this.format.name}.`);
    }
  }
  /**
   * Inform user when complex bans are unsupported in a team generator.
   */
  enforceNoDirectComplexBans() {
    if (!this.format.customRules)
      return false;
    for (const rule of this.format.customRules) {
      if (rule.includes("+") && !rule.startsWith("+")) {
        throw new Error(`Complex bans are not currently supported in ${this.format.name}.`);
      }
    }
  }
  /**
   * Validate set element pool size is sufficient to support size requirements after simple bans.
   */
  enforceCustomPoolSizeNoComplexBans(effectTypeName, basicEffectPool, requiredCount, requiredCountExplanation) {
    if (basicEffectPool.length >= requiredCount)
      return;
    throw new Error(`Legal ${effectTypeName} count is insufficient to support ${requiredCountExplanation} (${basicEffectPool.length} / ${requiredCount}).`);
  }
  queryMoves(moves, species, teraType, abilities = /* @__PURE__ */ new Set()) {
    const counter = new MoveCounter();
    const types = species.types;
    if (!moves?.size)
      return counter;
    const categories = { Physical: 0, Special: 0, Status: 0 };
    for (const moveid of moves) {
      const move = this.dex.moves.get(moveid);
      const moveType = this.getMoveType(move, species, abilities, teraType);
      if (move.damage || move.damageCallback) {
        counter.add("damage");
        counter.damagingMoves.add(move);
      } else {
        categories[move.category]++;
      }
      if (moveid === "lowkick" || move.basePower && move.basePower <= 60 && moveid !== "rapidspin") {
        counter.add("technician");
      }
      if (move.multihit && Array.isArray(move.multihit) && move.multihit[1] === 5)
        counter.add("skilllink");
      if (move.recoil || move.hasCrashDamage)
        counter.add("recoil");
      if (move.drain)
        counter.add("drain");
      if (move.basePower > 30 || move.multihit || move.basePowerCallback) {
        if (!this.noStab.includes(moveid) || PriorityPokemon.includes(species.id) && move.priority > 0) {
          counter.add(moveType);
          if (types.includes(moveType))
            counter.stabCounter++;
          if (teraType === moveType)
            counter.add("stabtera");
        }
        if (move.flags["bite"])
          counter.add("strongjaw");
        if (move.flags["punch"])
          counter.ironFist++;
        if (move.flags["sound"])
          counter.add("sound");
        if (move.priority > 0 || moveid === "grassyglide" && abilities.has("Grassy Surge")) {
          counter.add("priority");
        }
        counter.damagingMoves.add(move);
      }
      if (move.secondary || move.hasSheerForce) {
        counter.add("sheerforce");
        if (sereneGraceBenefits(move)) {
          counter.add("serenegrace");
        }
      }
      if (move.accuracy && move.accuracy !== true && move.accuracy < 90)
        counter.add("inaccurate");
      if (RecoveryMove.includes(moveid))
        counter.add("recovery");
      if (ContraryMoves.includes(moveid))
        counter.add("contrary");
      if (PhysicalSetup.includes(moveid))
        counter.add("physicalsetup");
      if (SpecialSetup.includes(moveid))
        counter.add("specialsetup");
      if (MixedSetup.includes(moveid))
        counter.add("mixedsetup");
      if (SpeedSetup.includes(moveid))
        counter.add("speedsetup");
      if (Setup.includes(moveid))
        counter.add("setup");
      if (Hazards.includes(moveid))
        counter.add("hazards");
    }
    counter.set("Physical", Math.floor(categories["Physical"]));
    counter.set("Special", Math.floor(categories["Special"]));
    counter.set("Status", categories["Status"]);
    return counter;
  }
  cullMovePool(types, moves, abilities, counter, movePool, teamDetails, species, isLead, isDoubles, teraType, role) {
    if (moves.size + movePool.length <= this.maxMoveCount)
      return;
    if (moves.size === this.maxMoveCount - 2) {
      const unpairedMoves = [...movePool];
      for (const pair of MovePairs) {
        if (movePool.includes(pair[0]) && movePool.includes(pair[1])) {
          this.fastPop(unpairedMoves, unpairedMoves.indexOf(pair[0]));
          this.fastPop(unpairedMoves, unpairedMoves.indexOf(pair[1]));
        }
      }
      if (unpairedMoves.length === 1) {
        this.fastPop(movePool, movePool.indexOf(unpairedMoves[0]));
      }
    }
    if (moves.size === this.maxMoveCount - 1) {
      for (const pair of MovePairs) {
        if (movePool.includes(pair[0]) && movePool.includes(pair[1])) {
          this.fastPop(movePool, movePool.indexOf(pair[0]));
          this.fastPop(movePool, movePool.indexOf(pair[1]));
        }
      }
    }
    const pivotingMoves = ["chillyreception", "flipturn", "partingshot", "shedtail", "teleport", "uturn", "voltswitch"];
    const statusMoves = this.dex.moves.all().filter((move) => move.category === "Status").map((move) => move.id);
    if (teamDetails.stealthRock) {
      if (movePool.includes("stealthrock"))
        this.fastPop(movePool, movePool.indexOf("stealthrock"));
    }
    if (moves.size + movePool.length <= this.maxMoveCount)
      return;
    if (teamDetails.defog || teamDetails.rapidSpin) {
      if (movePool.includes("defog"))
        this.fastPop(movePool, movePool.indexOf("defog"));
      if (movePool.includes("rapidspin"))
        this.fastPop(movePool, movePool.indexOf("rapidspin"));
    }
    if (teamDetails.stickyWeb) {
      if (movePool.includes("stickyweb"))
        this.fastPop(movePool, movePool.indexOf("stickyweb"));
    }
    this.incompatibleMoves(moves, movePool, statusMoves, ["healingwish", "switcheroo", "trick"]);
    if (species.id !== "scyther" && species.id !== "scizor") {
      this.incompatibleMoves(moves, movePool, Setup, pivotingMoves);
    }
    this.incompatibleMoves(moves, movePool, Setup, Hazards);
    this.incompatibleMoves(moves, movePool, Setup, ["defog", "nuzzle", "toxic", "waterspout", "yawn", "haze"]);
    this.incompatibleMoves(moves, movePool, PhysicalSetup, PhysicalSetup);
    this.incompatibleMoves(moves, movePool, SpecialSetup, "thunderwave");
    this.incompatibleMoves(moves, movePool, "substitute", pivotingMoves);
    this.incompatibleMoves(moves, movePool, SpeedSetup, ["aquajet", "rest", "trickroom"]);
    this.incompatibleMoves(moves, movePool, "curse", "rapidspin");
    this.incompatibleMoves(moves, movePool, "dragondance", "dracometeor");
    this.incompatibleMoves(moves, movePool, "healingwish", "uturn");
    this.incompatibleMoves(moves, movePool, "psychic", "psyshock");
    this.incompatibleMoves(moves, movePool, "surf", "hydropump");
    this.incompatibleMoves(moves, movePool, "liquidation", "wavecrash");
    this.incompatibleMoves(moves, movePool, ["airslash", "bravebird", "hurricane"], ["airslash", "bravebird", "hurricane"]);
    this.incompatibleMoves(moves, movePool, "knockoff", "foulplay");
    this.incompatibleMoves(moves, movePool, "doubleedge", "headbutt");
    this.incompatibleMoves(moves, movePool, "fireblast", ["fierydance", "flamethrower"]);
    this.incompatibleMoves(moves, movePool, "lavaplume", "magmastorm");
    this.incompatibleMoves(moves, movePool, "thunderpunch", "wildcharge");
    this.incompatibleMoves(moves, movePool, "gunkshot", ["direclaw", "poisonjab"]);
    this.incompatibleMoves(moves, movePool, "aurasphere", "focusblast");
    this.incompatibleMoves(moves, movePool, "closecombat", "drainpunch");
    this.incompatibleMoves(moves, movePool, "bugbite", "pounce");
    this.incompatibleMoves(moves, movePool, "bittermalice", "shadowball");
    this.incompatibleMoves(moves, movePool, ["dragonpulse", "spacialrend"], "dracometeor");
    this.incompatibleMoves(moves, movePool, ["taunt", "strengthsap"], "encore");
    this.incompatibleMoves(moves, movePool, "toxic", "willowisp");
    this.incompatibleMoves(moves, movePool, ["thunderwave", "toxic", "willowisp"], "toxicspikes");
    this.incompatibleMoves(moves, movePool, "thunderwave", "yawn");
    if (species.id === "dugtrio") {
      this.incompatibleMoves(moves, movePool, statusMoves, "memento");
    }
    this.incompatibleMoves(moves, movePool, "nastyplot", "rockslide");
    this.incompatibleMoves(moves, movePool, "switcheroo", ["fakeout", "superfang"]);
    this.incompatibleMoves(moves, movePool, "snowscape", "swordsdance");
    if (!teamDetails.defog && !teamDetails.rapidSpin && species.id === "cryogonal") {
      if (movePool.includes("haze"))
        this.fastPop(movePool, movePool.indexOf("haze"));
    }
    this.incompatibleMoves(moves, movePool, "bodypress", "mirrorcoat");
    this.incompatibleMoves(moves, movePool, "toxic", "clearsmog");
  }
  // Checks for and removes incompatible moves, starting with the first move in movesA.
  incompatibleMoves(moves, movePool, movesA, movesB) {
    const moveArrayA = Array.isArray(movesA) ? movesA : [movesA];
    const moveArrayB = Array.isArray(movesB) ? movesB : [movesB];
    if (moves.size + movePool.length <= this.maxMoveCount)
      return;
    for (const moveid1 of moves) {
      if (moveArrayB.includes(moveid1)) {
        for (const moveid2 of moveArrayA) {
          if (moveid1 !== moveid2 && movePool.includes(moveid2)) {
            this.fastPop(movePool, movePool.indexOf(moveid2));
            if (moves.size + movePool.length <= this.maxMoveCount)
              return;
          }
        }
      }
      if (moveArrayA.includes(moveid1)) {
        for (const moveid2 of moveArrayB) {
          if (moveid1 !== moveid2 && movePool.includes(moveid2)) {
            this.fastPop(movePool, movePool.indexOf(moveid2));
            if (moves.size + movePool.length <= this.maxMoveCount)
              return;
          }
        }
      }
    }
  }
  // Adds a move to the moveset, returns the MoveCounter
  addMove(move, moves, types, abilities, teamDetails, species, isLead, isDoubles, movePool, teraType, role) {
    moves.add(move);
    this.fastPop(movePool, movePool.indexOf(move));
    const counter = this.queryMoves(moves, species, teraType, abilities);
    this.cullMovePool(types, moves, abilities, counter, movePool, teamDetails, species, isLead, isDoubles, teraType, role);
    return counter;
  }
  // Returns the type of a given move for STAB/coverage enforcement purposes
  getMoveType(move, species, abilities, teraType) {
    if (move.id === "terablast")
      return teraType;
    if (["judgment", "revelationdance"].includes(move.id))
      return species.types[0];
    if (move.name === "Raging Bull" && species.name.startsWith("Tauros-Paldea")) {
      if (species.name.endsWith("Combat"))
        return "Fighting";
      if (species.name.endsWith("Blaze"))
        return "Fire";
      if (species.name.endsWith("Aqua"))
        return "Water";
    }
    const moveType = move.type;
    if (moveType === "Normal") {
      if (abilities.has("Aerilate"))
        return "Flying";
      if (abilities.has("Galvanize"))
        return "Electric";
      if (abilities.has("Pixilate"))
        return "Fairy";
      if (abilities.has("Refrigerate"))
        return "Ice";
    }
    return moveType;
  }
  // Generate random moveset for a given species, role, tera type.
  randomMoveset(types, abilities, teamDetails, species, isLead, isDoubles, movePool, teraType, role) {
    const moves = /* @__PURE__ */ new Set();
    let counter = this.queryMoves(moves, species, teraType, abilities);
    this.cullMovePool(types, moves, abilities, counter, movePool, teamDetails, species, isLead, isDoubles, teraType, role);
    if (movePool.length <= this.maxMoveCount) {
      for (const moveid of movePool) {
        moves.add(moveid);
      }
      return moves;
    }
    const runEnforcementChecker = (checkerName) => {
      if (!this.moveEnforcementCheckers[checkerName])
        return false;
      return this.moveEnforcementCheckers[checkerName](
        movePool,
        moves,
        abilities,
        types,
        counter,
        species,
        teamDetails,
        isLead,
        isDoubles,
        teraType,
        role
      );
    };
    if (role === "Tera Blast user") {
      counter = this.addMove(
        "terablast",
        moves,
        types,
        abilities,
        teamDetails,
        species,
        isLead,
        isDoubles,
        movePool,
        teraType,
        role
      );
    }
    if (species.requiredMove) {
      const move = this.dex.moves.get(species.requiredMove).id;
      counter = this.addMove(
        move,
        moves,
        types,
        abilities,
        teamDetails,
        species,
        isLead,
        isDoubles,
        movePool,
        teraType,
        role
      );
    }
    if (movePool.includes("facade") && abilities.has("Guts")) {
      counter = this.addMove(
        "facade",
        moves,
        types,
        abilities,
        teamDetails,
        species,
        isLead,
        isDoubles,
        movePool,
        teraType,
        role
      );
    }
    if (movePool.includes("stickyweb")) {
      counter = this.addMove(
        "stickyweb",
        moves,
        types,
        abilities,
        teamDetails,
        species,
        isLead,
        isDoubles,
        movePool,
        teraType,
        role
      );
    }
    if (movePool.includes("revivalblessing")) {
      counter = this.addMove(
        "revivalblessing",
        moves,
        types,
        abilities,
        teamDetails,
        species,
        isLead,
        isDoubles,
        movePool,
        teraType,
        role
      );
    }
    if (movePool.includes("saltcure")) {
      counter = this.addMove(
        "saltcure",
        moves,
        types,
        abilities,
        teamDetails,
        species,
        isLead,
        isDoubles,
        movePool,
        teraType,
        role
      );
    }
    if (movePool.includes("toxic") && species.id === "grafaiai") {
      counter = this.addMove(
        "toxic",
        moves,
        types,
        abilities,
        teamDetails,
        species,
        isLead,
        isDoubles,
        movePool,
        teraType,
        role
      );
    }
    if (role === "Bulky Attacker" || role === "Bulky Setup" || PriorityPokemon.includes(species.id)) {
      const priorityMoves = [];
      for (const moveid of movePool) {
        const move = this.dex.moves.get(moveid);
        const moveType = this.getMoveType(move, species, abilities, teraType);
        if (types.includes(moveType) && move.priority > 0 && move.category !== "Status") {
          priorityMoves.push(moveid);
        }
      }
      if (priorityMoves.length) {
        const moveid = this.sample(priorityMoves);
        counter = this.addMove(
          moveid,
          moves,
          types,
          abilities,
          teamDetails,
          species,
          isLead,
          isDoubles,
          movePool,
          teraType,
          role
        );
      }
    }
    for (const type of types) {
      const stabMoves = [];
      for (const moveid of movePool) {
        const move = this.dex.moves.get(moveid);
        const moveType = this.getMoveType(move, species, abilities, teraType);
        if (type === moveType && (move.basePower > 30 || move.multihit || move.basePowerCallback) && (!this.noStab.includes(moveid) || abilities.has("Technician") && moveid === "machpunch")) {
          stabMoves.push(moveid);
        }
      }
      while (runEnforcementChecker(type)) {
        if (!stabMoves.length)
          break;
        const moveid = this.sampleNoReplace(stabMoves);
        counter = this.addMove(
          moveid,
          moves,
          types,
          abilities,
          teamDetails,
          species,
          isLead,
          isDoubles,
          movePool,
          teraType,
          role
        );
      }
    }
    if (!counter.stabCounter) {
      const stabMoves = [];
      for (const moveid of movePool) {
        const move = this.dex.moves.get(moveid);
        const moveType = this.getMoveType(move, species, abilities, teraType);
        if (!this.noStab.includes(moveid) && (move.basePower > 30 || move.multihit || move.basePowerCallback) && types.includes(moveType)) {
          stabMoves.push(moveid);
        }
      }
      if (stabMoves.length) {
        const moveid = this.sample(stabMoves);
        counter = this.addMove(
          moveid,
          moves,
          types,
          abilities,
          teamDetails,
          species,
          isLead,
          isDoubles,
          movePool,
          teraType,
          role
        );
      }
    }
    if (!counter.get("stabtera") && role !== "Bulky Support" && species.baseSpecies !== "Dudunsparce") {
      const stabMoves = [];
      for (const moveid of movePool) {
        const move = this.dex.moves.get(moveid);
        const moveType = this.getMoveType(move, species, abilities, teraType);
        if (!this.noStab.includes(moveid) && (move.basePower > 30 || move.multihit || move.basePowerCallback)) {
          if (teraType === moveType) {
            stabMoves.push(moveid);
          }
        }
      }
      if (stabMoves.length) {
        const moveid = this.sample(stabMoves);
        counter = this.addMove(
          moveid,
          moves,
          types,
          abilities,
          teamDetails,
          species,
          isLead,
          isDoubles,
          movePool,
          teraType,
          role
        );
      }
    }
    if (["Bulky Support", "Bulky Attacker", "Bulky Setup"].includes(role)) {
      const recoveryMoves = movePool.filter((moveid) => RecoveryMove.includes(moveid));
      if (recoveryMoves.length) {
        const moveid = this.sample(recoveryMoves);
        counter = this.addMove(
          moveid,
          moves,
          types,
          abilities,
          teamDetails,
          species,
          isLead,
          isDoubles,
          movePool,
          teraType,
          role
        );
      }
    }
    if (role.includes("Setup") || role === "Tera Blast user") {
      const nonSpeedSetupMoves = movePool.filter((moveid) => Setup.includes(moveid) && !SpeedSetup.includes(moveid));
      if (nonSpeedSetupMoves.length) {
        const moveid = this.sample(nonSpeedSetupMoves);
        counter = this.addMove(
          moveid,
          moves,
          types,
          abilities,
          teamDetails,
          species,
          isLead,
          isDoubles,
          movePool,
          teraType,
          role
        );
      } else {
        const setupMoves = movePool.filter((moveid) => Setup.includes(moveid));
        if (setupMoves.length) {
          const moveid = this.sample(setupMoves);
          counter = this.addMove(
            moveid,
            moves,
            types,
            abilities,
            teamDetails,
            species,
            isLead,
            isDoubles,
            movePool,
            teraType,
            role
          );
        }
      }
    }
    if (!["AV Pivot", "Fast Support", "Bulky Support"].includes(role)) {
      if (counter.damagingMoves.size <= 1) {
        let currentAttackType;
        for (const moveid of moves) {
          const move = this.dex.moves.get(moveid);
          if (move.basePower > 30 || move.multihit || move.basePowerCallback) {
            const moveType = this.getMoveType(move, species, abilities, teraType);
            currentAttackType = moveType;
          }
        }
        const coverageMoves = [];
        for (const moveid of movePool) {
          const move = this.dex.moves.get(moveid);
          const moveType = this.getMoveType(move, species, abilities, teraType);
          if (!this.noStab.includes(moveid) && (move.basePower > 30 || move.multihit || move.basePowerCallback)) {
            if (currentAttackType !== moveType)
              coverageMoves.push(moveid);
          }
        }
        if (coverageMoves.length) {
          const moveid = this.sample(coverageMoves);
          counter = this.addMove(
            moveid,
            moves,
            types,
            abilities,
            teamDetails,
            species,
            isLead,
            isDoubles,
            movePool,
            teraType,
            role
          );
        }
      }
    }
    while (moves.size < this.maxMoveCount && movePool.length) {
      if (moves.size + movePool.length <= this.maxMoveCount) {
        for (const moveid2 of movePool) {
          moves.add(moveid2);
        }
        break;
      }
      const moveid = this.sample(movePool);
      counter = this.addMove(
        moveid,
        moves,
        types,
        abilities,
        teamDetails,
        species,
        isLead,
        isDoubles,
        movePool,
        teraType,
        role
      );
      for (const pair of MovePairs) {
        if (moveid === pair[0] && movePool.includes(pair[1])) {
          counter = this.addMove(
            pair[1],
            moves,
            types,
            abilities,
            teamDetails,
            species,
            isLead,
            isDoubles,
            movePool,
            teraType,
            role
          );
        }
        if (moveid === pair[1] && movePool.includes(pair[0])) {
          counter = this.addMove(
            pair[0],
            moves,
            types,
            abilities,
            teamDetails,
            species,
            isLead,
            isDoubles,
            movePool,
            teraType,
            role
          );
        }
      }
    }
    return moves;
  }
  shouldCullAbility(ability, types, moves, abilities, counter, teamDetails, species, isLead, isDoubles, teraType, role) {
    if ([
      "Armor Tail",
      "Battle Bond",
      "Early Bird",
      "Flare Boost",
      "Gluttony",
      "Harvest",
      "Hydration",
      "Ice Body",
      "Immunity",
      "Own Tempo",
      "Pressure",
      "Quick Feet",
      "Rain Dish",
      "Sand Veil",
      "Snow Cloak",
      "Steadfast",
      "Steam Engine"
    ].includes(ability))
      return true;
    switch (ability) {
      case "Contrary":
      case "Serene Grace":
      case "Skill Link":
      case "Strong Jaw":
        return !counter.get((0, import_dex.toID)(ability));
      case "Chlorophyll":
        return !moves.has("sunnyday") && !teamDetails.sun && species.id !== "lilligant";
      case "Cloud Nine":
        return species.id !== "golduck";
      case "Competitive":
        return species.id === "kilowattrel";
      case "Compound Eyes":
      case "No Guard":
        return !counter.get("inaccurate");
      case "Cursed Body":
        return abilities.has("Infiltrator");
      case "Defiant":
        return !counter.get("Physical") || abilities.has("Prankster") && (moves.has("thunderwave") || moves.has("taunt"));
      case "Flash Fire":
        return ["Flame Body", "Intimidate", "Rock Head", "Weak Armor"].some((m) => abilities.has(m)) && this.dex.getEffectiveness("Fire", species) < 0;
      case "Guts":
        return !moves.has("facade") && !moves.has("sleeptalk");
      case "Hustle":
        return counter.get("Physical") < 2;
      case "Infiltrator":
        return isDoubles && abilities.has("Clear Body");
      case "Insomnia":
        return role === "Wallbreaker";
      case "Intimidate":
        if (abilities.has("Hustle"))
          return true;
        if (abilities.has("Sheer Force") && !!counter.get("sheerforce"))
          return true;
        return abilities.has("Stakeout");
      case "Iron Fist":
        return !counter.ironFist;
      case "Justified":
        return !counter.get("Physical");
      case "Mold Breaker":
        return abilities.has("Sharpness") || abilities.has("Unburden");
      case "Moxie":
        return !counter.get("Physical") || moves.has("stealthrock");
      case "Natural Cure":
        return species.id === "pawmot";
      case "Overgrow":
        return !counter.get("Grass");
      case "Prankster":
        return !counter.get("Status");
      case "Reckless":
        return !counter.get("recoil");
      case "Rock Head":
        return !counter.get("recoil");
      case "Sand Force":
      case "Sand Rush":
        return !teamDetails.sand;
      case "Sap Sipper":
        return species.id === "wyrdeer";
      case "Seed Sower":
        return role === "Bulky Support";
      case "Shed Skin":
        return species.id === "seviper";
      case "Sheer Force":
        const braviaryCase = species.id === "braviaryhisui" && role === "Wallbreaker";
        const abilitiesCase = abilities.has("Guts") || abilities.has("Sharpness");
        return !counter.get("sheerforce") || moves.has("bellydrum") || braviaryCase || abilitiesCase;
      case "Slush Rush":
        return !teamDetails.snow;
      case "Sniper":
        return abilities.has("Torrent");
      case "Solar Power":
        return !teamDetails.sun || !counter.get("Special");
      case "Stakeout":
        return counter.damagingMoves.size < 1;
      case "Sturdy":
        return !!counter.get("recoil");
      case "Swarm":
        return !counter.get("Bug") || !!counter.get("recovery");
      case "Sweet Veil":
        return types.includes("Grass");
      case "Swift Swim":
        return !moves.has("raindance") && !teamDetails.rain;
      case "Synchronize":
        return species.id !== "umbreon" && species.id !== "rabsca";
      case "Technician":
        return !counter.get("technician") || abilities.has("Punk Rock");
      case "Tinted Lens":
        return species.id === "braviaryhisui" && role === "Fast Support";
      case "Unburden":
        return abilities.has("Prankster") || !counter.get("setup");
      case "Volt Absorb":
        if (abilities.has("Iron Fist") && counter.ironFist >= 2)
          return true;
        return this.dex.getEffectiveness("Electric", species) < -1;
      case "Water Absorb":
        return species.id === "quagsire";
      case "Weak Armor":
        return moves.has("shellsmash");
    }
    return false;
  }
  getAbility(types, moves, abilities, counter, teamDetails, species, isLead, isDoubles, teraType, role) {
    const abilityData = Array.from(abilities).map((a) => this.dex.abilities.get(a));
    import_lib.Utils.sortBy(abilityData, (abil) => -abil.rating);
    if (abilityData.length <= 1)
      return abilityData[0].name;
    if (species.id === "arcaninehisui")
      return "Rock Head";
    if (species.id === "staraptor")
      return "Reckless";
    if (species.id === "vespiquen")
      return "Pressure";
    if (species.id === "enamorus" && moves.has("calmmind"))
      return "Cute Charm";
    if (species.id === "cetitan" && role === "Wallbreaker")
      return "Sheer Force";
    if (abilities.has("Cud Chew") && moves.has("substitute"))
      return "Cud Chew";
    if (abilities.has("Guts") && (moves.has("facade") || moves.has("sleeptalk")))
      return "Guts";
    if (abilities.has("Harvest") && moves.has("substitute"))
      return "Harvest";
    if (species.id === "hypno")
      return "Insomnia";
    if (abilities.has("Serene Grace") && moves.has("headbutt"))
      return "Serene Grace";
    if (abilities.has("Technician") && counter.get("technician"))
      return "Technician";
    if (abilities.has("Own Tempo") && moves.has("petaldance"))
      return "Own Tempo";
    if (abilities.has("Slush Rush") && moves.has("snowscape"))
      return "Slush Rush";
    if (abilities.has("Soundproof") && moves.has("substitute"))
      return "Soundproof";
    let abilityAllowed = [];
    for (const ability of abilityData) {
      if (ability.rating >= 1 && !this.shouldCullAbility(
        ability.name,
        types,
        moves,
        abilities,
        counter,
        teamDetails,
        species,
        isLead,
        isDoubles,
        teraType,
        role
      )) {
        abilityAllowed.push(ability);
      }
    }
    if (!abilityAllowed.length)
      abilityAllowed = abilityData;
    if (abilityAllowed.length === 1)
      return abilityAllowed[0].name;
    if (abilityAllowed[2] && abilityAllowed[0].rating - 0.5 <= abilityAllowed[2].rating) {
      if (abilityAllowed[1].rating <= abilityAllowed[2].rating) {
        if (this.randomChance(1, 2))
          [abilityAllowed[1], abilityAllowed[2]] = [abilityAllowed[2], abilityAllowed[1]];
      } else {
        if (this.randomChance(1, 3))
          [abilityAllowed[1], abilityAllowed[2]] = [abilityAllowed[2], abilityAllowed[1]];
      }
      if (abilityAllowed[0].rating <= abilityAllowed[1].rating) {
        if (this.randomChance(2, 3))
          [abilityAllowed[0], abilityAllowed[1]] = [abilityAllowed[1], abilityAllowed[0]];
      } else {
        if (this.randomChance(1, 2))
          [abilityAllowed[0], abilityAllowed[1]] = [abilityAllowed[1], abilityAllowed[0]];
      }
    } else {
      if (abilityAllowed[0].rating <= abilityAllowed[1].rating) {
        if (this.randomChance(1, 2))
          [abilityAllowed[0], abilityAllowed[1]] = [abilityAllowed[1], abilityAllowed[0]];
      } else if (abilityAllowed[0].rating - 0.5 <= abilityAllowed[1].rating) {
        if (this.randomChance(1, 3))
          [abilityAllowed[0], abilityAllowed[1]] = [abilityAllowed[1], abilityAllowed[0]];
      }
    }
    return abilityAllowed[0].name;
  }
  getPriorityItem(ability, types, moves, counter, teamDetails, species, isLead, isDoubles, teraType, role) {
    if (species.requiredItems) {
      if (species.baseSpecies === "Arceus") {
        return species.requiredItems[0];
      }
      return this.sample(species.requiredItems);
    }
    if (role === "AV Pivot")
      return "Assault Vest";
    if (!isLead && role === "Bulky Setup" && (ability === "Quark Drive" || ability === "Protosynthesis")) {
      return "Booster Energy";
    }
    if (species.id === "pikachu")
      return "Light Ball";
    if (species.id === "regieleki")
      return "Magnet";
    if (species.id === "pincurchin")
      return "Shuca Berry";
    if (species.id === "cyclizar" && role === "Fast Attacker")
      return "Choice Scarf";
    if (species.id === "lokix") {
      return role === "Fast Attacker" ? "Silver Powder" : "Life Orb";
    }
    if (species.id === "toxtricity" && moves.has("shiftgear"))
      return "Throat Spray";
    if (species.baseSpecies === "Magearna" && role === "Tera Blast user")
      return "Weakness Policy";
    if (moves.has("lastrespects"))
      return "Choice Scarf";
    if (ability === "Imposter" || species.id === "magnezone" && moves.has("bodypress"))
      return "Choice Scarf";
    if (moves.has("bellydrum") && moves.has("substitute"))
      return "Salac Berry";
    if (["Cheek Pouch", "Cud Chew", "Harvest"].some((m) => ability === m) || moves.has("bellydrum") || moves.has("filletaway")) {
      return "Sitrus Berry";
    }
    if (["healingwish", "switcheroo", "trick"].some((m) => moves.has(m))) {
      if (species.baseStats.spe >= 60 && species.baseStats.spe <= 108 && role !== "Wallbreaker") {
        return "Choice Scarf";
      } else {
        return counter.get("Physical") > counter.get("Special") ? "Choice Band" : "Choice Specs";
      }
    }
    if ((ability === "Guts" || moves.has("facade")) && !moves.has("sleeptalk")) {
      return types.includes("Fire") || ability === "Toxic Boost" ? "Toxic Orb" : "Flame Orb";
    }
    if (ability === "Magic Guard" && counter.damagingMoves.size > 1 || ability === "Sheer Force" && counter.get("sheerforce")) {
      return "Life Orb";
    }
    if (moves.has("shellsmash"))
      return "White Herb";
    if (moves.has("populationbomb"))
      return "Wide Lens";
    if (moves.has("courtchange"))
      return "Heavy-Duty Boots";
    if (moves.has("stuffcheeks"))
      return this.randomChance(1, 2) ? "Liechi Berry" : "Salac Berry";
    if (ability === "Unburden")
      return moves.has("closecombat") ? "White Herb" : "Sitrus Berry";
    if (moves.has("acrobatics"))
      return ability === "Grassy Surge" ? "Grassy Seed" : "";
    if (moves.has("auroraveil") || moves.has("lightscreen") && moves.has("reflect"))
      return "Light Clay";
    if (moves.has("rest") && !moves.has("sleeptalk") && ability !== "Natural Cure" && ability !== "Shed Skin") {
      return "Chesto Berry";
    }
    if (species.id === "scyther")
      return isLead && !moves.has("uturn") ? "Eviolite" : "Heavy-Duty Boots";
    if (species.nfe)
      return "Eviolite";
    if (this.dex.getEffectiveness("Rock", species) >= 2)
      return "Heavy-Duty Boots";
  }
  /** Item generation specific to Random Doubles */
  // This will be changed and used later, once doubles is actually coming out.
  getDoublesItem(ability, types, moves, counter, teamDetails, species, teraType, role) {
    const defensiveStatTotal = species.baseStats.hp + species.baseStats.def + species.baseStats.spd;
    if (["dragonenergy", "eruption", "waterspout"].some((m) => moves.has(m)) && counter.damagingMoves.size >= 4)
      return "Choice Scarf";
    if (moves.has("blizzard") && ability !== "Snow Warning" && !teamDetails.snow)
      return "Blunder Policy";
    if (this.dex.getEffectiveness("Rock", species) >= 2 && !types.includes("Flying"))
      return "Heavy-Duty Boots";
    if (counter.get("Physical") >= 4 && ["fakeout", "feint", "rapidspin", "suckerpunch"].every((m) => !moves.has(m)) && (types.includes("Dragon") || types.includes("Fighting") || types.includes("Rock") || moves.has("flipturn") || moves.has("uturn"))) {
      return !counter.get("priority") && ability !== "Speed Boost" && species.baseStats.spe >= 60 && species.baseStats.spe <= 100 && this.randomChance(1, 2) ? "Choice Scarf" : "Choice Band";
    }
    if (counter.get("Special") >= 4 && (types.includes("Dragon") || types.includes("Fighting") || types.includes("Rock") || moves.has("voltswitch")) || counter.get("Special") >= 3 && (moves.has("flipturn") || moves.has("uturn")) && !moves.has("acidspray") && !moves.has("electroweb")) {
      return species.baseStats.spe >= 60 && species.baseStats.spe <= 100 && this.randomChance(1, 2) ? "Choice Scarf" : "Choice Specs";
    }
    if (defensiveStatTotal < 250 && ability === "Regenerator" || species.name === "Pheromosa")
      return "Life Orb";
    if (counter.damagingMoves.size >= 4 && defensiveStatTotal >= 275)
      return "Assault Vest";
    if (counter.damagingMoves.size >= 3 && species.baseStats.spe >= 60 && ability !== "Multiscale" && ability !== "Sturdy" && [
      "acidspray",
      "clearsmog",
      "electroweb",
      "fakeout",
      "feint",
      "icywind",
      "incinerate",
      "naturesmadness",
      "rapidspin",
      "snarl",
      "uturn"
    ].every((m) => !moves.has(m)))
      return ability === "Defeatist" || defensiveStatTotal >= 275 ? "Sitrus Berry" : "Life Orb";
  }
  getItem(ability, types, moves, counter, teamDetails, species, isLead, isDoubles, teraType, role) {
    if ((counter.get("Physical") >= 4 || counter.get("Physical") >= 3 && moves.has("memento")) && ["fakeout", "firstimpression", "flamecharge", "rapidspin", "ruination", "superfang"].every((m) => !moves.has(m))) {
      const scarfReqs = role !== "Wallbreaker" && (species.baseStats.atk >= 100 || ability === "Huge Power" || ability === "Pure Power") && species.baseStats.spe >= 60 && species.baseStats.spe <= 108 && ability !== "Speed Boost" && !counter.get("priority") && !moves.has("aquastep");
      return scarfReqs && this.randomChance(1, 2) ? "Choice Scarf" : "Choice Band";
    }
    if (counter.get("Special") >= 4 || counter.get("Special") >= 3 && ["flipturn", "partingshot", "uturn"].some((m) => moves.has(m))) {
      const scarfReqs = role !== "Wallbreaker" && species.baseStats.spa >= 100 && species.baseStats.spe >= 60 && species.baseStats.spe <= 108 && ability !== "Speed Boost" && ability !== "Tinted Lens" && !counter.get("Physical");
      return scarfReqs && this.randomChance(1, 2) ? "Choice Scarf" : "Choice Specs";
    }
    if (!counter.get("Status") && role !== "Fast Attacker" && role !== "Wallbreaker")
      return "Assault Vest";
    if (counter.get("speedsetup") && this.dex.getEffectiveness("Ground", species) < 1)
      return "Weakness Policy";
    if (species.id === "urshifurapidstrike")
      return "Punching Glove";
    if (species.id === "palkia")
      return "Lustrous Orb";
    if (moves.has("substitute") || ability === "Moody")
      return "Leftovers";
    if (moves.has("stickyweb") && isLead)
      return "Focus Sash";
    if (!teamDetails.defog && !teamDetails.rapidSpin && this.dex.getEffectiveness("Rock", species) >= 1)
      return "Heavy-Duty Boots";
    if (role === "Fast Support" && ["defog", "rapidspin", "uturn", "voltswitch"].some((m) => moves.has(m)) && !types.includes("Flying") && ability !== "Levitate")
      return "Heavy-Duty Boots";
    if (moves.has("outrage"))
      return "Lum Berry";
    if (species.id === "garchomp" && role === "Fast Support" || ability === "Regenerator" && types.includes("Water") && species.baseStats.def >= 110 && this.randomChance(1, 3))
      return "Rocky Helmet";
    if (role === "Fast Support" && isLead && !counter.get("recovery") && !counter.get("recoil") && !moves.has("protect") && species.baseStats.hp + species.baseStats.def + species.baseStats.spd < 258)
      return "Focus Sash";
    if (role !== "Fast Attacker" && role !== "Tera Blast user" && ability !== "Levitate" && this.dex.getEffectiveness("Ground", species) >= 2)
      return "Air Balloon";
    if (["Bulky Attacker", "Bulky Support", "Bulky Setup"].some((m) => role === m))
      return "Leftovers";
    if (role === "Fast Support" || role === "Fast Bulky Setup") {
      return counter.damagingMoves.size >= 3 && !moves.has("nuzzle") ? "Life Orb" : "Leftovers";
    }
    if (role === "Tera Blast user" && counter.get("recovery") && counter.damagingMoves.size < 3)
      return "Leftovers";
    if (["flamecharge", "rapidspin"].every((m) => !moves.has(m)) && ["Fast Attacker", "Setup Sweeper", "Tera Blast user", "Wallbreaker"].some((m) => role === m))
      return "Life Orb";
    if (isDoubles)
      return "Sitrus Berry";
    return "Leftovers";
  }
  getLevel(species, isDoubles) {
    if (this.adjustLevel)
      return this.adjustLevel;
    if (isDoubles && this.randomDoublesSets[species.id]["level"])
      return this.randomDoublesSets[species.id]["level"];
    if (!isDoubles && this.randomSets[species.id]["level"])
      return this.randomSets[species.id]["level"];
    const tier = species.tier;
    const tierScale = {
      Uber: 76,
      OU: 80,
      UUBL: 81,
      UU: 82,
      RUBL: 83,
      RU: 84,
      NUBL: 85,
      NU: 86,
      PUBL: 87,
      PU: 88,
      "(PU)": 88,
      NFE: 88
    };
    return tierScale[tier] || 80;
  }
  randomSet(species, teamDetails = {}, isLead = false, isDoubles = false) {
    species = this.dex.species.get(species);
    let forme = species.name;
    if (typeof species.battleOnly === "string") {
      forme = species.battleOnly;
    }
    if (species.cosmeticFormes) {
      forme = this.sample([species.name].concat(species.cosmeticFormes));
    }
    const sets = this[`random${isDoubles ? "Doubles" : ""}Sets`][species.id]["sets"];
    const possibleSets = [];
    for (const set2 of sets) {
      if (teamDetails.teraBlast && set2.role === "Tera Blast user") {
        continue;
      }
      possibleSets.push(set2);
    }
    const set = this.sampleIfArray(possibleSets);
    const role = set.role;
    const movePool = [];
    for (const movename of set.movepool) {
      movePool.push(this.dex.moves.get(movename).id);
    }
    const teraTypes = set.teraTypes;
    const teraType = this.sampleIfArray(teraTypes);
    if (this.format.gameType === "multi" || this.format.gameType === "freeforall") {
      const allySwitch = movePool.indexOf("allyswitch");
      if (allySwitch > -1) {
        if (movePool.length > this.maxMoveCount) {
          this.fastPop(movePool, allySwitch);
        } else {
          movePool[allySwitch] = "sleeptalk";
        }
      }
    }
    let ability = "";
    let item = void 0;
    const evs = { hp: 85, atk: 85, def: 85, spa: 85, spd: 85, spe: 85 };
    const ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
    const types = species.types;
    const abilities = new Set(Object.values(species.abilities));
    if (species.unreleasedHidden)
      abilities.delete(species.abilities.H);
    const moves = this.randomMoveset(types, abilities, teamDetails, species, isLead, isDoubles, movePool, teraType, role);
    const counter = this.queryMoves(moves, species, teraType, abilities);
    ability = this.getAbility(types, moves, abilities, counter, teamDetails, species, isLead, isDoubles, teraType, role);
    item = this.getPriorityItem(ability, types, moves, counter, teamDetails, species, isLead, isDoubles, teraType, role);
    if (item === void 0 && isDoubles) {
      item = this.getDoublesItem(ability, types, moves, counter, teamDetails, species, teraType, role);
    }
    if (item === void 0) {
      item = this.getItem(ability, types, moves, counter, teamDetails, species, isLead, isDoubles, teraType, role);
    }
    if (item === void 0)
      item = isDoubles ? "Sitrus Berry" : "Leftovers";
    if (species.baseSpecies === "Pikachu") {
      forme = "Pikachu" + this.sample(["", "-Original", "-Hoenn", "-Sinnoh", "-Unova", "-Kalos", "-Alola", "-Partner", "-World"]);
    }
    const level = this.getLevel(species, isDoubles);
    const srImmunity = ability === "Magic Guard" || item === "Heavy-Duty Boots";
    const srWeakness = srImmunity ? 0 : this.dex.getEffectiveness("Rock", species);
    while (evs.hp > 1) {
      const hp = Math.floor(Math.floor(2 * species.baseStats.hp + ivs.hp + Math.floor(evs.hp / 4) + 100) * level / 100 + 10);
      if (moves.has("substitute") && ["Sitrus Berry", "Salac Berry"].includes(item)) {
        if (hp % 4 === 0)
          break;
      } else if ((moves.has("bellydrum") || moves.has("filletaway")) && (item === "Sitrus Berry" || ability === "Gluttony")) {
        if (hp % 2 === 0)
          break;
      } else {
        if (srWeakness <= 0 || hp % (4 / srWeakness) > 0 || ["Leftovers", "Life Orb"].includes(item))
          break;
      }
      evs.hp -= 4;
    }
    const noAttackStatMoves = [...moves].every((m) => {
      const move = this.dex.moves.get(m);
      if (move.damageCallback || move.damage)
        return true;
      if (move.id === "shellsidearm")
        return false;
      if (move.id === "terablast" && moves.has("shiftgear"))
        return false;
      return move.category !== "Physical" || move.id === "bodypress" || move.id === "foulplay";
    });
    if (noAttackStatMoves && !moves.has("transform")) {
      evs.atk = 0;
      ivs.atk = 0;
    }
    if (moves.has("gyroball") || moves.has("trickroom")) {
      evs.spe = 0;
      ivs.spe = 0;
    }
    const shuffledMoves = Array.from(moves);
    this.prng.shuffle(shuffledMoves);
    return {
      name: species.baseSpecies,
      species: forme,
      gender: species.gender,
      shiny: this.randomChance(1, 1024),
      level,
      moves: shuffledMoves,
      ability,
      evs,
      ivs,
      item,
      teraType,
      role
    };
  }
  getPokemonPool(type, pokemonToExclude = [], isMonotype = false, isDoubles = false) {
    const exclude = pokemonToExclude.map((p) => (0, import_dex.toID)(p.species));
    const pokemonPool = [];
    const baseSpeciesPool = [];
    if (isDoubles) {
      for (const pokemon of Object.keys(this.randomDoublesSets)) {
        let species = this.dex.species.get(pokemon);
        if (species.gen > this.gen || exclude.includes(species.id))
          continue;
        if (isMonotype) {
          if (!species.types.includes(type))
            continue;
          if (typeof species.battleOnly === "string") {
            species = this.dex.species.get(species.battleOnly);
            if (!species.types.includes(type))
              continue;
          }
        }
        pokemonPool.push(pokemon);
        if (!baseSpeciesPool.includes(species.baseSpecies))
          baseSpeciesPool.push(species.baseSpecies);
      }
    } else {
      for (const pokemon of Object.keys(this.randomSets)) {
        let species = this.dex.species.get(pokemon);
        if (species.gen > this.gen || exclude.includes(species.id))
          continue;
        if (isMonotype) {
          if (!species.types.includes(type))
            continue;
          if (typeof species.battleOnly === "string") {
            species = this.dex.species.get(species.battleOnly);
            if (!species.types.includes(type))
              continue;
          }
        }
        pokemonPool.push(pokemon);
        if (!baseSpeciesPool.includes(species.baseSpecies))
          baseSpeciesPool.push(species.baseSpecies);
      }
    }
    return [pokemonPool, baseSpeciesPool];
  }
  // Doubles sets are the same as singles for now
  randomTeam() {
    this.enforceNoDirectCustomBanlistChanges();
    const seed = this.prng.seed;
    const ruleTable = this.dex.formats.getRuleTable(this.format);
    const pokemon = [];
    const isMonotype = !!this.forceMonotype || ruleTable.has("sametypeclause");
    const isDoubles = this.format.gameType !== "singles";
    const typePool = this.dex.types.names();
    const type = this.forceMonotype || this.sample(typePool);
    const usePotD = global.Config && Config.potd && ruleTable.has("potd");
    const potd = usePotD ? this.dex.species.get(Config.potd) : null;
    const baseFormes = {};
    const tierCount = {};
    const typeCount = {};
    const typeComboCount = {};
    const typeWeaknesses = {};
    const teamDetails = {};
    const [pokemonPool, baseSpeciesPool] = this.getPokemonPool(type, pokemon, isMonotype, isDoubles);
    while (baseSpeciesPool.length && pokemon.length < this.maxTeamSize) {
      const baseSpecies = this.sampleNoReplace(baseSpeciesPool);
      const currentSpeciesPool = [];
      for (const poke of pokemonPool) {
        const species2 = this.dex.species.get(poke);
        if (species2.baseSpecies === baseSpecies)
          currentSpeciesPool.push(species2);
      }
      let species = this.sample(currentSpeciesPool);
      if (!species.exists)
        continue;
      if (species.baseSpecies === "Zoroark" && pokemon.length >= this.maxTeamSize - 1)
        continue;
      if (pokemon.some((pkmn) => pkmn.name === "Zoroark") && pokemon.length >= this.maxTeamSize - 1 && this.getLevel(species, isDoubles) < 72 && !this.adjustLevel) {
        continue;
      }
      if (["Basculegion", "Houndstone", "Zacian", "Zamazenta"].includes(species.baseSpecies) && !pokemon.length)
        continue;
      const tier = species.tier;
      const types = species.types;
      const typeCombo = types.slice().sort().join();
      const limitFactor = Math.round(this.maxTeamSize / 6) || 1;
      if (!isMonotype && !this.forceMonotype) {
        let skip = false;
        for (const typeName of types) {
          if (typeCount[typeName] >= 2 * limitFactor) {
            skip = true;
            break;
          }
        }
        if (skip)
          continue;
        for (const typeName of this.dex.types.names()) {
          if (this.dex.getEffectiveness(typeName, species) > 0) {
            if (!typeWeaknesses[typeName])
              typeWeaknesses[typeName] = 0;
            if (typeWeaknesses[typeName] >= 3 * limitFactor) {
              skip = true;
              break;
            }
          }
        }
        if (skip)
          continue;
      }
      if (!this.forceMonotype && typeComboCount[typeCombo] >= (isMonotype ? 2 : 1) * limitFactor)
        continue;
      if (potd?.exists && (pokemon.length === 1 || this.maxTeamSize === 1))
        species = potd;
      const set = this.randomSet(species, teamDetails, pokemon.length === 0, isDoubles);
      pokemon.push(set);
      if (pokemon.length === this.maxTeamSize) {
        const illusion = teamDetails.illusion;
        if (illusion)
          pokemon[illusion - 1].level = pokemon[this.maxTeamSize - 1].level;
        break;
      }
      baseFormes[species.baseSpecies] = 1;
      if (tierCount[tier]) {
        tierCount[tier]++;
      } else {
        tierCount[tier] = 1;
      }
      for (const typeName of types) {
        if (typeName in typeCount) {
          typeCount[typeName]++;
        } else {
          typeCount[typeName] = 1;
        }
      }
      if (typeCombo in typeComboCount) {
        typeComboCount[typeCombo]++;
      } else {
        typeComboCount[typeCombo] = 1;
      }
      for (const typeName of this.dex.types.names()) {
        if (this.dex.getEffectiveness(typeName, species) > 0) {
          typeWeaknesses[typeName]++;
        }
      }
      if (set.ability === "Drizzle" || set.moves.includes("raindance"))
        teamDetails.rain = 1;
      if (set.ability === "Drought" || set.ability === "Orichalcum Pulse" || set.moves.includes("sunnyday")) {
        teamDetails.sun = 1;
      }
      if (set.ability === "Sand Stream")
        teamDetails.sand = 1;
      if (set.ability === "Snow Warning" || set.moves.includes("snowscape") || set.moves.includes("chillyreception")) {
        teamDetails.snow = 1;
      }
      if (set.moves.includes("spikes"))
        teamDetails.spikes = (teamDetails.spikes || 0) + 1;
      if (set.moves.includes("stealthrock"))
        teamDetails.stealthRock = 1;
      if (set.moves.includes("stickyweb"))
        teamDetails.stickyWeb = 1;
      if (set.moves.includes("stoneaxe"))
        teamDetails.stealthRock = 1;
      if (set.moves.includes("toxicspikes"))
        teamDetails.toxicSpikes = 1;
      if (set.moves.includes("defog"))
        teamDetails.defog = 1;
      if (set.moves.includes("rapidspin"))
        teamDetails.rapidSpin = 1;
      if (set.moves.includes("mortalspin"))
        teamDetails.rapidSpin = 1;
      if (set.moves.includes("tidyup"))
        teamDetails.rapidSpin = 1;
      if (set.moves.includes("auroraveil") || set.moves.includes("reflect") && set.moves.includes("lightscreen")) {
        teamDetails.screens = 1;
      }
      if (set.role === "Tera Blast user")
        teamDetails.teraBlast = 1;
      if (set.ability === "Illusion")
        teamDetails.illusion = pokemon.length;
    }
    if (pokemon.length < this.maxTeamSize && pokemon.length < 12) {
      throw new Error(`Could not build a random team for ${this.format} (seed=${seed})`);
    }
    return pokemon;
  }
  randomCCTeam() {
    this.enforceNoDirectCustomBanlistChanges();
    const dex = this.dex;
    const team = [];
    const natures = this.dex.natures.all();
    const items = this.dex.items.all();
    const randomN = this.randomNPokemon(this.maxTeamSize, this.forceMonotype, void 0, void 0, true);
    for (let forme of randomN) {
      let species = dex.species.get(forme);
      if (species.isNonstandard)
        species = dex.species.get(species.baseSpecies);
      let item = "";
      let isIllegalItem;
      let isBadItem;
      if (this.gen >= 2) {
        do {
          item = this.sample(items).name;
          isIllegalItem = this.dex.items.get(item).gen > this.gen || this.dex.items.get(item).isNonstandard;
          isBadItem = item.startsWith("TR") || this.dex.items.get(item).isPokeball;
        } while (isIllegalItem || isBadItem && this.randomChance(19, 20));
      }
      if (species.battleOnly) {
        if (typeof species.battleOnly === "string") {
          species = dex.species.get(species.battleOnly);
        } else {
          species = dex.species.get(this.sample(species.battleOnly));
        }
        forme = species.name;
      } else if (species.requiredItems && !species.requiredItems.some((req) => (0, import_dex.toID)(req) === item)) {
        if (!species.changesFrom)
          throw new Error(`${species.name} needs a changesFrom value`);
        species = dex.species.get(species.changesFrom);
        forme = species.name;
      }
      let itemData = this.dex.items.get(item);
      if (itemData.forcedForme && forme === this.dex.species.get(itemData.forcedForme).baseSpecies) {
        do {
          itemData = this.sample(items);
          item = itemData.name;
        } while (itemData.gen > this.gen || itemData.isNonstandard || itemData.forcedForme && forme === this.dex.species.get(itemData.forcedForme).baseSpecies);
      }
      const abilities = Object.values(species.abilities).filter((a) => this.dex.abilities.get(a).gen <= this.gen);
      const ability = this.gen <= 2 ? "No Ability" : this.sample(abilities);
      let pool = ["struggle"];
      if (forme === "Smeargle") {
        pool = this.dex.moves.all().filter((move) => !(move.isNonstandard || move.isZ || move.isMax || move.realMove)).map((m) => m.id);
      } else {
        const formes = ["gastrodoneast", "pumpkaboosuper", "zygarde10"];
        let learnset = this.dex.species.getLearnset(species.id);
        let learnsetSpecies = species;
        if (formes.includes(species.id) || !learnset) {
          learnsetSpecies = this.dex.species.get(species.baseSpecies);
          learnset = this.dex.species.getLearnset(learnsetSpecies.id);
        }
        if (learnset) {
          pool = Object.keys(learnset).filter(
            (moveid) => learnset[moveid].find((learned) => learned.startsWith(String(this.gen)))
          );
        }
        if (learnset && learnsetSpecies === species && species.changesFrom) {
          learnset = this.dex.species.getLearnset((0, import_dex.toID)(species.changesFrom));
          for (const moveid in learnset) {
            if (!pool.includes(moveid) && learnset[moveid].some((source) => source.startsWith(String(this.gen)))) {
              pool.push(moveid);
            }
          }
        }
        const evoRegion = learnsetSpecies.evoRegion && learnsetSpecies.gen !== this.gen;
        while (learnsetSpecies.prevo) {
          learnsetSpecies = this.dex.species.get(learnsetSpecies.prevo);
          for (const moveid in learnset) {
            if (!pool.includes(moveid) && learnset[moveid].some((source) => source.startsWith(String(this.gen)) && !evoRegion)) {
              pool.push(moveid);
            }
          }
        }
      }
      const moves = this.multipleSamplesNoReplace(pool, this.maxMoveCount);
      const evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
      const s = ["hp", "atk", "def", "spa", "spd", "spe"];
      let evpool = 510;
      do {
        const x = this.sample(s);
        const y = this.random(Math.min(256 - evs[x], evpool + 1));
        evs[x] += y;
        evpool -= y;
      } while (evpool > 0);
      const ivs = {
        hp: this.random(32),
        atk: this.random(32),
        def: this.random(32),
        spa: this.random(32),
        spd: this.random(32),
        spe: this.random(32)
      };
      const nature = this.sample(natures).name;
      const mbstmin = 1307;
      let stats = species.baseStats;
      if (species.baseSpecies === "Wishiwashi")
        stats = import_dex.Dex.species.get("wishiwashischool").baseStats;
      let mbst = stats["hp"] * 2 + 31 + 21 + 100 + 10;
      mbst += stats["atk"] * 2 + 31 + 21 + 100 + 5;
      mbst += stats["def"] * 2 + 31 + 21 + 100 + 5;
      mbst += stats["spa"] * 2 + 31 + 21 + 100 + 5;
      mbst += stats["spd"] * 2 + 31 + 21 + 100 + 5;
      mbst += stats["spe"] * 2 + 31 + 21 + 100 + 5;
      let level;
      if (this.adjustLevel) {
        level = this.adjustLevel;
      } else {
        level = Math.floor(100 * mbstmin / mbst);
        while (level < 100) {
          mbst = Math.floor((stats["hp"] * 2 + 31 + 21 + 100) * level / 100 + 10);
          mbst += Math.floor(((stats["atk"] * 2 + 31 + 21 + 100) * level / 100 + 5) * level / 100);
          mbst += Math.floor((stats["def"] * 2 + 31 + 21 + 100) * level / 100 + 5);
          mbst += Math.floor(((stats["spa"] * 2 + 31 + 21 + 100) * level / 100 + 5) * level / 100);
          mbst += Math.floor((stats["spd"] * 2 + 31 + 21 + 100) * level / 100 + 5);
          mbst += Math.floor((stats["spe"] * 2 + 31 + 21 + 100) * level / 100 + 5);
          if (mbst >= mbstmin)
            break;
          level++;
        }
      }
      const happiness = this.random(256);
      const shiny = this.randomChance(1, 1024);
      const set = {
        name: species.baseSpecies,
        species: species.name,
        gender: species.gender,
        item,
        ability,
        moves,
        evs,
        ivs,
        nature,
        level,
        happiness,
        shiny
      };
      if (this.gen === 9) {
        set.teraType = this.sample(this.dex.types.all()).name;
      }
      team.push(set);
    }
    return team;
  }
  randomNPokemon(n, requiredType, minSourceGen, ruleTable, requireMoves = false) {
    const last = [0, 151, 251, 386, 493, 649, 721, 807, 898, 1010][this.gen];
    if (n <= 0 || n > last)
      throw new Error(`n must be a number between 1 and ${last} (got ${n})`);
    if (requiredType && !this.dex.types.get(requiredType).exists) {
      throw new Error(`"${requiredType}" is not a valid type.`);
    }
    const isNotCustom = !ruleTable;
    const pool = [];
    let speciesPool = [];
    if (isNotCustom) {
      speciesPool = [...this.dex.species.all()];
      for (const species of speciesPool) {
        if (species.isNonstandard && species.isNonstandard !== "Unobtainable")
          continue;
        if (requireMoves) {
          const hasMovesInCurrentGen = Object.values(this.dex.species.getLearnset(species.id) || {}).some((sources) => sources.some((source) => source.startsWith("9")));
          if (!hasMovesInCurrentGen)
            continue;
        }
        if (requiredType && !species.types.includes(requiredType))
          continue;
        if (minSourceGen && species.gen < minSourceGen)
          continue;
        const num = species.num;
        if (num <= 0 || pool.includes(num))
          continue;
        if (num > last)
          break;
        pool.push(num);
      }
    } else {
      const EXISTENCE_TAG = ["past", "future", "lgpe", "unobtainable", "cap", "custom", "nonexistent"];
      const nonexistentBanReason = ruleTable.check("nonexistent");
      for (const species of this.dex.species.all()) {
        if (requiredType && !species.types.includes(requiredType))
          continue;
        let banReason = ruleTable.check("pokemon:" + species.id);
        if (banReason)
          continue;
        if (banReason !== "") {
          if (species.isMega && ruleTable.check("pokemontag:mega"))
            continue;
          banReason = ruleTable.check("basepokemon:" + (0, import_dex.toID)(species.baseSpecies));
          if (banReason)
            continue;
          if (banReason !== "" || this.dex.species.get(species.baseSpecies).isNonstandard !== species.isNonstandard) {
            const nonexistentCheck = import_tags.Tags.nonexistent.genericFilter(species) && nonexistentBanReason;
            let tagWhitelisted = false;
            let tagBlacklisted = false;
            for (const ruleid of ruleTable.tagRules) {
              if (ruleid.startsWith("*"))
                continue;
              const tagid = ruleid.slice(12);
              const tag = import_tags.Tags[tagid];
              if ((tag.speciesFilter || tag.genericFilter)(species)) {
                const existenceTag = EXISTENCE_TAG.includes(tagid);
                if (ruleid.startsWith("+")) {
                  if (!existenceTag && nonexistentCheck)
                    continue;
                  tagWhitelisted = true;
                  break;
                }
                tagBlacklisted = true;
                break;
              }
            }
            if (tagBlacklisted)
              continue;
            if (!tagWhitelisted) {
              if (ruleTable.check("pokemontag:allpokemon"))
                continue;
            }
          }
        }
        speciesPool.push(species);
        const num = species.num;
        if (pool.includes(num))
          continue;
        pool.push(num);
      }
    }
    const hasDexNumber = {};
    for (let i = 0; i < n; i++) {
      const num = this.sampleNoReplace(pool);
      hasDexNumber[num] = i;
    }
    const formes = [];
    for (const species of speciesPool) {
      if (!(species.num in hasDexNumber))
        continue;
      if (isNotCustom && (species.gen > this.gen || species.isNonstandard && species.isNonstandard !== "Unobtainable"))
        continue;
      if (!formes[hasDexNumber[species.num]])
        formes[hasDexNumber[species.num]] = [];
      formes[hasDexNumber[species.num]].push(species.name);
    }
    if (formes.length < n) {
      throw new Error(`Legal Pokemon forme count insufficient to support Max Team Size: (${formes.length} / ${n}).`);
    }
    const nPokemon = [];
    for (let i = 0; i < n; i++) {
      if (!formes[i].length) {
        throw new Error(`Invalid pokemon gen ${this.gen}: ${JSON.stringify(formes)} numbers ${JSON.stringify(hasDexNumber)}`);
      }
      nPokemon.push(this.sample(formes[i]));
    }
    return nPokemon;
  }
  randomHCTeam() {
    const hasCustomBans = this.hasDirectCustomBanlistChanges();
    const ruleTable = this.dex.formats.getRuleTable(this.format);
    const hasNonexistentBan = hasCustomBans && ruleTable.check("nonexistent");
    const hasNonexistentWhitelist = hasCustomBans && hasNonexistentBan === "";
    if (hasCustomBans) {
      this.enforceNoDirectComplexBans();
    }
    const doItemsExist = this.gen > 1;
    let itemPool = [];
    if (doItemsExist) {
      if (!hasCustomBans) {
        itemPool = [...this.dex.items.all()].filter((item) => item.gen <= this.gen && !item.isNonstandard);
      } else {
        const hasAllItemsBan = ruleTable.check("pokemontag:allitems");
        for (const item of this.dex.items.all()) {
          let banReason = ruleTable.check("item:" + item.id);
          if (banReason)
            continue;
          if (banReason !== "" && item.id) {
            if (hasAllItemsBan)
              continue;
            if (item.isNonstandard) {
              banReason = ruleTable.check("pokemontag:" + (0, import_dex.toID)(item.isNonstandard));
              if (banReason)
                continue;
              if (banReason !== "" && item.isNonstandard !== "Unobtainable") {
                if (hasNonexistentBan)
                  continue;
                if (!hasNonexistentWhitelist)
                  continue;
              }
            }
          }
          itemPool.push(item);
        }
        if (ruleTable.check("item:noitem")) {
          this.enforceCustomPoolSizeNoComplexBans("item", itemPool, this.maxTeamSize, "Max Team Size");
        }
      }
    }
    const doAbilitiesExist = this.gen > 2 && this.dex.currentMod !== "gen7letsgo";
    let abilityPool = [];
    if (doAbilitiesExist) {
      if (!hasCustomBans) {
        abilityPool = [...this.dex.abilities.all()].filter((ability) => ability.gen <= this.gen && !ability.isNonstandard);
      } else {
        const hasAllAbilitiesBan = ruleTable.check("pokemontag:allabilities");
        for (const ability of this.dex.abilities.all()) {
          let banReason = ruleTable.check("ability:" + ability.id);
          if (banReason)
            continue;
          if (banReason !== "") {
            if (hasAllAbilitiesBan)
              continue;
            if (ability.isNonstandard) {
              banReason = ruleTable.check("pokemontag:" + (0, import_dex.toID)(ability.isNonstandard));
              if (banReason)
                continue;
              if (banReason !== "") {
                if (hasNonexistentBan)
                  continue;
                if (!hasNonexistentWhitelist)
                  continue;
              }
            }
          }
          abilityPool.push(ability);
        }
        if (ruleTable.check("ability:noability")) {
          this.enforceCustomPoolSizeNoComplexBans("ability", abilityPool, this.maxTeamSize, "Max Team Size");
        }
      }
    }
    const setMoveCount = ruleTable.maxMoveCount;
    let movePool = [];
    if (!hasCustomBans) {
      movePool = [...this.dex.moves.all()].filter((move) => move.gen <= this.gen && !move.isNonstandard);
    } else {
      const hasAllMovesBan = ruleTable.check("pokemontag:allmoves");
      for (const move of this.dex.moves.all()) {
        let banReason = ruleTable.check("move:" + move.id);
        if (banReason)
          continue;
        if (banReason !== "") {
          if (hasAllMovesBan)
            continue;
          if (move.isNonstandard) {
            banReason = ruleTable.check("pokemontag:" + (0, import_dex.toID)(move.isNonstandard));
            if (banReason)
              continue;
            if (banReason !== "" && move.isNonstandard !== "Unobtainable") {
              if (hasNonexistentBan)
                continue;
              if (!hasNonexistentWhitelist)
                continue;
            }
          }
        }
        movePool.push(move);
      }
      this.enforceCustomPoolSizeNoComplexBans("move", movePool, this.maxTeamSize * setMoveCount, "Max Team Size * Max Move Count");
    }
    const doNaturesExist = this.gen > 2;
    let naturePool = [];
    if (doNaturesExist) {
      if (!hasCustomBans) {
        naturePool = [...this.dex.natures.all()];
      } else {
        const hasAllNaturesBan = ruleTable.check("pokemontag:allnatures");
        for (const nature of this.dex.natures.all()) {
          let banReason = ruleTable.check("nature:" + nature.id);
          if (banReason)
            continue;
          if (banReason !== "" && nature.id) {
            if (hasAllNaturesBan)
              continue;
            if (nature.isNonstandard) {
              banReason = ruleTable.check("pokemontag:" + (0, import_dex.toID)(nature.isNonstandard));
              if (banReason)
                continue;
              if (banReason !== "" && nature.isNonstandard !== "Unobtainable") {
                if (hasNonexistentBan)
                  continue;
                if (!hasNonexistentWhitelist)
                  continue;
              }
            }
          }
          naturePool.push(nature);
        }
      }
    }
    const randomN = this.randomNPokemon(
      this.maxTeamSize,
      this.forceMonotype,
      void 0,
      hasCustomBans ? ruleTable : void 0
    );
    const team = [];
    for (const forme of randomN) {
      const species = this.dex.species.get(forme);
      let item = "";
      let itemData;
      let isBadItem;
      if (doItemsExist) {
        do {
          itemData = this.sampleNoReplace(itemPool);
          item = itemData?.name;
          isBadItem = item.startsWith("TR") || itemData.isPokeball;
        } while (isBadItem && this.randomChance(19, 20) && itemPool.length > this.maxTeamSize);
      }
      let ability = "No Ability";
      let abilityData;
      if (doAbilitiesExist) {
        abilityData = this.sampleNoReplace(abilityPool);
        ability = abilityData?.name;
      }
      const m = [];
      do {
        const move = this.sampleNoReplace(movePool);
        m.push(move.id);
      } while (m.length < setMoveCount);
      const evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
      if (this.gen === 6) {
        let evpool = 510;
        do {
          const x = this.sample(import_dex.Dex.stats.ids());
          const y = this.random(Math.min(256 - evs[x], evpool + 1));
          evs[x] += y;
          evpool -= y;
        } while (evpool > 0);
      } else {
        for (const x of import_dex.Dex.stats.ids()) {
          evs[x] = this.random(256);
        }
      }
      const ivs = {
        hp: this.random(32),
        atk: this.random(32),
        def: this.random(32),
        spa: this.random(32),
        spd: this.random(32),
        spe: this.random(32)
      };
      let nature = "";
      if (doNaturesExist && naturePool.length > 0) {
        nature = this.sample(naturePool).name;
      }
      const mbstmin = 1307;
      const stats = species.baseStats;
      let mbst = stats["hp"] * 2 + 31 + 21 + 100 + 10;
      mbst += stats["atk"] * 2 + 31 + 21 + 100 + 5;
      mbst += stats["def"] * 2 + 31 + 21 + 100 + 5;
      mbst += stats["spa"] * 2 + 31 + 21 + 100 + 5;
      mbst += stats["spd"] * 2 + 31 + 21 + 100 + 5;
      mbst += stats["spe"] * 2 + 31 + 21 + 100 + 5;
      let level;
      if (this.adjustLevel) {
        level = this.adjustLevel;
      } else {
        level = Math.floor(100 * mbstmin / mbst);
        while (level < 100) {
          mbst = Math.floor((stats["hp"] * 2 + 31 + 21 + 100) * level / 100 + 10);
          mbst += Math.floor(((stats["atk"] * 2 + 31 + 21 + 100) * level / 100 + 5) * level / 100);
          mbst += Math.floor((stats["def"] * 2 + 31 + 21 + 100) * level / 100 + 5);
          mbst += Math.floor(((stats["spa"] * 2 + 31 + 21 + 100) * level / 100 + 5) * level / 100);
          mbst += Math.floor((stats["spd"] * 2 + 31 + 21 + 100) * level / 100 + 5);
          mbst += Math.floor((stats["spe"] * 2 + 31 + 21 + 100) * level / 100 + 5);
          if (mbst >= mbstmin)
            break;
          level++;
        }
      }
      const happiness = this.random(256);
      const shiny = this.randomChance(1, 1024);
      const set = {
        name: species.baseSpecies,
        species: species.name,
        gender: species.gender,
        item,
        ability,
        moves: m,
        evs,
        ivs,
        nature,
        level,
        happiness,
        shiny
      };
      if (this.gen === 9) {
        set.teraType = this.sample(this.dex.types.all()).name;
      }
      team.push(set);
    }
    return team;
  }
}
var random_teams_default = RandomTeams;
//# sourceMappingURL=random-teams.js.map
