import { AnyCubeBaseScene } from '../AnyCubeBaseScene';
import { Assets } from '../../Assets';
import AnyAxisArrowModel from '../AnyAxisArrowModel';
import { Axis } from '../../GLObject';
import { MCInputStruct } from '../../MCInputCache';
import { CameraViewState } from '../../CameraViewState';

export class AnyFightScene extends AnyCubeBaseScene {
    private anyAxisArrow: AnyAxisArrowModel;
    constructor(container: Element, step: number, viewState: CameraViewState, assets: Assets, dragEnable: boolean = true) {
        super(container, step, viewState, assets, dragEnable);
        this.anyAxisArrow = new AnyAxisArrowModel(this.step, this.assets.GetAxisArrowGeo(), this.cubeInstance.GetGameObject());
        this.useEffectComposer = false;
    }

    protected Update() {
        if (this.anyAxisArrow) {
            this.anyAxisArrow.Update(0.02);
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

    public ShowArrow(face: Axis, status: number, rotateSpeed: number = 90) {
        if (status === 0) {
            this.anyAxisArrow.Detach();
        } else {
            const input = new MCInputStruct();
            input.translateRotateData(face, this.step, status, 1000);
            this.anyAxisArrow.ShowArrow(input.axis, input.layer, input.circle > 0 ? 0 : 1, rotateSpeed);
        }
    }


}
