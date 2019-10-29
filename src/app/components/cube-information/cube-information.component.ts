import { Component, OnInit } from '@angular/core';
import { bufferToHex } from 'src/libs/utils';
import { Debug } from 'src/libs/debug';

import { BleStateService } from '../../services/ble-state.service';
import { BleCurrentStateService } from '../../services/ble-current-state.service';

@Component({
  selector: 'app-cube-information',
  templateUrl: './cube-information.component.html',
  styleUrls: ['./cube-information.component.scss']
})
export class CubeInformationComponent implements OnInit {

  constructor(
    private bleStateService: BleStateService,
    private bleCurrentStateService: BleCurrentStateService,
  ) { }

  //连接状态
  public connectedState: boolean

  //设备硬件信息
  public pid: string
  public serial: string
  public major: number
  public minor: number
  public patch: number
  public bootCount: number

  //设备剩余电量
  public percentage: number

  ngOnInit() {
    this.getDeviceInfo()
  }

  public clearDeviceInfo() {
    this.pid = null
    this.serial = null
    this.major = null
    this.minor = null
    this.patch = null
    this.bootCount = null
    this.percentage = null
  }

  public async getDeviceInfo() {
    this.bleStateService.connectionStatus$.subscribe(async connected => {
      if (connected) {
        this.connectedState = true
        this.pid = this.bleCurrentStateService.pid
        this.serial = this.bleCurrentStateService.serial
        this.major = this.bleCurrentStateService.major
        this.minor = this.bleCurrentStateService.minor
        this.patch = this.bleCurrentStateService.patch
        this.bootCount = this.bleCurrentStateService.bootCount
        this.percentage = this.bleCurrentStateService.percentage
      } else {
        this.connectedState = false
        this.clearDeviceInfo()
      }
    }, err => {
      Debug.info(`获取是否有设备连接信息失败!`)
    })
  }

}
