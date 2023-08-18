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
var thecafe_exports = {};
__export(thecafe_exports, {
  commands: () => commands,
  pages: () => pages
});
module.exports = __toCommonJS(thecafe_exports);
var import_fs = require("../../lib/fs");
var import_utils = require("../../lib/utils");
const DISHES_FILE = "config/chat-plugins/thecafe-foodfight.json";
const FOODFIGHT_COOLDOWN = 5 * 60 * 1e3;
const dishes = JSON.parse((0, import_fs.FS)(DISHES_FILE).readIfExistsSync() || "{}");
function saveDishes() {
  void (0, import_fs.FS)(DISHES_FILE).write(JSON.stringify(dishes));
}
function generateTeam(generator = "") {
  let potentialPokemon = Object.keys(Dex.data.Pokedex).filter((mon) => {
    const species = Dex.species.get(mon);
    return species.baseSpecies === species.name;
  });
  let speciesClause = true;
  switch (generator) {
    case "ou":
      potentialPokemon = potentialPokemon.filter((mon) => {
        const species = Dex.species.get(mon);
        return species.tier === "OU";
      }).concat(potentialPokemon.filter((mon) => {
        const species = Dex.species.get(mon);
        return species.tier === "OU" || species.tier === "UU";
      }));
      break;
    case "ag":
      potentialPokemon = potentialPokemon.filter((mon) => {
        const species = Dex.species.get(mon);
        const unviable = species.tier === "NFE" || species.tier === "PU" || species.tier === "(PU)" || species.tier.startsWith("LC");
        const illegal = species.tier === "Unreleased" || species.tier === "Illegal" || species.tier.startsWith("CAP");
        return !(unviable || illegal);
      });
      speciesClause = false;
      break;
    default:
      potentialPokemon = potentialPokemon.filter((mon) => {
        const species = Dex.species.get(mon);
        const op = species.tier === "AG" || species.tier === "Uber" || species.tier.slice(1, -1) === "Uber";
        const unviable = species.tier === "Illegal" || species.tier.includes("LC");
        return !(op || unviable);
      });
      potentialPokemon.push("miltank", "miltank", "miltank", "miltank");
  }
  const team = [];
  while (team.length < 6) {
    const randIndex = Math.floor(Math.random() * potentialPokemon.length);
    const potentialMon = potentialPokemon[randIndex];
    if (team.includes(potentialMon))
      continue;
    team.push(potentialMon);
    if (speciesClause)
      potentialPokemon.splice(randIndex, 1);
  }
  return team.map((mon) => Dex.species.get(mon).name);
}
function generateDish() {
  const keys = Object.keys(dishes);
  const entry = dishes[keys[Math.floor(Math.random() * keys.length)]].slice();
  const dish = entry.splice(0, 1)[0];
  const ingredients = [];
  while (ingredients.length < 6) {
    ingredients.push(entry.splice(Math.floor(Math.random() * entry.length), 1)[0]);
  }
  return [dish, ingredients];
}
const commands = {
  foodfight(target, room, user) {
    room = this.requireRoom("thecafe");
    if (!Object.keys(dishes).length)
      return this.errorReply("No dishes found. Add some dishes first.");
    if (user.foodfight && user.foodfight.timestamp + FOODFIGHT_COOLDOWN > Date.now()) {
      return this.errorReply("Please wait a few minutes before using this command again.");
    }
    target = toID(target);
    let team = [];
    let importable;
    const [newDish, newIngredients] = generateDish();
    if (!target) {
      const bfTeam = Teams.generate("gen7bssfactory");
      for (const [i, name] of newIngredients.entries())
        bfTeam[i].name = name;
      importable = Teams.export(bfTeam);
      team = bfTeam.map((val) => val.species);
    } else {
      team = generateTeam(target);
    }
    user.foodfight = { generatedTeam: team, dish: newDish, ingredients: newIngredients, timestamp: Date.now() };
    const importStr = importable ? import_utils.Utils.html`<tr><td colspan=7><details><summary style="font-size:13pt;">Importable team:</summary><div style="width:100%;height:400px;overflow:auto;color:black;font-family:monospace;background:white;text-align:left;">${importable}</textarea></details></td></tr>` : "";
    return this.sendReplyBox(`<div class="ladder"><table style="text-align:center;"><tr><th colspan="7" style="font-size:10pt;">Your dish is: <u>${newDish}</u></th></tr><tr><th>Team</th>${team.map((mon) => `<td><psicon pokemon="${mon}"/> ${mon}</td>`).join("")}</tr><tr><th>Ingredients</th>${newIngredients.map((ingredient) => `<td>${ingredient}</td>`).join("")}</tr>${importStr}</table></div>`);
  },
  checkfoodfight(target, room, user) {
    room = this.requireRoom("thecafe");
    const targetUser = this.getUserOrSelf(target);
    if (!targetUser)
      return this.errorReply(`User ${target} not found.`);
    const self = targetUser === user;
    if (!self)
      this.checkCan("mute", targetUser, room);
    const foodfight = targetUser.foodfight;
    if (!foodfight) {
      return this.errorReply(`${self ? `You don't` : `This user doesn't`} have an active Foodfight team.`);
    }
    return this.sendReplyBox(/* @__PURE__ */ Chat.h("div", { class: "ladder" }, /* @__PURE__ */ Chat.h("table", { style: { textAlign: "center" } }, /* @__PURE__ */ Chat.h("tr", null, /* @__PURE__ */ Chat.h("th", { colSpan: 7, style: { fontSize: "10pt" } }, self ? `Your` : `${targetUser.name}'s`, " dish is: ", /* @__PURE__ */ Chat.h("u", null, foodfight.dish))), /* @__PURE__ */ Chat.h("tr", null, /* @__PURE__ */ Chat.h("th", null, "Team"), foodfight.generatedTeam.map((mon) => /* @__PURE__ */ Chat.h("td", null, /* @__PURE__ */ Chat.h("psicon", { pokemon: mon }), " ", mon))), /* @__PURE__ */ Chat.h("tr", null, /* @__PURE__ */ Chat.h("th", null, "Ingredients"), foodfight.ingredients.map((ingredient) => /* @__PURE__ */ Chat.h("td", null, ingredient))))));
  },
  addingredients: "adddish",
  adddish(target, room, user, connection, cmd) {
    room = this.requireRoom("thecafe");
    this.checkCan("mute", null, room);
    let [dish, ...ingredients] = target.split(",");
    dish = dish.trim();
    if (!dish || !ingredients.length)
      return this.parse("/help foodfight");
    const id = toID(dish);
    if (id === "constructor")
      return this.errorReply("Invalid dish name.");
    ingredients = ingredients.map((ingredient) => ingredient.trim());
    if ([...ingredients.entries()].some(([index, ingredient]) => ingredients.indexOf(ingredient) !== index)) {
      return this.errorReply("Please don't enter duplicate ingredients.");
    }
    if (ingredients.some((ingredient) => ingredient.length > 19)) {
      return this.errorReply("Ingredients can only be 19 characters long.");
    }
    if (cmd === "adddish") {
      if (dishes[id])
        return this.errorReply("This dish already exists.");
      if (ingredients.length < 6)
        return this.errorReply("Dishes need at least 6 ingredients.");
      dishes[id] = [dish];
    } else {
      if (!dishes[id])
        return this.errorReply(`Dish not found: ${dish}`);
      if (ingredients.some((ingredient) => dishes[id].includes(ingredient))) {
        return this.errorReply("Please don't enter duplicate ingredients.");
      }
    }
    dishes[id] = dishes[id].concat(ingredients);
    saveDishes();
    this.sendReply(`${cmd.slice(3)} '${dish}: ${ingredients.join(", ")}' added successfully.`);
  },
  removedish(target, room, user) {
    room = this.requireRoom("thecafe");
    this.checkCan("mute", null, room);
    const id = toID(target);
    if (id === "constructor")
      return this.errorReply("Invalid dish.");
    if (!dishes[id])
      return this.errorReply(`Dish '${target}' not found.`);
    delete dishes[id];
    saveDishes();
    this.sendReply(`Dish '${target}' deleted successfully.`);
  },
  viewdishes(target, room, user, connection) {
    room = this.requireRoom("thecafe");
    return this.parse(`/join view-foodfight`);
  },
  foodfighthelp: [
    `/foodfight <generator> - Gives you a randomly generated Foodfight dish, ingredient list and team. Generator can be either 'random', 'ou', 'ag', or left blank. If left blank, uses Battle Factory to generate an importable team.`,
    `/checkfoodfight <username> - Gives you the last team and dish generated for the entered user, or your own if left blank. Anyone can check their own info, checking other people requires: % @ # &`,
    `/adddish <dish>, <ingredient>, <ingredient>, ... - Adds a dish to the database. Requires: % @ # &`,
    `/addingredients <dish>, <ingredient>, <ingredient>, ... - Adds extra ingredients to a dish in the database. Requires: % @ # &`,
    `/removedish <dish> - Removes a dish from the database. Requires: % @ # &`,
    `/viewdishes - Shows the entire database of dishes. Requires: % @ # &`
  ]
};
const pages = {
  foodfight(query, user, connection) {
    if (!user.named)
      return Rooms.RETRY_AFTER_LOGIN;
    this.title = "Foodfight";
    const room = Rooms.get("thecafe");
    if (!room)
      return this.errorReply(`Room not found.`);
    this.checkCan("mute", null, room);
    const content = Object.values(dishes).map(
      ([dish, ...ingredients]) => /* @__PURE__ */ Chat.h("tr", null, /* @__PURE__ */ Chat.h("td", null, dish), /* @__PURE__ */ Chat.h("td", null, ingredients.join(", ")))
    ).join("");
    return /* @__PURE__ */ Chat.h("div", { class: "pad ladder" }, /* @__PURE__ */ Chat.h("h2", null, "Foodfight Dish list"), content ? /* @__PURE__ */ Chat.h("table", null, /* @__PURE__ */ Chat.h("tr", null, /* @__PURE__ */ Chat.h("th", null, /* @__PURE__ */ Chat.h("h3", null, "Dishes")), /* @__PURE__ */ Chat.h("th", null, /* @__PURE__ */ Chat.h("h3", null, "Ingredients"))), content) : /* @__PURE__ */ Chat.h("p", null, "There are no dishes in the database."));
  }
};
//# sourceMappingURL=thecafe.js.map
