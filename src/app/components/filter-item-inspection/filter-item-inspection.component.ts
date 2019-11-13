import { Component, OnInit } from '@angular/core';

import { InspectionStaticItem } from '../../class/inspection-static-item';

import { BleInspectionItemService } from '../../services/ble-inspection-item.service';
import { FilterInspectionService } from '../../services/filter-inspection.service';

@Component({
  selector: 'app-filter-item-inspection',
  templateUrl: './filter-item-inspection.component.html',
  styleUrls: ['./filter-item-inspection.component.scss']
})
export class FilterItemInspectionComponent implements OnInit {

  constructor(
    private bleInspectionItemService: BleInspectionItemService,
    private filterInspectionService: FilterInspectionService,
  ) { }

  public filterItem: InspectionStaticItem

  ngOnInit() {
    this.initInspectionItem()
  }

  //初始化待检测项目信息
  public initInspectionItem() {
    this.filterItem = this.bleInspectionItemService.filterItem
  }

  public async inspectFilter() {
    this.filterItem.isInspecting = true
    const { result, description } = await this.filterInspectionService.inspectFilter()
    this.filterItem.isInspected = true
    this.filterItem.isInspecting = false
    this.filterItem.inspectionResult = result
    this.filterItem.description = description

    this.bleInspectionItemService.inspectionItem$.next(this.filterItem.itemId)
  }
  
  //清除当前检查项目的信息
  public clearInspectionItem() {
    this.bleInspectionItemService.filterItem.isInspected = false
    this.bleInspectionItemService.filterItem.inspectionResult = null
    this.bleInspectionItemService.filterItem.description = null

    this.bleInspectionItemService.inspectionItem$.next(this.filterItem.itemId)
  }
}
