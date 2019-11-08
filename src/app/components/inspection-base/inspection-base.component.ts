import { Component, OnInit } from '@angular/core';
import { ElMessageService } from 'element-angular';

import { BleStateService } from '../../services/ble-state.service';
import { BleInspectionService } from '../../services/ble-inspection.service';

@Component({
  selector: 'app-inspection-base',
  templateUrl: './inspection-base.component.html',
  styleUrls: ['./inspection-base.component.scss'],
})
export class InspectionBaseComponent implements OnInit {

  constructor(
    private bleStateService: BleStateService,
    private bleInspectionService: BleInspectionService,
    private message: ElMessageService,
  ) { }

  ngOnInit() {
  }

  public selectionChange(e) {
    if (!this.bleStateService.connectedDevice) {
      this.message.show('未检测到已连接的魔方，请连接！')
    }
    this.bleInspectionService.stepInspectItem.next(e.selectedIndex)
  }

}
