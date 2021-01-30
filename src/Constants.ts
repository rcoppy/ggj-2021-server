export class Constants {
    private static _gridWidth: number = 10;
    private static _gridHeight: number = 10;

    public static get gridWidth(): number {
        return Constants._gridWidth;
    }

    public static get gridHeight(): number {
        return Constants._gridHeight;
    }
}