import { FillColorCubeController } from './FillColorCubeController';
import { Tools } from '../../Util/Tools';
import { FillColorEventBinder } from './FillColorEventBinder';
import { FaceSide } from './FaceSide';
import THREE from '../../three';

export class FillColorCubeNode {
    private position: THREE.Vector3;
    private controller: FillColorCubeController;

    constructor(position: THREE.Vector3) {
        this.position = position;
        this.controller = new FillColorCubeController(position);
    }

    public SetFaceActive(side: FaceSide, active: boolean) {
        this.controller.SetFaceActive(side, active);
    }

    public SetColorToFace(face: FaceSide, color: string) {
        this.controller.SetColorToFace(face, color);
    }

    public GetWholeCube(): THREE.Group {
        return this.controller.GetWholeCube();
    }

    public GetFace(side: FaceSide): THREE.Object3D {
        return this.controller.GetFace(side);
    }

    public SetController(controller: FillColorCubeController) {
        this.controller = controller;
    }

    public GetPosition(): THREE.Vector3 {
        return this.position;
    }

    public GetKey(): string {
        return Tools.PositionToKey(this.position);
    }

    public GetColorString(): string {
        return this.controller.GetColorString();
    }

    public GetFaceColor(side: FaceSide): string {
        return this.controller.GetFaceColor(side);
    }

    public OnBind(binder: FillColorEventBinder) {
        this.controller.OnBind(binder);
    }
}
