import { InspectionBaseItem } from './inspection-base-item';

export class InspectionStaticItem extends InspectionBaseItem{
    constructor(itemName: string, id: number) {
        super(itemName)
        this.id = id
    }
    id: number;
    validState: any;
    currentState: any;
}
