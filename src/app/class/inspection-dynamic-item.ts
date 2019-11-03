import { InspectionBaseItem } from './inspection-base-item';

export class InspectionDynamicItem extends InspectionBaseItem{
    constructor(itemName: string, face: number) {
        super(itemName)
        this.face = face
    }
    face: number
    ClockwiseAngle: number = 0;
    CounterclockwiseAngle: number = 0;
}
