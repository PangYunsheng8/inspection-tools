import {FillColorCubeLogicState} from './FillColorCubeLogicState';
import { SceneContainer } from '../../GLObject';
import { Assets } from '../../Assets';
import * as THREE from 'three';
import {AnyCubeFactory} from '../AnyCubeFactory';
import { FaceSide } from './FaceSide';
import { FillColorEventBinder } from './FillColorEventBinder';
class AnyFillColorCubeAttatudeTracer {
    private targetAttatude: THREE.Quaternion;
    private scale: number;
    private cube: FillColorCubeInstance;
    constructor(cube: FillColorCubeInstance) {
        this.cube = cube;
        this.targetAttatude = new THREE.Quaternion();
        this.targetAttatude.copy(this.cube.GetGameObject().quaternion);
    }

    public OnUpdate() {
        const gameObject = this.cube.GetGameObject();
        if (!gameObject.quaternion.equals(this.targetAttatude)) {
            gameObject.quaternion.slerp(this.targetAttatude, this.scale);
        }
    }

    SetTargetAttatude(qua: THREE.Quaternion, scale: number) {
        this.targetAttatude.copy(qua);
        this.scale = scale;
    }
}

export class FillColorCubeInstance {
    private gameObject: THREE.Group;
    private sceneContainer: SceneContainer;
    private step: number;
    private cubeLogicState: FillColorCubeLogicState;
    private attatudeTracer: AnyFillColorCubeAttatudeTracer;
    constructor(assets: Assets, parent: THREE.Scene, sceneContainer: SceneContainer, step: number) {
        this.gameObject = new THREE.Group();
        this.step = step;
        this.sceneContainer = sceneContainer;
        this.cubeLogicState = new FillColorCubeLogicState(this.step, assets, this.gameObject);
        this.attatudeTracer = new AnyFillColorCubeAttatudeTracer(this);
        parent.add(this.gameObject);
    }

    public OnUpdate() {
        this.attatudeTracer.OnUpdate();
    }

    public UpdateAttatude(rot: THREE.Quaternion, scale: number) {
        this.attatudeTracer.SetTargetAttatude(rot, scale);
    }

    public SetFaceActive(position: THREE.Vector3, side: FaceSide, active: boolean) {
        this.cubeLogicState.SetFaceActive(position, side, active);
    }

    public GetFaces(side: FaceSide): Array<THREE.Object3D> {
        return this.cubeLogicState.GetFaces(side);
    }

    public OnBind(binder: FillColorEventBinder) {
        this.cubeLogicState.OnBind(binder);
    }

    public GetAllColor(): Array<string> {
        return this.cubeLogicState.GetAllColor();
    }

    public GetFaceColor(position: THREE.Vector3, side: FaceSide): string {
        return this.cubeLogicState.GetFaceColor(position, side);
    }

    public SetColorToFace(position: THREE.Vector3, face: FaceSide, color: string) {
        this.cubeLogicState.SetColorToFace(position, face, color);
    }

    public GetGameObject(): THREE.Object3D {
        return this.gameObject;
    }
}
