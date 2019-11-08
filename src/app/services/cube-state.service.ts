import { Injectable } from '@angular/core';
import { AnyCubeFreemodeScene } from '../../libs/3d-cube/MagicCubeAny/FreemodeScene/AnyCubeFreemodeScene';
import { CubeState } from 'src/libs/cube-state';
import { AnyColorTable } from 'src/libs/3d-cube/MagicCubeAny/ColorRef/AnyColorTable';

@Injectable({
  providedIn: 'root'
})
export class CubeStateService {

  constructor() { }

  public cube: AnyCubeFreemodeScene;

  private currPauseCount = [0, 0, 0, 0, 0, 0]

  public async setCubeState(cs: CubeState, pauseCounts: Array<number> = [0, 0, 0, 0, 0, 0]) {
    for (let i = 0; i < this.currPauseCount.length; i++) {
      for (let j = 0; j < Math.abs(this.currPauseCount[i]); j++) {
        // 逆向将魔方转回原来位置
        this.cube.rotateFace(i, this.currPauseCount[i] < 0 ? 36 : -36, 0)
      }
    }
    // 设置魔方颜色
    this.cube.SetColorByColorTable(AnyColorTable.fromMatrix(3, cs))
    for (let i = 0; i < pauseCounts.length; i++) {
      for (let j = 0; j < Math.abs(pauseCounts[i]); j++) {
        // 将魔方转到目标位置
        this.cube.rotateFace(i, pauseCounts[i] < 0 ? -36 : 36, 0)
      }
    }
    this.currPauseCount = JSON.parse(JSON.stringify(pauseCounts))
  }
}
