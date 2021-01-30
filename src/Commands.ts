// OnJoinCommand.ts
import { Command } from "@colyseus/command";

import { Coordinate, MyRoomState, Player, Hex } from "./rooms/schema/MyRoomState";

import { IntCoordinate } from "./IntCoordinate";
import { PathfindingLogic } from "./PathfindingLogic"; 
import { Constants } from "./Constants";

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
    // console.log(`hexIndex: ${hexIndex}`);

    const hex = this.state.grid.get(hexIndex);

    if (!hex.isOccupied) {
      const player = this.state.players.get(sessionId);

      const finder = new PathfindingLogic({ width: Constants.gridWidth, height: Constants.gridHeight}); 

      const obstructions = new Array<IntCoordinate>();

      this.state.grid.forEach((hex) => { hex.isOccupied ? obstructions.push(new IntCoordinate(hex.x, hex.y)) : null });

      finder.updateObstructions(obstructions);

      const rawPath: Array<IntCoordinate> = finder.generateMovementQueue({ startX: player.x, startY: player.y, endX: hex.x, endY: hex.y });

      player.moveQueue.clear();
      
      rawPath.forEach(coord => player.moveQueue.push(new Coordinate({x: coord.x, y: coord.y})));

      player.x = hex.x;
      player.y = hex.y;
      player.clientIsUpdating = true;
    } else {
      // send some kind of message to player that request was invalid
    }  
  }

}