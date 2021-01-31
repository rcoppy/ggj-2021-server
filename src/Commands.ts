// OnJoinCommand.ts
import { Command } from "@colyseus/command";

import { Coordinate, MyRoomState, Hex, PlayerState, PlayerPieceFactory, TileOccupant } from "./rooms/schema/MyRoomState";

import { IntCoordinate } from "./IntCoordinate";
import { PathfindingLogic } from "./PathfindingLogic"; 
import { Constants, OccupantTypes } from "./Constants";

export class OnJoinCommand extends Command<MyRoomState, { sessionId: string }> {

  execute({ sessionId }) {
    const hexGridSize: number = this.state.grid.size;
    const randomIndex: number = Math.floor(Math.random() * hexGridSize);

    console.log(`random index: ${randomIndex}`);
    console.log(`test id: ${Array.from(this.state.grid.keys())[randomIndex]}`);

    this.state.playerStates.set(sessionId, new PlayerState({ 
      pieceOnBoard: PlayerPieceFactory({ tileId: Array.from(this.state.grid.keys())[randomIndex] }) 
    }));

    const newPiece = this.state.playerStates.get(sessionId).pieceOnBoard;

    this.state.tileOccupants.set(`${newPiece.id}`, newPiece);

    this.state.triggerAll();
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

  // very slow method unfortunately
  searchForTileByCoordinate(x: number, y: number): Hex {
    for (let pair of this.state.grid) { 
      if (pair[1].x == x && pair[1].y == y) {
        return pair[1];   
      }      
    };

    return null;
  }

  spawnWall(startHex: Hex, endHex: Hex) {
    if (!startHex.isOccupied && !endHex.isOccupied) {
      
      const finder = new PathfindingLogic({ width: Constants.gridWidth, height: Constants.gridHeight}); 

      const obstructions = new Array<IntCoordinate>();

      this.state.grid.forEach((hex) => { hex.isOccupied ? obstructions.push(new IntCoordinate(hex.x, hex.y)) : null });

      finder.updateObstructions(obstructions);

      const rawPath: Array<IntCoordinate> = finder.generateMovementQueue({ startX: startHex.x, 
                                                                            startY: startHex.y, 
                                                                            endX: endHex.x, 
                                                                            endY: endHex.y });

      // const positionQueue: Queue<IntCoordinate> = new Queue<IntCoordinate>();
      
      rawPath.forEach(coord => {
        const tile = this.searchForTileByCoordinate(coord.x, coord.y);

        if (tile != null) {
          const wall = new TileOccupant({tileId: tile.id.toString(), occupantTypeId: OccupantTypes.Wall });
          tile.isOccupied = true;
          this.state.tileOccupants.set(tile.id.toString(), wall);
        }
        
      });

      this.state.triggerAll();
    } else {
      // send some kind of message to player that request was invalid
    }  
  }

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

export class MovePlayerCommand extends Command<MyRoomState, { hexIndex: string, sessionId: string }> {

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