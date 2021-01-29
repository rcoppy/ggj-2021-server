import { Room, Client } from "colyseus";
import { MyRoomState } from "./schema/MyRoomState";
import { Dispatcher } from "@colyseus/command";

import { OnJoinCommand, OnLeaveCommand } from "../Commands";

export class MyRoom extends Room {

  dispatcher = new Dispatcher(this);

  onCreate (options: any) {
    this.setState(new MyRoomState());

    this.onMessage("type", (client, message) => {
      //
      // handle "type" message
      //
      console.log(message);
    });

  }

  onJoin (client: Client, options: any) {
    console.log("client joined!");
    this.dispatcher.dispatch(new OnJoinCommand(), {
        sessionId: client.sessionId
    });
  }

  onLeave (client: Client, consented: boolean) {
    console.log("client left!");
    this.dispatcher.dispatch(new OnLeaveCommand(), {
        sessionId: client.sessionId
    });
  }

  onDispose() {
    this.dispatcher.stop();
  }

}
