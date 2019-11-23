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

  //是否正在连接
  public connecting = false
  //设备前缀
  public namePrefix = 'MHC'
  //是否debug
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

    //将休眠状态设置为0
    await this.bleCommandService.setSleepState(0)
    this.connectDataByWorkState(this.bleCurrentStateService.workState)

    this.bleStateService.connectionStatus$.next(this.bleStateService.connectedDevice? true: false)
  }

  public async disconnect() {
    if (this.bleStateService.connected) {
      await this.bleService.disconnect(this.bleStateService.connectedDevice.id)
    }
    this.ahrsService.disconnectAll()
    this.clearCurrentState()
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

  //获取所有设备信息
  public async oneKeyGetAll() {
    await this.getHardwareInfo()
    await this.getBatteryInfo()
    await this.getCoderFilterParam()
    await this.getWorkState()
    await this.getSensorsCalibrationParam()
  }
  //清除所有设备信息
  public clearCurrentState() {
    this.clearHardwareInfo()
    this.clearBatteryInfo()
    this.clearCoderFilterParam()
    this.clearWorkState()
    this.clearSensorsCalibrationParam()
  }

  //获取当前hardwareInfo
  public async getHardwareInfo() {
    const { pid, serial, major, minor, patch, bootCount } = await this.bleCommandService.getHardwareInfo()
    this.bleCurrentStateService.pid = bufferToHex(pid)
    this.bleCurrentStateService.serial = bufferToHex(serial)
    this.bleCurrentStateService.major = major
    this.bleCurrentStateService.minor = minor
    this.bleCurrentStateService.patch = patch
    this.bleCurrentStateService.bootCount = bootCount
  }
  //清除当前hardwareInfo
  public clearHardwareInfo() {
    this.bleCurrentStateService.pid = null
    this.bleCurrentStateService.serial = null
    this.bleCurrentStateService.major = null
    this.bleCurrentStateService.minor = null
    this.bleCurrentStateService.patch = null
    this.bleCurrentStateService.bootCount = null
  }

  //获取当前voltage和percentage
  public async getBatteryInfo() {
    const { voltage, percentage } = await this.bleCommandService.getBatteryInfo()
    this.bleCurrentStateService.voltage = voltage
    this.bleCurrentStateService.percentage = percentage
  }
  //清除当前voltage和percentage
  public clearBatteryInfo() {
    this.bleCurrentStateService.voltage = null
    this.bleCurrentStateService.percentage = null
  }

  //获取当前coderErrorCount和axisInterfereCount
  public async getCoderFilterParam() {
    const { coderErrorCount, axisInterfereCount } = await this.bleCommandService.getCoderFilterParam()
    this.bleCurrentStateService.coderErrorCount = coderErrorCount
    this.bleCurrentStateService.axisInterfereCount = axisInterfereCount
  }
  //清除当前coderErrorCount和axisInterfereCount
  public clearCoderFilterParam() {
    this.bleCurrentStateService.coderErrorCount = null
    this.bleCurrentStateService.axisInterfereCount = null
  }

  //获取当前workState
  public async getWorkState() {
    this.bleCurrentStateService.workState = await this.bleCommandService.getWorkState()
  }
  //设置当前的工作状态为正常的工作状态
  public async setWorkState() {
    await this
  }
  //清除当前workState
  public clearWorkState() {
    this.bleCurrentStateService.workState = null
  }

  //获取当前九轴校准参数
  public async getSensorsCalibrationParam() {
    const {
      accelerometerParam,
      gyroscopeParam,
      magnetometerParam
    } = await this.bleCommandService.getSensorsCalibrationParam()
    this.bleCurrentStateService.accelerometerParam = accelerometerParam
    this.bleCurrentStateService.gyroscopeParam = gyroscopeParam
    this.bleCurrentStateService.magnetometerParam = magnetometerParam
  }
  //清除当前九轴校准参数
  public clearSensorsCalibrationParam() {
    this.bleCurrentStateService.accelerometerParam = null
    this.bleCurrentStateService.gyroscopeParam = null
    this.bleCurrentStateService.magnetometerParam = null
  }
}
