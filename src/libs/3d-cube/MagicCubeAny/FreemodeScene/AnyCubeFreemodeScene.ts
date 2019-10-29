import { AnyCubeBaseScene } from '../AnyCubeBaseScene';
import { Debug } from '../../Util/Debug';
import * as THREE from 'three';
import { Tools } from '../../Util/Tools';
import { Assets } from '../../Assets';
import { CameraViewState } from '../../CameraViewState';


export class AnyCubeFreemodeScene extends AnyCubeBaseScene {

    // tslint:disable-next-line:max-line-length
    constructor(container: Element, step: number, viewState: CameraViewState, assets: Assets, dragEnable: boolean = true) {
        super(container, step, viewState, assets, dragEnable);
    }

    protected Update() {
    }

    protected UpdateCamera(horizontal: number, vertical: number): void {
        if (this.cameraUpdateEnable) {
            if (horizontal > 1.0) horizontal = 1.0
            if (horizontal < -1.0) horizontal = -1.0;
            if (vertical > 1.0) vertical = 1.0;
            if (vertical < -1.0) vertical = -1.0;
            this.HAngle += horizontal * 0.025;
            this.VAngle += vertical * 0.025;
            if (this.HAngle > 2 * Math.PI)
                this.HAngle -= 2 * Math.PI;
            if (this.HAngle < 0)
                this.HAngle = 2 * Math.PI - this.HAngle;
            if (this.VAngle > 90 * Math.PI / 180.0)
                this.VAngle = 90 * Math.PI / 180.0;
            if (this.VAngle < 30 * Math.PI / 180.0)
                this.VAngle = 30 * Math.PI / 180.0;
            this.updateCamera();
        }
    }

}
