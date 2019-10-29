import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface BleDeviceInfo {
  name?: string,
  id: string
}

@Injectable({
  providedIn: 'root'
})
export class BleStateService {

  constructor() { }

  public connectedDevice: BleDeviceInfo = null
  public devices: { [key: string]: BleDeviceInfo } = {}
  public scanning = false

  private _connectionStatus$: Subject<boolean> = new Subject<boolean>()

   /**
   * 返回是否已经连接设备
   */
  public get connected() {
    return !!this.connectedDevice
  }

  public get connectionStatus$() {
    return this._connectionStatus$
  }

}
