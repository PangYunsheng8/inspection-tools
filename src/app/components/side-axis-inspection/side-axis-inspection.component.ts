import { Component, ViewChild, OnInit, Output, EventEmitter} from '@angular/core';
import { Debug } from 'src/libs/debug';
import { Quaternion } from 'three';
import { CubeComponent } from '../cube/cube.component';

import { InspectionDynamicItem } from '../../class/inspection-dynamic-item';

import { AttitudeService } from '../../services/attitude.service';
import { CubeRotateService } from '../../services/cube-rotate.service';
import { BleCommandService } from '../../services/ble-command.service';
import { BleCurrentStateService } from '../../services/ble-current-state.service';
import { BleInspectionService } from '../../services/ble-inspection.service';
import { BleStateService } from '../../services/ble-state.service';

const AXIS_COLOR_MAP = ['黄', '橘', '蓝', '红', '绿', '白',]

@Component({
  selector: 'app-side-axis-inspection',
  templateUrl: './side-axis-inspection.component.html',
  styleUrls: ['./side-axis-inspection.component.scss']
})
export class SideAxisInspectionComponent implements OnInit {

  constructor(
    private bleCommandService: BleCommandService,
    private ahrsService: AttitudeService,
    private cubeRotateService: CubeRotateService,
    private bleCurrentStateService: BleCurrentStateService,
    private bleInspectionService: BleInspectionService,
    private bleStateService: BleStateService,
  ) { }

  @Output() finishedEvent = new EventEmitter<boolean>();

  @ViewChild('cube')
  cube: CubeComponent;

  //上一步旋转的face, 上一步旋转的方向
  public lastRotateFace: number = 0
  public lastRotateDirection: number = 1  //1代表顺时针,-1代表逆时针

  //滤波器参数
  public coderErrorCount: number
  public axisInterfereCount: number

  //6个轴面的检查项
  public faceItems: Array<InspectionDynamicItem> = new Array<InspectionDynamicItem>()

  //已检查的项目个数
  public hasInspectedItems: number = 0
  //最终检查结果
  public finalResult: boolean = true

  //订阅
  public attitudeSubscription
  public attitudeRawSubscription
  public rotateSubscription

  ngOnInit() {

    this.bleStateService.connectionStatus$.subscribe(connected => {
      if (connected) { 
        this.coderErrorCount = this.bleCurrentStateService.coderErrorCount
      }
      else if (!connected) {
        this.clearInspectionItem()
        this.lastRotateFace = 0
        this.lastRotateDirection = 1
        this.hasInspectedItems = 0
      }
    })

    this.bleInspectionService.dynamicInspectItem$.subscribe(async item => {
      if (item === 1) {
        this.subscribeCubeData()
      } else {
        this.unsubscribeCubeData()
      }
    }, err => {
      console.log(err)
    })

    this.initInspectionItem()
  }

  public subscribeCubeData() {
    (window as any).times = [];
    (window as any).data = [];
    (window as any).rotateCounter = 0;
    let counter = 0

    this.attitudeSubscription = this.ahrsService.attitude$.subscribe(i => {
      // Debug.attitude(JSON.stringify(i))
      this.cube.quaternion = new Quaternion(i.x, i.y, i.z, i.w)
    })
    this.attitudeRawSubscription = this.ahrsService.attitudeRaw$.subscribe(i => {
      (window as any).data.push({ counter: counter++, time: Date.now(), data: i })
      // Debug.attitudeRaw(JSON.stringify(i, null, 2))
    })
    this.rotateSubscription = this.cubeRotateService.rotate$.subscribe(i => {
      (window as any).rotateCounter += i.circle
      // Debug.resolve(JSON.stringify({ face: i.face, circle: i.circle, color: AXIS_COLOR_MAP[i.face], time: i.second + i.counter / 65536 }))
      this.cube.rotateFace(i.face, i.circle, 0)
      this.inspectItem(i.face, i.circle)
    })
  }

  public unsubscribeCubeData() {
    this.attitudeSubscription.unsubscribe()
    this.attitudeRawSubscription.unsubscribe()
    this.rotateSubscription.unsubscribe()
  }

