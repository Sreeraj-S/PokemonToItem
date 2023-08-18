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
  RandomGen5Teams: () => RandomGen5Teams,
  default: () => random_teams_default
});
module.exports = __toCommonJS(random_teams_exports);
var import_random_teams = __toESM(require("../gen6/random-teams"));
var import_lib = require("../../../lib");
var import_dex = require("../../../sim/dex");
class RandomGen5Teams extends import_random_teams.default {
  constructor(format, prng) {
    super(format, prng);
    this.randomData = require("./random-data.json");
    this.moveEnforcementCheckers = {
      lead: (movePool, moves, abilities, types, counter) => movePool.includes("stealthrock") && !!counter.get("Status") && !counter.setupType && !counter.get("speedsetup") && !moves.has("substitute"),
      Dark: (movePool, moves, abilities, types, counter) => !counter.get("Dark"),
      Dragon: (movePool, moves, abilities, types, counter) => !counter.get("Dragon"),
      Electric: (movePool, moves, abilities, types, counter) => !counter.get("Electric") || movePool.includes("thunder"),
      Fighting: (movePool, moves, abilities, types, counter, species) => !counter.get("Fighting") && (species.baseStats.atk >= 90 || abilities.has("Pure Power") || !!counter.setupType || !counter.get("Status")),
      Fire: (movePool, moves, abilities, types, counter) => !counter.get("Fire"),
      Flying: (movePool, moves, abilities, types, counter) => !counter.get("Flying") && (types.has("Normal") || abilities.has("Serene Grace")),
      Ghost: (movePool, moves, abilities, types, counter) => !types.has("Dark") && !counter.get("Ghost"),
      Grass: (movePool) => ["hornleech", "seedflare", "woodhammer"].some((m) => movePool.includes(m)),
      Ground: (movePool, moves, abilities, types, counter) => !counter.get("Ground") && !moves.has("rest") && !moves.has("sleeptalk"),
      Ice: (movePool, moves, abilities, types, counter) => !counter.get("Ice"),
      Normal: (movePool, moves, abilities, types, counter, species) => movePool.includes("return") && species.baseStats.atk > 80,
      Rock: (movePool, moves, abilities, types, counter, species) => !counter.get("Rock") && species.baseStats.atk >= 80,
      Steel: (movePool, moves, abilities, types, counter) => !counter.get("Steel") && abilities.has("Technician"),
      Water: (movePool, moves, abilities, types, counter) => !counter.get("Water") || abilities.has("Adaptability") && movePool.includes("waterfall"),
      Contrary: (movePool, moves, abilities, types, counter, species, teamDetails) => !counter.get("contrary") && species.name !== "Shuckle",
      Guts: (movePool, moves, abilities, types) => types.has("Normal") && movePool.includes("facade"),
      "Slow Start": (movePool) => movePool.includes("substitute")
    };
  }
  shouldCullMove(move, types, moves, abilities, counter, movePool, teamDetails, species, isLead) {
    const hasRestTalk = moves.has("rest") && moves.has("sleeptalk");
    switch (move.id) {
      case "endeavor":
        return { cull: !isLead };
      case "focuspunch":
        return { cull: !moves.has("substitute") || counter.damagingMoves.size < 2 || moves.has("swordsdance") };
      case "lightscreen":
        if (movePool.length > 1) {
          const screen = movePool.indexOf("reflect");
          if (screen >= 0)
            this.fastPop(movePool, screen);
        }
        return { cull: !moves.has("reflect") };
      case "reflect":
        if (movePool.length > 1) {
          const screen = movePool.indexOf("lightscreen");
          if (screen >= 0)
            this.fastPop(movePool, screen);
        }
        return { cull: !moves.has("lightscreen") };
      case "rest":
        return { cull: movePool.includes("sleeptalk") };
      case "sleeptalk":
        if (movePool.length > 1) {
          const rest = movePool.indexOf("rest");
          if (rest >= 0)
            this.fastPop(movePool, rest);
        }
        return { cull: !moves.has("rest") };
      case "storedpower":
        return { cull: !counter.setupType && !moves.has("cosmicpower") };
      case "weatherball":
        return { cull: !moves.has("sunnyday") };
      case "bellydrum":
      case "bulkup":
      case "coil":
      case "curse":
      case "dragondance":
      case "honeclaws":
      case "swordsdance":
        return { cull: counter.setupType !== "Physical" || counter.get("physicalsetup") > 1 || counter.get("Physical") + counter.get("physicalpool") < 2 && !hasRestTalk, isSetup: true };
      case "calmmind":
      case "nastyplot":
      case "tailglow":
        return { cull: counter.setupType !== "Special" || counter.get("specialsetup") > 1 || counter.get("Special") + counter.get("specialpool") < 2 && !hasRestTalk, isSetup: true };
      case "growth":
      case "shellsmash":
      case "workup":
        const moveTotal = counter.damagingMoves.size + counter.get("physicalpool") + counter.get("specialpool");
        return {
          cull: counter.setupType !== "Mixed" || counter.get("mixedsetup") > 1 || moveTotal < 2 || move.id === "growth" && !moves.has("sunnyday"),
          isSetup: true
        };
      case "agility":
      case "autotomize":
      case "rockpolish":
        return {
          cull: counter.damagingMoves.size < 2 && !counter.setupType || hasRestTalk,
          isSetup: !counter.setupType
        };
      case "bulletpunch":
        return { cull: !!counter.get("speedsetup") };
      case "circlethrow":
      case "dragontail":
        return { cull: moves.has("substitute") || !!counter.setupType && !moves.has("rest") && !moves.has("sleeptalk") };
      case "fakeout":
      case "healingwish":
        return { cull: !!counter.setupType || !!counter.get("recovery") || moves.has("substitute") };
      case "haze":
      case "magiccoat":
      case "pursuit":
      case "spikes":
        return { cull: !!counter.setupType || !!counter.get("speedsetup") || moves.has("rest") || moves.has("trickroom") };
      case "iceshard":
        return { cull: moves.has("shellsmash") };
      case "leechseed":
      case "roar":
      case "whirlwind":
        return { cull: !!counter.setupType || !!counter.get("speedsetup") || moves.has("dragontail") };
      case "nightshade":
      case "seismictoss":
      case "superfang":
        return { cull: !!counter.setupType || counter.damagingMoves.size > 1 };
      case "protect":
        return { cull: moves.has("rest") || counter.setupType && !abilities.has("Speed Boost") && !moves.has("wish") || moves.has("lightscreen") && moves.has("reflect") };
      case "rapidspin":
        return { cull: moves.has("shellsmash") || !!counter.setupType && counter.get("Status") >= 2 };
      case "stealthrock":
        return { cull: !!counter.setupType || !!counter.get("speedsetup") || moves.has("rest") || !!teamDetails.stealthRock };
      case "switcheroo":
      case "trick":
        return { cull: counter.get("Physical") + counter.get("Special") < 3 || ["fakeout", "rapidspin", "suckerpunch"].some((m) => moves.has(m)) };
      case "toxic":
        return { cull: !!counter.setupType || !!counter.get("speedsetup") || moves.has("trickroom") };
      case "toxicspikes":
        return { cull: !!counter.setupType || !!teamDetails.toxicSpikes };
      case "trickroom":
        return { cull: !!counter.setupType || !!counter.get("speedsetup") || counter.damagingMoves.size < 2 || moves.has("lightscreen") || moves.has("reflect") };
      case "uturn":
        const infernapeCase = species.id === "infernape" && !!counter.get("Special");
        return { cull: !!counter.setupType || !!counter.get("speedsetup") || infernapeCase };
      case "voltswitch":
        return { cull: !!counter.setupType || !!counter.get("speedsetup") || ["magnetrise", "uturn"].some((m) => moves.has(m)) };
      case "bugbite":
        return { cull: moves.has("uturn") };
      case "crunch":
        return { cull: !types.has("Dark") && moves.has("suckerpunch") };
      case "dragonpulse":
      case "spacialrend":
        return { cull: moves.has("dracometeor") || moves.has("outrage") };
      case "thunderbolt":
        return { cull: moves.has("wildcharge") };
      case "drainpunch":
      case "focusblast":
        return { cull: moves.has("closecombat") || moves.has("lowkick") };
      case "blueflare":
      case "flareblitz":
      case "fierydance":
      case "flamethrower":
      case "lavaplume":
        return { cull: ["fireblast", "overheat", "vcreate"].some((m) => moves.has(m)) };
      case "bravebird":
      case "pluck":
        return { cull: moves.has("acrobatics") || moves.has("hurricane") };
      case "acrobatics":
        return { cull: !counter.setupType && moves.has("hurricane") };
      case "hurricane":
        return { cull: !!counter.setupType && moves.has("acrobatics") };
      case "gigadrain":
        return { cull: !counter.setupType && moves.has("leafstorm") || ["petaldance", "powerwhip"].some((m) => moves.has(m)) };
      case "solarbeam":
        return { cull: !abilities.has("Drought") && !moves.has("sunnyday") || moves.has("gigadrain") };
      case "leafstorm":
        return { cull: !!counter.setupType && (moves.has("gigadrain") || moves.has("seedbomb")) };
      case "seedbomb":
        return { cull: !counter.setupType && moves.has("leafstorm") };
      case "bonemerang":
      case "earthpower":
        return { cull: moves.has("earthquake") };
      case "extremespeed":
      case "headsmash":
        return { cull: moves.has("roost") };
      case "facade":
        return { cull: moves.has("suckerpunch") && !types.has("Normal") };
      case "hydropump":
        return { cull: moves.has("waterfall") && !!counter.setupType };
      case "judgment":
        return { cull: counter.setupType !== "Special" && counter.get("stab") > 1 };
      case "return":
        return { cull: moves.has("doubleedge") };
      case "rockblast":
        return { cull: moves.has("stoneedge") };
      case "poisonjab":
        return { cull: moves.has("gunkshot") };
      case "psychic":
        return { cull: moves.has("psyshock") };
      case "scald":
      case "surf":
        return { cull: moves.has("hydropump") || moves.has("waterfall") };
      case "shadowball":
        return { cull: types.has("Psychic") && types.size < 2 && counter.get("Special") < 3 && moves.has("calmmind") && species.id !== "chimecho" };
      case "waterfall":
        return { cull: moves.has("hydropump") && !counter.setupType && !moves.has("raindance") && !teamDetails.rain };
      case "waterspout":
        return { cull: !!counter.get("Status") };
      case "encore":
      case "icepunch":
      case "raindance":
      case "suckerpunch":
        return { cull: moves.has("thunderwave") || hasRestTalk };
      case "glare":
      case "headbutt":
        return { cull: moves.has("bodyslam") };
      case "healbell":
        return { cull: !!counter.get("speedsetup") || moves.has("magiccoat") };
      case "moonlight":
      case "painsplit":
      case "recover":
      case "roost":
      case "softboiled":
      case "synthesis":
        const gliscorCase = species.id === "gliscor" && moves.has("protect");
        return { cull: ["leechseed", "rest", "wish"].some((m) => moves.has(m)) || gliscorCase };
      case "substitute":
        return { cull: moves.has("doubleedge") && !abilities.has("rockhead") || ["pursuit", "rest", "superpower", "uturn", "voltswitch"].some((m) => moves.has(m)) || moves.has("acrobatics") && moves.has("earthquake") || movePool.includes("shiftgear") };
      case "thunderwave":
        return { cull: !!counter.setupType || !!counter.get("speedsetup") || hasRestTalk || moves.has("discharge") || moves.has("trickroom") };
      case "willowisp":
        return { cull: moves.has("lavaplume") || moves.has("scald") && !types.has("Ghost") };
    }
    return { cull: false };
  }
  shouldCullAbility(ability, types, moves, abilities, counter, movePool, teamDetails, species) {
    switch (ability) {
      case "Anger Point":
      case "Gluttony":
      case "Keen Eye":
      case "Moody":
      case "Sand Veil":
      case "Snow Cloak":
      case "Steadfast":
      case "Weak Armor":
        return true;
      case "Analytic":
      case "Download":
      case "Hyper Cutter":
        return species.nfe;
      case "Chlorophyll":
      case "Solar Power":
        return !moves.has("sunnyday") && !teamDetails.sun;
      case "Compound Eyes":
      case "No Guard":
        return !counter.get("inaccurate");
      case "Contrary":
      case "Iron Fist":
      case "Skill Link":
        return !counter.get((0, import_dex.toID)(ability));
      case "Defiant":
      case "Moxie":
        return !counter.get("Physical");
      case "Flash Fire":
        return abilities.has("Drought");
      case "Guts":
        return species.id === "heracross";
      case "Hydration":
      case "Rain Dish":
      case "Swift Swim":
        return !moves.has("raindance") && !teamDetails.rain;
      case "Hustle":
        return counter.get("Physical") < 2;
      case "Ice Body":
        return !teamDetails.hail;
      case "Immunity":
        return abilities.has("Toxic Boost");
      case "Intimidate":
        return moves.has("rest") || species.id === "staraptor";
      case "Lightning Rod":
        return species.types.includes("Ground");
      case "Limber":
        return species.types.includes("Electric");
      case "Mold Breaker":
        return abilities.has("Adaptability") || moves.has("rest") && moves.has("sleeptalk");
      case "Overgrow":
        return !counter.get("Grass");
      case "Poison Heal":
        return abilities.has("Technician") && !!counter.get("technician");
      case "Prankster":
        return !counter.get("Status");
      case "Pressure":
      case "Synchronize":
        return counter.get("Status") < 2 || abilities.has("Trace");
      case "Reckless":
      case "Rock Head":
        return !counter.get("recoil") || abilities.has("Sap Sipper");
      case "Regenerator":
        return abilities.has("Magic Guard");
      case "Sand Force":
      case "Sand Rush":
        return !teamDetails.sand;
      case "Serene Grace":
        return !counter.get("serenegrace") || species.id === "blissey";
      case "Sheer Force":
        return !counter.get("sheerforce") || abilities.has("Guts");
      case "Sturdy":
        return !!counter.get("recoil") && !counter.get("recovery");
      case "Swarm":
        return !counter.get("Bug");
      case "Technician":
        return !counter.get("technician") || moves.has("tailslap");
      case "Tinted Lens":
        return abilities.has("Insomnia") || abilities.has("Magic Guard") || moves.has("protect");
      case "Unaware":
        return !!counter.setupType || abilities.has("Magic Guard");
      case "Unburden":
        return species.baseStats.spe > 100 && !moves.has("acrobatics");
      case "Water Absorb":
        return abilities.has("Drizzle") || abilities.has("Unaware") || abilities.has("Volt Absorb");
    }
    return false;
  }
  getHighPriorityItem(ability, types, moves, counter, teamDetails, species, isLead) {
    if (species.requiredItem)
      return species.requiredItem;
    if (species.requiredItems)
      return this.sample(species.requiredItems);
    if (species.name === "Marowak")
      return "Thick Club";
    if (species.name === "Farfetch\u2019d")
      return "Stick";
    if (species.name === "Pikachu")
      return "Light Ball";
    if (species.name === "Shedinja" || species.name === "Smeargle")
      return "Focus Sash";
    if (species.name === "Unown")
      return "Choice Specs";
    if (species.name === "Wobbuffet" && moves.has("destinybond") && this.randomChance(1, 2))
      return "Custap Berry";
    if (ability === "Imposter")
      return "Choice Scarf";
    if (moves.has("switcheroo") || moves.has("trick")) {
      if (species.baseStats.spe >= 60 && species.baseStats.spe <= 108 && !counter.get("priority")) {
        return "Choice Scarf";
      } else {
        return counter.get("Physical") > counter.get("Special") ? "Choice Band" : "Choice Specs";
      }
    }
    if (species.nfe)
      return "Eviolite";
    if (moves.has("shellsmash"))
      return "White Herb";
    if (ability === "Harvest" || moves.has("bellydrum"))
      return "Sitrus Berry";
    if ((ability === "Magic Guard" || ability === "Sheer Force") && counter.damagingMoves.size > 1)
      return "Life Orb";
    if (ability === "Poison Heal" || ability === "Toxic Boost" || ability === "Quick Feet" && moves.has("facade")) {
      return "Toxic Orb";
    }
    if (moves.has("psychoshift"))
      return "Flame Orb";
    if (moves.has("rest") && !moves.has("sleeptalk") && ability !== "Natural Cure" && ability !== "Shed Skin") {
      return "Chesto Berry";
    }
    if (ability === "Guts" && moves.has("facade")) {
      return types.has("Fire") || moves.has("uturn") || moves.has("voltswitch") ? "Toxic Orb" : "Flame Orb";
    }
    if (moves.has("raindance"))
      return ability === "Forecast" ? "Damp Rock" : "Life Orb";
    if (moves.has("sunnyday"))
      return ability === "Forecast" || ability === "Flower Gift" ? "Heat Rock" : "Life Orb";
    if (moves.has("lightscreen") && moves.has("reflect"))
      return "Light Clay";
    if (moves.has("acrobatics"))
      return "Flying Gem";
    if (ability === "Unburden")
      return moves.has("fakeout") ? "Normal Gem" : `${species.types[0]} Gem`;
  }
  getLowPriorityItem(ability, types, moves, abilities, counter, teamDetails, species, isLead) {
    if (ability === "Speed Boost" && !moves.has("substitute") && counter.get("Physical") + counter.get("Special") > 2) {
      return "Life Orb";
    }
    if (counter.get("Physical") >= 4 && ["dragontail", "fakeout", "flamecharge"].every((m) => !moves.has(m)) && !moves.has("suckerpunch") && (!moves.has("rapidspin") || this.dex.getEffectiveness("Rock", species) < 1)) {
      return (species.baseStats.atk >= 100 || abilities.has("Huge Power")) && species.baseStats.spe >= 60 && species.baseStats.spe <= 108 && !counter.get("priority") && this.randomChance(2, 3) ? "Choice Scarf" : "Choice Band";
    }
    if (counter.get("Special") >= 4 || counter.get("Special") >= 3 && moves.has("uturn")) {
      return species.baseStats.spa >= 100 && species.baseStats.spe >= 60 && species.baseStats.spe <= 108 && !moves.has("uturn") && (ability === "Download" || this.randomChance(2, 3)) ? "Choice Scarf" : "Choice Specs";
    }
    if (counter.setupType && moves.has("outrage"))
      return "Lum Berry";
    if (this.dex.getEffectiveness("Ground", species) >= 2 && ability !== "Levitate")
      return "Air Balloon";
    if (counter.get("Dark") >= 3)
      return "Black Glasses";
    if (species.name === "Palkia" && (moves.has("dracometeor") || moves.has("spacialrend"))) {
      return "Lustrous Orb";
    }
    if (types.has("Poison") || ["bodyslam", "dragontail", "protect", "scald", "sleeptalk", "substitute"].some((m) => moves.has(m))) {
      return "Leftovers";
    }
    if (counter.damagingMoves.size >= 4 && ability !== "Sturdy") {
      return moves.has("uturn") ? "Expert Belt" : "Life Orb";
    }
    if (isLead && counter.get("hazards") && !counter.get("recovery") && ability !== "Regenerator" && species.baseStats.hp + species.baseStats.def + species.baseStats.spd <= 275) {
      return ability === "Sturdy" ? "Custap Berry" : "Focus Sash";
    }
    if (moves.has("voltswitch") && species.baseStats.spe <= 90) {
      return "Leftovers";
    }
    if (counter.damagingMoves.size >= 3 && species.baseStats.spe >= 40 && species.baseStats.hp + species.baseStats.def + species.baseStats.spd <= 275 && ability !== "Sturdy" && !moves.has("rapidspin") && !moves.has("uturn")) {
      return "Life Orb";
    }
  }
  randomSet(species, teamDetails = {}, isLead = false) {
    species = this.dex.species.get(species);
    let forme = species.name;
    if (typeof species.battleOnly === "string") {
      forme = species.battleOnly;
    }
    if (species.cosmeticFormes) {
      forme = this.sample([species.name].concat(species.cosmeticFormes));
    }
    const data = this.randomData[species.id];
    const movePool = (data.moves || Object.keys(this.dex.species.getLearnset(species.id))).slice();
    const rejectedPool = [];
    const moves = /* @__PURE__ */ new Set();
    let ability = "";
    const evs = { hp: 85, atk: 85, def: 85, spa: 85, spd: 85, spe: 85 };
    const ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
    const types = new Set(species.types);
    const abilities = new Set(Object.values(species.abilities));
    if (species.unreleasedHidden)
      abilities.delete(species.abilities.H);
    let availableHP = 0;
    for (const setMoveid of movePool) {
      if (setMoveid.startsWith("hiddenpower"))
        availableHP++;
    }
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
          if (hasHiddenPower) {
            continue;
          }
          hasHiddenPower = true;
        }
        moves.add(moveid);
      }
      counter = this.queryMoves(moves, species.types, abilities, movePool);
      for (const moveid of moves) {
        const move = this.dex.moves.get(moveid);
        let { cull, isSetup } = this.shouldCullMove(
          move,
          types,
          moves,
          abilities,
          counter,
          movePool,
          teamDetails,
          species,
          isLead
        );
        if (move.category === "Physical" && counter.setupType === "Special" || move.category === "Special" && counter.setupType === "Physical") {
          const stabs = counter.get(species.types[0]) + (counter.get(species.types[1]) || 0);
          if (!types.has(move.type) || stabs > 1 || counter.get(move.category) < 2)
            cull = true;
        }
        if (!isSetup && counter.setupType && counter.setupType !== "Mixed" && move.category !== counter.setupType && counter.get(counter.setupType) < 2 && (move.category !== "Status" || !move.flags.heal) && moveid !== "sleeptalk" && (move.category !== "Status" || counter.get(counter.setupType) + counter.get("Status") > 3 && counter.get("physicalsetup") + counter.get("specialsetup") < 2)) {
          cull = true;
        }
        if (counter.setupType === "Special" && moveid === "hiddenpower" && species.types.length > 1 && counter.get("Special") <= 2 && !types.has(move.type) && !counter.get("Physical") && counter.get("specialpool")) {
          cull = true;
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
            teamDetails
          );
        };
        if (!cull && !["judgment", "lightscreen", "quiverdance", "reflect", "sleeptalk"].includes(moveid) && !isSetup && !move.weather && !move.damage && (move.category !== "Status" || !move.flags.heal) && (move.category === "Status" || !types.has(move.type) || move.basePower && move.basePower < 40 && !move.multihit) && (counter.get("physicalsetup") + counter.get("specialsetup") < 2 && (!counter.setupType || counter.setupType === "Mixed" || move.category !== counter.setupType && move.category !== "Status" || counter.get(counter.setupType) + counter.get("Status") > 3))) {
          if (!counter.get("stab") && !counter.get("damage") && (species.types.length > 1 || species.types[0] !== "Normal" && species.types[0] !== "Psychic" || !moves.has("icebeam") || species.baseStats.spa >= species.baseStats.spd) || !counter.get("recovery") && !counter.setupType && ["healingwish", "trick", "trickroom"].every((m) => !moves.has(m)) && !abilities.has("Poison Heal") && (counter.get("Status") || species.nfe && !!counter.get("Status")) && ["recover", "roost", "slackoff", "softboiled"].some((m) => movePool.includes(m)) || (movePool.includes("moonlight") && types.size < 2 && !moves.has("trickroom") || movePool.includes("darkvoid") || movePool.includes("milkdrink") || movePool.includes("quiverdance") || species.requiredMove && movePool.includes((0, import_dex.toID)(species.requiredMove))) || isLead && runEnforcementChecker("lead")) {
            cull = true;
          } else {
            for (const type of types) {
              if (runEnforcementChecker(type)) {
                cull = true;
              }
            }
            for (const abil of abilities) {
              if (runEnforcementChecker(abil)) {
                cull = true;
              }
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
        const isHP = moveid.startsWith("hiddenpower");
        if (cull && (movePool.length - availableHP || availableHP && (isHP || !hasHiddenPower))) {
          if (move.category !== "Status" && !move.damage && !move.flags.charge && (!isHP || !availableHP))
            rejectedPool.push(moveid);
          moves.delete(moveid);
          if (isHP)
            hasHiddenPower = false;
          break;
        }
        if (cull && rejectedPool.length) {
          moves.delete(moveid);
          if (moveid.startsWith("hiddenpower"))
            hasHiddenPower = false;
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
    const abilityData = Array.from(abilities).map((a) => this.dex.abilities.get(a));
    import_lib.Utils.sortBy(abilityData, (abil) => -abil.rating);
    if (abilityData.length > 1) {
      if (abilityData[2] && abilityData[1].rating <= abilityData[2].rating && this.randomChance(1, 2)) {
        [abilityData[1], abilityData[2]] = [abilityData[2], abilityData[1]];
      }
      if (abilityData[0].rating <= abilityData[1].rating) {
        if (this.randomChance(1, 2))
          [abilityData[0], abilityData[1]] = [abilityData[1], abilityData[0]];
      } else if (abilityData[0].rating - 0.6 <= abilityData[1].rating) {
        if (this.randomChance(2, 3))
          [abilityData[0], abilityData[1]] = [abilityData[1], abilityData[0]];
      }
      ability = abilityData[0].name;
      while (this.shouldCullAbility(ability, types, moves, abilities, counter, movePool, teamDetails, species)) {
        if (ability === abilityData[0].name && abilityData[1].rating >= 1) {
          ability = abilityData[1].name;
        } else if (ability === abilityData[1].name && abilityData[2] && abilityData[2].rating >= 1) {
          ability = abilityData[2].name;
        } else {
          ability = abilityData[0].name;
          break;
        }
      }
      if (abilities.has("Guts") && moves.has("facade") && (ability !== "Quick Feet" || !counter.setupType)) {
        ability = "Guts";
      } else if (abilities.has("Prankster") && counter.get("Status") > 1) {
        ability = "Prankster";
      } else if (abilities.has("Quick Feet") && moves.has("facade")) {
        ability = "Quick Feet";
      } else if (abilities.has("Swift Swim") && moves.has("raindance")) {
        ability = "Swift Swim";
      }
      if (species.name === "Altaria")
        ability = "Natural Cure";
    } else {
      ability = abilityData[0].name;
    }
    let item = this.getHighPriorityItem(ability, types, moves, counter, teamDetails, species, isLead);
    if (item === void 0) {
      item = this.getLowPriorityItem(ability, types, moves, abilities, counter, teamDetails, species, isLead);
    }
    if (item === void 0)
      item = "Leftovers";
    if (item === "Leftovers" && types.has("Poison")) {
      item = "Black Sludge";
    }
    const level = this.adjustLevel || data.level || (species.nfe ? 90 : 80);
    const srWeakness = this.dex.getEffectiveness("Rock", species);
    while (evs.hp > 1) {
      const hp = Math.floor(
        Math.floor(
          2 * species.baseStats.hp + (ivs.hp || 31) + Math.floor(evs.hp / 4) + 100
        ) * level / 100 + 10
      );
      if (moves.has("bellydrum") && item === "Sitrus Berry") {
        if (hp % 2 === 0)
          break;
      } else {
        if (srWeakness <= 0 || hp % (4 / srWeakness) > 0)
          break;
      }
      evs.hp -= 4;
    }
    if (!counter.get("Physical") && !moves.has("transform")) {
      evs.atk = 0;
      ivs.atk = hasHiddenPower ? (ivs.atk || 31) - 28 : 0;
    }
    if (["gyroball", "metalburst", "trickroom"].some((m) => moves.has(m))) {
      evs.spe = 0;
      ivs.spe = hasHiddenPower ? (ivs.spe || 31) - 28 : 0;
    }
    return {
      name: species.baseSpecies,
      species: forme,
      gender: species.gender,
      shiny: this.randomChance(1, 1024),
      moves: Array.from(moves),
      ability,
      evs,
      ivs,
      item,
      level
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
      switch (species.baseSpecies) {
        case "Arceus":
          if (this.randomChance(16, 17) && !isMonotype)
            continue;
          break;
        case "Rotom":
          if (this.gen < 5 && this.randomChance(5, 6) && !isMonotype)
            continue;
          break;
        case "Basculin":
        case "Castform":
        case "Meloetta":
          if (this.randomChance(1, 2) && this.gen === 5)
            continue;
          break;
        case "Cherrim":
          if (this.randomChance(1, 2) && this.gen === 4)
            continue;
          break;
      }
      if (species.name === "Zoroark" && pokemon.length > 4)
        continue;
      const limitFactor = Math.round(this.maxTeamSize / 6) || 1;
      const tier = species.tier;
      if (this.gen === 5 && !isMonotype && !this.forceMonotype && tierCount[tier] >= 2 * limitFactor)
        continue;
      const set = this.randomSet(species, teamDetails, pokemon.length === 0);
      const types = species.types;
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
      let typeCombo = types.slice().sort().join();
      if (set.ability === "Drought" || set.ability === "Drizzle" || set.ability === "Sand Stream") {
        typeCombo = set.ability;
        if (typeCombo in typeComboCount)
          continue;
      } else if (!this.forceMonotype) {
        if (typeComboCount[typeCombo] >= (isMonotype ? 2 : 1) * limitFactor)
          continue;
      }
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
      if (set.ability === "Snow Warning" || set.moves.includes("hail"))
        teamDetails.hail = 1;
      if (set.ability === "Drizzle" || set.moves.includes("raindance"))
        teamDetails.rain = 1;
      if (set.ability === "Sand Stream")
        teamDetails.sand = 1;
      if (set.moves.includes("stealthrock"))
        teamDetails.stealthRock = 1;
      if (set.moves.includes("toxicspikes"))
        teamDetails.toxicSpikes = 1;
      if (set.moves.includes("rapidspin"))
        teamDetails.rapidSpin = 1;
      if (set.ability === "Illusion")
        teamDetails.illusion = pokemon.length;
    }
    if (pokemon.length < this.maxTeamSize && pokemon.length < 12) {
      throw new Error(`Could not build a random team for ${this.format} (seed=${seed})`);
    }
    return pokemon;
  }
}
var random_teams_default = RandomGen5Teams;
//# sourceMappingURL=random-teams.js.map
