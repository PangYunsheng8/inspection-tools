import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class BleConfigService {
  public readonly DATA_SERVICE_UUID = 0x1000
  public readonly COMMAND_WRITE_CHARACTERISTIC_UUID = 0x1001
  public readonly COMMAND_READ_CHARACTERISTIC_UUID = 0x1002
  public readonly ROTATE_READ_CHARACTERISTIC_UUID = 0x1003
  public readonly ATTITUDE_READ_CHARACTERISTIC_UUID = 0x1004
  public readonly DEBUG_CHARACTERISTIC_UUID = 0x1005

  public readonly OTA_SERVICE_UUID = 0xfe59
  public readonly DFU_CONTROL_CHARACTERISTIC_UUID = '8EC90001-F315-4F60-9FB8-838830DAEA50'.toLocaleLowerCase()
  public readonly DFU_PACKET_CHARACTERISTIC_UUID = '8EC90002-F315-4F60-9FB8-838830DAEA50'.toLocaleLowerCase()
}
