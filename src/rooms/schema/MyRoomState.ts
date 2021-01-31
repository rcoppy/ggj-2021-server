import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";
import { CorsOptionsDelegate } from "cors";

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

export class Player extends Schema {
  @type("number")
    x: number;

  @type("number")
    y: number;

  @type("boolean") 
    isClientUpdating: boolean;

  constructor({ x=0, y=0 }) {
    super();
    this.x = x;
    this.y = y;
    this.isClientUpdating = false;
  }

  @type({ array: Coordinate })
    moveQueue = new ArraySchema<Coordinate>();
}

export class Hex extends Schema {
  @type("number")
    x: number;

  @type("number")
    y: number;

  @type("number")
    index: number;

  @type("boolean")
    isOccupied: boolean

  constructor({ x, y, index }) {
    super();
    this.x = x;
    this.y = y;
    this.index = index;
    this.isOccupied = false;
  }
}

export class MyRoomState extends Schema {

  @type("string")
    mySynchronizedProperty: string = "Hello world";

  @type({ map: Player })
    players = new MapSchema<Player>();

  @type({ map: Hex }) 
    grid = new MapSchema<Hex>();

}