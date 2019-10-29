import { RotateAxis } from '../MCInputCache';
import { Debug } from '../Util/Debug';

export interface AnyCubeRotateEventObserver {
    OnRotate90(axis: RotateAxis, layer: number, direction: number): void;
}

class AddAngleResult {
    public isOverflow: boolean
    public direction: number;
    public time: number;
    constructor(overflow: boolean = false, direction: number = 0) {
        this.isOverflow = overflow;
        this.direction = direction;
        this.time = 0;
    }
}
export class AnyCubeRotateAngleAccumulator {
    private rotateXAxis: Array<number> = [];
    private rotateYAxis: Array<number> = [];
    private rotateZAxis: Array<number> = [];
    private mainObserver: AnyCubeRotateEventObserver;
    private otherObservers: Array<AnyCubeRotateEventObserver> = [];
    constructor(observer: AnyCubeRotateEventObserver, steps: number) {
        this.mainObserver = observer;
        for (let i = 0; i < steps; i += 1.0) {
            this.rotateXAxis.push(0);
            this.rotateYAxis.push(0);
            this.rotateZAxis.push(0);
        }
    }
    RotateAngle(axis: RotateAxis, layer: number, angle: number) {
        switch (axis) {
            case RotateAxis.X_AXIS:
                {
                    const result = this.addAngle(this.rotateXAxis, layer, angle);
                    if (result.isOverflow) {
                        for (let i = 0; i < result.time; i++) {
                            this.mainObserver.OnRotate90(RotateAxis.X_AXIS, layer, result.direction);
                            for (let j = 0; j < this.otherObservers.length; j++) {
                                this.otherObservers[j].OnRotate90(RotateAxis.X_AXIS, layer, result.direction);
                            }
                        }
                    }
                }
                break;
            case RotateAxis.Y_AXIS:
                {
                    const result = this.addAngle(this.rotateYAxis, layer, angle);
                    if (result.isOverflow) {
                        for (let i = 0; i < result.time; i++) {
                            this.mainObserver.OnRotate90(RotateAxis.Y_AXIS, layer, result.direction);
                            for (let j = 0; j < this.otherObservers.length; j++) {
                                this.otherObservers[j].OnRotate90(RotateAxis.Y_AXIS, layer, result.direction);
                            }
                        }
                    }
                }
                break;
            case RotateAxis.Z_AXIS:
                {
                    const result = this.addAngle(this.rotateZAxis, layer, angle);
                    if (result.isOverflow) {
                        for (let i = 0; i < result.time; i++) {
                            this.mainObserver.OnRotate90(RotateAxis.Z_AXIS, layer, result.direction);
                            for (let j = 0; j < this.otherObservers.length; j++) {
                                this.otherObservers[j].OnRotate90(RotateAxis.Z_AXIS, layer, result.direction);
                            }
                        }
                    }
                }
                break;
        }
    }
    public addObserver(observer: AnyCubeRotateEventObserver) {
        this.otherObservers.push(observer);
    }
    private addAngle(rotateAxis: Array<number>, layer: number, angle: number): AddAngleResult {
        rotateAxis[layer] += angle;
        const res = new AddAngleResult();
        if (Math.abs(rotateAxis[layer]) >= 90.0) {
            res.isOverflow = true;
            res.direction = angle > 0 ? 1 : -1;
            res.time = Math.round(Math.abs(rotateAxis[layer]) / 90);
            if (rotateAxis[layer] > 0)
                rotateAxis[layer] -= 90 * res.time;
            else {
                rotateAxis[layer] += 90 * res.time;
            }
        }
        return res;
    }
}
