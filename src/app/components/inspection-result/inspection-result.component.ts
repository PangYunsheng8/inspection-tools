import { Component, OnInit } from '@angular/core';
import { InspectionStaticItem } from '../../class/inspection-static-item';
import { InspectionDynamicItem } from '../../class/inspection-dynamic-item';
import { BleInspectionItemService } from '../../services/ble-inspection-item.service';
import { BleStateService } from '../../services/ble-state.service';

const AXIS_COLOR_MAP = ['黄', '橘', '蓝', '红', '绿', '白',]

@Component({
  selector: 'app-inspection-result',
  templateUrl: './inspection-result.component.html',
  styleUrls: ['./inspection-result.component.scss']
})
export class InspectionResultComponent implements OnInit {

  constructor(
    private bleInspectionItemService: BleInspectionItemService,
    private bleStateService: BleStateService,
  ) { }

  public notInspectedItems: Array<any> = new Array()
  public InspectedValidItems: Array<any> = new Array()
  public InspectedInvalidItems: Array<any> = new Array()

  public inspectionItems: Array<any> = new Array<any>()

  ngOnInit() {
    this.initInspectionItem()

    for (let i = 0; i < this.inspectionItems.length; i++){
      this.notInspectedItems.push(this.inspectionItems[i])
    }

    this.bleStateService.connectionStatus$.subscribe(connected => {
      if (!connected) {
        this.initInspectionItem()
      }
    })

    this.bleInspectionItemService.inspectionItem$.subscribe(id => {
      let isInspected = this.inspectionItems[id].isInspected
      let result = this.inspectionItems[id].inspectionResult
      if (isInspected) {
        this.notInspectedItems = this.notInspectedItems.filter(i => i.itemId != id)
        if (result) this.InspectedValidItems.push(this.inspectionItems[id])
        else this.InspectedInvalidItems.push(this.inspectionItems[id])
      } else {
        this.InspectedValidItems = this.InspectedValidItems.filter(i => i.itemId != id)
        this.InspectedInvalidItems = this.InspectedInvalidItems.filter(i => i.itemId != id)

        if (this.notInspectedItems.filter(i => i.itemId == id).length == 0)
          this.notInspectedItems.push(this.inspectionItems[id])
      }
    }, err => console.log(err)) 
  }

  public initInspectionItem() {
    this.inspectionItems = [
      this.bleInspectionItemService.faceItem0,
      this.bleInspectionItemService.faceItem1,
      this.bleInspectionItemService.faceItem2,
      this.bleInspectionItemService.faceItem3,
      this.bleInspectionItemService.faceItem4,
      this.bleInspectionItemService.faceItem5,
      this.bleInspectionItemService.voltageItem,
      this.bleInspectionItemService.cstateItem,
      this.bleInspectionItemService.sensorsItem,
      this.bleInspectionItemService.filterItem,
      this.bleInspectionItemService.identityItem,
      this.bleInspectionItemService.oadItem
    ]
  }

}
