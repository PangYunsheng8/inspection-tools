import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Buffer } from 'buffer';
import { filter, map, tap, pairwise, sampleTime } from 'rxjs/operators';
import { DfuStage } from 'src/libs/nrf-dfu';
import { InspectionStaticItem } from '../../class/inspection-static-item';
import { BleService } from '../../services/ble.service';
import { BleInspectionItemService } from '../../services/ble-inspection-item.service';
import { BleCurrentStateService } from '../../services/ble-current-state.service';
import { StaticService, Oad } from '../../services/static.service';
var hash = require('hash.js')

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
    private staticService: StaticService,
  ) { }

  @ViewChild('uploadInput')
  private otaFileInput: ElementRef<HTMLInputElement>

  //oad相关
  public otaProgressMode: '' | 'success' = 'success'
  public otaProgressValue = 0
  public mtu = 20
  public otaing = false
  public otaSpeed: number

  //oad检查项
  public oadItem: InspectionStaticItem

  //固件类型
  public type: string = "1"

  public lowestAvlOad: Oad
  public latestAvlOad: Oad
  public latestOadVersion: string

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
  }

  public async inspect() {
    this.oadItem.isInspecting = true
    let { major, minor, patch } = { 
      major: this.bleCurrentStateService.major,
      minor: this.bleCurrentStateService.minor,
      patch: this.bleCurrentStateService.patch,
    }
    
    //分别获取当前版本，最低可用版本和最新版本的OAD固件信息
    // let currOad = await this.staticService.getOadByVersion({ type: this.type, major: major, minor: minor, patch: patch })
    // this.lowestAvlOad = await this.staticService.getLowestAvailableOad(this.type) 
    // this.latestAvlOad = await this.staticService.getLatestAvailableOad(this.type)
    let currOad = await this.staticService.getOadByVersionGQL({ type: this.type, major: major, minor: minor, patch: patch })
    this.lowestAvlOad = await this.staticService.getLowestAvlOadGQL(this.type) 
    this.latestAvlOad = await this.staticService.getLatestAvlOadGQL(this.type)

    //当前版本，最低可用版本和最新版本的OAD版本号
    this.oadItem.currentState = currOad? `${major}.${minor}.${patch}` : "当前版本不存在!"
    this.oadItem.validState = this.lowestAvlOad? `${this.lowestAvlOad.major}.${this.lowestAvlOad.minor}.${this.lowestAvlOad.patch}` : "最低可用版本不存在！"
    this.latestOadVersion = this.latestAvlOad? `${this.latestAvlOad.major}.${this.latestAvlOad.minor}.${this.latestAvlOad.patch}` : "无最新可用版本！"

    //检查OAD版本是否符合要求
    const { result, description } = this.inspectOad(currOad, this.lowestAvlOad)
    this.oadItem.isInspected = true
    this.oadItem.isInspecting = false
    this.oadItem.inspectionResult = result
    this.oadItem.description = description
  }

  public inspectOad(currOad: Oad, lowestAvailableOad: Oad) {
    let result, description
    if (!currOad) return { result: false, description: "不存在当前版本！"}
    if (!lowestAvailableOad) return { result: false, description: "不存在最低可用版本！"}

    if (this.isHigerThanLowest(currOad, lowestAvailableOad)) {
      if (currOad.isAvailable == true) return { result: true, description: "当前OAD版本合法且可用！"}
      else return { result: false, description: "当前版本不可用！" }
    } else return { result: false, description: "当前版本过低！" }
  }

  //检查当前版本是否高于最低可用版本
  public isHigerThanLowest(currOad: Oad, lowestAvailableOad: Oad): boolean {
    if (currOad.major >= lowestAvailableOad.major && 
      currOad.minor >= lowestAvailableOad.minor && 
      currOad.patch >= lowestAvailableOad.patch) {
        return true
      }
    return false
  }

  //检查OAD固件的哈希编码与数据库是否一致
  public checkHashCode(fileBuff: ArrayBuffer, hashCode: string): boolean {
    var currhashCode = hash.sha256().update(fileBuff).digest('hex')
    if (currhashCode == hashCode) return true
    else return false
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
      let hashCodeCheckRes = this.checkHashCode(fileBuff, this.latestAvlOad.hashCode)
      if (!hashCodeCheckRes) return alert('文件损坏，请重新下载！')
    } catch (err) {
      return alert('检测到该文件不可用或不是最新可用版本，无法更新！')
    }
    const { result, description } = this.inspectOad(this.latestAvlOad, this.lowestAvlOad)
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
