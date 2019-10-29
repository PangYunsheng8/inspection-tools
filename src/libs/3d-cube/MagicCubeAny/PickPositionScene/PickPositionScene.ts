import { AnyCubeBaseScene } from '../AnyCubeBaseScene';
import { MouseStatus } from '../Base/BaseScene';
import * as THREE from 'three';
import { Debug } from '../../Util/Debug';
import { Assets } from '../../Assets';
import { CameraViewState } from '../../CameraViewState';

export class PickPositionScene extends AnyCubeBaseScene {

    constructor(container: Element, step: number, viewState: CameraViewState, assets: Assets,
        dragEnable: boolean = true) {
        super(container, step, viewState, assets, dragEnable);
    }

    protected Update() {
    }

    protected OnMouseUp(event: any) {
        if (this.mouseStatus === MouseStatus.UP) {
            let intersects
            if (this.isMobile) {
                intersects = this.getIntersects(event.clientX, event.clientY);
            } else {
                intersects = this.getIntersects(event.layerX, event.layerY);
            }
            if (intersects.length > 0) {
                const object = intersects[0].object as THREE.Mesh;
                Debug.Log(object.parent.position);
            }
        }
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

    private getIntersects(x: number, y: number): THREE.Intersection[] {
        x = (x / this.container.clientWidth) * 2 - 1.0;
        y = -(y / this.container.clientHeight) * 2 + 1.0;
        const mouseVector3 = new THREE.Vector3(x, y, 0.5);
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseVector3, this.camera);
        return raycaster.intersectObjects(this.cubeInstance.GetGameObject().children, true);
    }
}
