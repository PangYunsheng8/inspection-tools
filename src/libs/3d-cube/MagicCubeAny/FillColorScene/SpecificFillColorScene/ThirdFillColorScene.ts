import { AnyFillColorScene } from '../AnyFillColorScene';
import { Tools } from '../../../Util/Tools';
import { FaceSide } from '../FaceSide';
import * as THREE from 'three';
import { Assets } from '../../../../../libs/3d-cube/Assets';
import { Debug } from '../../../../../libs/3d-cube/Util/Debug';

export class ThirdFillColorScene extends AnyFillColorScene {
    constructor(container: Element, assets: Assets) {
        super(container, 3, assets);
        this.SetColorToFace(Tools.MakeVector3(0, 1, 0), FaceSide.UP, 'y');
        this.SetFaceActive(Tools.MakeVector3(0, 1, 0), FaceSide.UP, false);

        this.SetColorToFace(Tools.MakeVector3(0, 0, 1), FaceSide.FRONT, 'b');
        this.SetFaceActive(Tools.MakeVector3(0, 0, 1), FaceSide.FRONT, false);

        this.SetColorToFace(Tools.MakeVector3(0, 0, -1), FaceSide.BACK, 'g');
        this.SetFaceActive(Tools.MakeVector3(0, 0, -1), FaceSide.BACK, false);

        this.SetColorToFace(Tools.MakeVector3(-1, 0, 0), FaceSide.RIGHT, 'o');
        this.SetFaceActive(Tools.MakeVector3(-1, 0, 0), FaceSide.RIGHT, false);

        this.SetColorToFace(Tools.MakeVector3(1, 0, 0), FaceSide.LEFT, 'r');
        this.SetFaceActive(Tools.MakeVector3(1, 0, 0), FaceSide.LEFT, false);

        this.SetColorToFace(Tools.MakeVector3(0, -1, 0), FaceSide.DOWN, 'w');
        this.SetFaceActive(Tools.MakeVector3(0, -1, 0), FaceSide.DOWN, false);
        this.colorCount.blue = 1;
        this.colorCount.red = 1;
        this.colorCount.green = 1;
        this.colorCount.orange = 1;
        this.colorCount.white = 1;
        this.colorCount.yellow = 1;
    }

    protected Update() {
    }

}
