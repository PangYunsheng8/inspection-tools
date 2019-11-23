import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CubeState, Color } from 'src/libs/cube-state';
import { ElMessageService } from 'element-angular';
import { BleStateService } from '../../services/ble-state.service';
import { BleCommandService } from '../../services/ble-command.service';
import { CubeRotateService } from '../../services/cube-rotate.service';
import { CalibrationParam } from 'src/libs/sk-protocol-v2';
import { StaticService } from '../../services/static.service';

const SLEEP_STATE: number = 2

const ORIGIN_CUBE: CubeState = [
  [Color.Y, Color.Y, Color.Y, Color.Y, Color.Y, Color.Y, Color.Y, Color.Y, Color.Y],
  [Color.O, Color.O, Color.O, Color.O, Color.O, Color.O, Color.O, Color.O, Color.O],
  [Color.B, Color.B, Color.B, Color.B, Color.B, Color.B, Color.B, Color.B, Color.B],
  [Color.R, Color.R, Color.R, Color.R, Color.R, Color.R, Color.R, Color.R, Color.R],
  [Color.G, Color.G, Color.G, Color.G, Color.G, Color.G, Color.G, Color.G, Color.G],
  [Color.W, Color.W, Color.W, Color.W, Color.W, Color.W, Color.W, Color.W, Color.W]
]

@Component({
  selector: 'app-inspection-result',
  templateUrl: './inspection-result.component.html',
  styleUrls: ['./inspection-result.component.scss']
})
export class InspectionResultComponent implements OnInit {

  constructor(
    private message: ElMessageService,
    private bleStateService: BleStateService,
    private bleCommandService: BleCommandService,
    private cubeRotateService: CubeRotateService,
    private staticService: StaticService
  ) { }

  //视图魔方与手中的魔方是否一致
  public inspRes: boolean
  //魔方是否为还原态
  public recover: boolean
  public isInspected: boolean = false

  //倒计时定时器和倒计时开始时间
  public timer: NodeJS.Timer
  public seconds: number = 3

  ngOnInit() {
    this.bleStateService.connectionStatus$.subscribe(connected => {
      if (!connected) {  //如果魔方断开连接，清空变量
        this.inspRes = null
        this.recover = null
        this.isInspected = false
        this.seconds = 3
        if (this.timer) clearInterval(this.timer)
      }
    })
  }

  //检查一致的事件处理函数
  public async doConsistent() {
    this.inspRes = true
    this.isInspected = true
    await this.checkCubeState()
  }

  //检查不一致的事件处理函数
  public doInConsistent() {  
    this.inspRes = false
    this.isInspected = true
  }

  //重新选择的事件处理函数
  public doReChoose() {
    this.isInspected = false
    this.inspRes = null
    this.recover = null
    this.seconds = 3
    if (this.timer) clearInterval(this.timer)
  }

  //检查魔方是否为还原态
  public async checkCubeState() {
    let { state } = await this.bleCommandService.getCubeState()
    if (state.toString() !== ORIGIN_CUBE.toString()) {
      this.message['warning']('检测到魔方未还原，请还原魔方！！')
    } else {
      this.recover = true
      this.disConnect()
    }
  }

  //通过写入魔方的睡眠状态为2来断开连接
  public disConnect() {
    this.timer = setInterval(async () => {
      this.seconds -= 1
      if (this.seconds === 0) {
        clearInterval(this.timer)
        try {
          await this.bleCommandService.setSleepState(SLEEP_STATE)
        } catch(err) {
          console.log(err)
        }
      }
    }, 1000)
  }
}
