import { RotateAxis, RotateLayer, MCInputStruct } from '../MCInputCache';
import { UTIL } from '../GLObject';
import * as THREE from 'three';
import { AnyCubeInstance } from './AnyCubeInstance';
import { Debug } from '../Util/Debug';

class ExecuteFrame {
    public axis: RotateAxis;
    public layer: number;
    public angle: number;
    public index: number;
}

export enum CubeStateFlag {
    IDLE = 3,
    ROTATEX = 1,
    ROTATEY = 0,
    ROTATEZ = 2
}

class RotateStatusDescription {
    public remainAngle: number;
    public rotateAnglePerFrame: number;
    public direction: number;
    public Reset() {
        this.remainAngle = 0;
        this.rotateAnglePerFrame = 0;
        this.direction = 0;
    }
}

export abstract class AnyAbsCubeRotateState {
    protected cubeInstance: AnyCubeInstance;
    protected step: number;
    protected rotateStatusDescriptions: Array<RotateStatusDescription>;

    constructor(cubeInstance: AnyCubeInstance, step: number) {
        this.cubeInstance = cubeInstance;
        this.step = step;
        this.rotateStatusDescriptions = new Array<RotateStatusDescription>();
        for (let i = 0; i < step; i++) {
            this.rotateStatusDescriptions.push(new RotateStatusDescription());
        }
    }

    protected PushInput(input: MCInputStruct): void {
        const signal = Math.sign(input.circle);
        const sum_angle = 360.0 / Math.abs(input.circle);
        const totalFrame = Math.round(Math.max(input.during / 20.0, 3));
        const rotateSpeed = sum_angle / totalFrame;
        this.cubeInstance.AccumulateAngle(input.axis, input.layer, sum_angle * signal);
        this.rotateStatusDescriptions[input.layer].remainAngle = sum_angle;
        this.rotateStatusDescriptions[input.layer].direction = signal;
        this.rotateStatusDescriptions[input.layer].rotateAnglePerFrame = rotateSpeed;
    }

    public abstract OnUpdate(deltaTime: number);

    protected OnRotateExit(rotateAxises: Array<THREE.Group> = []): void {
        for (let i = 0; i < this.step; i += 1.0) {
            const childrenCount = rotateAxises[i].children.length;
            if (childrenCount > 0) {
                for (let j = 0; j < childrenCount; j += 1.0) {
                    UTIL.AddChild(this.cubeInstance.GetScene(),
                        this.cubeInstance.GetGameObject(),
                        rotateAxises[i].children[0]);
                }
            }
        }
        this.cubeInstance.SwitchToIdleState();
    }

    public abstract GetFlag(): CubeStateFlag;

    public abstract TurnBackToIdle();

    protected UpdateUtil(axis: RotateAxis) {
        let shouldExit = true;
        for (let i = 0; i < this.step; i += 1) {
            if (this.rotateStatusDescriptions[i].remainAngle > 0) {

                const direction = this.rotateStatusDescriptions[i].direction;
                let angle = 0;
                if (this.rotateStatusDescriptions[i].remainAngle < this.rotateStatusDescriptions[i].rotateAnglePerFrame) {
                    angle = this.rotateStatusDescriptions[i].remainAngle;
                    this.rotateStatusDescriptions[i].remainAngle = 0;
                } else {
                    angle = this.rotateStatusDescriptions[i].rotateAnglePerFrame;
                    this.rotateStatusDescriptions[i].remainAngle -= this.rotateStatusDescriptions[i].rotateAnglePerFrame;
                }
                angle *= direction;
                this.RotateUtil(this.cubeInstance.GetCubeRotateAxis(axis, i), axis, i, angle);
                shouldExit = false;
            }
        }

        if (shouldExit) {
            this.OnRotateExit(this.cubeInstance.GetCubeRotateAxes(axis));
        }
    }

    protected RotateUtil(rotCenter: THREE.Object3D, axis: RotateAxis, layer: number, angle: number): void {
        if (rotCenter.children.length === 0) {
            this.cubeInstance.PickCubes(axis, layer);
        }
        switch (axis) {
            case RotateAxis.Y_AXIS:
                rotCenter.rotateY(angle * THREE.Math.DEG2RAD);
                break;
            case RotateAxis.X_AXIS:
                rotCenter.rotateX(angle * THREE.Math.DEG2RAD);
                break;
            case RotateAxis.Z_AXIS:
                rotCenter.rotateZ(angle * THREE.Math.DEG2RAD);
                break;
        }
    }

    public abstract Reset();

    // protected resetUtil(frame_caches: Array<Array<ExecuteFrame>>) {
    //     frame_caches.forEach(element => {
    //         while (element.length > 0) {
    //             element.shift();
    //         }
    //     });
    // }

