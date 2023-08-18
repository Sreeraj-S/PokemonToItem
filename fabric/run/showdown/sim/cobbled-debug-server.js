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
var cobbled_debug_server_exports = {};
__export(cobbled_debug_server_exports, {
  startServer: () => startServer
});
module.exports = __toCommonJS(cobbled_debug_server_exports);
var import_battle_stream = require("./battle-stream");
var import_dex = require("./dex");
var Net = __toESM(require("net"));
var CobblemonCache = __toESM(require("./cobblemon-cache"));
function startServer(port) {
  const server = Net.createServer();
  const battleMap = /* @__PURE__ */ new Map();
  server.listen(port, () => {
    console.log("Server listening for connection requests on socket localhost: " + port);
  });
  server.on("connection", (socket) => onConnection(socket, battleMap));
}
function onData(socket, chunk, battleMap) {
  const data = chunk.toString();
  const lines = data.split("\n");
  lines.forEach((line) => {
    console.log("Data received from client: " + line.toString());
    if (line.startsWith(">startbattle")) {
      const battleId = line.split(" ")[1];
      battleMap.set(battleId, new import_battle_stream.BattleStream());
    } else if (line === ">getCobbledMoves") {
      getCobbledMoves(socket);
    } else if (line === ">getCobbledAbilityIds") {
      getCobbledAbilityIds(socket);
    } else if (line === ">getCobbledItemIds") {
      getCobbledItemIds(socket);
    } else if (line === ">resetSpeciesData") {
      CobblemonCache.resetSpecies();
    } else if (line.startsWith(">receiveSpeciesData")) {
      const speciesJson = line.replace(`>receiveSpeciesData `, "");
      const species = JSON.parse(speciesJson);
      CobblemonCache.registerSpecies(species);
      console.log("Received", species.id);
      socket.write("ACK");
    } else {
      const [battleId, showdownMsg] = line.split("~");
      const battleStream = battleMap.get(battleId);
      if (battleStream) {
        try {
          void battleStream.write(showdownMsg);
        } catch (err) {
          console.error(err.stack);
        }
        writeBattleOutput(socket, battleStream);
      }
    }
  });
}
function writeBattleOutput(socket, battleStream) {
  const messages = battleStream.buf;
  if (messages.length !== 0) {
    socket.write(padNumber(messages.length, 8));
    for (const message of messages) {
      socket.write(padNumber(message.length, 8) + message);
    }
  } else {
    writeVoid(socket);
  }
  battleStream.buf = [];
}
function writeVoid(socket) {
  socket.write("00000000");
}
function onConnection(socket, battleMap) {
  socket.on("data", (chunk) => onData(socket, chunk, battleMap));
  socket.on("end", () => console.log("Closing connection with the client"));
  socket.on("error", (err) => console.error(err.stack));
}
function getCobbledMoves(socket) {
  const payload = JSON.stringify(import_dex.Dex.mod(CobblemonCache.MOD_ID).moves.all());
  socket.write(padNumber(payload.length, 8) + payload);
}
function getCobbledAbilityIds(socket) {
  const payload = JSON.stringify(import_dex.Dex.mod(CobblemonCache.MOD_ID).abilities.all().map((ability) => ability.id));
  socket.write(padNumber(payload.length, 8) + payload);
}
function getCobbledItemIds(socket) {
  const payload = JSON.stringify(import_dex.Dex.mod(CobblemonCache.MOD_ID).items.all().map((item) => item.id));
  socket.write(padNumber(payload.length, 8) + payload);
}
function padNumber(num, size) {
  let numStr = num.toString();
  while (numStr.length < size)
    numStr = "0" + numStr;
  return numStr;
}
//# sourceMappingURL=cobbled-debug-server.js.map
