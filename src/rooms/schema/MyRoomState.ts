import { MapSchema, Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("number")
    x: number;

  @type("number")
    y: number;

  constructor({ x=0, y=0 }) {
    super();
    this.x = x;
    this.y = y;
  }
}

export class Hex extends Schema {
  @type("number")
    x: number;

  @type("number")
    y: number;

  @type("number")
    index: number;

  constructor({ x, y, index }) {
    super();
    this.x = x;
    this.y = y;
    this.index = index;
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