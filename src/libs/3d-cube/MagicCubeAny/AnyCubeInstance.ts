import { SceneContainer, UTIL } from '../GLObject';
import * as THREE from 'three';
import { AnyCubeAttatudeTracer } from './AnyCubeAttatudeTracer';
import { Assets } from '../Assets';
import { AnyCubeFactory } from './AnyCubeFactory';
import { LogicAnyCube } from './LogicAnyCube';
import { AnyCubeRotateAxesGroup } from './AnyCubeRotateAxesGroup';
import { MCInputStruct, RotateAxis, RotateLayer } from '../MCInputCache';
import { AnyCubeRotateAngleAccumulator } from './AnyCubeRotateAngleAccumulator';
// tslint:disable-next-line:max-line-length
import { AnyAbsCubeRotateState, AnyCubeIdleState, AnyCubeRotateYState, AnyCubeRotateXState, AnyCubeRotateZState, CubeStateFlag } from './AnyCubeRotateState';
import { AnyCubeNode } from './LogicAnyCubeNode';
import { FaceSide } from './FillColorScene/FaceSide';
import { AnyCubeAttatudeControllerScheduler, ControllerType } from './AnyCubeAttatudeScheduler';
import { Debug } from '../Util/Debug';

export class AnyCubeInstance {
    private gameObject: THREE.Group;
    private sceneContainer: SceneContainer;
    // private attatudeTracer: AnyCubeAttatudeTracer;
    private attatudeControllerScheduler: AnyCubeAttatudeControllerScheduler;
    private step: number;
    private cubeLogicState: LogicAnyCube;

    public cubeRotateIdleState: AnyCubeIdleState;
    public cubeRotateYState: AnyCubeRotateYState;
    public cubeRotateXState: AnyCubeRotateXState;
    public cubeRotateZState: AnyCubeRotateZState;

    public cubeRotateState: AnyAbsCubeRotateState;

    private rotateAxesGroup: AnyCubeRotateAxesGroup;
    private rotateAngleAccumulator: AnyCubeRotateAngleAccumulator;

    constructor(assets: Assets, parent: THREE.Scene, sceneContainer: SceneContainer, step: number) {
        this.gameObject = new THREE.Group();
        parent.add(this.gameObject);
        this.sceneContainer = sceneContainer;
        this.step = step;
        this.cubeLogicState = new LogicAnyCube(step, assets, this.gameObject);
        // this.attatudeTracer = new AnyCubeAttatudeTracer(this);
        this.attatudeControllerScheduler = new AnyCubeAttatudeControllerScheduler(this);
        this.rotateAxesGroup = new AnyCubeRotateAxesGroup(this.gameObject, this.step);
        this.rotateAngleAccumulator = new AnyCubeRotateAngleAccumulator(this.cubeLogicState, this.step);
        this.cubeRotateIdleState = new AnyCubeIdleState(this, this.step);
        this.cubeRotateYState = new AnyCubeRotateYState(this, this.step);
        this.cubeRotateXState = new AnyCubeRotateXState(this, this.step);
        this.cubeRotateZState = new AnyCubeRotateZState(this, this.step);
        this.SwitchToIdleState();
    }

    OnUpdate(delta: number) {
        this.attatudeControllerScheduler.OnUpdate();
        this.cubeRotateState.OnUpdate(delta);
    }

    PushInput(input: MCInputStruct) {
        if ((this.cubeRotateState.GetFlag() as number) === (input.axis as number)) {
            this.cubeRotateState.OnInput(input);
        } else if (this.cubeRotateState.GetFlag() === CubeStateFlag.IDLE ||
            (this.cubeRotateState.GetFlag() as number) !== (input.axis as number)) {
            if (this.cubeRotateState.GetFlag() !== CubeStateFlag.IDLE)
                this.cubeRotateState.OnErrorInput();
            switch (input.axis) {
                case RotateAxis.Y_AXIS:
                    this.SwitchToYState();
                    this.cubeRotateState.OnInput(input);
                    break;
                case RotateAxis.X_AXIS:
                    this.SwitchToXState();
                    this.cubeRotateState.OnInput(input);
                    break;
                case RotateAxis.Z_AXIS:
                    this.SwitchToZState();
                    this.cubeRotateState.OnInput(input);
                    break;
                default:
                    Debug.Log('Error input command.');
                    break;
            }
        }
    }

