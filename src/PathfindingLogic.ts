import pathfinding, { Finder } from "pathfinding";
import { Queue } from "./Queue";
import { IntCoordinate } from "./IntCoordinate";

export class PathfindingLogic {
    gridWidth: number;
    gridHeight: number;
    grid: any;

    private static options: pathfinding.FinderOptions = { diagonalMovement: pathfinding.DiagonalMovement.Always };

    private static finder = new pathfinding.AStarFinder(PathfindingLogic.options);

    constructor({ width, height }) {
        this.grid = new pathfinding.Grid(width, height);
    }

    updateObstructions(obstructions: Array<IntCoordinate>) {
        obstructions.forEach(coord => {
            this.grid.setWalkableAt(coord.x, coord.y, false);           
        });
    }

    generateMovementQueue({ startX, startY, endX, endY }) : Array<IntCoordinate> {
        const queue: Array<IntCoordinate> = new Array<IntCoordinate>();

        const gridBackup = this.grid.clone();

        const path = PathfindingLogic.finder.findPath(startX, startY, endX, endY, gridBackup);

        path.forEach((coord) => queue.push(new IntCoordinate(coord[0], coord[1])));

        return queue;
    }



}