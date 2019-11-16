import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Buffer } from 'buffer';
import { filter, map, tap, pairwise, sampleTime } from 'rxjs/operators';
import { DfuStage } from 'src/libs/nrf-dfu';
import { InspectionStaticItem } from '../../class/inspection-static-item';
import { BleService } from '../../services/ble.service';
import { BleInspectionItemService } from '../../services/ble-inspection-item.service';
import { BleCurrentStateService } from '../../services/ble-current-state.service';
import { BleValidService } from '../../services/ble-valid.service';
import { OadInspectionService, Oad } from '../../services/oad-inspection.service';

@Component({
  selector: 'app-oad-item-inspection',
  templateUrl: './oad-item-inspection.component.html',
  styleUrls: ['./oad-item-inspection.component.scss']
})
export class OadItemInspectionComponent implements OnInit {

  constructor(
    private bleService: BleService,
    private bleInspectionItemService: BleInspectionItemService,
    private bleCurrentStateService: BleCurrentStateService,
    private bleValidService: BleValidService,
    private oadInspectionService: OadInspectionService,
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

  public type: string = "1"

  public lowestAvlOad: Oad
  public latestAvlOad: Oad

  public latestOadVersion: string

  public selectedFile: boolean 

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
    this.oadItem.isInspecting = true
    let { major, minor, patch } = { 
      major: this.bleCurrentStateService.major,
      minor: this.bleCurrentStateService.minor,
      patch: this.bleCurrentStateService.patch,
    }
     
    let currOad = await this.oadInspectionService.getOadByVersion({ type: this.type, major: major, minor: minor, patch: patch })
    this.lowestAvlOad = await this.oadInspectionService.getLowestAvailableOad(this.type) 
    this.latestAvlOad = await this.oadInspectionService.getLatestAvailableOad(this.type)

    if (currOad) this.oadItem.currentState = `${major}.${minor}.${patch}`
    else this.oadItem.currentState = "当前版本不存在!"

    if (this.lowestAvlOad) this.oadItem.validState = `${this.lowestAvlOad.major}.${this.lowestAvlOad.minor}.${this.lowestAvlOad.patch}`
    else this.oadItem.validState = "最低可用版本不存在！"

    if (this.latestAvlOad) this.latestOadVersion = `${this.latestAvlOad.major}.${this.latestAvlOad.minor}.${this.latestAvlOad.patch}`
    else this.latestOadVersion = "无最新可用版本！"

    const { result, description} = this.oadInspectionService.inspectOad(currOad, this.lowestAvlOad)
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

    this.latestOadVersion = null

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
    let file = this.otaFileInput.nativeElement.files[0]
    if (file.size > 100000) {  //文件不超过100k
      return alert('文件太大，请重新选择！')
    }
    let fileBuff
    try {
      fileBuff = await getFileBuffer(file)
    } catch (err) {
      return alert('请先选择OTA文件')
    }
    try {
      let hashCodeCheckRes = this.oadInspectionService.checkHashCode(fileBuff, this.latestAvlOad.hash_code)
      if (!hashCodeCheckRes) return alert('文件损坏，请重新下载！')
    } catch (err) {
      return alert('检测到该文件不可用或不是最新可用版本，无法更新！')
    }
    const { result, description } = this.oadInspectionService.inspectOad(this.latestAvlOad, this.lowestAvlOad)
    if (result) {
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
    } else {
      return alert(description)
    }
  }

  public selectFile() {
    this.selectedFile = true
  }

  public downloadOAD() {
    try{
      window.open(this.latestAvlOad.path)
    } catch(err) {
      return alert('无法下载，无最新可用版本！')
    }
  }

  public getTransferSize(e) {
    this.mtu = e
  }

}
