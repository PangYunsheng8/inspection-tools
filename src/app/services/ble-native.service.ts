import { Injectable } from '@angular/core';
import { Observable, Subject, Subscription, Subscriber } from 'rxjs'
import { BLE } from '@ionic-native/ble/ngx'
import { filter, tap, flatMap, map } from 'rxjs/operators';
import { PTPV2 } from 'src/libs/ptp-v2';
import { Buffer } from 'buffer';
import toArrayBuffer from 'to-arraybuffer';
import { BluetoothLE } from '@ionic-native/bluetooth-le/ngx';
import { Device } from '@ionic-native/device/ngx';
import { DfuProgress } from 'src/libs/nrf-dfu';

import { BleStateService, BleDeviceInfo } from './ble-state.service';
import { BleConfigService } from './ble-config.service';
 
@Injectable({
  providedIn: 'root'
})
export class BleNativeService {

  constructor(
    private ble: BLE,
    private device: Device,
    private bluetoothle: BluetoothLE,
    private bleStateService: BleStateService,
    private bleConfigService: BleConfigService
  ) {
    this.bluetoothle.initialize()
    this.isAndroid = device.platform === 'Android'
    this.afterAndroid6 = this.isAndroid && +device.version.split('.')[0] >= 6
  }
  
  private isAndroid: boolean
  private afterAndroid6: boolean

  private _command$: Observable<Buffer>
  private _rotate$: Observable<Buffer>
  private _attitude$: Observable<Buffer>

  private ptpV2: PTPV2 = null
  private bleConnection$Subscription: Subscription

  public startScan(startWith: string): Observable<BleDeviceInfo> {
    this.bleStateService.devices = {}
    try {
      return this.ble.startScan([]).pipe(
        filter(i => i.name && i.name.match(new RegExp(`^${startWith}`))),
        tap(i => {
          this.bleStateService.devices[i.id] = i
        })
      )
    } finally {
      // 为了让流已经返回后才置scanning为 true
      this.bleStateService.scanning = true
    }
  }

  public async connect(deviceId: string, enableDebug: boolean): Promise<Observable<Buffer>> {
    return new Promise<Observable<Buffer>>((resolve, reject) => {
      // 如果已经连接了设备，则将其断开
      if (this.bleStateService.connectedDevice) {
        // this.disconnect(this.bleStateService.connectedDevice.id)
      }

      this.bleConnection$Subscription = this.ble.connect(deviceId).subscribe(
        i => {
          this.bleStateService.connectedDevice = this.bleStateService.devices[deviceId]
          this.ptpV2 = new PTPV2()

          this._command$ = this.ble.startNotification(
            deviceId,
            this.bleConfigService.DATA_SERVICE_UUID.toString(16),
            this.bleConfigService.COMMAND_READ_CHARACTERISTIC_UUID.toString(16)
          ).pipe(
            flatMap(i => {
              this.ptpV2.input(Buffer.from(i))
              const res = []
              let recv: Buffer | null
              while (recv = this.ptpV2.receive()){
                res.push(recv)
              }
              return res
            })
          )

          this._rotate$ = this.ble.startNotification(
            deviceId,
            this.bleConfigService.DATA_SERVICE_UUID.toString(16),
            this.bleConfigService.ROTATE_READ_CHARACTERISTIC_UUID.toString(16)
          ).pipe(
            map(i => Buffer.from(i))
          )

          this._attitude$ = this.ble.startNotification(
            deviceId,
            this.bleConfigService.DATA_SERVICE_UUID.toString(16),
            this.bleConfigService.ATTITUDE_READ_CHARACTERISTIC_UUID.toString(16)
          ).pipe(
            map(i => Buffer.from(i))
          )

          resolve(this._command$)
        },
        err => {
          this.disconnect(this.bleStateService.connectedDevice.id)
        },
        () => {
          this.disconnect(this.bleStateService.connectedDevice.id)
        }
      )
    })
  }

  public async disconnect(deviceId: string): Promise<void> {
    this.clearConnection()
    await this.ble.disconnect(deviceId)
  }

  private clearConnection() {
    this.ptpV2 = null
    this.bleStateService.connectedDevice = null
    this._command$ = null
    this._rotate$ = null
    this._attitude$ = null
    if (this.bleConnection$Subscription) {
      this.bleConnection$Subscription.unsubscribe()
    }
  }

  // 每次返回不同的 Observable 实现数据共享
  public get command$(): Observable<Buffer> {
    return this._command$
  }

  public get rotate$(): Observable<Buffer> {
    return this._rotate$
  }

  public get attitude$(): Observable<Buffer> {
    return this._attitude$
  }

  public get otaProgress$(): Observable<DfuProgress> {
    return null
  } 

  public async send(buff: Buffer): Promise<void> {
    if (!this.bleStateService.connected) {
      throw new Error('还未连接设备，请先连接设备再发送数据')
    }
    this.ptpV2.send(buff)
    let outputBuff: Buffer | null
    while (outputBuff = this.ptpV2.output()) {
      await this.ble.writeWithoutResponse(
        this.bleStateService.connectedDevice.id,
        this.bleConfigService.DATA_SERVICE_UUID.toString(16),
        this.bleConfigService.COMMAND_WRITE_CHARACTERISTIC_UUID.toString(16),
        toArrayBuffer(outputBuff)
      )
    }
  }

  public async ota(otaFileBuffer: Buffer, mtu: number) {
    
  }
}