    public AccumulateAngle(axis: RotateAxis, layer: number, angle: number) {
        this.rotateAngleAccumulator.RotateAngle(axis, layer, angle);
    }

    public GetFaceColor(position: THREE.Vector3, side: FaceSide): string {
        return this.cubeLogicState.GetFaceColor(position, side);
    }


    public UpdateAttatude(rot: THREE.Quaternion, scale: number) {
        this.attatudeControllerScheduler.SetTargetAttatude(rot, scale, ControllerType.TRACER);
    }

    public updateQuaternionAnimation(rot: THREE.Quaternion, animateTime: number) {
        this.attatudeControllerScheduler.SetTargetAttatude(rot, animateTime, ControllerType.UPDATOR);
    }

    public GetScene(): THREE.Scene {
        return this.sceneContainer.GetScene();
    }

    public GetGameObject(): THREE.Group {
        return this.gameObject;
    }

    public GetCubes(axis: RotateAxis, layer: number): Array<THREE.Group> {
        const res = new Array<THREE.Group>();
        const nodes = this.cubeLogicState.GetRotateCubes(axis, layer);
        for (let i = 0; i < nodes.length; i++) {
            res.push(nodes[i].GetWholeCube());
        }
        return res;
    }

    public GetCube(position: THREE.Vector3): THREE.Object3D {
        return this.cubeLogicState.GetWholeCube(position);
    }

    public GetFace(position: THREE.Vector3, side: FaceSide): THREE.Object3D {
        return this.cubeLogicState.GetCubeFace(position, side);
    }

    public GetCubeRotateAxis(rotateAxisFlag: RotateAxis, layer: number): THREE.Object3D {
        switch (rotateAxisFlag) {
            case RotateAxis.Y_AXIS:
                return this.rotateAxesGroup.GetRotateYAxis(layer);
            case RotateAxis.X_AXIS:
                return this.rotateAxesGroup.GetRotateXAxis(layer);
            case RotateAxis.Z_AXIS:
                return this.rotateAxesGroup.GetRotateZAxis(layer);
        }
    }

    public GetCubeRotateAxes(rotateAxisFlag: RotateAxis): THREE.Group[] {
        switch (rotateAxisFlag) {
            case RotateAxis.Y_AXIS:
                return this.rotateAxesGroup.GetRotateYAxes();
            case RotateAxis.X_AXIS:
                return this.rotateAxesGroup.GetRotateXAxes();
            case RotateAxis.Z_AXIS:
                return this.rotateAxesGroup.GetRotateZAxes();
        }
    }

    public SetColorToFace(position: THREE.Vector3, face: FaceSide, color: string) {
        this.cubeLogicState.SetColorToFace(position, face, color);
    }

    public GetAllColor(): string[] {
        return this.cubeLogicState.GetAllColor();
    }

    public SetAllColor(colors: string[]) {
        this.cubeLogicState.SetAllColor(colors);
    }

    public PickCubes(rotateAxisFlag: RotateAxis, layer: number) {
        const rotateAxis = this.GetCubeRotateAxis(rotateAxisFlag, layer);
        const cubeSet = this.cubeLogicState.GetRotateCubes(rotateAxisFlag, layer);
        cubeSet.forEach((value: AnyCubeNode, index: number, array: AnyCubeNode[]) => {
            UTIL.AddChild(this.GetScene(), rotateAxis, value.GetWholeCube());
        });
    }

    public ForAllCubes(func: (cube: THREE.Group) => void) {
        this.cubeLogicState.ForAllCubes(func);
    }

    public SwitchToYState(): void {
        this.cubeRotateState = this.cubeRotateYState;
        // this.cubeRotateState.Reset();
    }

    public SwitchToXState(): void {
        this.cubeRotateState = this.cubeRotateXState;
        // this.cubeRotateState.Reset();
    }

    public SwitchToZState(): void {
        this.cubeRotateState = this.cubeRotateZState;
        // this.cubeRotateState.Reset();
    }

    public SwitchToIdleState(): void {
        this.cubeRotateState = this.cubeRotateIdleState;
        // this.cubeRotateState.Reset();
    }

    public SwitchToHollow() {
        this.gameObject.traverse((obj: THREE.Object3D) => {
            if (obj.name === '0') {
                obj.visible = false;
            }
        })
    }

    public SwitchToUnhollow() {
        this.gameObject.traverse((obj: THREE.Object3D) => {
            if (obj.name === '0') {
                obj.visible = true;
            }
        })
    }
}
