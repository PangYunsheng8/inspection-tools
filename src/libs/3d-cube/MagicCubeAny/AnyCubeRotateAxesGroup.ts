import * as THREE from 'three';

export class AnyCubeRotateAxesGroup {
    private rotateYAxes: Array<THREE.Group>;
    private rotateXAxes: Array<THREE.Group>;
    private rotateZAxes: Array<THREE.Group>;
    constructor(parent: THREE.Group, step: number) {
        this.rotateYAxes = new Array<THREE.Group>();
        this.rotateXAxes = new Array<THREE.Group>();
        this.rotateZAxes = new Array<THREE.Group>();
        this.generateRotateAxes(this.rotateYAxes, parent, step);
        this.generateRotateAxes(this.rotateXAxes, parent, step);
        this.generateRotateAxes(this.rotateZAxes, parent, step);
    }
    private generateRotateAxes(array: Array<THREE.Group>, parent: THREE.Group, step: number) {
        for (let i = 0; i < step; i++) {
            const rotateAxis = new THREE.Group();
            array.push(rotateAxis);
            parent.add(rotateAxis);
        }
    }
    public GetRotateYAxes(): Array<THREE.Group> {
        return this.rotateYAxes;
    }
    public GetRotateXAxes(): Array<THREE.Group> {
        return this.rotateXAxes;
    }
    public GetRotateZAxes(): Array<THREE.Group> {
        return this.rotateZAxes;
    }
    public GetRotateYAxis(layer: number): THREE.Group {
        return this.rotateYAxes[layer];
    }
    public GetRotateXAxis(layer: number): THREE.Group {
        return this.rotateXAxes[layer];
    }
    public GetRotateZAxis(layer: number): THREE.Group {
        return this.rotateZAxes[layer];
    }
}
