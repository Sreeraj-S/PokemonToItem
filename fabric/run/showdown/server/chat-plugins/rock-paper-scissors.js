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
var rock_paper_scissors_exports = {};
__export(rock_paper_scissors_exports, {
  RPSGame: () => RPSGame,
  RPSPlayer: () => RPSPlayer,
  commands: () => commands
});
module.exports = __toCommonJS(rock_paper_scissors_exports);
const MAX_ROUNDS = 200;
const TIMEOUT = 10 * 1e3;
const ICONS = {
  Rock: /* @__PURE__ */ Chat.h("i", { class: "fa fa-hand-rock-o" }),
  Paper: /* @__PURE__ */ Chat.h("i", { class: "fa fa-hand-paper-o" }),
  Scissors: /* @__PURE__ */ Chat.h("i", { class: "fa fa-hand-scissors-o" })
};
const MATCHUPS = /* @__PURE__ */ new Map([
  ["Scissors", "Paper"],
  ["Rock", "Scissors"],
  ["Paper", "Rock"]
]);
function toChoice(str) {
  const id = toID(str);
  return id.charAt(0).toUpperCase() + id.slice(1);
}
class RPSPlayer extends Rooms.RoomGamePlayer {
  constructor() {
    super(...arguments);
    this.choice = "";
    this.prevChoice = "";
    this.prevWinner = false;
    this.score = 0;
  }
  sendControls(jsx) {
    this.sendRoom(Chat.html`|controlshtml|${jsx}`);
  }
}
class RPSGame extends Rooms.RoomGame {
  constructor(room) {
    super(room);
    this.checkChat = true;
    this.roundTimer = null;
    this.currentRound = 0;
    this.title = "Rock Paper Scissors";
    this.gameid = "rockpaperscissors";
    this.room.update();
    this.controls(/* @__PURE__ */ Chat.h("div", { style: { textAlign: "center" } }, "Waiting for another player to join...."));
    this.sendField();
  }
  controls(node) {
    this.room.send(Chat.html`|controlshtml|${node}`);
  }
  onConnect(user, connection) {
    this.room.sendUser(connection, Chat.html`|fieldhtml|${this.getField()}`);
  }
  static getWinner(p1, p2) {
    const p1Choice = p1.choice;
    const p2Choice = p2.choice;
    if (!p1Choice && p2Choice)
      return p2;
    if (!p2Choice && p1Choice)
      return p1;
    if (MATCHUPS.get(p1Choice) === p2Choice)
      return p1;
    if (MATCHUPS.get(p2Choice) === p1Choice)
      return p2;
    return null;
  }
  sendControls(player) {
    if (!this.roundTimer) {
      return player.sendControls(/* @__PURE__ */ Chat.h("div", { style: { textAlign: "center" } }, "The game is paused.", /* @__PURE__ */ Chat.h("br", null), /* @__PURE__ */ Chat.h("br", null), /* @__PURE__ */ Chat.h("button", { class: "button", name: "send", value: "/rps resume" }, "Resume game")));
    }
    if (player.choice) {
      player.sendControls(
        /* @__PURE__ */ Chat.h("div", { style: { textAlign: "center" } }, "You have selected ", /* @__PURE__ */ Chat.h("strong", null, player.choice), ". Now to wait for your foe.")
      );
      return;
    }
    player.sendControls(/* @__PURE__ */ Chat.h("div", { style: { textAlign: "center" } }, /* @__PURE__ */ Chat.h("strong", null, "Make your choice, quick! You have ", Chat.toDurationString(TIMEOUT), "!"), /* @__PURE__ */ Chat.h("br", null), ["Rock", "Paper", "Scissors"].map((choice) => /* @__PURE__ */ Chat.h("button", { class: "button", name: "send", value: `/choose ${choice}`, style: { width: "6em" } }, /* @__PURE__ */ Chat.h("span", { style: { fontSize: "24px" } }, ICONS[choice]), /* @__PURE__ */ Chat.h("br", null), choice || "\xA0")), /* @__PURE__ */ Chat.h("br", null), /* @__PURE__ */ Chat.h("br", null), /* @__PURE__ */ Chat.h("button", { class: "button", name: "send", value: "/rps end" }, "End game"), /* @__PURE__ */ Chat.h("br", null), /* @__PURE__ */ Chat.h("button", { class: "button", name: "send", value: "/rps pause" }, "Pause game")));
  }
  getField() {
    if (this.players.length < 2) {
      return /* @__PURE__ */ Chat.h("div", { style: { textAlign: "center" } }, /* @__PURE__ */ Chat.h("h2", null, "Waiting to start the game..."));
    }
    const [p1, p2] = this.players;
    function renderBigChoice(choice, isWinner) {
      return /* @__PURE__ */ Chat.h("div", { style: {
        width: "180px",
        fontSize: "120px",
        background: isWinner ? "#595" : "#888",
        color: "white",
        borderRadius: "20px",
        paddingBottom: "5px",
        margin: "0 auto"
      } }, ICONS[choice] || "\xA0", /* @__PURE__ */ Chat.h("br", null), /* @__PURE__ */ Chat.h("small", { style: { fontSize: "40px" } }, /* @__PURE__ */ Chat.h("small", { style: { fontSize: "32px", display: "block" } }, choice || "\xA0")));
    }
    function renderCurrentChoice(exists) {
      return /* @__PURE__ */ Chat.h("div", { style: {
        width: "100px",
        fontSize: "60px",
        background: "#888",
        color: "white",
        borderRadius: "15px",
        paddingBottom: "5px",
        margin: "20px auto 0"
      } }, exists ? /* @__PURE__ */ Chat.h("i", { class: "fa fa-check" }) : "\xA0");
    }
    return /* @__PURE__ */ Chat.h("table", { style: { width: "100%", textAlign: "center", fontSize: "18px" } }, /* @__PURE__ */ Chat.h("tr", null, /* @__PURE__ */ Chat.h("td", null, /* @__PURE__ */ Chat.h("div", { style: { padding: "8px 0" } }, /* @__PURE__ */ Chat.h("strong", null, p1.name), " (", p1.score, ")"), renderBigChoice(p1.prevChoice, p1.prevWinner), renderCurrentChoice(!!p1.choice)), /* @__PURE__ */ Chat.h("td", null, /* @__PURE__ */ Chat.h("em", { style: { fontSize: "24px" } }, "vs")), /* @__PURE__ */ Chat.h("td", null, /* @__PURE__ */ Chat.h("div", { style: { padding: "8px 0" } }, /* @__PURE__ */ Chat.h("strong", null, p2.name), " (", p2.score, ")"), renderBigChoice(p2.prevChoice, p2.prevWinner), renderCurrentChoice(!!p2.choice))));
  }
  sendField() {
    this.room.send(Chat.html`|fieldhtml|${this.getField()}`);
  }
  end() {
    const [p1, p2] = this.players;
    if (p1.score === p2.score) {
      this.message(`**Tie** at score ${p1.score}!`);
    } else {
      const [winner, loser] = p1.score > p2.score ? [p1, p2] : [p2, p1];
      this.message(`**${winner.name}** wins with score ${winner.score} to ${loser.score}!`);
    }
    if (this.roundTimer) {
      clearTimeout(this.roundTimer);
      this.roundTimer = null;
    }
    this.room.pokeExpireTimer();
    this.ended = true;
    this.room.add(`|-message|The game has ended.`);
    for (const player of this.players) {
      player.sendControls(/* @__PURE__ */ Chat.h("div", { class: "pad" }, "The game has ended."));
      player.unlinkUser();
    }
  }
  runMatch() {
    const [p1, p2] = this.players;
    const winner = RPSGame.getWinner(p1, p2);
    if (!winner) {
      if (!p1.choice) {
        this.message(`${p1.name} and ${p2.name} both **timed out**.`);
      } else {
        this.message(`${p1.name} and ${p2.name} **tie** with ${p1.choice}.`);
      }
    } else {
      const loser = p1 === winner ? p2 : p1;
      if (!loser.choice) {
        this.message(`**${winner.name}**'s ${winner.choice} wins; ${loser.name} timed out.`);
      } else {
        this.message(`**${winner.name}**'s ${winner.choice} beats ${loser.name}'s ${loser.choice}.`);
      }
      winner.score++;
    }
    if (!winner && !p1.choice) {
      this.pause();
      return;
    }
    if (this.currentRound >= MAX_ROUNDS) {
      this.message(`The game is ending automatically at ${this.currentRound} rounds.`);
      return this.end();
    }
    for (const player of this.players) {
      player.prevChoice = player.choice;
      player.prevWinner = false;
      player.choice = "";
    }
    if (winner)
      winner.prevWinner = true;
    this.sendField();
    this.nextRound();
  }
  smallMessage(message) {
    this.room.add(`|-message|${message}`).update();
  }
  message(message) {
    this.room.add(`|message|${message}`).update();
  }
  start() {
    if (this.players.length < 2) {
      throw new Chat.ErrorMessage(`There are not enough players to start. Use /rps start to start when all players are ready.`);
    }
    if (this.room.log.log.length > 1e3) {
      this.room.log.log = [];
    }
    const [p1, p2] = this.players;
    this.room.add(
      `|raw|<h2><span style="font-weight: normal">Rock Paper Scissors:</span> ${p1.name} vs ${p2.name}!</h2>
|message|Game started!
|notify|Game started!`
    ).update();
    this.nextRound();
  }
  getPlayer(user) {
    const player = this.playerTable[user.id];
    if (!player)
      throw new Chat.ErrorMessage(`You are not a player in this game.`);
    return player;
  }
  pause(user) {
    if (!this.roundTimer)
      throw new Chat.ErrorMessage(`The game is not running, and cannot be paused.`);
    const player = user ? this.getPlayer(user) : null;
    clearTimeout(this.roundTimer);
    this.roundTimer = null;
    for (const curPlayer of this.players)
      this.sendControls(curPlayer);
    if (player)
      this.message(`The game was paused by ${player.name}.`);
  }
  unpause(user) {
    if (this.roundTimer)
      throw new Chat.ErrorMessage(`The game is not paused.`);
    const player = this.getPlayer(user);
    this.message(`The game was resumed by ${player.name}.`);
    this.nextRound();
  }
  nextRound() {
    this.currentRound++;
    this.sendField();
    this.room.add(`|html|<h2>Round ${this.currentRound}</h2>`).update();
    this.roundTimer = setTimeout(() => {
      this.runMatch();
    }, TIMEOUT);
    for (const player of this.players)
      this.sendControls(player);
  }
  choose(user, option) {
    option = toChoice(option);
    const player = this.getPlayer(user);
    if (!MATCHUPS.get(option)) {
      throw new Chat.ErrorMessage(`Invalid choice: ${option}.`);
    }
    if (player.choice)
      throw new Chat.ErrorMessage("You have already made your choice!");
    player.choice = option;
    this.smallMessage(`${user.name} made a choice.`);
    this.sendControls(player);
    if (this.players.filter((item) => item.choice).length > 1) {
      clearTimeout(this.roundTimer);
      this.roundTimer = null;
      return this.runMatch();
    }
    this.sendField();
    return true;
  }
  leaveGame(user) {
    const player = this.getPlayer(user);
    player.sendRoom(`You left the game.`);
    delete this.playerTable[user.id];
    this.end();
  }
  addPlayer(user) {
    if (this.playerTable[user.id])
      throw new Chat.ErrorMessage(`You are already a player in this game.`);
    this.playerTable[user.id] = this.makePlayer(user);
    this.players.push(this.playerTable[user.id]);
    this.room.auth.set(user.id, Users.PLAYER_SYMBOL);
    return this.playerTable[user.id];
  }
  makePlayer(user) {
    return new RPSPlayer(user, this);
  }
}
function findExisting(user1, user2) {
  return Rooms.get(`game-rps-${user1}-${user2}`) || Rooms.get(`game-rps-${user2}-${user1}`);
}
const commands = {
  rps: "rockpaperscissors",
  rockpaperscissors: {
    challenge: "create",
    chall: "create",
    chal: "create",
    create(target, room, user) {
      target = target.trim();
      if (!target && this.pmTarget) {
        target = this.pmTarget.id;
      }
      const { targetUser, targetUsername } = this.splitUser(target);
      if (!targetUser) {
        return this.errorReply(`User ${targetUsername} not found. Either specify a username or use this command in PMs.`);
      }
      if (targetUser === user)
        return this.errorReply(`You cannot challenge yourself.`);
      if (targetUser.settings.blockChallenges && !user.can("bypassblocks", targetUser)) {
        Chat.maybeNotifyBlocked("challenge", targetUser, user);
        return this.errorReply(this.tr`The user '${targetUser.name}' is not accepting challenges right now.`);
      }
      const existingRoom = findExisting(user.id, targetUser.id);
      if (existingRoom?.game && !existingRoom.game.ended) {
        return this.errorReply(`You're already playing a Rock Paper Scissors game against ${targetUser.name}!`);
      }
      Ladders.challenges.add(
        new Ladders.GameChallenge(user.id, targetUser.id, "Rock Paper Scissors", {
          acceptCommand: `/rps accept ${user.id}`
        })
      );
      if (!this.pmTarget)
        this.pmTarget = targetUser;
      this.sendChatMessage(
        `/raw ${user.name} wants to play Rock Paper Scissors!`
      );
    },
    accept(target, room, user) {
      const fromUser = Ladders.challenges.accept(this);
      const existingRoom = findExisting(user.id, fromUser.id);
      const roomid = `game-rps-${fromUser.id}-${user.id}`;
      const gameRoom = existingRoom || Rooms.createGameRoom(
        roomid,
        `[RPS] ${user.name} vs ${fromUser.name}`,
        {}
      );
      const game = new RPSGame(gameRoom);
      gameRoom.game = game;
      game.addPlayer(fromUser);
      game.addPlayer(user);
      user.joinRoom(gameRoom.roomid);
      fromUser.joinRoom(gameRoom.roomid);
      gameRoom.game.start();
      this.pmTarget = fromUser;
      this.sendChatMessage(`/text ${user.name} accepted <<${gameRoom.roomid}>>`);
    },
    deny: "reject",
    reject(target, room, user) {
      return this.parse(`/reject ${target}`);
    },
    end(target, room, user) {
      const game = this.requireGame(RPSGame);
      if (!game.playerTable[user.id]) {
        return this.errorReply(`You are not a player, and so cannot end the game.`);
      }
      game.end();
    },
    choose(target, room, user) {
      this.parse(`/choose ${target}`);
    },
    leave(target, room, user) {
      this.parse(`/leavegame`);
    },
    pause(target, room, user) {
      const game = this.requireGame(RPSGame);
      game.pause(user);
    },
    unpause: "resume",
    resume(target, room, user) {
      const game = this.requireGame(RPSGame);
      game.unpause(user);
    },
    "": "help",
    help() {
      this.runBroadcast();
      const strings = [
        `/rockpaperscissors OR /rps<br />`,
        `/rps challenge [user] - Challenges a user to a game of Rock Paper Scissors`,
        `(in PM) /rps challenge - Challenges a user to a game of Rock Paper Scissors`,
        `/rps leave - Leave the game.`,
        `/rps start - Start the Rock Paper Scissors game.`,
        `/rps end - End the Rock Paper Scissors game`,
        `/rps pause - Pauses the game, if it's in progress.`,
        `/rps resume - Resumes the game, if it's paused.`
      ];
      return this.sendReplyBox(strings.join("<br />"));
    }
  }
};
//# sourceMappingURL=rock-paper-scissors.js.map
