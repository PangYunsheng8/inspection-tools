import { Injectable } from '@angular/core';
import { CubeState, Color } from 'src/libs/cube-state';
import { BleCommandService } from './ble-command.service';
import { CubeStateService } from './cube-state.service';

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

@Injectable({
  providedIn: 'root'
})
export class CstateInspectionService {

  constructor(
    private bleCommandService: BleCommandService,
    private cubeStateService: CubeStateService
  ) { }

  public inspectCstate(): Promise<InspectResult> {
    return new Promise<InspectResult>(async (resolve, reject) => {
      let result 
      let description
      try {
        await this.bleCommandService.setCubeState({
          state: ORIGIN_CUBE,
          pause: [0, 0, 0, 0, 0, 0]
        })
        this.cubeStateService.setCubeState(ORIGIN_CUBE)
        result = true
        description = "已初始化逻辑魔方姿态！"
      } catch(err) {
        result = false
        description = `初始化逻辑魔方姿态失败！${err}`
      } finally {
        resolve( {result, description} )
      }
    })
  }
}
