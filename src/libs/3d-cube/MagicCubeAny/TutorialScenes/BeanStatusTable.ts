import { BeanStatus } from '../../Effect/ParticleSystem/ParticleSystemHandlers';

export class BeanStatusTable {
    private status: Array<Array<BeanStatus>>;
    private step: number;
    constructor(step: number) {
        this.status = new Array<Array<BeanStatus>>();
        this.step = step;
        for (let i = 0; i < 6; i++) {
            this.status.push(new Array<BeanStatus>());
            for (let j = 0; j < step; j++) {
                for (let k = 0; k < step; k++) {
                    this.status[i].push(BeanStatus.CLOSE);
                }
            }
        }
    }

    public UpdateStatus(status: Array<Array<BeanStatus>>) {
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < this.step * this.step; j++) {
                this.status[i][j] = status[i][j];
            }
        }
    }

    public GetStatus(sideIndex: number, faceIndex: number): BeanStatus {
        return this.status[sideIndex][faceIndex];
    }

    public SetStatus(sideIndex: number, faceIndex: number, value: BeanStatus) {
        this.status[sideIndex][faceIndex] = value;
    }
}
