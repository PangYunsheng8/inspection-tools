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
  public sideAxisIcon: string = '#icon-dengdaiqueren'

  ngOnInit() {
    this.bleStateService.connectionStatus$.subscribe(connected => {
      if (!connected) {
        this.sideAxisIcon = '#icon-dengdaiqueren'
      }
    })
  }

  public finishedEvent(data) {
    if (data) {
      this.sideAxisIcon = '#icon-chenggong'
    } else {
      this.sideAxisIcon = '#icon-shibai'
    }
  }

  public selectionChange(e) {
    if (e.length) this.itemIndex = parseInt(e[0])
    else this.itemIndex = 0
    this.bleInspectionService.dynamicInspectItem$.next(this.itemIndex)
  }

}