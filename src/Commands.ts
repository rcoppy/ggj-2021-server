// OnJoinCommand.ts
import { Command } from "@colyseus/command";

import { Coordinate, MyRoomState, Hex, PlayerState, PlayerPiece } from "./rooms/schema/MyRoomState";

import { IntCoordinate } from "./IntCoordinate";
import { PathfindingLogic } from "./PathfindingLogic"; 
import { Constants } from "./Constants";

export class OnJoinCommand extends Command<MyRoomState, { sessionId: string }> {

  execute({ sessionId }) {
    const hexGridSize: number = this.state.grid.keys.length;
    const randomIndex: number = Math.floor(Math.random() * hexGridSize);

    this.state.playerStates.set(sessionId, new PlayerState({ pieceOnBoard: new PlayerPiece({ tileId: this.state.grid.keys[randomIndex] }) }));
  }

}

export class OnLeaveCommand extends Command<MyRoomState, { sessionId: string }> {

  execute({ sessionId }) {
    this.state.tileOccupants.delete(`${this.state.playerStates.get(sessionId).pieceOnBoard.id}`);
    this.state.playerStates.delete(sessionId);

    console.log(`Players in room: ${this.state.playerStates.size}`);
  }

}

export class InitGridCommand extends Command<MyRoomState, { board: Array<{}> }> {

  execute({ board }) {
    board.forEach(hex => {
      const tile: Hex = new Hex({ x: hex.x, y: hex.y})
      this.state.grid.set(`${tile.id}`, tile);
    });
  }

}

export class UpdateClientStatusCommand extends Command<MyRoomState, { isPositionUpdating: boolean, sessionId: string }> {

  execute({ isPositionUpdating, sessionId}) {
    this.state.playerStates.get(sessionId).pieceOnBoard.isPositionUpdating = isPositionUpdating;
  }

}

export class MovePlayerCommand extends Command<MyRoomState, { hexIndex: number, sessionId: string }> {

  execute({ hexIndex, sessionId }) {
    // console.log(`hexIndex: ${hexIndex}`);

    const hex = this.state.grid.get(hexIndex);

    if (!hex.isOccupied) {
      const player = this.state.playerStates.get(sessionId).pieceOnBoard;

      const finder = new PathfindingLogic({ width: Constants.gridWidth, height: Constants.gridHeight}); 

      const obstructions = new Array<IntCoordinate>();

      this.state.grid.forEach((hex) => { hex.isOccupied ? obstructions.push(new IntCoordinate(hex.x, hex.y)) : null });

      finder.updateObstructions(obstructions);

      const rawPath: Array<IntCoordinate> = finder.generateMovementQueue({ startX: this.state.grid.get(`${player.tileId}`).x, 
                                                                           startY: this.state.grid.get(`${player.tileId}`).y, 
                                                                           endX: hex.x, 
                                                                           endY: hex.y });

      player.moveQueue.clear();
      
      rawPath.forEach(coord => player.moveQueue.push(new Coordinate({x: coord.x, y: coord.y})));

      player.tileId = hexIndex;
      player.isPositionUpdating = true;
    } else {
      // send some kind of message to player that request was invalid
    }  
  }

}