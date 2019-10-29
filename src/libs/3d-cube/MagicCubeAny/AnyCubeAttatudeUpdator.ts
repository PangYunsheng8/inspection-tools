import { IAttatudeController, ControllerType } from './AnyCubeAttatudeScheduler';
import { AnyCubeInstance } from './AnyCubeInstance';
import { Debug } from '../Util/Debug';
import * as THREE from 'three';

export class AnyCubeAttatudeUpdator implements IAttatudeController {
    private cube: AnyCubeInstance;

    private QS: THREE.Quaternion;
    private QE: THREE.Quaternion;
    private DeltaPerFrame: number;
    private Progress: number;

    constructor(cube: AnyCubeInstance) {
        this.cube = cube;
        this.DeltaPerFrame = 0.02;
        this.Progress = 0.0;
        this.QS = new THREE.Quaternion();
        this.QS.copy(this.cube.GetGameObject().quaternion);
        this.QE = new THREE.Quaternion();
        this.QE.copy(this.cube.GetGameObject().quaternion);
    }

    public OnUpdate(): void {
        if (this.Progress < 1.0 && !this.QS.equals(this.QE)) {
            this.Progress += this.DeltaPerFrame;
            if (this.Progress >= 1.0) {
                this.Progress = 1.0;
            }
            const QCur = this.QS.clone().slerp(this.QE, this.Progress);
            this.cube.GetGameObject().quaternion.copy(QCur);
        }
    }

    public SetTargetAttatude(qua: THREE.Quaternion, animateTime: number): void {
        this.QS.copy(this.cube.GetGameObject().quaternion);
        this.QE.copy(qua);
        this.Progress = 0.0;
        this.DeltaPerFrame = 20.0 / animateTime;
    }

    public Release() {
        this.cube.GetGameObject().quaternion.copy(this.QE);
        this.QS.copy(this.QE);
    }

    public GetControllerType(): ControllerType {
        return ControllerType.UPDATOR;
    }

    public EndForce() {
        this.cube.GetGameObject().quaternion.copy(this.QE);
    }


}
