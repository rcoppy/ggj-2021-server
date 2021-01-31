import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";
import { CorsOptionsDelegate } from "cors";
import { OccupantTypes, Constants } from "../../Constants";

export class Coordinate extends Schema {
  @type("number")
    x: number;

  @type("number")
    y: number;

    constructor({x = 0, y = 0}) {
      super();
      this.x = x;
      this.y = y;
    }
}

export class TileOccupant extends Schema {
  @type("number")
    occupantTypeId: number;

  @type("number")
    tileId: number;

  @type("string")
    textDescription: string;

  @type("boolean") 
    isPositionUpdating: boolean;

  @type({ array: Coordinate })
    moveQueue = new ArraySchema<Coordinate>();

  private static _idCounter: number = 0;
  public static  get idCounter() {
    return TileOccupant._idCounter;
  }

  @type("number")
    private _id: number = 0;
  
  public get id(): number {
    return this._id;
  }

  constructor({ tileId=null, occupantTypeId=OccupantTypes.Blank }) {
    super();
    this.tileId = tileId;

    this._id = TileOccupant._idCounter; 
    TileOccupant._idCounter += 1;

    this.occupantTypeId = occupantTypeId;
    this.textDescription = Constants.occupantTypeStrings.get(occupantTypeId);
    
    // variable state
    this.isPositionUpdating = false;
    
  }
}


export class PlayerPiece extends TileOccupant {
  
  constructor({ tileId=null }) {
    super({ tileId: tileId, occupantTypeId: OccupantTypes.Player });
  }
  
}

export class PlayerState extends Schema {
  @type(PlayerPiece)
    pieceOnBoard: PlayerPiece;

  constructor({ pieceOnBoard=null }) {
    super();
    this.pieceOnBoard = pieceOnBoard;
  }
}

export class Hex extends Schema {
  @type("number")
    x: number;

  @type("number")
    y: number;

  @type("number")
  private _id: number = 0;
  
  public get id(): number {
    return this._id;
  }

  private static _idCounter: number = 0;
  public static  get idCounter() {
    return Hex._idCounter;
  }


  @type("boolean")
    isOccupied: boolean

  @type(TileOccupant)
    occupant: TileOccupant 

  constructor({ x, y }) {
    super();
    this.x = x;
    this.y = y;

    this._id = Hex._idCounter; 
    Hex._idCounter += 1;
    
    this.isOccupied = false;
  }
}

export class MyRoomState extends Schema {

  @type("string")
    mySynchronizedProperty: string = "Hello world";

  @type({ map: PlayerState })
    playerStates = new MapSchema<PlayerState>();

  @type({ map: Hex }) 
    // keys are unfortunately strings instead of ints; don't know how to change that
    grid = new MapSchema<Hex>();

  @type({ map: TileOccupant })
    tileOccupants = new MapSchema<TileOccupant>();

}