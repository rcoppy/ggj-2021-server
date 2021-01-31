// OnJoinCommand.ts
import { Command } from "@colyseus/command";

import { Coordinate, MyRoomState, Hex, PlayerState, PlayerPieceFactory, TileOccupant } from "./rooms/schema/MyRoomState";

import { IntCoordinate } from "./IntCoordinate";
import { PathfindingLogic } from "./PathfindingLogic"; 
import { Constants, OccupantTypes } from "./Constants";
import { repeat } from "./Utilities";

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

  getRandomTile(): Hex {
    const hexGridSize: number = this.state.grid.size;
    const randomIndex: number = Math.floor(Math.random() * hexGridSize);

    return Array.from(this.state.grid.values())[randomIndex];
  }

  spawnRandomWalls(count: number) {
    repeat(count, () => {
      const startHex = this.getRandomTile();
      const endHex = this.getRandomTile();

      if (startHex.x != endHex.x && startHex.y != endHex.y) {
        this.spawnWall(startHex, endHex);
      }
    });
  }

  spawnOccupantOfType(hex: Hex, type: OccupantTypes) {
    if (!hex.isOccupied) {
      const occupant = new TileOccupant({tileId: hex.id.toString(), occupantTypeId: type });
      hex.isOccupied = true;
      this.state.tileOccupants.set(hex.id.toString(), occupant);
    } else {
      console.log("can't spawn here");
    }
  }

  spawnOccupantAtRandomPosition(type: OccupantTypes) {
    this.spawnOccupantOfType(this.getRandomTile(), type);
  }

  execute({ board }) {

    board.forEach(hex => {
      const tile: Hex = new Hex({ x: hex.x, y: hex.y})
      this.state.grid.set(`${tile.id}`, tile);
    });

    this.spawnRandomWalls(Math.floor(Math.random() * 14) + 5);

    // spawn fire
    repeat(Math.floor(Math.random() * 10) + 3, () => this.spawnOccupantAtRandomPosition(OccupantTypes.Fire));

    // spawn enemies
    repeat(Math.floor(Math.random() * 13) + 3, () => this.spawnOccupantAtRandomPosition(OccupantTypes.Monster));
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

      if (player.moveQueue.length > 0) {
        player.tileId = hexIndex;
        player.isPositionUpdating = true;
        // consume move phase here
      } else {
        // no path was possible, move aborted
      }
    } else {
      // send some kind of message to player that request was invalid
    }  
  }

}