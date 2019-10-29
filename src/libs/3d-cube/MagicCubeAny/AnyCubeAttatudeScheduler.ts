import { AnyCubeInstance } from './AnyCubeInstance';
import {AnyCubeAttatudeTracer} from './AnyCubeAttatudeTracer';
import { AnyCubeAttatudeUpdator } from './AnyCubeAttatudeUpdator';

export interface IAttatudeController {
    OnUpdate(): void;

    SetTargetAttatude(qua: THREE.Quaternion, t: number): void;

    Release();

    GetControllerType(): ControllerType;

    EndForce();
}

export enum ControllerType {
    TRACER = 0,
    UPDATOR = 1
}

//  姿态更新有两种方式
//  使用slerp每一次以当前姿态为起点对目标姿态追踪的方式——Tracer
//  使用slerp对起始姿态到目标姿态的追踪方式——Updator
//  两种方式统一由Scheduler调度切换和更新
export class AnyCubeAttatudeControllerScheduler {
    private anyCubeAttatudeTracer: IAttatudeController;

    private anyCubeAttatudeUpdator: IAttatudeController;

    private activeController: IAttatudeController;

    constructor(cube: AnyCubeInstance) {
        this.anyCubeAttatudeTracer = new AnyCubeAttatudeTracer(cube);
        this.anyCubeAttatudeUpdator = new AnyCubeAttatudeUpdator(cube);
        this.activeController = this.anyCubeAttatudeTracer;
    }

    private GetController(type: ControllerType) {
        switch (type) {
            case ControllerType.TRACER:
                return this.anyCubeAttatudeTracer;
            case ControllerType.UPDATOR:
                return this.anyCubeAttatudeUpdator;
        }
    }

    public OnUpdate() {
        this.activeController.OnUpdate();
    }

    public SetTargetAttatude(qua: THREE.Quaternion, t: number, type: ControllerType): void {
        if (this.activeController.GetControllerType() !== type) {
            this.activeController.Release();
            this.activeController = this.GetController(type);
        } else if (this.activeController.GetControllerType() === ControllerType.UPDATOR) {
            this.activeController.EndForce();
        }
        this.activeController.SetTargetAttatude(qua, t);
    }
}