  public async inspectItem(currRotateFace: number, currRotateCircle: number) {
    this.faceItems[currRotateFace].isInspecting = true

    //判断当前旋转轴是否与上次旋转轴相同
    //如果与上次旋转的轴不是同一个轴, 则判断之前的轴是否已经检查完成,如果检查完成,不做处理,如果没检查完,需要重新旋转
    if (this.lastRotateFace != currRotateFace) {  
      this.faceItems[this.lastRotateFace].isInspecting = false
      if (!this.faceItems[this.lastRotateFace].isInspected) {
        this.faceItems[this.lastRotateFace].ClockwiseAngle = 0
        this.faceItems[this.lastRotateFace].CounterclockwiseAngle = 0
      }
    }

    //判断相同轴上,当前旋转方向是否与上次旋转方向相同
    let currRotateDirection = currRotateCircle > 0? 1: -1
    console.log(currRotateCircle)
    // console.log(this.lastRotateDirection + ' | ' + currRotateDirection + ' | ' + currRotateCircle)
    if (this.lastRotateDirection != currRotateDirection && this.lastRotateFace == currRotateFace) {
      // console.log('!!!')
      if (this.faceItems[this.lastRotateFace].ClockwiseAngle != 360) this.faceItems[this.lastRotateFace].ClockwiseAngle = 0
      if (this.faceItems[this.lastRotateFace].CounterclockwiseAngle != 360) this.faceItems[this.lastRotateFace].CounterclockwiseAngle = 0
    }
    
    //分别记录顺时针和逆时针的旋转角度
    if (currRotateCircle > 0) {
      // console.log('before')
      // console.log(this.faceItems[currRotateFace].ClockwiseAngle)
      this.faceItems[currRotateFace].ClockwiseAngle += currRotateCircle/3.6
      // console.log('after')
      // console.log(this.faceItems[currRotateFace].ClockwiseAngle)
      if (this.faceItems[currRotateFace].ClockwiseAngle >= 360) this.faceItems[currRotateFace].ClockwiseAngle = 360
    } else {
      this.faceItems[currRotateFace].CounterclockwiseAngle -= currRotateCircle/3.6
      if (this.faceItems[currRotateFace].CounterclockwiseAngle >= 360) this.faceItems[currRotateFace].CounterclockwiseAngle = 360
    }

    //判断当前轴是否已经完成了两次360度旋转(一次顺,一次逆),以及当前轴是否没有被检查过,若是则检查该轴
    if (this.faceItems[currRotateFace].ClockwiseAngle == 360 && 
      this.faceItems[currRotateFace].CounterclockwiseAngle == 360 && 
      !this.faceItems[currRotateFace].isInspected) {
      
      this.faceItems[currRotateFace].isInspected = true //这行代码只能放这里，顺序很重要！！
      //判断该轴是否合格
      const { coderErrorCount } = await this.bleCommandService.getCoderFilterParam()
      console.log('coderErrorCount')
      console.log(coderErrorCount)
      console.log('coderErrorCount1')
      console.log(this.coderErrorCount)
      if (coderErrorCount == this.coderErrorCount) {
        this.faceItems[currRotateFace].inspectionResult = true
        this.faceItems[currRotateFace].description = "合格"
      } else {
        this.faceItems[currRotateFace].inspectionResult = false
        this.faceItems[currRotateFace].description = `${AXIS_COLOR_MAP[currRotateFace]}色面不合格`
        this.finalResult = false
      }
      this.coderErrorCount = coderErrorCount

      this.hasInspectedItems += 1
      if (this.hasInspectedItems === 6) {
        this.finishedEvent.emit(this.finalResult)
      }
    }

    this.lastRotateFace = currRotateFace
    this.lastRotateDirection = currRotateDirection
  }

  public initInspectionItem() {
    for (let i = 0; i < 6; i++){
      let faceItem = new InspectionDynamicItem()
      faceItem.itemName = AXIS_COLOR_MAP[i]
      this.faceItems.push(faceItem)
    }
  }

  public clearInspectionItem() {
    for (let i = 0; i < 6; i++) {
      this.faceItems[i] = new InspectionDynamicItem()
      this.faceItems[i].itemName = AXIS_COLOR_MAP[i]
    }
  }

}

