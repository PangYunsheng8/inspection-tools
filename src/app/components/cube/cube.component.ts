import { Component, OnInit, ElementRef, ViewChild, Input, AfterViewInit } from '@angular/core';
import { Quaternion } from 'three';
import { CameraState } from '../../../libs/3d-cube/GLObject';
import * as THREE from 'three';
import { AnyCubeFreemodeScene } from '../../../libs/3d-cube/MagicCubeAny/FreemodeScene/AnyCubeFreemodeScene';
import { AnyColorTable } from 'src/libs/3d-cube/MagicCubeAny/ColorRef/AnyColorTable';
import { Assets } from '../../../libs/3d-cube/Assets';
import { CameraViewState } from '../../../libs/3d-cube/CameraViewState';
import { CubeState } from 'src/libs/cube-state';
import { BleInspectionService } from '../../services/ble-inspection.service';
@Component({
  selector: 'app-cube',
  templateUrl: './cube.component.html',
  styleUrls: ['./cube.component.scss']
})
export class CubeComponent implements AfterViewInit {

  @ViewChild('glContainer')
  private glContainer: ElementRef<Element>
  private cube: AnyCubeFreemodeScene;
  private assets: Assets;

  private _height = 300
  private _width = 300

  private currPauseCount = [0, 0, 0, 0, 0, 0]

  @Input()
  public set height(value) {
    this._height = value
    this.resize(this._width, this._height)

  }
  @Input()
  public set width(value) {
    this._width = value
    this.resize(this._width, this._height)
  }
  public style = { 'height.px': this._height, 'width.px': this._width }
  constructor(private bleInspectionService: BleInspectionService) { }

  ngAfterViewInit() {
    const viewState = new CameraViewState();
    viewState.position = new THREE.Vector3(0, 1, 0).normalize().multiplyScalar(10);
    viewState.quaternion = new THREE.Quaternion(0, 0, 0, 1);
    this.cube = new AnyCubeFreemodeScene(this.glContainer.nativeElement, 3, viewState, (window as any).assets, false);
    this.bleInspectionService.cube = this.cube
    this.resize(this._width, this._height);
    setInterval(() => {
      this.cube.RenderEnable();
    }, 20);
  }

  private getRandom(min: number, max: number): number {
    const range = max - min;
    const random = Math.random();
    return (min + Math.round(random * range));
  }
  private resize(width: number, height: number) {
    this.style['width.px'] = width
    this.style['height.px'] = height
    if (this.cube) {
      this.cube.resize(width, height)
    }
  }
  @Input()
  public set quaternion(rot: Quaternion) {
    this.cube.updateAttitude(rot, 0.5)
  }
  public rotateFace(face: number, circle: number, animation: number): void {
    this.cube.rotateFace(face, circle, animation)
  }
  @Input()
  public set cameraState(state: CameraState) {
    if (this.cube) {
      this.cube.setCameraState(state)
    }
  }

  public updateCameraRadius(newRadius: number) {
    this.cube.UpdateCameraRadius(newRadius);
  }

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
