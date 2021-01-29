import { Room, Client } from "colyseus";
import { MyRoomState } from "./schema/MyRoomState";
import { Dispatcher } from "@colyseus/command";
import { defineGrid, extendHex, Grid } from "honeycomb-grid";

import { InitGridCommand, OnJoinCommand, OnLeaveCommand } from "../Commands";

export class MyRoom extends Room {

  // dispatcher for command pattern
  dispatcher = new Dispatcher(this);

  // // hex setup logic
  // hexPrototype = {
  //   toJSON() { return [this.x, this.y] }
  // }
  
  // Hex = extendHex(this.hexPrototype);


  Hex = extendHex();
  Grid = defineGrid(this.Hex);
  gameBoard = this.Grid.rectangle({ width: 4, height: 4 });

  workaroundGridStructurer(grid: Grid) {
    const tupleGrid = [];

    grid.forEach((hex) => tupleGrid.push({ x: hex.cartesian().x, y: hex.cartesian().y, index: grid.indexOf(hex) }));

    return tupleGrid;
  }

  simpleBoard = this.workaroundGridStructurer(this.gameBoard);

  onCreate (options: any) {
    this.setState(new MyRoomState());

    this.dispatcher.dispatch(new InitGridCommand(), {
      board: this.simpleBoard
    });

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
