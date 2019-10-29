import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class BleConfigService {
  public readonly SERVICE_UUID = 0x1000
  public readonly COMMAND_WRITE_CHARACTERISTIC_UUID = 0x1001
  public readonly COMMAND_READ_CHARACTERISTIC_UUID = 0x1002
  public readonly ROTATE_READ_CHARACTERISTIC_UUID = 0x1003
  public readonly ATTITUDE_READ_CHARACTERISTIC_UUID = 0x1004
  public readonly DEBUG_CHARACTERISTIC_UUID = 0x1005
}
