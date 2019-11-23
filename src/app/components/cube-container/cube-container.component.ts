import { Component, OnInit, ViewChild } from '@angular/core';
import { CubeComponent } from '../cube/cube.component';
import { Quaternion } from 'three';
import { AttitudeService } from '../../services/attitude.service';
import { CubeRotateService } from '../../services/cube-rotate.service';

@Component({
  selector: 'app-cube-container',
  templateUrl: './cube-container.component.html',
  styleUrls: ['./cube-container.component.scss']
})
export class CubeContainerComponent implements OnInit {

  constructor(
    private ahrsService: AttitudeService,
    private cubeRotateService: CubeRotateService,
  ) { }

  @ViewChild('cube')
  cube: CubeComponent;

  ngOnInit() {
    (window as any).times = [];
    (window as any).data = [];
    (window as any).rotateCounter = 0;
    let counter = 0

    this.ahrsService.attitude$.subscribe(i => {
      this.cube.quaternion = new Quaternion(i.x, i.y, i.z, i.w)
    })
    this.ahrsService.attitudeRaw$.subscribe(i => {
      (window as any).data.push({ counter: counter++, time: Date.now(), data: i })
    })
    this.cubeRotateService.rotate$.subscribe(i => {
      (window as any).rotateCounter += i.circle
      this.cube.rotateFace(i.face, i.circle, 0)
    })
  }

}
