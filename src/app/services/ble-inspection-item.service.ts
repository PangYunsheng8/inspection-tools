import { Injectable } from '@angular/core';
import { Subject } from 'rxjs'

import { InspectionStaticItem } from '../class/inspection-static-item';
import { InspectionDynamicItem } from '../class/inspection-dynamic-item';

import { BleValidService } from './ble-valid.service';

const AXIS_COLOR_MAP = ['黄', '橘', '蓝', '红', '绿', '白',]

@Injectable({
  providedIn: 'root'
})
export class BleInspectionItemService {

    constructor(
      private bleValidService: BleValidService,
    ) { }

    //6个侧轴检查项
    public faceItem0: InspectionDynamicItem = new InspectionDynamicItem('黄', 0)
    public faceItem1: InspectionDynamicItem = new InspectionDynamicItem('橘', 1)
    public faceItem2: InspectionDynamicItem = new InspectionDynamicItem('蓝', 2)
    public faceItem3: InspectionDynamicItem = new InspectionDynamicItem('红', 3)
    public faceItem4: InspectionDynamicItem = new InspectionDynamicItem('绿', 4)
    public faceItem5: InspectionDynamicItem = new InspectionDynamicItem('白', 5)

    //电压检查项
    public voltageItem: InspectionStaticItem = new InspectionStaticItem('电压', 0)

    public faceItems$: Subject<number> = new Subject<number>()
    public staticItem$: Subject<number> = new Subject<number>()
}
