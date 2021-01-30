// OnJoinCommand.ts
import { Command } from "@colyseus/command";

import { MyRoomState, Player, Hex } from "./rooms/schema/MyRoomState";

export class OnJoinCommand extends Command<MyRoomState, { sessionId: string }> {

  execute({ sessionId }) {
    this.state.players.set(sessionId, new Player({}));
  }

}

export class OnLeaveCommand extends Command<MyRoomState, { sessionId: string }> {

  execute({ sessionId }) {
    this.state.players.delete(sessionId);
    console.log(`Players in room: ${this.state.players.size}`);
  }

}

export class InitGridCommand extends Command<MyRoomState, { board: Array<{}> }> {

  execute({ board }) {
    board.forEach(hex => this.state.grid.set(hex.index, new Hex({ x: hex.x, y: hex.y, index: hex.index})));
  }

}

export class MovePlayerCommand extends Command<MyRoomState, { hexIndex: number, sessionId: string }> {

  execute({ hexIndex, sessionId }) {
    console.log(`hexIndex: ${hexIndex}`);

    const hex = this.state.grid.get(hexIndex);
    const player = this.state.players.get(sessionId);
    player.x = hex.x;
    player.y = hex.y;
  }

}