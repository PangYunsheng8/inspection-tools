import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { PTPV2 } from 'src/libs/ptp-v2';
import { Debug } from 'src/libs/debug';
import { bufferToHex } from 'src/libs/utils';
import { Buffer } from 'buffer';
import { getUpdatesFromZipFileBytes, DfuTransportAnyBle, DfuOperation, DfuProgress } from 'src/libs/nrf-dfu';

import { BleStateService } from './ble-state.service';
import { BleConfigService } from './ble-config.service';


type BluetoothServiceUUID = number | string;
type BluetoothCharacteristicUUID = number | string;
type BluetoothDescriptorUUID = number | string;

interface BluetoothRequestDeviceFilter {
  services?: BluetoothServiceUUID[];
  name?: string;
  namePrefix?: string;
  manufacturerId?: number;
  serviceDataUUID?: BluetoothServiceUUID;
}

type RequestDeviceOptions = {
  filters: BluetoothRequestDeviceFilter[];
  optionalServices?: BluetoothServiceUUID[];
} | {
  acceptAllDevices: boolean;
  optionalServices?: BluetoothServiceUUID[];
};

interface BluetoothRemoteGATTDescriptor {
  readonly characteristic: BluetoothRemoteGATTCharacteristic;
  readonly uuid: string;
  readonly value?: DataView;
  readValue(): Promise<DataView>;
  writeValue(value: BufferSource): Promise<void>;
}

interface BluetoothCharacteristicProperties {
  readonly broadcast: boolean;
  readonly read: boolean;
  readonly writeWithoutResponse: boolean;
  readonly write: boolean;
  readonly notify: boolean;
  readonly indicate: boolean;
  readonly authenticatedSignedWrites: boolean;
  readonly reliableWrite: boolean;
  readonly writableAuxiliaries: boolean;
}

interface CharacteristicEventHandlers {
  oncharacteristicvaluechanged: (this: this, ev: Event) => any;
}

interface BluetoothRemoteGATTCharacteristic extends EventTarget, CharacteristicEventHandlers {
  readonly service?: BluetoothRemoteGATTService;
  readonly uuid: string;
  readonly properties: BluetoothCharacteristicProperties;
  readonly value?: DataView;
  getDescriptor(descriptor: BluetoothDescriptorUUID): Promise<BluetoothRemoteGATTDescriptor>;
  getDescriptors(descriptor?: BluetoothDescriptorUUID): Promise<BluetoothRemoteGATTDescriptor[]>;
  readValue(): Promise<DataView>;
  writeValue(value: BufferSource): Promise<void>;
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  addEventListener(type: 'characteristicvaluechanged', listener: (this: this, ev: Event) => any, useCapture?: boolean): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
}

interface ServiceEventHandlers {
  onserviceadded: (this: this, ev: Event) => any;
  onservicechanged: (this: this, ev: Event) => any;
  onserviceremoved: (this: this, ev: Event) => any;
}

