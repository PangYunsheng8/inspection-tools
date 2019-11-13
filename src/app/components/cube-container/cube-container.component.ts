import { Component, OnInit, ViewChild } from '@angular/core';
import { CubeComponent } from '../cube/cube.component';
import { Quaternion } from 'three';

import { AttitudeService } from '../../services/attitude.service';
import { CubeRotateService } from '../../services/cube-rotate.service';
import { BleInspectionItemService } from '../../services/ble-inspection-item.service';

@Component({
  selector: 'app-cube-container',
  templateUrl: './cube-container.component.html',
  styleUrls: ['./cube-container.component.scss']
})
export class CubeContainerComponent implements OnInit {

  constructor(
    private ahrsService: AttitudeService,
    private cubeRotateService: CubeRotateService,
    private bleInspectionItemService: BleInspectionItemService,
  ) { }

  @ViewChild('cube')
  cube: CubeComponent;

  ngOnInit() {
    (window as any).times = [];
    (window as any).data = [];
    (window as any).rotateCounter = 0;
    let counter = 0

    this.ahrsService.attitude$.subscribe(i => {
      // Debug.attitude(JSON.stringify(i))
      this.cube.quaternion = new Quaternion(i.x, i.y, i.z, i.w)
    })
    this.ahrsService.attitudeRaw$.subscribe(i => {
      (window as any).data.push({ counter: counter++, time: Date.now(), data: i })
      // Debug.attitudeRaw(JSON.stringify(i, null, 2))
    })
    this.cubeRotateService.rotate$.subscribe(i => {
      (window as any).rotateCounter += i.circle
      // Debug.resolve(JSON.stringify({ face: i.face, circle: i.circle, color: AXIS_COLOR_MAP[i.face], time: i.second + i.counter / 65536 }))
      this.cube.rotateFace(i.face, i.circle, 0)
      this.bleInspectionItemService.rotateParams$.next({face: i.face, circle: i.circle})
    })
  }

}
