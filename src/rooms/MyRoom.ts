import { Room, Client } from "colyseus";
import { MyRoomState } from "./schema/MyRoomState";
import { Dispatcher } from "@colyseus/command";
import { defineGrid, extendHex, Grid } from "honeycomb-grid";

import { InitGridCommand, OnJoinCommand, OnLeaveCommand, MovePlayerCommand, UpdateClientStatusCommand } from "../Commands";

import { Constants } from "../Constants";

export class MyRoom extends Room {

  // dispatcher for command pattern
  dispatcher = new Dispatcher(this);

  // // hex setup logic
  // hexPrototype = {
  //   toJSON() { return [this.x, this.y] }
  // }
  
  // Hex = extendHex(this.hexPrototype);


  CoordHex = extendHex();
  Grid = defineGrid(this.CoordHex);
  gameBoard = this.Grid.rectangle({ width: Constants.gridWidth, height: Constants.gridHeight });

  workaroundGridStructurer(grid: Grid) {
    const tupleGrid = [];

    grid.forEach((hex) => tupleGrid.push({ x: hex.cartesian().x, y: hex.cartesian().y }));

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

    this.onMessage("move_player_to_hex", (client, { hexIndex }) => {
      this.dispatcher.dispatch(new MovePlayerCommand(), {
        hexIndex: hexIndex,
        sessionId: client.sessionId
      })
    });

    this.onMessage("update_piece_status", (client, { isPositionUpdating }) => {
      this.dispatcher.dispatch(new UpdateClientStatusCommand(), {
        isPositionUpdating: isPositionUpdating,
        sessionId: client.sessionId
      })
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
