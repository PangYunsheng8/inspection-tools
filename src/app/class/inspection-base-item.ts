export class InspectionBaseItem {
    constructor(itemId: number, itemName: string) {
        this.itemId = itemId
        this.itemName = itemName
    }
    itemId: number
    itemName: string;
    isInspecting: boolean = false;
    isInspected: boolean = false;
    inspectionResult: boolean;
    description: string;
}
