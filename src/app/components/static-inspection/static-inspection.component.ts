import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Debug } from 'src/libs/debug';
import { Buffer } from 'buffer';
import { filter, map, tap, pairwise, sampleTime } from 'rxjs/operators';
import { DfuStage } from 'src/libs/nrf-dfu';

import { InspectionStaticItem } from '../../class/inspection-static-item';

import { BleValidService } from '../../services/ble-valid.service';
import { BleInspectionService } from '../../services/ble-inspection.service';
import { BleStateService } from '../../services/ble-state.service';
import { BleCurrentStateService } from '../../services/ble-current-state.service';
import { BleInspectionItemService } from '../../services/ble-inspection-item.service';
import { BleService } from '../../services/ble.service';

@Component({
  selector: 'app-static-inspection',
  templateUrl: './static-inspection.component.html',
  styleUrls: ['./static-inspection.component.scss']
})
export class StaticInspectionComponent implements OnInit {

  constructor(
    private bleValidService: BleValidService,
    private bleInspectionService: BleInspectionService,
    private bleStateService: BleStateService,
    private bleCurrentStateService: BleCurrentStateService,
    private bleInspectionItemService: BleInspectionItemService,
    private bleService: BleService
  ) { }

  @ViewChild('uploadInput')
  private otaFileInput: ElementRef<HTMLInputElement>

  //电池电压
  public voltageItem: InspectionStaticItem
  public voltageIcon: string = "#icon-dengdaiqueren"

  //oad相关
  public otaProgressMode: 'indeterminate' | 'determinate' = 'determinate'
  public otaProgressValue = 0
  public mtu = 20
  public otaing = false
  public otaSpeed: number

  ngOnInit() {
    this.initInspectionItem()

    this.bleStateService.connectionStatus$.subscribe(connected => {
      if (connected) {
        this.inspectAll()
      } else if (!connected) {
        this.clearInspectionItem()
        this.voltageIcon = "#icon-dengdaiqueren"
      }
    })

    this.bleService.otaProgress$.subscribe(i => {
      this.otaProgressMode = i.stage === DfuStage.PREPARE ? 'indeterminate' : 'determinate'
      this.otaProgressValue = Math.floor(i.sendBytes / i.totalBytes * 100)
    })
    this.bleService.otaProgress$.pipe(
      map(i => i.sendBytes),
      sampleTime(100),
      pairwise(),
      map(i => i[1] - i[0]),
      filter(i => i >= 0)
    ).subscribe(i => {
      this.otaSpeed = i / 1024 * 10
    })
  }

  public async inspectAll() {
    await this.inspectVoltage()
  }

  public async inspectVoltage() {
    this.voltageItem.currentState = this.bleCurrentStateService.voltage
    this.voltageItem.validState = this.bleValidService.VOLTAGE_VALID
    this.voltageItem.isInspecting = true
    const { result, description } = this.bleInspectionService.inspectVoltage(
      this.voltageItem.currentState, 
      this.voltageItem.validState
    )
    this.voltageItem.isInspected = true
    this.voltageItem.isInspecting = false
    this.voltageItem.inspectionResult = result
    this.voltageItem.description = description

    if (this.voltageItem.inspectionResult) this.voltageIcon = "#icon-chenggong"
    else this.voltageIcon = "#icon-shibai"

    this.bleInspectionItemService.staticItem$.next(this.voltageItem.id)
  }

  //初始化待检测项目信息
  public initInspectionItem() {
    this.voltageItem = this.bleInspectionItemService.voltageItem
  }

  //清除当前检查项目的信息
  public clearInspectionItem() {
    this.bleInspectionItemService.voltageItem.isInspected = false
    this.bleInspectionItemService.voltageItem.inspectionResult = null
    this.bleInspectionItemService.voltageItem.description = null
    this.bleInspectionItemService.voltageItem.currentState = null
    this.bleInspectionItemService.voltageItem.validState = null

    this.bleInspectionItemService.staticItem$.next(this.voltageItem.id)
  }

  public async startOTA() {
    function getFileBuffer(file: File) {
      return new Promise<Buffer>((resolve, reject) => {
        const reader = new FileReader()

        function onLoadEnd(e) {
          if (reader.removeEventListener) {
            reader.removeEventListener('loadend', onLoadEnd, false)
          } else {
            reader.onloadend = null
          }
          if (e.error) reject(e.error)
          else resolve(Buffer.from(reader.result as ArrayBuffer))
        }

        if (reader.addEventListener) {
          reader.addEventListener('loadend', onLoadEnd, false)
        } else {
          reader.onloadend = onLoadEnd
        }
        reader.readAsArrayBuffer(file)
      })
    }
    let fileBuff
    try {
      fileBuff = await getFileBuffer(this.otaFileInput.nativeElement.files[0])
      console.log(fileBuff)
      console.log(this.mtu)
    } catch (err) {
      return alert('请先选择OTA文件')
    }
    try {
      this.otaing = true
      await this.bleService.ota(fileBuff, +this.mtu)
    } catch (err) {
      alert('OTA 失败,请重试')
      throw err
    } finally {
      this.otaProgressMode = 'determinate'
      this.otaProgressValue = 0
      this.otaing = false
    }
  }
  
  public handle(e) {
    this.mtu = e
  }
}
