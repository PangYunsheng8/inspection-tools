import { Injectable } from '@angular/core';
import { Subject } from 'rxjs'
import { InspectionStaticItem } from '../class/inspection-static-item';
import { InspectionDynamicItem } from '../class/inspection-dynamic-item';

export enum InspRes {
  valid,
  invalid,
  notInspected
}

export enum InspItemIcon {
  "#icon-chenggong",
  '#icon-shibai',
  "#icon-dengdaiqueren"
}

@Injectable({
  providedIn: 'root'
})
export class BleInspectionItemService {

    constructor() { }

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
    public filterItem: InspectionStaticItem = new InspectionStaticItem(9, '初始化滤波算法')
    //ID与序列号合法性
    public identityItem: InspectionStaticItem = new InspectionStaticItem(10, 'ID与序列号合法性')
    //OAD版本
    public oadItem: InspectionStaticItem = new InspectionStaticItem(11, 'OAD版本号')

    //姿态检测
    public attitudeItem: InspectionDynamicItem = new InspectionDynamicItem(12, '魔方姿态检测')

    //stepper Subject，静态检查执行完后next相应的ID，提示打开动态检查；动态检查完后同样next相应的ID，提示打开检查结果
    private _stepInspectItem$: Subject<number> = new Subject<number>()
    //动态检查中的折叠面板Subject，每当一个折叠面板打开，next相应的面板ID
    private _dynInspStep$: Subject<number> = new Subject<number>()

    public get stepInspectItem$() {
      return this._stepInspectItem$
    }
    public get dynInspStep$() {
      return this._dynInspStep$
    }
}
