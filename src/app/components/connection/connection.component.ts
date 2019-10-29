import { Component, OnInit } from '@angular/core';
import { Debug } from 'src/libs/debug';
import { bufferToHex } from 'src/libs/utils';
import { WorkState } from 'src/libs/sk-protocol-v2';

import { BleService } from '../../services/ble.service';
import { BleStateService } from '../../services/ble-state.service';
import { AttitudeService } from '../../services/attitude.service';
import { CubeRotateService } from '../../services/cube-rotate.service';
import { BleCurrentStateService } from '../../services/ble-current-state.service';
import { BleCommandService } from '../../services/ble-command.service';

@Component({
  selector: 'app-connection',
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss']
})
export class ConnectionComponent implements OnInit {

  constructor(
    private bleService: BleService,
    private bleStateService: BleStateService,
    private ahrsService: AttitudeService,
    private bleCurrentStateService: BleCurrentStateService,
    private bleCommandService: BleCommandService,
    private cubeRotateService: CubeRotateService,
  ) {}

  public connecting = false
  public connected = false
  public namePrefix = 'MHC'

  public enableDebug = true

  ngOnInit() {
  }

  public async scanAndConnect() {
    let device
    try {
      device = await (await this.bleService.startScan(this.namePrefix)).toPromise()
      Debug.info(`用户选择`, device)
    } catch (err) {
      Debug.info('用户取消选择')
      return
    }
    try {
      this.connecting = true
      await this.bleService.connect(device.id, this.enableDebug)
      this.connected = true
    } catch (err) {
      alert(`连接失败！请重试！原因:${err}`)
      return
    } finally {
      this.connecting = false
    }
    Debug.info(`连接成功`)
    this.bleService.command$.subscribe(i => {
    }, err => {
      Debug.info(`蓝牙设备断开连接!`)
    })
    await this.oneKeyGetAll()
    this.bleStateService.connectionStatus$.next(this.bleStateService.connectedDevice? true: false)
    this.connectDataByWorkState(this.bleCurrentStateService.workState)
  }

  public async disconnect() {
    if (this.bleStateService.connected) {
      await this.bleService.disconnect(this.bleStateService.connectedDevice.id)
    }
    this.ahrsService.disconnectAll()
    this.connected = false
    this.bleStateService.connectionStatus$.next(this.bleStateService.connectedDevice? true: false)
  }

  private connectDataByWorkState(workState: WorkState) {
    console.log('connectDataByWorkState')
    switch (+workState) {
      case WorkState.DEBUG_WORK_STATE:
        console.log('DEBUG_WORK_STATE')
        this.ahrsService.disconnectAll()
        this.ahrsService.connectAttitudeRawData(this.bleService.attitude$)
        this.cubeRotateService.disconnectAll()
        this.cubeRotateService.conectGPIOData(this.bleService.rotate$)
        break
      case WorkState.NORMAL_WORK_STATE:
        console.log('NORMAL_WORK_STATE')
        this.ahrsService.disconnectAll()
        this.ahrsService.connectAttitudeData(this.bleService.attitude$)
        this.cubeRotateService.disconnectAll()
        this.cubeRotateService.connectMoveData(this.bleService.rotate$)
        break
      case WorkState.IDLE_WORK_STATE:
        console.log('IDLE_WORK_STATE')
        this.ahrsService.disconnectAll()
        this.cubeRotateService.disconnectAll()
    }
  }

  public async oneKeyGetAll() {
    await this.getHardwareInfo()
    await this.getBatteryInfo()
    await this.getCoderFilterParam()
    await this.getWorkState()
  }

  public async getHardwareInfo() {
    const { pid, serial, major, minor, patch, bootCount } = await this.bleCommandService.getHardwareInfo()
    this.bleCurrentStateService.pid = bufferToHex(pid)
    this.bleCurrentStateService.serial = bufferToHex(serial)
    this.bleCurrentStateService.major = major
    this.bleCurrentStateService.minor = minor
    this.bleCurrentStateService.patch = patch
    this.bleCurrentStateService.bootCount = bootCount
  }

  public async getBatteryInfo() {
    const { voltage, percentage } = await this.bleCommandService.getBatteryInfo()
    this.bleCurrentStateService.voltage = voltage
    this.bleCurrentStateService.percentage = percentage
  }

  public async getCoderFilterParam() {
    const { coderErrorCount, axisInterfereCount } = await this.bleCommandService.getCoderFilterParam()
    this.bleCurrentStateService.coderErrorCount = coderErrorCount
    this.bleCurrentStateService.axisInterfereCount = axisInterfereCount
  }

  public async getWorkState() {
    this.bleCurrentStateService.workState = await this.bleCommandService.getWorkState()
  }

}
