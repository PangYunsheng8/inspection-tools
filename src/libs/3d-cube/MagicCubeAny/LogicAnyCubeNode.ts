import { Vector3, Quaternion } from 'three';
import * as THREE from 'three';
import { RotateAxis } from '../MCInputCache';
import {AnyCubeController} from './AnyCubeController';
import { Tools } from '../Util/Tools';
import { FaceSide } from './FillColorScene/FaceSide';

export class AnyCubeNode {
    private position: THREE.Vector3;

    private adjacent: Array<Array<string>>;

    private controller: AnyCubeController;
    private initController: AnyCubeController;

    constructor(position: THREE.Vector3) {
        this.position = position;

        this.adjacent = new Array<Array<string>>();
        for (let i = 0; i < 3; i++) {
            this.adjacent.push(new Array<string>());
        }
        this.adjacent[RotateAxis.Y_AXIS].push(this.getNextKey(Tools.MakeQuaternion(-90, new THREE.Vector3(0, 1, 0))))
        this.adjacent[RotateAxis.Y_AXIS].push(this.getNextKey(Tools.MakeQuaternion(90, new THREE.Vector3(0, 1, 0))));

        this.adjacent[RotateAxis.X_AXIS].push(this.getNextKey(Tools.MakeQuaternion(-90, new THREE.Vector3(1, 0, 0))));
        this.adjacent[RotateAxis.X_AXIS].push(this.getNextKey(Tools.MakeQuaternion(90, new THREE.Vector3(1, 0, 0))));

        this.adjacent[RotateAxis.Z_AXIS].push(this.getNextKey(Tools.MakeQuaternion(-90, new THREE.Vector3(0, 0, 1))));
        this.adjacent[RotateAxis.Z_AXIS].push(this.getNextKey(Tools.MakeQuaternion(90, new THREE.Vector3(0, 0, 1))));

        this.controller = new AnyCubeController(this.position);
        this.initController = this.controller;
    }

    public GetFaceColor(side: FaceSide): string {
        return this.controller.GetFaceColor(side);
    }

    public Reset() {
        this.controller = this.initController;
        this.controller.Reset(this.position);
    }

    public SetColorToFace(face: FaceSide, color: string) {
        this.controller.SetColorToFace(face, color);
    }

    //  设置控制器
    public SetController(controller: AnyCubeController) {
        this.controller = controller;
    }

    public GetController(): AnyCubeController {
        return this.controller;
    }

    //  设置颜色
    public SetColor(color: string) {
        this.controller.UpdateColor(color);
    }

    public GetWholeCube(): THREE.Group {
        return this.controller.GetWholeCube();
    }

    public GetFace(side: FaceSide): THREE.Object3D {
        return this.controller.GetFace(side);
    }

    public GetNextKey(axis: RotateAxis, index: number): string {
        index = THREE.Math.clamp(index, 0, 1);
        return this.adjacent[axis][index];
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

    public OnRotate(axis: RotateAxis, direction: number) {
        this.controller.RotateColorMapping(axis, direction);
    }

    private getNextKey(rot: Quaternion): string {
        const position = this.position.clone();
        position.applyQuaternion(rot);
        return Tools.PositionToKey(position);
    }
}
