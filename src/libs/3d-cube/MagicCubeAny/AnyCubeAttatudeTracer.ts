import {AnyCubeInstance} from './AnyCubeInstance';
import * as THREE from 'three';
import { IAttatudeController, ControllerType } from './AnyCubeAttatudeScheduler';
export class AnyCubeAttatudeTracer implements IAttatudeController {
    private targetAttatude: THREE.Quaternion;
    private scale: number;
    private cube: AnyCubeInstance;
    constructor(cube: AnyCubeInstance) {
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

    public SetTargetAttatude(qua: THREE.Quaternion, scale: number) {
        this.targetAttatude.copy(qua);
        this.scale = scale;
    }

    public Release() {
        this.cube.GetGameObject().quaternion.copy(this.targetAttatude);
    }

    public GetControllerType(): ControllerType {
        return ControllerType.TRACER;
    }

    public EndForce() {
        this.cube.GetGameObject().quaternion.copy(this.targetAttatude);
    }
}