    protected clearFrameCacheUtil(axis: RotateAxis, layer: number) {
        // for (let i = 0; i < this.step; i++) {
        if (this.rotateStatusDescriptions[layer].remainAngle > 0) {
            const remainAngle = this.rotateStatusDescriptions[layer].remainAngle * this.rotateStatusDescriptions[layer].direction;
            this.RotateUtil(this.cubeInstance.GetCubeRotateAxis(axis, layer), axis, layer, remainAngle);
            this.cubeInstance.GetCubeRotateAxis(axis, layer).updateMatrixWorld(true);
            this.rotateStatusDescriptions[layer].Reset();
        }
        // }
    }

    public abstract OnInput(input: MCInputStruct);

    public OnErrorInput() {
        this.TurnBackToIdle();
    }
}

export class AnyCubeIdleState extends AnyAbsCubeRotateState {
    public Reset() {
    }
    constructor(cubeInstance: AnyCubeInstance, step: number) {
        super(cubeInstance, step);
    }

    public GetFlag(): CubeStateFlag {
        return CubeStateFlag.IDLE;
    }

    public OnUpdate(deltaTime: number): void {
    }

    public TurnBackToIdle() {
    }

    public OnInput(input: MCInputStruct) {
        // if (input.axis === RotateAxis.Y_AXIS) {
        //     this.cubeInstance.SwitchToYState();
        //     this.cubeInstance.cubeRotateState.OnInput(input);
        // } else if (input.axis === RotateAxis.X_AXIS) {
        //     this.cubeInstance.SwitchToXState();
        //     this.cubeInstance.cubeRotateState.OnInput(input);
        // } else if (input.axis === RotateAxis.Z_AXIS) {
        //     this.cubeInstance.SwitchToZState();
        //     this.cubeInstance.cubeRotateState.OnInput(input);
        // }
    }
}

export class AnyCubeRotateYState extends AnyAbsCubeRotateState {
    public Reset() {
        // this.clearFrameCacheUtil(RotateAxis.Y_AXIS);
    }
    constructor(cubeInstance: AnyCubeInstance, step: number) {
        super(cubeInstance, step);
    }

    public OnUpdate(deltaTime: number) {
        this.UpdateUtil(RotateAxis.Y_AXIS);
    }

    public GetFlag(): CubeStateFlag {
        return CubeStateFlag.ROTATEY;
    }

    public TurnBackToIdle() {
        for (let i = 0; i < this.step; i++) {
            this.clearFrameCacheUtil(RotateAxis.Y_AXIS, i);
        }
        this.OnRotateExit(this.cubeInstance.GetCubeRotateAxes(RotateAxis.Y_AXIS));
    }

    public OnInput(input: MCInputStruct) {
        if (input.axis === RotateAxis.Y_AXIS) {
            this.clearFrameCacheUtil(RotateAxis.Y_AXIS, input.layer);
            this.PushInput(input);
        }
    }
}

export class AnyCubeRotateXState extends AnyAbsCubeRotateState {
    public Reset() {
        // this.clearFrameCacheUtil(RotateAxis.X_AXIS);
    }
    constructor(cubeInstance: AnyCubeInstance, step: number) {
        super(cubeInstance, step);
    }

    public OnUpdate(deltaTime: number) {
        this.UpdateUtil(RotateAxis.X_AXIS);
    }

    public GetFlag(): CubeStateFlag {
        return CubeStateFlag.ROTATEX;
    }

    public TurnBackToIdle() {
        for (let i = 0; i < this.step; i++) {
            this.clearFrameCacheUtil(RotateAxis.X_AXIS, i);
        }
        this.OnRotateExit(this.cubeInstance.GetCubeRotateAxes(RotateAxis.X_AXIS));
    }

    public OnInput(input: MCInputStruct) {
        if (input.axis === RotateAxis.X_AXIS) {
            this.clearFrameCacheUtil(RotateAxis.X_AXIS, input.layer);
            this.PushInput(input);
        }
    }
}

export class AnyCubeRotateZState extends AnyAbsCubeRotateState {
    public Reset() {
        // this.clearFrameCacheUtil(RotateAxis.Z_AXIS);
    }
    constructor(cubeInstance: AnyCubeInstance, step: number) {
        super(cubeInstance, step);
    }

    public OnUpdate(deltaTime: number) {
        this.UpdateUtil(RotateAxis.Z_AXIS);
    }

    public GetFlag(): CubeStateFlag {
        return CubeStateFlag.ROTATEZ;
    }

    public TurnBackToIdle() {
        for (let i = 0; i < this.step; i++) {
            this.clearFrameCacheUtil(RotateAxis.Z_AXIS, i);
        }
        this.OnRotateExit(this.cubeInstance.GetCubeRotateAxes(RotateAxis.Z_AXIS));
    }

    public OnInput(input: MCInputStruct) {
        if (input.axis === RotateAxis.Z_AXIS) {
            this.clearFrameCacheUtil(RotateAxis.Z_AXIS, input.layer);
            this.PushInput(input);
        }
    }
}
