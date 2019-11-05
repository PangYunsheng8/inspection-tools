import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Buffer } from 'buffer';
import { Debug } from 'src/libs/debug';
import { bufferToHex } from 'src/libs/utils';
import { environment } from 'src/environments/environment';

import { BleStateService, BleDeviceInfo } from './ble-state.service';
import { BleBrowserService } from './ble-browser.service';
import { BleNativeService } from './ble-native.service';
import { DfuProgress } from '../../libs/nrf-dfu';

@Injectable({
  providedIn: 'root'
})
export class BleService {

  constructor(
    private bleNativeService: BleNativeService,
    private bleBrowserService: BleBrowserService,
    private bleStateService: BleStateService
  ) { }

  public async startScan(startWith: string): Promise<Observable<BleDeviceInfo>> {
    if (environment.usingWebtooth) {
      return this.bleBrowserService.startScan(startWith)
    } else {
      return this.bleNativeService.startScan(startWith)
    }
  }

  public async connect(deviceId: string, enableDebug: boolean): Promise<Observable<Buffer>> {
    if (environment.usingWebtooth) {
      return this.bleBrowserService.connect(deviceId, enableDebug)
    } else {
      return this.bleNativeService.connect(deviceId, enableDebug)
    }
  }

  public async disconnect(deviceId: string): Promise<void> {
    if (environment.usingWebtooth) {
      return this.bleBrowserService.disconnect(deviceId)
    } else {
      return this.bleNativeService.disconnect(deviceId)
    }
  }

  public get command$(): Observable<Buffer> {
    if (environment.usingWebtooth) {
      return this.bleBrowserService.command$
    } else {
      return this.bleNativeService.command$
    }
  }
  public get rotate$(): Observable<Buffer> {
    if (environment.usingWebtooth) {
      return this.bleBrowserService.rotate$
    } else {
      return this.bleNativeService.rotate$
    }
  }
  public get attitude$(): Observable<Buffer> {
    if (environment.usingWebtooth) {
      return this.bleBrowserService.attitude$
    } else {
      return this.bleNativeService.attitude$
    }
  }

  public async send(buff: Buffer): Promise<void> {
    Debug.send(bufferToHex(buff))
    if (environment.usingWebtooth) {
      return this.bleBrowserService.send(buff)
    } else {
      return this.bleNativeService.send(buff)
    }
  }

  public get otaProgress$(): Observable<DfuProgress> {
    if (environment.usingWebtooth) {
      return this.bleBrowserService.otaProgress$
    } else {
      return this.bleNativeService.otaProgress$
    }
  }

  public async ota(otaFileBuffer: Buffer, mtu: number): Promise<void> {
    if (environment.usingWebtooth) {
      return this.bleBrowserService.ota(otaFileBuffer, mtu)
    } else {
      return this.bleNativeService.ota(otaFileBuffer, mtu)
    }
  }
}
