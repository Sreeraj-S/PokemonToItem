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
var conditions_exports = {};
__export(conditions_exports, {
  Conditions: () => Conditions
});
module.exports = __toCommonJS(conditions_exports);
const Conditions = {
  silvally: {
    name: "Silvally",
    onTypePriority: 1,
    onType(types, pokemon) {
      if (pokemon.transformed || !(pokemon.ability === "rkssystem" || pokemon.ability === "powerofalchemysilvally") && this.gen >= 8) {
        return types;
      }
      let type = "Normal";
      if (pokemon.ability === "rkssystem" || pokemon.ability === "powerofalchemysilvally") {
        type = pokemon.getItem().onMemory;
        if (!type) {
          type = "Normal";
        }
      }
      return [type];
    }
  },
  raindance: {
    name: "RainDance",
    effectType: "Weather",
    duration: 5,
    durationCallback(source, effect) {
      if (source?.hasItem("damprock")) {
        return 8;
      }
      return 5;
    },
    onWeatherModifyDamage(damage, attacker, defender, move) {
      if (defender.hasItem("utilityumbrella") || attacker.hasItem("utilityumbrella") || defender.hasAbility("utilityumbrella") || attacker.hasAbility("utilityumbrella"))
        return;
      if (move.type === "Water") {
        this.debug("rain water boost");
        return this.chainModify(1.5);
      }
      if (move.type === "Fire") {
        this.debug("rain fire suppress");
        return this.chainModify(0.5);
      }
    },
    onStart(battle, source, effect) {
      if (effect?.effectType === "Ability") {
        if (this.gen <= 5)
          this.effectState.duration = 0;
        this.add("-weather", "RainDance", "[from] ability: " + effect, "[of] " + source);
      } else {
        this.add("-weather", "RainDance");
      }
    },
    onResidualOrder: 1,
    onResidual() {
      this.add("-weather", "RainDance", "[upkeep]");
      this.eachEvent("Weather");
    },
    onEnd() {
      this.add("-weather", "none");
    }
  },
  primordialsea: {
    name: "PrimordialSea",
    effectType: "Weather",
    duration: 0,
    onTryMovePriority: 1,
    onTryMove(attacker, defender, move) {
      if (move.type === "Fire" && move.category !== "Status" && !attacker.hasItem("utilityumbrella") && !attacker.hasAbility("utilityumbrella")) {
        this.debug("Primordial Sea fire suppress");
        this.add("-fail", attacker, move, "[from] Primordial Sea");
        this.attrLastMove("[still]");
        return null;
      }
    },
    onWeatherModifyDamage(damage, attacker, defender, move) {
      if (defender.hasItem("utilityumbrella") || attacker.hasItem("utilityumbrella") || defender.hasAbility("utilityumbrella") || attacker.hasAbility("utilityumbrella"))
        return;
      if (move.type === "Water") {
        this.debug("Rain water boost");
        return this.chainModify(1.5);
      }
    },
    onStart(battle, source, effect) {
      this.add("-weather", "PrimordialSea", "[from] ability: " + effect, "[of] " + source);
    },
    onResidualOrder: 1,
    onResidual() {
      this.add("-weather", "PrimordialSea", "[upkeep]");
      this.eachEvent("Weather");
    },
    onEnd() {
      this.add("-weather", "none");
    }
  },
  sunnyday: {
    name: "SunnyDay",
    effectType: "Weather",
    duration: 5,
    durationCallback(source, effect) {
      if (source?.hasItem("heatrock")) {
        return 8;
      }
      return 5;
    },
    onWeatherModifyDamage(damage, attacker, defender, move) {
      if (defender.hasItem("utilityumbrella") || attacker.hasItem("utilityumbrella") || defender.hasAbility("utilityumbrella") || attacker.hasAbility("utilityumbrella"))
        return;
      if (move.type === "Fire") {
        this.debug("Sunny Day fire boost");
        return this.chainModify(1.5);
      }
      if (move.type === "Water" && !attacker.hasAbility("vaporcontrol")) {
        this.debug("Sunny Day water suppress");
        return this.chainModify(0.5);
      }
    },
    onStart(battle, source, effect) {
      if (effect?.effectType === "Ability") {
        if (this.gen <= 5)
          this.effectState.duration = 0;
        this.add("-weather", "SunnyDay", "[from] ability: " + effect, "[of] " + source);
      } else {
        this.add("-weather", "SunnyDay");
      }
    },
    onImmunity(type, pokemon) {
      if (pokemon.hasItem("utilityumbrella"))
        return;
      if (type === "frz")
        return false;
    },
    onResidualOrder: 1,
    onResidual() {
      this.add("-weather", "SunnyDay", "[upkeep]");
      this.eachEvent("Weather");
    },
    onEnd() {
      this.add("-weather", "none");
    }
  },
  desolateland: {
    name: "DesolateLand",
    effectType: "Weather",
    duration: 0,
    onTryMovePriority: 1,
    onTryMove(attacker, defender, move) {
      if (move.type === "Water" && move.category !== "Status" && !attacker.hasItem("utilityumbrella") && !attacker.hasAbility("utilityumbrella")) {
        this.debug("Desolate Land water suppress");
        this.add("-fail", attacker, move, "[from] Desolate Land");
        this.attrLastMove("[still]");
        return null;
      }
    },
    onWeatherModifyDamage(damage, attacker, defender, move) {
      if (defender.hasItem("utilityumbrella") || attacker.hasItem("utilityumbrella") || defender.hasAbility("utilityumbrella") || attacker.hasAbility("utilityumbrella"))
        return;
      if (move.type === "Fire") {
        this.debug("Sunny Day fire boost");
        return this.chainModify(1.5);
      }
    },
    onStart(battle, source, effect) {
      this.add("-weather", "DesolateLand", "[from] ability: " + effect, "[of] " + source);
    },
    onImmunity(type, pokemon) {
      if (pokemon.hasItem("utilityumbrella") || pokemon.hasAbility("utilityumbrella"))
        return;
      if (type === "frz")
        return false;
    },
    onResidualOrder: 1,
    onResidual() {
      this.add("-weather", "DesolateLand", "[upkeep]");
      this.eachEvent("Weather");
    },
    onEnd() {
      this.add("-weather", "none");
    }
  }
};
//# sourceMappingURL=conditions.js.map
