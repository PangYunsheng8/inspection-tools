import { Component, OnInit } from '@angular/core';
import { CubeState, Color } from 'src/libs/cube-state';
import { InspectionStaticItem } from '../../class/inspection-static-item';
import { BleCommandService } from '../../services/ble-command.service';
import { BleInspectionItemService } from '../../services/ble-inspection-item.service';
import { CubeStateService } from '../../services/cube-state.service';

interface InspectResult {
  result: boolean,
  description: string
}

const ORIGIN_CUBE: CubeState = [
  [Color.Y, Color.Y, Color.Y, Color.Y, Color.Y, Color.Y, Color.Y, Color.Y, Color.Y],
  [Color.O, Color.O, Color.O, Color.O, Color.O, Color.O, Color.O, Color.O, Color.O],
  [Color.B, Color.B, Color.B, Color.B, Color.B, Color.B, Color.B, Color.B, Color.B],
  [Color.R, Color.R, Color.R, Color.R, Color.R, Color.R, Color.R, Color.R, Color.R],
  [Color.G, Color.G, Color.G, Color.G, Color.G, Color.G, Color.G, Color.G, Color.G],
  [Color.W, Color.W, Color.W, Color.W, Color.W, Color.W, Color.W, Color.W, Color.W]
]

const PAUSE = [0, 0, 0, 0, 0, 0]

@Component({
  selector: 'app-cstate-item-inspection',
  templateUrl: './cstate-item-inspection.component.html',
  styleUrls: ['./cstate-item-inspection.component.scss']
})
export class CstateItemInspectionComponent implements OnInit {

  constructor(
    private bleInspectionItemService: BleInspectionItemService,
    private bleCommandService: BleCommandService,
    private cubeStateService: CubeStateService
  ) { }

  public cstateItem: InspectionStaticItem

  ngOnInit() {
    this.initInspectionItem()
  }

  public async inspect() {
    this.cstateItem.isInspecting = true
    const { result, description } = await this.inspectCstate()
    this.cstateItem.isInspected = true
    this.cstateItem.isInspecting = false
    this.cstateItem.inspectionResult = result
    this.cstateItem.description = description
  }

  public inspectCstate(): Promise<InspectResult> {
    return new Promise<InspectResult>(async (resolve, reject) => {
      let result 
      let description
      try {
        await this.bleCommandService.setCubeState({
          state: ORIGIN_CUBE,
          pause: PAUSE
        })
        await this.cubeStateService.setCubeState(ORIGIN_CUBE)
        const { state } = await this.bleCommandService.getCubeState()
        if (state.toString() === ORIGIN_CUBE.toString()) {
          result = true
          description = "已初始化逻辑魔方姿态！"
        } else {
          result = false
          description = `初始化逻辑魔方姿态失败!`
        }
      } catch(err) {
        result = false
        description = `初始化逻辑魔方姿态失败！`
      } finally {
        resolve( {result, description} )
      }
    })
  }

  //初始化待检测项目信息
  public initInspectionItem() {
    this.cstateItem = this.bleInspectionItemService.cstateItem
  }
  
  //清除当前检查项目的信息
  public clearInspectionItem() {
    this.bleInspectionItemService.cstateItem.isInspected = false
    this.bleInspectionItemService.cstateItem.inspectionResult = null
    this.bleInspectionItemService.cstateItem.description = null
  }
}
