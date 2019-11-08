import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Buffer } from 'buffer';
import { filter, map, tap, pairwise, sampleTime } from 'rxjs/operators';
import { DfuStage } from 'src/libs/nrf-dfu';

import { InspectionStaticItem } from '../../class/inspection-static-item';

import { BleService } from '../../services/ble.service';
import { BleInspectionService } from '../../services/ble-inspection.service';
import { BleInspectionItemService } from '../../services/ble-inspection-item.service';
import { BleCurrentStateService } from '../../services/ble-current-state.service';
import { BleValidService } from '../../services/ble-valid.service';

@Component({
  selector: 'app-oad-item-inspection',
  templateUrl: './oad-item-inspection.component.html',
  styleUrls: ['./oad-item-inspection.component.scss']
})
export class OadItemInspectionComponent implements OnInit {

  constructor(
    private bleService: BleService,
    private bleInspectionService: BleInspectionService,
    private bleInspectionItemService: BleInspectionItemService,
    private bleCurrentStateService: BleCurrentStateService,
    private bleValidService: BleValidService,
  ) { }

  @ViewChild('uploadInput')
  private otaFileInput: ElementRef<HTMLInputElement>

  //oad相关
  public otaProgressMode: '' | 'success' = 'success'
  public otaProgressValue = 0
  public mtu = 20
  public otaing = false
  public otaSpeed: number

  public oadItem: InspectionStaticItem

  ngOnInit() {
    this.initInspectionItem()
    this.bleService.otaProgress$.subscribe(i => {
      this.otaProgressMode = i.stage === DfuStage.PREPARE ? '' : 'success'
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

  public async inspectOad() {
    let major = this.bleCurrentStateService.major
    let minor = this.bleCurrentStateService.minor
    let patch = this.bleCurrentStateService.patch
    this.oadItem.currentState = major+'.'+minor+'.'+patch
    this.oadItem.validState = this.bleValidService.VERSION_VALID
    this.oadItem.isInspecting = true
    const { result, description } = await this.bleInspectionService.inspectOad(
      this.oadItem.currentState, 
      this.oadItem.validState
    )
    this.oadItem.isInspected = true
    this.oadItem.isInspecting = false
    this.oadItem.inspectionResult = result
    this.oadItem.description = description

    this.bleInspectionItemService.inspectionItem$.next(this.oadItem.itemId)
  }

  //初始化待检测项目信息
  public initInspectionItem() {
    this.oadItem = this.bleInspectionItemService.oadItem
  }

  //清除当前检查项目的信息
  public clearInspectionItem() {
    this.bleInspectionItemService.oadItem.isInspected = false
    this.bleInspectionItemService.oadItem.inspectionResult = null
    this.bleInspectionItemService.oadItem.description = null
    this.bleInspectionItemService.oadItem.currentState = null
    this.bleInspectionItemService.oadItem.validState = null

    this.bleInspectionItemService.inspectionItem$.next(this.oadItem.itemId)
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
      this.otaProgressMode = 'success'
      this.otaProgressValue = 0
      this.otaing = false
    }
  }

  public handle(e) {
    this.mtu = e
  }

}
