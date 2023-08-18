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
var tcgtabletop_exports = {};
__export(tcgtabletop_exports, {
  commands: () => commands
});
module.exports = __toCommonJS(tcgtabletop_exports);
var import_lib = require("../../lib");
const SEARCH_PATH = "/api/v1/Search/List/";
const DETAILS_PATH = "/api/v1/Articles/Details/";
async function getFandom(site, pathName, search) {
  const body = await (0, import_lib.Net)(`https://${site}.fandom.com/${pathName}`).get({ query: search });
  const json = JSON.parse(body);
  if (!json)
    throw new Error(`Malformed data`);
  if (json.exception)
    throw new Error(import_lib.Utils.getString(json.exception.message) || `Not found`);
  return json;
}
async function searchFandom(site, query) {
  const result = await getFandom(site, SEARCH_PATH, { query, limit: 1 });
  if (!Array.isArray(result.items) || !result.items.length)
    throw new Error(`Malformed data`);
  if (!result.items[0] || typeof result.items[0] !== "object")
    throw new Error(`Malformed data`);
  return result.items[0];
}
async function getCardDetails(site, id) {
  const specifications = {
    ids: id,
    abstract: 0,
    width: 80,
    height: 115
  };
  const result = await getFandom(site, DETAILS_PATH, specifications);
  if (typeof result.items !== "object" || !result.items[id] || typeof result.items[id] !== "object") {
    throw new Error(`Malformed data`);
  }
  return result.items[id];
}
const commands = {
  ygo: "yugioh",
  yugioh(target, room, user) {
    this.checkBroadcast();
    room = this.requireRoom("tcgtabletop");
    const subdomain = "yugioh";
    const query = target.trim();
    if (!query)
      return this.parse("/help yugioh");
    return searchFandom(subdomain, query).then((data) => {
      if (!this.runBroadcast())
        return;
      const entryUrl = import_lib.Utils.getString(data.url);
      const entryTitle = import_lib.Utils.getString(data.title);
      const id = import_lib.Utils.getString(data.id);
      let htmlReply = import_lib.Utils.html`<strong>Best result for ${query}:</strong><br /><a href="${entryUrl}">${entryTitle}</a>`;
      if (id) {
        getCardDetails(subdomain, id).then((card) => {
          if (!room)
            return;
          const thumb = import_lib.Utils.getString(card.thumbnail);
          if (thumb) {
            htmlReply = `<table><tr><td style="padding-right:5px;"><img src="${import_lib.Utils.escapeHTML(thumb)}" width=80 height=115></td><td>${htmlReply}</td></tr></table>`;
          }
          if (!this.broadcasting)
            return this.sendReply(`|raw|<div class="infobox">${htmlReply}</div>`);
          room.addRaw(`<div class="infobox">${htmlReply}</div>`).update();
        }, () => {
          if (!room)
            return;
          if (!this.broadcasting)
            return this.sendReply(`|raw|<div class="infobox">${htmlReply}</div>`);
          room.addRaw(`<div class="infobox">${htmlReply}</div>`).update();
        });
      } else {
        if (!room)
          return;
        if (!this.broadcasting)
          return this.sendReply(`|raw|<div class="infobox">${htmlReply}</div>`);
        room.addRaw(`<div class="infobox">${htmlReply}</div>`).update();
      }
    }, (err) => {
      if (!this.runBroadcast())
        return;
      if (!room)
        return;
      if (err instanceof SyntaxError || err.message === "Malformed data") {
        if (!this.broadcasting)
          return this.sendReply(`Error: Something went wrong in the request: ${err.message}`);
        return room.add(`Error: Something went wrong in the request: ${err.message}`).update();
      } else if (err.message === "Not found") {
        if (!this.broadcasting)
          return this.sendReply('|raw|<div class="infobox">No results found.</div>');
        return room.addRaw('<div class="infobox">No results found.</div>').update();
      } else if (err.code === "ENOTFOUND") {
        if (!this.broadcasting)
          return this.sendReply("Error connecting to the yugioh wiki.");
        return room.add("Error connecting to the yugioh wiki.").update();
      }
      if (!this.broadcasting)
        return this.sendReply(`Error: ${err.message}`);
      return room.add(`Error: ${err.message}`).update();
    });
  },
  yugiohhelp: [`/yugioh [query] - Search the Yugioh wiki.`]
};
//# sourceMappingURL=tcgtabletop.js.map
