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
var room_game_exports = {};
__export(room_game_exports, {
  RoomGame: () => RoomGame,
  RoomGamePlayer: () => RoomGamePlayer,
  SimpleRoomGame: () => SimpleRoomGame
});
module.exports = __toCommonJS(room_game_exports);
/**
 * Room games
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * Room games are an abstract representation of an activity that a room
 * can be focused on, such as a battle, tournament, or chat game like
 * Hangman. Rooms are limited to one roomgame at a time.
 *
 * Room games can keep track of designated players. If a user is a player,
 * they will not be allowed to change name until their games are complete.
 *
 * The player system is optional: Some games, like Hangman, don't designate
 * players and just allow any user in the room to play.
 *
 * @license MIT
 */
class RoomGamePlayer {
  constructor(user, game, num = 0) {
    this.num = num;
    if (!user)
      user = num ? `Player ${num}` : `Player`;
    this.game = game;
    this.name = typeof user === "string" ? user : user.name;
    if (typeof user === "string")
      user = null;
    this.id = user ? user.id : "";
    if (user && !this.game.isSubGame) {
      user.games.add(this.game.roomid);
      user.updateSearch();
    }
  }
  unlinkUser() {
    if (!this.id)
      return;
    const user = Users.getExact(this.id);
    if (user && !this.game.isSubGame) {
      user.games.delete(this.game.roomid);
      user.updateSearch();
    }
    this.id = "";
  }
  destroy() {
    this.unlinkUser();
  }
  toString() {
    return this.id;
  }
  send(data) {
    const user = Users.getExact(this.id);
    if (user)
      user.send(data);
  }
  sendRoom(data) {
    const user = Users.getExact(this.id);
    if (user)
      user.sendTo(this.game.roomid, data);
  }
}
class RoomGame {
  constructor(room, isSubGame = false) {
    /** Does `/guess` or `/choose` require the user to be able to talk? */
    this.checkChat = false;
    this.roomid = room.roomid;
    this.room = room;
    this.gameid = "game";
    this.title = "Game";
    this.allowRenames = false;
    this.isSubGame = isSubGame;
    this.playerTable = /* @__PURE__ */ Object.create(null);
    this.players = [];
    this.playerCount = 0;
    this.playerCap = 0;
    this.ended = false;
    if (this.isSubGame) {
      this.room.subGame = this;
    } else {
      this.room.game = this;
    }
  }
  destroy() {
    if (this.isSubGame) {
      this.room.subGame = null;
    } else {
      this.room.game = null;
    }
    this.room = null;
    for (const player of this.players) {
      player.destroy();
    }
    this.players = null;
    this.playerTable = null;
  }
  addPlayer(user = null, ...rest) {
    if (typeof user !== "string" && user) {
      if (user.id in this.playerTable)
        return null;
    }
    if (this.playerCap > 0 && this.playerCount >= this.playerCap)
      return null;
    const player = this.makePlayer(user, ...rest);
    if (!player)
      return null;
    if (typeof user === "string")
      user = null;
    this.players.push(player);
    if (user) {
      this.playerTable[user.id] = player;
      this.playerCount++;
    }
    return player;
  }
  updatePlayer(player, user) {
    if (!this.allowRenames)
      return;
    if (player.id) {
      delete this.playerTable[player.id];
    }
    if (user) {
      player.id = user.id;
      player.name = user.name;
      this.playerTable[player.id] = player;
      this.room.auth.set(user.id, Users.PLAYER_SYMBOL);
    } else {
      player.unlinkUser();
    }
  }
  removePlayer(player) {
    if (player instanceof Users.User) {
      player = this.playerTable[player.id];
      if (!player)
        throw new Error("Player not found");
    }
    if (!this.allowRenames)
      return false;
    const playerIndex = this.players.indexOf(player);
    if (playerIndex < 0)
      return false;
    if (player.id)
      delete this.playerTable[player.id];
    this.players.splice(playerIndex, 1);
    player.destroy();
    this.playerCount--;
    return true;
  }
  renamePlayer(user, oldUserid) {
    if (user.id === oldUserid) {
      this.playerTable[user.id].name = user.name;
    } else {
      this.playerTable[user.id] = this.playerTable[oldUserid];
      this.playerTable[user.id].id = user.id;
      this.playerTable[user.id].name = user.name;
      delete this.playerTable[oldUserid];
    }
  }
  renameRoom(roomid) {
    for (const player of this.players) {
      const user = Users.get(player.id);
      user?.games.delete(this.roomid);
      user?.games.add(roomid);
    }
    this.roomid = roomid;
  }
  // Events:
  // Note:
  // A user can have multiple connections. For instance, if you have
  // two tabs open and connected to PS, those tabs represent two
  // connections, but a single PS user. Each tab can be in separate
  // rooms.
  /**
   * Called when a user joins a room. (i.e. when the user's first
   * connection joins)
   *
   * While connection is passed, it should not usually be used:
   * Any handling of connections should happen in onConnect.
   */
  onJoin(user, connection) {
  }
  /**
   * Called when a user is banned from the room this game is taking
   * place in.
   */
  removeBannedUser(user) {
    if (this.forfeit)
      this.forfeit(user);
  }
  /**
   * Called when a user in the game is renamed. `isJoining` is true
   * if the user was previously a guest, but now has a username.
   * Check `!user.named` for the case where a user previously had a
   * username but is now a guest. By default, updates a player's
   * name as long as allowRenames is set to true.
   */
  onRename(user, oldUserid, isJoining, isForceRenamed) {
    if (!this.allowRenames || !user.named && !isForceRenamed) {
      if (!(user.id in this.playerTable) && !this.isSubGame) {
        user.games.delete(this.roomid);
        user.updateSearch();
      }
      return;
    }
    if (!(oldUserid in this.playerTable))
      return;
    if (!user.named) {
      return this.onLeave(user, oldUserid);
    }
    this.renamePlayer(user, oldUserid);
  }
  /**
   * Called when a user leaves the room. (i.e. when the user's last
   * connection leaves)
   */
  onLeave(user, oldUserid) {
  }
  /**
   * Called each time a connection joins a room (after onJoin if
   * applicable). By default, this is also called when connection
   * is updated in some way (such as by changing user or renaming).
   * If you don't want this behavior, override onUpdateConnection
   * and/or onRename.
   */
  onConnect(user, connection) {
  }
  /**
   * Called for each connection in a room that changes users by
   * merging into a different user. By default, runs the onConnect
   * handler.
   *
   * Player updates and an up-to-date report of what's going on in
   * the game should be sent during `onConnect`. You should rarely
   * need to handle the other events.
   */
  onUpdateConnection(user, connection) {
    this.onConnect(user, connection);
  }
  /**
   * Called for every message a user sends while this game is active.
   * Return an error message to prevent the message from being sent,
   * an empty string to prevent it with no error message, or
   * `undefined` to let it through.
   */
  onChatMessage(message, user) {
  }
  /**
   * Called for every message a user sends while this game is active.
   * Unlike onChatMessage, this function runs after the message has been added to the room's log.
   * Do not try to use this to block messages, use onChatMessage for that.
   */
  onLogMessage(message, user) {
  }
}
class SimpleRoomGame extends RoomGame {
  makePlayer(user, ...rest) {
    const num = this.players.length ? this.players[this.players.length - 1].num : 1;
    return new RoomGamePlayer(user, this, num);
  }
}
//# sourceMappingURL=room-game.js.map
