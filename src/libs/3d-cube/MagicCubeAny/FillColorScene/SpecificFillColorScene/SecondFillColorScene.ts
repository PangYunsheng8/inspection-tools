import {AnyFillColorScene} from '../AnyFillColorScene';
import { FaceSide } from '../FaceSide';
import { Tools } from '../../../Util/Tools';
import { Assets } from '../../../../../libs/3d-cube/Assets';

export class SecondFillColorScene extends AnyFillColorScene {
    constructor(container: Element, assets: Assets) {
        super(container, 2, assets);
        this.SetColorFace(Tools.MakeVector3(0.5, 0.5, 0.5), FaceSide.UP, 'y');
        this.SetColorFace(Tools.MakeVector3(0.5, 0.5, 0.5), FaceSide.FRONT, 'b');
        this.SetColorFace(Tools.MakeVector3(0.5, 0.5, 0.5), FaceSide.LEFT, 'r');
        this.colorCount.yellow = 1;
        this.colorCount.blue = 1;
        this.colorCount.red = 1;

        this.SetFaceActive(Tools.MakeVector3(0.5, 0.5, 0.5), FaceSide.UP, false);
        this.SetFaceActive(Tools.MakeVector3(0.5, 0.5, 0.5), FaceSide.FRONT, false);
        this.SetFaceActive(Tools.MakeVector3(0.5, 0.5, 0.5), FaceSide.LEFT, false);
    }
}
