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

  public faceItems: Array<InspectionDynamicItem> = new Array<InspectionDynamicItem>()

  public voltageItem: InspectionStaticItem

  ngOnInit() {
    this.initInspectionItem()

    for (let i = 0; i < this.faceItems.length; i++){
      this.notInspectedItems.push(this.faceItems[i])
    }
    this.notInspectedItems.push(this.voltageItem)

    this.bleStateService.connectionStatus$.subscribe(connected => {
      if (!connected) {
        this.initInspectionItem()
      }
    })

    this.bleInspectionItemService.faceItems$.subscribe(face => {
      let isInspected = this.faceItems[face].isInspected
      let result = this.faceItems[face].inspectionResult
      if (isInspected) {
        this.notInspectedItems = this.notInspectedItems.filter(i => i.itemName != AXIS_COLOR_MAP[face])
        if (result) this.InspectedValidItems.push(this.faceItems[face])
        else this.InspectedInvalidItems.push(this.faceItems[face])
      } else {
        this.InspectedValidItems = this.InspectedValidItems.filter(i => i.itemName != AXIS_COLOR_MAP[face])
        this.InspectedInvalidItems = this.InspectedInvalidItems.filter(i => i.itemName != AXIS_COLOR_MAP[face])

        if (this.notInspectedItems.filter(i => i.itemName == AXIS_COLOR_MAP[face]).length == 0)
          this.notInspectedItems.push(this.faceItems[face])
      }
    }, err => console.log(err)) 

    this.bleInspectionItemService.staticItem$.subscribe(id => {
      let isInspected
      let result
      switch (id) {
        case 0:
          isInspected = this.voltageItem.isInspected
          result = this.voltageItem.inspectionResult
          break;
        case 1:
          console.log('待定')
          break;
        default:
          break;
      }

      if (isInspected) {
        this.notInspectedItems = this.notInspectedItems.filter(i => i.itemName != '电压')
        if (result) this.InspectedValidItems.push(this.voltageItem)
        else this.InspectedInvalidItems.push(this.voltageItem)
      } else {
        this.InspectedValidItems = this.InspectedValidItems.filter(i => i.itemName != '电压')
        this.InspectedInvalidItems = this.InspectedInvalidItems.filter(i => i.itemName != '电压')

        if (this.notInspectedItems.filter(i => i.itemName == '电压').length == 0)
          this.notInspectedItems.push(this.voltageItem)
      }
    }, err => console.log(err))
  }

  public initInspectionItem() {
    this.faceItems = [
      this.bleInspectionItemService.faceItem0,
      this.bleInspectionItemService.faceItem1,
      this.bleInspectionItemService.faceItem2,
      this.bleInspectionItemService.faceItem3,
      this.bleInspectionItemService.faceItem4,
      this.bleInspectionItemService.faceItem5
    ]

    this.voltageItem = this.bleInspectionItemService.voltageItem
  }

}
