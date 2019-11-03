export class InspectionBaseItem {
    constructor(itemName: string) {
        this.itemName = itemName
    }
    itemName: string;
    // itemDisplayName: string;
    isInspecting: boolean = false;
    isInspected: boolean = false;
    inspectionResult: boolean;
    description: string;
}
