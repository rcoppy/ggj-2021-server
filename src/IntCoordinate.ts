export class IntCoordinate {
    private _x: number = 0;
    private _y: number = 0;
    private _tuple: Array<number> = [0,0];

    constructor(x: number, y: number) {
        this._x = x; 
        this._y = y;
        this._tuple = [x, y];
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    get tuple(): Array<number> {
        return this._tuple;
    }

    set x(x: number) {
        this._x = x;
        this._tuple = [x, this._y];
    }

    set y(y: number) {
        this._y = y;
        this._tuple = [this._x, y];
    }

    set tuple(tuple: Array<number>) {
        this._tuple = tuple;
        this._x = tuple[0];
        this._y = tuple[1];
    }

    setTuple(x: number, y: number) {
        this._tuple = [x, y];
        this._x = x; 
        this._y = y;
    }

}