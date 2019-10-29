import { Component, OnInit, Input } from '@angular/core';

import { BleInspectionService } from '../../services/ble-inspection.service';

@Component({
  selector: 'app-dynamic-inspection',
  templateUrl: './dynamic-inspection.component.html',
  styleUrls: ['./dynamic-inspection.component.scss']
})
export class DynamicInspectionComponent implements OnInit {

  constructor(
    private bleInspectionService: BleInspectionService
  ) { }
  
  public itemIndex: number
  public sideAxisIcon: string = '#icon-dengdaiqueren'

  ngOnInit() {
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