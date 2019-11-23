import { Component, OnInit } from '@angular/core';
import { InspectionStaticItem } from '../../class/inspection-static-item';
import { BleInspectionItemService } from '../../services/ble-inspection-item.service';

@Component({
  selector: 'app-filter-item-inspection',
  templateUrl: './filter-item-inspection.component.html',
  styleUrls: ['./filter-item-inspection.component.scss']
})
export class FilterItemInspectionComponent implements OnInit {

  constructor(
    private bleInspectionItemService: BleInspectionItemService,
  ) { }

  //初始化滤波算法检查项
  public filterItem: InspectionStaticItem

  ngOnInit() {
    this.initInspectionItem()
  }

  public async inspect() {
    this.filterItem.isInspecting = true
    const { result, description } = await this.inspectFilter()
    this.filterItem.isInspected = true
    this.filterItem.isInspecting = false
    this.filterItem.inspectionResult = result
    this.filterItem.description = description
  }

  public inspectFilter(){
    //TODO: 现在还没有滤波算法
    let result = true
    let description = "合格，已初始化滤波算法！"
    return ({result, description})
  }

  //初始化待检测项目信息
  public initInspectionItem() {
    this.filterItem = this.bleInspectionItemService.filterItem
  }
  
  //清除当前检查项目的信息
  public clearInspectionItem() {
    this.bleInspectionItemService.filterItem.isInspected = false
    this.bleInspectionItemService.filterItem.inspectionResult = null
    this.bleInspectionItemService.filterItem.description = null
  }
}