interface BluetoothRemoteGATTService extends EventTarget, CharacteristicEventHandlers, ServiceEventHandlers {
  readonly device: BluetoothDevice;
  readonly uuid: string;
  readonly isPrimary: boolean;
  getCharacteristic(characteristic: BluetoothCharacteristicUUID): Promise<BluetoothRemoteGATTCharacteristic>;
  getCharacteristics(characteristic?: BluetoothCharacteristicUUID): Promise<BluetoothRemoteGATTCharacteristic[]>;
  getIncludedService(service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService>;
  getIncludedServices(service?: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService[]>;
  addEventListener(type: 'serviceadded', listener: (this: this, ev: Event) => any, useCapture?: boolean): void;
  // tslint:disable-next-line:unified-signatures
  addEventListener(type: 'servicechanged', listener: (this: this, ev: Event) => any, useCapture?: boolean): void;
  // tslint:disable-next-line:unified-signatures
  addEventListener(type: 'serviceremoved', listener: (this: this, ev: Event) => any, useCapture?: boolean): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
}

interface BluetoothRemoteGATTServer extends EventTarget {
  readonly device: BluetoothDevice;
  readonly connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService>;
  getPrimaryServices(service?: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService[]>;
}

interface BluetoothDeviceEventHandlers {
  ongattserverdisconnected: (this: this, ev: Event) => any;
}

interface BluetoothDevice extends EventTarget, BluetoothDeviceEventHandlers, CharacteristicEventHandlers, ServiceEventHandlers {
  readonly id: string;
  readonly name?: string;
  readonly gatt?: BluetoothRemoteGATTServer;
  readonly uuids?: string[];
  watchAdvertisements(): Promise<void>;
  unwatchAdvertisements(): void;
  // tslint:disable-next-line:member-ordering
  readonly watchingAdvertisements: boolean;
  addEventListener(type: 'gattserverdisconnected', listener: (this: this, ev: Event) => any, useCapture?: boolean): void;
  // tslint:disable-next-line:unified-signatures
  addEventListener(type: 'advertisementreceived', listener: (this: this, ev: Event) => any, useCapture?: boolean): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
}

interface Bluetooth extends EventTarget, BluetoothDeviceEventHandlers, CharacteristicEventHandlers, ServiceEventHandlers {
  getAvailability(): Promise<boolean>;
  // tslint:disable-next-line:member-ordering
  onavailabilitychanged: (this: this, ev: Event) => any;
  // tslint:disable-next-line:member-ordering
  readonly referringDevice?: BluetoothDevice;
  requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>;
  addEventListener(type: 'availabilitychanged', listener: (this: this, ev: Event) => any, useCapture?: boolean): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
}

interface Navigator {
  bluetooth: Bluetooth;
}

const bluetooth = (navigator as any as Navigator).bluetooth

@Injectable({
  providedIn: 'root'
})
export class BleBrowserService {

  constructor(
    private bleConfigService: BleConfigService,
    private bleStateService: BleStateService
  ) { }

  private ptpV2: PTPV2 = null

  private _command$: Subject<Buffer> = new Subject<Buffer>()
  private _rotate$: Subject<Buffer> = new Subject<Buffer>()
  private _attitude$: Subject<Buffer> = new Subject<Buffer>()

  private commandWriteCharacteristic: BluetoothRemoteGATTCharacteristic

  private otaService: BluetoothRemoteGATTService = null
  private _otaProgress$ = new Subject<DfuProgress>()

  public that = this

  //根据指定前缀扫描外围设备
  public async startScan(namePrefix: string): Promise<Observable<BluetoothDevice>> {
    this.bleStateService.scanning = true
    const device = await bluetooth.requestDevice({
      filters: [{ namePrefix }],
      optionalServices: [this.bleConfigService.DATA_SERVICE_UUID, this.bleConfigService.OTA_SERVICE_UUID]
    });
    this.bleStateService.devices[device.id] = device
    const subject = new Subject<BluetoothDevice>()
    setTimeout(() => {
      subject.next(device)
      subject.complete()
    }, 100)
    return subject
  }

  //根据设备id连接外围设备
  public async connect(deviceId: string, enableDebug: boolean): Promise<Observable<Buffer>> {
    //如果已经连接了设备，则将其断开
    if (this.bleStateService.connectedDevice) {
      this.disconnect(this.bleStateService.connectedDevice.id)
    }

    this.ptpV2 = new PTPV2()
    this._command$ = new Subject<Buffer>()
    this._rotate$ = new Subject<Buffer>()
    this._attitude$ = new Subject<Buffer>()

    //连接外设上的gatt server
    const server = await (this.bleStateService.devices[deviceId] as BluetoothDevice).gatt.connect()
    //获得service
    const dataService = await server.getPrimaryService(this.bleConfigService.DATA_SERVICE_UUID)
    this.otaService = await server.getPrimaryService(this.bleConfigService.OTA_SERVICE_UUID)
    //获得4个charateristic
    this.commandWriteCharacteristic = await dataService.getCharacteristic(this.bleConfigService.COMMAND_WRITE_CHARACTERISTIC_UUID);
    const commandReadCharacteristic = await dataService.getCharacteristic(this.bleConfigService.COMMAND_READ_CHARACTERISTIC_UUID);
    const rotateReadCharacteristic = await dataService.getCharacteristic(this.bleConfigService.ROTATE_READ_CHARACTERISTIC_UUID);
    const attitudeReadCharacteristic = await dataService.getCharacteristic(this.bleConfigService.ATTITUDE_READ_CHARACTERISTIC_UUID);

    (this.bleStateService.devices[deviceId] as BluetoothDevice).addEventListener('gattserverdisconnected', this.disconnectCallback)

    commandReadCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
      const buff = Buffer.from(event.target.value.buffer) 
      this.ptpV2.input(buff)
      let recv: Buffer | null
      while (recv = this.ptpV2.receive()) {
        this._command$.next(recv) 
        Debug.receive(bufferToHex(recv))
      }
    })

    rotateReadCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
      const buff = Buffer.from(event.target.value.buffer)
      this._rotate$.next(buff)
      // Debug.rotate(bufferToHex(buff))
    })

    attitudeReadCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
      const buff = Buffer.from(event.target.value.buffer)
      this._attitude$.next(buff)
      // Debug.attitude(bufferToHex(buff))
    })

    await commandReadCharacteristic.startNotifications()
    await rotateReadCharacteristic.startNotifications()
    await attitudeReadCharacteristic.startNotifications()

    if (enableDebug) {
      const debugCharacteristic = await dataService.getCharacteristic(this.bleConfigService.DEBUG_CHARACTERISTIC_UUID)
      debugCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const buff = Buffer.from(event.target.value.buffer)
        Debug.debugInfo(buff.toString())
      })
      await debugCharacteristic.startNotifications()
    }

    this.bleStateService.connectedDevice = this.bleStateService.devices[deviceId]

    return this._command$
  }

  public async disconnect(deviceId: string): Promise<void> {
    await (this.bleStateService.devices[deviceId] as BluetoothDevice).gatt.disconnect()
    this.clearConnection()
  }

  private clearConnection() {
    this.ptpV2 = null
    this.bleStateService.connectedDevice = null
    this.commandWriteCharacteristic = null
    this.otaService = null
    if (this._command$) {
      this._command$.complete()
      this._command$ = null
    }
    if (this._attitude$) {
      this._attitude$.complete()
      this._attitude$ = null
    }
    if (this._rotate$) {
      this._rotate$.complete()
      this._rotate$ = null
    }
  }

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
    return this._otaProgress$
  }

  public async send(buff: Buffer): Promise<void> {
    if (!this.bleStateService.connected) {
      throw new Error('还未连接设备，请先连接设备再发送数据')
    }
    this.ptpV2.send(buff) 
    let outputBuff: Buffer | null
    while (outputBuff = this.ptpV2.output()) {
      await this.commandWriteCharacteristic.writeValue(outputBuff) 
    }
  }

  public disconnectCallback = (event) => {
    this._command$.error(event)
    this.clearConnection()
    this.bleStateService.connectionStatus$.next(this.bleStateService.connectedDevice? true: false)
  }

  public async ota(otaFileBuffer: Buffer, mtu: number) {
    const receiveData$ = new Subject<Buffer>()

    let dfuControlCharacteristic: BluetoothRemoteGATTCharacteristic
    let dfuPacketCharacteristic: BluetoothRemoteGATTCharacteristic

    const prepareBle = async () => {
      dfuControlCharacteristic = await this.otaService.getCharacteristic(this.bleConfigService.DFU_CONTROL_CHARACTERISTIC_UUID)
      dfuPacketCharacteristic = await this.otaService.getCharacteristic(this.bleConfigService.DFU_PACKET_CHARACTERISTIC_UUID)
      dfuControlCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const buff = Buffer.from(event.target.value.buffer)
        receiveData$.next(buff)
      })
      await dfuControlCharacteristic.startNotifications()
    }

    const writeCommandImpl = async (buff: Buffer) => {
      await dfuControlCharacteristic.writeValue(buff)
    }
    const writeDataImpl = async (buff: Buffer) => {
      await dfuPacketCharacteristic.writeValue(buff)
    }

    const onProgress = (stage: number, sendBytes: number, totalBytes: number) => {
      this._otaProgress$.next({ stage, sendBytes, totalBytes })
    }

    const updates = await getUpdatesFromZipFileBytes(otaFileBuffer)
    const bleTransport = new DfuTransportAnyBle(prepareBle, writeCommandImpl, writeDataImpl, receiveData$, mtu, onProgress)

    const dfu = new DfuOperation(updates, bleTransport);
    await dfu.start(true)

  }
}
