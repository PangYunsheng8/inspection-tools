import { Component, OnInit, Input } from '@angular/core';

import { BleInspectionService } from '../../services/ble-inspection.service';
import { BleStateService } from '../../services/ble-state.service';

@Component({
  selector: 'app-dynamic-inspection',
  templateUrl: './dynamic-inspection.component.html',
  styleUrls: ['./dynamic-inspection.component.scss']
})
export class DynamicInspectionComponent implements OnInit {

  constructor(
    private bleInspectionService: BleInspectionService,
    private bleStateService: BleStateService,
  ) { }
  
  public itemIndex: number
  public axisIcon: string = '#icon-dengdaiqueren'

  ngOnInit() {
  }

  public finishedEvent(data) {
    if (data === 'valid') {
      this.axisIcon = '#icon-chenggong'
    } else if (data === 'invalid'){
      this.axisIcon = '#icon-shibai'
    } else{
      this.axisIcon = '#icon-dengdaiqueren'
    }
  }

  public selectionChange(e) {
    if (e.length) this.itemIndex = parseInt(e[0])
    else this.itemIndex = 0
    this.bleInspectionService.dynamicInspectItem$.next(this.itemIndex)
  }

}