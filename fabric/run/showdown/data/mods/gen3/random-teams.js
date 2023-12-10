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
  RandomGen3Teams: () => RandomGen3Teams,
  default: () => random_teams_default
});
module.exports = __toCommonJS(random_teams_exports);
var import_random_teams = __toESM(require("../gen4/random-teams"));
var import_lib = require("../../../lib");
class RandomGen3Teams extends import_random_teams.default {
  constructor(format, prng) {
    super(format, prng);
    this.randomData = require("./random-data.json");
    this.battleHasDitto = false;
    this.battleHasWobbuffet = false;
    this.moveEnforcementCheckers = {
      Bug: (movePool, moves, abilities, types, counter, species) => movePool.includes("megahorn") || !species.types[1] && movePool.includes("hiddenpowerbug"),
      Electric: (movePool, moves, abilities, types, counter) => !counter.get("Electric"),
      Fighting: (movePool, moves, abilities, types, counter) => !counter.get("Fighting"),
      Fire: (movePool, moves, abilities, types, counter) => !counter.get("Fire"),
      Ground: (movePool, moves, abilities, types, counter) => !counter.get("Ground"),
      Normal: (movePool, moves, abilities, types, counter, species) => {
        if (species.id === "blissey" && movePool.includes("softboiled"))
          return true;
        return !counter.get("Normal") && counter.setupType === "Physical";
      },
      Psychic: (movePool, moves, abilities, types, counter, species) => types.has("Psychic") && (movePool.includes("psychic") || movePool.includes("psychoboost")) && species.baseStats.spa >= 100,
      Rock: (movePool, moves, abilities, types, counter, species) => !counter.get("Rock") && species.baseStats.atk >= 100,
      Water: (movePool, moves, abilities, types, counter, species) => !counter.get("Water") && counter.setupType !== "Physical" && species.baseStats.spa >= 60,
      // If the Pokémon has this move, the other move will be forced
      protect: (movePool) => movePool.includes("wish"),
      sunnyday: (movePool) => movePool.includes("solarbeam"),
      sleeptalk: (movePool) => movePool.includes("rest")
    };
  }
  shouldCullMove(move, types, moves, abilities, counter, movePool, teamDetails, species) {
    const restTalk = moves.has("rest") && moves.has("sleeptalk");
    switch (move.id) {
      case "bulkup":
      case "curse":
      case "dragondance":
      case "swordsdance":
        return {
          cull: counter.setupType !== "Physical" || counter.get("physicalsetup") > 1 || counter.get("Physical") + counter.get("physicalpool") < 2 && !moves.has("batonpass") && !restTalk,
          isSetup: true
        };
      case "calmmind":
        return {
          cull: counter.setupType !== "Special" || counter.get("Special") + counter.get("specialpool") < 2 && !moves.has("batonpass") && !moves.has("refresh") && !restTalk,
          isSetup: true
        };
      case "agility":
        return {
          cull: counter.damagingMoves.size < 2 && !moves.has("batonpass") || moves.has("substitute") || restTalk,
          isSetup: !counter.setupType
        };
      case "amnesia":
      case "sleeptalk":
        if (moves.has("roar") || moves.has("whirlwind"))
          return { cull: true };
        if (!moves.has("rest"))
          return { cull: true };
        if (movePool.length > 1) {
          const rest = movePool.indexOf("rest");
          if (rest >= 0)
            this.fastPop(movePool, rest);
        }
        break;
      case "barrier":
        return { cull: !moves.has("calmmind") && !moves.has("batonpass") && !moves.has("mirrorcoat") };
      case "batonpass":
        return { cull: !counter.setupType && !counter.get("speedsetup") && ["meanlook", "spiderweb", "substitute", "wish"].every((m) => !moves.has(m)) };
      case "endeavor":
      case "flail":
      case "reversal":
        return { cull: restTalk || !moves.has("endure") && !moves.has("substitute") };
      case "endure":
        return { cull: movePool.includes("destinybond") };
      case "extremespeed":
      case "raindance":
      case "sunnyday":
        return { cull: counter.damagingMoves.size < 2 || moves.has("rest") };
      case "focuspunch":
        return { cull: counter.damagingMoves.size < 2 || moves.has("rest") || counter.setupType && !moves.has("spore") || !moves.has("substitute") && (counter.get("Physical") < 4 || moves.has("fakeout")) || // Breloom likes to have coverage
        species.id === "breloom" && (moves.has("machpunch") || moves.has("skyuppercut")) };
      case "moonlight":
        return { cull: moves.has("wish") || moves.has("protect") };
      case "perishsong":
        return { cull: !moves.has("meanlook") && !moves.has("spiderweb") };
      case "protect":
        return { cull: !abilities.has("Speed Boost") && ["perishsong", "toxic", "wish"].every((m) => !moves.has(m)) };
      case "refresh":
        return { cull: !counter.setupType };
      case "rest":
        return { cull: movePool.includes("sleeptalk") || !moves.has("sleeptalk") && (!!counter.get("recovery") || movePool.includes("curse")) };
      case "solarbeam":
        if (movePool.length > 1) {
          const sunnyday = movePool.indexOf("sunnyday");
          if (sunnyday >= 0)
            this.fastPop(movePool, sunnyday);
        }
        return { cull: !moves.has("sunnyday") };
      case "aromatherapy":
      case "healbell":
        return { cull: moves.has("rest") || !!teamDetails.statusCure };
      case "confuseray":
        return { cull: !!counter.setupType || restTalk };
      case "counter":
      case "mirrorcoat":
        return { cull: !!counter.setupType || ["rest", "substitute", "toxic"].some((m) => moves.has(m)) };
      case "destinybond":
        return { cull: !!counter.setupType || moves.has("explosion") || moves.has("selfdestruct") };
      case "doubleedge":
      case "facade":
      case "fakeout":
      case "waterspout":
        return { cull: !types.has(move.type) && counter.get("Status") >= 1 || move.id === "doubleedge" && moves.has("return") };
      case "encore":
      case "painsplit":
      case "recover":
      case "yawn":
        return { cull: restTalk };
      case "explosion":
      case "machpunch":
      case "selfdestruct":
        const snorlaxCase = species.id === "snorlax" && !moves.has("return") && !moves.has("bodyslam");
        return { cull: snorlaxCase || moves.has("rest") || moves.has("substitute") || !!counter.get("recovery") };
      case "haze":
        return { cull: !!counter.setupType || moves.has("raindance") || restTalk };
      case "icywind":
      case "pursuit":
      case "superpower":
      case "transform":
        return { cull: !!counter.setupType || moves.has("rest") };
      case "leechseed":
        return { cull: !!counter.setupType || moves.has("explosion") };
      case "stunspore":
        return { cull: moves.has("sunnyday") || moves.has("toxic") };
      case "lightscreen":
        return { cull: !!counter.setupType || !!counter.get("speedsetup") };
      case "meanlook":
      case "spiderweb":
        return { cull: !!counter.get("speedsetup") || !moves.has("batonpass") && !moves.has("perishsong") };
      case "morningsun":
        return { cull: counter.get("speedsetup") >= 1 };
      case "quickattack":
        return { cull: !!counter.get("speedsetup") || moves.has("substitute") || !types.has("Normal") && !!counter.get("Status") };
      case "rapidspin":
        return { cull: !!counter.setupType || moves.has("rest") || !!teamDetails.rapidSpin };
      case "reflect":
        return { cull: !!counter.setupType || !!counter.get("speedsetup") };
      case "roar":
      case "whirlwind":
        return { cull: moves.has("sleeptalk") || moves.has("rest") };
      case "seismictoss":
        return { cull: !!counter.setupType || moves.has("thunderbolt") };
      case "spikes":
        return { cull: !!counter.setupType || moves.has("substitute") || restTalk || !!teamDetails.spikes };
      case "substitute":
        const restOrDD = moves.has("rest") || moves.has("dragondance") && !moves.has("bellydrum");
        return { cull: restOrDD || species.id !== "entei" && !moves.has("batonpass") && movePool.includes("calmmind") };
      case "thunderwave":
        return { cull: !!counter.setupType || moves.has("bodyslam") || moves.has("substitute") && movePool.includes("toxic") || restTalk };
      case "toxic":
        return { cull: !!counter.setupType || !!counter.get("speedsetup") || ["endure", "focuspunch", "raindance", "yawn", "hypnosis"].some((m) => moves.has(m)) };
      case "trick":
        return { cull: counter.get("Status") > 1 };
      case "willowisp":
        return { cull: !!counter.setupType || moves.has("hypnosis") || moves.has("toxic") };
      case "bodyslam":
        return { cull: moves.has("return") && !!counter.get("Status") };
      case "headbutt":
        return { cull: !moves.has("bodyslam") && !moves.has("thunderwave") };
      case "return":
        return { cull: moves.has("endure") || moves.has("substitute") && moves.has("flail") || moves.has("bodyslam") && !counter.get("Status") };
      case "fireblast":
        return { cull: moves.has("flamethrower") && !!counter.get("Status") };
      case "flamethrower":
        return { cull: moves.has("fireblast") && !counter.get("Status") };
      case "overheat":
        return { cull: moves.has("flamethrower") || moves.has("substitute") };
      case "hydropump":
        return { cull: moves.has("surf") && !!counter.get("Status") };
      case "surf":
        return { cull: moves.has("hydropump") && !counter.get("Status") };
      case "gigadrain":
        return { cull: moves.has("morningsun") || moves.has("toxic") };
      case "hiddenpower":
        const stabCondition = types.has(move.type) && counter.get(move.type) > 1 && (moves.has("substitute") && !counter.setupType && !moves.has("toxic") || // This otherwise causes STABless meganium
        species.id !== "meganium" && moves.has("toxic") && !moves.has("substitute") || restTalk);
        return { cull: stabCondition || move.type === "Grass" && moves.has("sunnyday") && moves.has("solarbeam") };
      case "brickbreak":
      case "crosschop":
      case "skyuppercut":
        return { cull: moves.has("substitute") && (moves.has("focuspunch") || movePool.includes("focuspunch")) };
      case "earthquake":
        return { cull: moves.has("bonemerang") };
    }
    return { cull: false };
  }
  getItem(ability, types, moves, counter, species) {
    if (species.name === "Ditto")
      return this.sample(["Metal Powder", "Quick Claw"]);
    if (species.name === "Farfetch\u2019d")
      return "Stick";
    if (species.name === "Marowak")
      return "Thick Club";
    if (species.name === "Pikachu")
      return "Light Ball";
    if (species.name === "Shedinja")
      return "Lum Berry";
    if (species.name === "Unown")
      return "Twisted Spoon";
    if (moves.has("trick"))
      return "Choice Band";
    if (moves.has("rest") && !moves.has("sleeptalk") && !["Early Bird", "Natural Cure", "Shed Skin"].includes(ability)) {
      return "Chesto Berry";
    }
    if (moves.has("dragondance") && ability !== "Natural Cure")
      return "Lum Berry";
    if (moves.has("bellydrum") && counter.get("Physical") - counter.get("priority") > 1 || (moves.has("swordsdance") && counter.get("Status") < 2 || moves.has("bulkup") && moves.has("substitute")) && !counter.get("priority") && species.baseStats.spe >= 60 && species.baseStats.spe <= 95) {
      return "Salac Berry";
    }
    if (moves.has("endure") || moves.has("substitute") && ["bellydrum", "endeavor", "flail", "reversal"].some((m) => moves.has(m))) {
      return species.baseStats.spe <= 100 && ability !== "Speed Boost" && !counter.get("speedsetup") && !moves.has("focuspunch") ? "Salac Berry" : "Liechi Berry";
    }
    if (moves.has("substitute") && counter.get("Physical") >= 3 && species.baseStats.spe >= 120)
      return "Liechi Berry";
    if ((moves.has("substitute") || moves.has("raindance")) && counter.get("Special") >= 3)
      return "Petaya Berry";
    if (counter.get("Physical") >= 4 && !moves.has("fakeout"))
      return "Choice Band";
    if (counter.get("Physical") >= 3 && !moves.has("rapidspin") && (["fireblast", "icebeam", "overheat"].some((m) => moves.has(m)) || Array.from(moves).some((m) => {
      const moveData = this.dex.moves.get(m);
      return moveData.category === "Special" && types.has(moveData.type);
    }))) {
      return "Choice Band";
    }
    if (moves.has("psychoboost"))
      return "White Herb";
    return "Leftovers";
  }
  shouldCullAbility(ability, types, moves, abilities, counter, movePool, teamDetails, species) {
    switch (ability) {
      case "Chlorophyll":
        return !moves.has("sunnyday") && !teamDetails["sun"];
      case "Compound Eyes":
        return !counter.get("inaccurate");
      case "Hustle":
        return counter.get("Physical") < 2;
      case "Lightning Rod":
        return species.types.includes("Ground");
      case "Overgrow":
        return !counter.get("Grass");
      case "Rock Head":
        return !counter.get("recoil");
      case "Sand Veil":
        return !teamDetails["sand"];
      case "Serene Grace":
        return species.id === "blissey";
      case "Sturdy":
        return true;
      case "Swift Swim":
        return !moves.has("raindance") && !teamDetails["rain"];
      case "Swarm":
        return !counter.get("Bug");
      case "Torrent":
        return !counter.get("Water");
      case "Water Absorb":
        return abilities.has("Swift Swim");
    }
    return false;
  }
  randomSet(species, teamDetails = {}) {
    species = this.dex.species.get(species);
    let forme = species.name;
    const data = this.randomData[species.id];
    if (typeof species.battleOnly === "string")
      forme = species.battleOnly;
    const movePool = (data.moves || Object.keys(this.dex.species.getLearnset(species.id))).slice();
    const rejectedPool = [];
    const moves = /* @__PURE__ */ new Set();
    let ability = "";
    const evs = { hp: 85, atk: 85, def: 85, spa: 85, spd: 85, spe: 85 };
    const ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
    let availableHP = 0;
    for (const setMoveid of movePool) {
      if (setMoveid.startsWith("hiddenpower"))
        availableHP++;
    }
    const types = new Set(species.types);
    const abilities = new Set(Object.values(species.abilities));
    let counter;
    let hasHiddenPower = false;
    do {
      while (moves.size < this.maxMoveCount && movePool.length) {
        const moveid = this.sampleNoReplace(movePool);
        if (moveid.startsWith("hiddenpower")) {
          availableHP--;
          if (hasHiddenPower)
            continue;
          hasHiddenPower = true;
        }
        moves.add(moveid);
      }
      while (moves.size < this.maxMoveCount && rejectedPool.length) {
        const moveid = this.sampleNoReplace(rejectedPool);
        if (moveid.startsWith("hiddenpower")) {
          if (hasHiddenPower)
            continue;
          hasHiddenPower = true;
        }
        moves.add(moveid);
      }
      counter = this.queryMoves(moves, species.types, abilities, movePool);
      for (const moveid of moves) {
        const move = this.dex.moves.get(moveid);
        let { cull, isSetup } = this.shouldCullMove(move, types, moves, abilities, counter, movePool, teamDetails, species);
        if (counter.setupType === "Physical" && move.category === "Special" && !types.has(move.type) && move.type !== "Fire" || counter.setupType === "Special" && move.category === "Physical" && moveid !== "superpower") {
          cull = true;
        }
        const moveIsRejectable = !move.weather && (move.category !== "Status" || !move.flags.heal) && (counter.setupType || !move.stallingMove) && // These moves cannot be rejected in favor of a forced move
        !["batonpass", "sleeptalk", "solarbeam", "substitute", "sunnyday"].includes(moveid) && (move.category === "Status" || !types.has(move.type) || move.basePower && move.basePower < 40 && !move.multihit);
        const requiresStab = !counter.get("stab") && !moves.has("seismictoss") && !moves.has("nightshade") && species.id !== "castform" && species.id !== "umbreon" && // If a Flying-type has Psychic, it doesn't need STAB
        !(moves.has("psychic") && types.has("Flying")) && !(types.has("Ghost") && species.baseStats.spa > species.baseStats.atk) && !// With Calm Mind, Lugia and pure Normal-types are fine without STAB
        (counter.setupType === "Special" && (species.id === "lugia" || types.has("Normal") && species.types.length < 2)) && !// With Swords Dance, Dark-types and pure Water-types are fine without STAB
        (counter.setupType === "Physical" && (types.has("Water") && species.types.length < 2 || types.has("Dark"))) && counter.get("physicalpool") + counter.get("specialpool") > 0;
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
            teamDetails
          );
        };
        if (!cull && !isSetup && moveIsRejectable) {
          if (requiresStab || counter.setupType && counter.get(counter.setupType) < 2 && !moves.has("refresh") || moves.has("substitute") && movePool.includes("morningsun") || ["meteormash", "spore", "recover"].some((m) => movePool.includes(m))) {
            cull = true;
          } else {
            for (const type of types) {
              if (runEnforcementChecker(type)) {
                cull = true;
              }
            }
            for (const m of moves) {
              if (runEnforcementChecker(m))
                cull = true;
            }
          }
        }
        if (moveid === "rest" && cull) {
          const sleeptalk = movePool.indexOf("sleeptalk");
          if (sleeptalk >= 0) {
            if (movePool.length < 2) {
              cull = false;
            } else {
              this.fastPop(movePool, sleeptalk);
            }
          }
        }
        const moveIsHP = moveid.startsWith("hiddenpower");
        if (cull && (movePool.length - availableHP || availableHP && (moveIsHP || !hasHiddenPower))) {
          if (move.category !== "Status" && !move.damage && (!moveIsHP || !availableHP)) {
            rejectedPool.push(moveid);
          }
          if (moveIsHP)
            hasHiddenPower = false;
          moves.delete(moveid);
          break;
        }
        if (cull && rejectedPool.length) {
          if (moveIsHP)
            hasHiddenPower = false;
          moves.delete(moveid);
          break;
        }
      }
    } while (moves.size < this.maxMoveCount && (movePool.length || rejectedPool.length));
    if (hasHiddenPower) {
      let hpType;
      for (const move of moves) {
        if (move.startsWith("hiddenpower"))
          hpType = move.substr(11);
      }
      if (!hpType)
        throw new Error(`hasHiddenPower is true, but no Hidden Power move was found.`);
      const HPivs = this.dex.types.get(hpType).HPivs;
      let iv;
      for (iv in HPivs) {
        ivs[iv] = HPivs[iv];
      }
    }
    const abilityData = Array.from(abilities).map((a) => this.dex.abilities.get(a)).filter((a) => a.gen === 3);
    import_lib.Utils.sortBy(abilityData, (abil) => -abil.rating);
    let ability0 = abilityData[0];
    let ability1 = abilityData[1];
    if (abilityData[1]) {
      if (ability0.rating <= ability1.rating && this.randomChance(1, 2)) {
        [ability0, ability1] = [ability1, ability0];
      } else if (ability0.rating - 0.6 <= ability1.rating && this.randomChance(2, 3)) {
        [ability0, ability1] = [ability1, ability0];
      }
      ability = ability0.name;
      while (this.shouldCullAbility(ability, types, moves, abilities, counter, movePool, teamDetails, species)) {
        if (ability === ability0.name && ability1.rating > 1) {
          ability = ability1.name;
        } else {
          ability = abilityData[0].name;
          break;
        }
      }
    } else {
      ability = abilityData[0].name;
    }
    const item = this.getItem(ability, types, moves, counter, species);
    const level = this.adjustLevel || data.level || (species.nfe ? 90 : 80);
    let hp = Math.floor(Math.floor(2 * species.baseStats.hp + ivs.hp + Math.floor(evs.hp / 4) + 100) * level / 100 + 10);
    if (moves.has("substitute") && ["endeavor", "flail", "reversal"].some((m) => moves.has(m))) {
      if (hp % 4 === 0)
        evs.hp -= 4;
    } else if (moves.has("substitute") && (item === "Salac Berry" || item === "Petaya Berry" || item === "Liechi Berry")) {
      while (hp % 4 > 0) {
        evs.hp -= 4;
        hp = Math.floor(Math.floor(2 * species.baseStats.hp + ivs.hp + Math.floor(evs.hp / 4) + 100) * level / 100 + 10);
      }
    }
    if (!counter.get("Physical") && !moves.has("transform")) {
      evs.atk = 0;
      ivs.atk = hasHiddenPower ? ivs.atk - 28 : 0;
    }
    return {
      name: species.baseSpecies,
      species: forme,
      gender: species.gender,
      moves: Array.from(moves),
      ability,
      evs,
      ivs,
      item,
      level,
      shiny: this.randomChance(1, 1024)
    };
  }
  randomTeam() {
    this.enforceNoDirectCustomBanlistChanges();
    const seed = this.prng.seed;
    const ruleTable = this.dex.formats.getRuleTable(this.format);
    const pokemon = [];
    const isMonotype = !!this.forceMonotype || ruleTable.has("sametypeclause");
    const typePool = this.dex.types.names();
    const type = this.forceMonotype || this.sample(typePool);
    const baseFormes = {};
    const tierCount = {};
    const typeCount = {};
    const typeComboCount = {};
    const typeWeaknesses = {};
    const teamDetails = {};
    const pokemonPool = this.getPokemonPool(type, pokemon, isMonotype);
    while (pokemonPool.length && pokemon.length < this.maxTeamSize) {
      const species = this.dex.species.get(this.sampleNoReplace(pokemonPool));
      if (!species.exists || !this.randomData[species.id]?.moves)
        continue;
      if (baseFormes[species.baseSpecies])
        continue;
      if (species.name === "Wobbuffet" && this.battleHasWobbuffet)
        continue;
      if (this.dex.gen < 3 && species.name === "Ditto" && this.battleHasDitto)
        continue;
      const tier = species.tier;
      const types = species.types;
      const typeCombo = types.slice().sort().join();
      if (!isMonotype && !this.forceMonotype) {
        const limitFactor = Math.round(this.maxTeamSize / 6) || 1;
        if (tierCount[tier] >= 2 * limitFactor)
          continue;
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
        if (!this.forceMonotype && typeComboCount[typeCombo] >= 1 * limitFactor)
          continue;
      }
      const set = this.randomSet(species, teamDetails);
      pokemon.push(set);
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
      if (set.ability === "Sand Stream")
        teamDetails.sand = 1;
      if (set.moves.includes("spikes"))
        teamDetails.spikes = 1;
      if (set.moves.includes("rapidspin"))
        teamDetails.rapidSpin = 1;
      if (set.moves.includes("aromatherapy") || set.moves.includes("healbell"))
        teamDetails.statusCure = 1;
      if (set.ability === "Shadow Tag")
        this.battleHasWobbuffet = true;
      if (species.id === "ditto")
        this.battleHasDitto = true;
    }
    if (pokemon.length < this.maxTeamSize && !isMonotype && !this.forceMonotype && pokemon.length < 12) {
      throw new Error(`Could not build a random team for ${this.format} (seed=${seed})`);
    }
    return pokemon;
  }
}
var random_teams_default = RandomGen3Teams;
//# sourceMappingURL=random-teams.js.map
