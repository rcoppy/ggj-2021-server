export enum OccupantTypes {
    Monster = 0, // auto-increment; make sure this matches the corresponding enum on the client side
    FinalBoss,
    Player,
    Wall,
    Loot,
    Chest,
    Shopkeep,
    Fire,
    Blank
}

export class Constants {
    private static _gridWidth: number = 10;
    private static _gridHeight: number = 10;

    public static get gridWidth(): number {
        return Constants._gridWidth;
    }

    public static get gridHeight(): number {
        return Constants._gridHeight;
    }

    private static _occupantTypeStrings: Map<number, string> = new Map([
        [OccupantTypes.Monster, "Monster"],
        [OccupantTypes.FinalBoss, "Final Boss"],
        [OccupantTypes.Player, "Player"],
        [OccupantTypes.Wall, "Wall"],
        [OccupantTypes.Loot, "Loot"],
        [OccupantTypes.Chest, "Chest"],
        [OccupantTypes.Shopkeep, "Shopkeep"],
        [OccupantTypes.Fire, "Fire"]
    ]);

    public static get occupantTypeStrings(): Map<number, string> {
        return Constants._occupantTypeStrings;
    }

    
}

