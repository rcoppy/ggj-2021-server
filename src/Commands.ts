// OnJoinCommand.ts
import { Command } from "@colyseus/command";

import { MyRoomState, Player } from "./rooms/schema/MyRoomState";

export class OnJoinCommand extends Command<MyRoomState, { sessionId: string }> {

  execute({ sessionId }) {
    this.state.players.set(sessionId, new Player());
  }

}

export class OnLeaveCommand extends Command<MyRoomState, { sessionId: string }> {

    execute({ sessionId }) {
      this.state.players.delete(sessionId);
    }
  
  }