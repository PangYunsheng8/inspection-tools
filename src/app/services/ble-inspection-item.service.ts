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
    public faceItem0: InspectionDynamicItem = new InspectionDynamicItem(0, '黄')
    public faceItem1: InspectionDynamicItem = new InspectionDynamicItem(1, '橘')
    public faceItem2: InspectionDynamicItem = new InspectionDynamicItem(2, '蓝')
    public faceItem3: InspectionDynamicItem = new InspectionDynamicItem(3, '红')
    public faceItem4: InspectionDynamicItem = new InspectionDynamicItem(4, '绿')
    public faceItem5: InspectionDynamicItem = new InspectionDynamicItem(5, '白')

    //电压检查项
    public voltageItem: InspectionStaticItem = new InspectionStaticItem(6, '电压')
    //初始化逻辑魔方姿态
    public cstateItem: InspectionStaticItem = new InspectionStaticItem(7, '初始化逻辑魔方姿态')
    //九轴参数校准
    public sensorsItem: InspectionStaticItem = new InspectionStaticItem(8, '九轴参数校准')
    //初始化滤波参数
    public filterItem: InspectionStaticItem = new InspectionStaticItem(9, '初始化滤波参数')
    //ID与序列号合法性
    public identityItem: InspectionStaticItem = new InspectionStaticItem(10, 'ID与序列号合法性')
    //OAD版本
    public oadItem: InspectionStaticItem = new InspectionStaticItem(11, 'OAD版本号')

    public inspectionItem$: Subject<number> = new Subject<number>()
}
