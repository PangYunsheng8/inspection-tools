import * as THREE from 'three';
import { Tools } from '../Util/Tools';
import { Debug } from '../Util/Debug';

export default class AnyAxisArrowModel {
    private step: number;
    private mat: THREE.Material;
    private geo: THREE.BufferGeometry | THREE.Geometry;
    private disposeGeometries: Array<THREE.BufferGeometry | THREE.Geometry>;
    private cubeAxisArrows: Array<Array<THREE.Group>>;
    private cubeAxisArrowsDirection: Array<Array<number>>;
    private root: THREE.Object3D;

    private currentGroup: THREE.Group;
    private currentAxis: number;
    private currentDirection: number;
    private rotateSpeed: number;
    constructor(step: number, axisArrowGeo: THREE.BufferGeometry | THREE.Geometry, root: THREE.Object3D) {
        this.step = step;
        this.root = root;
        this.cubeAxisArrows = new Array<Array<THREE.Group>>();
        this.cubeAxisArrowsDirection = new Array<Array<number>>();
        for (let i = 0; i < 3; i++) {
            this.cubeAxisArrows.push(new Array<THREE.Group>());
            this.cubeAxisArrowsDirection.push(new Array<number>());
            for (let j = 0; j < 2; j++) {
                this.cubeAxisArrows[i].push(new THREE.Group);
            }
            this.cubeAxisArrowsDirection[i][0] = 1;
            this.cubeAxisArrowsDirection[i][1] = -1;
        }

        this.mat = new THREE.MeshPhongMaterial({
            color: new THREE.Color(0xd0d0d0),
            transparent: true,
            opacity: 1,
        });
        this.disposeGeometries = Array<THREE.BufferGeometry | THREE.Geometry>();
        this.geo = axisArrowGeo;

        this.generateYAxisArrows(this.step, this.step / 2 - 0.5, this.geo, this.cubeAxisArrows[0][0], true);
        this.generateYAxisArrows(this.step, this.step / 2 - 0.5, this.geo, this.cubeAxisArrows[0][1], false);
        this.generateXAxisArrows(this.step, this.step / 2 - 0.5, this.geo, this.cubeAxisArrows[1][0], true);
        this.generateXAxisArrows(this.step, this.step / 2 - 0.5, this.geo, this.cubeAxisArrows[1][1], false);
        this.generateZAxisArrows(this.step, this.step / 2 - 0.5, this.geo, this.cubeAxisArrows[2][0], true);
        this.generateZAxisArrows(this.step, this.step / 2 - 0.5, this.geo, this.cubeAxisArrows[2][1], false);

        this.currentGroup = undefined;
        this.currentAxis = -1;
        this.currentDirection = -1;
        this.rotateSpeed = 90;
    }

    public Update(deltaTime: number) {
        if (this.currentAxis >= 0 && this.currentGroup !== undefined) {
            switch (this.currentAxis) {
                case 0:
                    this.currentGroup.rotateY(this.currentDirection * deltaTime * this.rotateSpeed * THREE.Math.DEG2RAD);
                    break;
                case 1:
                    this.currentGroup.rotateX(this.currentDirection * deltaTime * this.rotateSpeed * THREE.Math.DEG2RAD);
                    break;
                case 2:
                    this.currentGroup.rotateZ(this.currentDirection * deltaTime * this.rotateSpeed * THREE.Math.DEG2RAD);
                    break;
            }
        }
    }

    public ShowArrow(axis: number, layer: number, direction: number, speed: number) {
        if (this.currentGroup !== undefined) this.currentGroup.parent.remove(this.currentGroup);
        this.currentAxis = axis;
        this.currentGroup = this.cubeAxisArrows[axis][direction];
        this.currentDirection = this.cubeAxisArrowsDirection[axis][direction];
        this.rotateSpeed = speed;

        const start = -this.step / 2 + 0.5;
        switch (axis) {
            case 0:
                this.currentGroup.position.set(0, start + layer, 0);
                break;
            case 1:
                this.currentGroup.position.set(start + layer, 0, 0);
                break;
            case 2:
                this.currentGroup.position.set(0, 0, start + layer);
                break;
        }
        this.currentGroup.scale.set(1, 1, 1);
        this.root.add(this.currentGroup);
    }

    public ShowArrowForMultiLayers(axis: number, p: number, scale: number, direction: number, speed: number) {
        if (this.currentGroup !== undefined) this.currentGroup.parent.remove(this.currentGroup);
        this.currentAxis = axis;
        this.currentGroup = this.cubeAxisArrows[axis][direction];
        this.currentDirection = this.cubeAxisArrowsDirection[axis][direction];
        this.rotateSpeed = speed;

        const start = -this.step / 2 + 0.5;
        switch (axis) {
            case 0:
                this.currentGroup.position.set(0, start + p, 0);
                break;
            case 1:
                this.currentGroup.position.set(start + p, 0, 0);
                break;
            case 2:
                this.currentGroup.position.set(0, 0, start + p);
                break;
        }
        this.currentGroup.scale.set(scale, scale, scale);
        this.root.add(this.currentGroup);
    }

    private generateYAxisArrows(step: number, layer: number, axisArrowSGeo: THREE.BufferGeometry | THREE.Geometry, group: THREE.Group,
        isNegitive: boolean) {
        const geo = axisArrowSGeo.clone();
        if (!isNegitive)
            geo.rotateY(180 * THREE.Math.DEG2RAD);
        geo.rotateX(-90 * THREE.Math.DEG2RAD);
        this.disposeGeometries.push(geo);
        const start = -step / 2 + 0.5;
        const position = Tools.MakeVector3(start - 0.5, start + layer, start - 0.5);

        for (let i = 0; i < 2; i++) {
            const mesh = new THREE.Mesh(geo, this.mat);
            const rot = Tools.MakeQuaternion(180 * i, Tools.MakeVector3(0, 1, 0));
            const pos = position.clone().applyQuaternion(rot);
            mesh.rotateY((45 + i * 180) * THREE.Math.DEG2RAD);
            mesh.position.copy(pos);
            group.add(mesh);
        }
    }

    private generateXAxisArrows(step: number, layer: number, axisArrowSGeo: THREE.BufferGeometry | THREE.Geometry, group: THREE.Group,
        isNegitive: boolean) {
        const geo = axisArrowSGeo.clone();
        // geo.scale(1, 1, 0.5);
        if (isNegitive)
            geo.rotateY(-90 * THREE.Math.DEG2RAD);
        else
            geo.rotateY(90 * THREE.Math.DEG2RAD);
        geo.rotateZ(180 * THREE.Math.DEG2RAD);
        this.disposeGeometries.push(geo);
        const start = -step / 2 + 0.5;
        const position = Tools.MakeVector3(start + layer, start - 0.5, start - 0.5);

        for (let i = 0; i < 2; i++) {
            const mesh = new THREE.Mesh(geo, this.mat);
            const rot = Tools.MakeQuaternion(180 * i, Tools.MakeVector3(1, 0, 0));
            const pos = position.clone().applyQuaternion(rot);
            mesh.rotateX((45 + i * 180) * THREE.Math.DEG2RAD);
            mesh.position.copy(pos);
            group.add(mesh);
        }
    }

    private generateZAxisArrows(step: number, layer: number, axisArrowSGeo: THREE.BufferGeometry | THREE.Geometry, group: THREE.Group,
        isNegitive: boolean) {
        const geo = axisArrowSGeo.clone();
        if (isNegitive) {
            geo.rotateZ(90 * THREE.Math.DEG2RAD);
        } else {
            geo.rotateX(180 * THREE.Math.DEG2RAD);
            geo.rotateZ(-90 * THREE.Math.DEG2RAD);
        }

        this.disposeGeometries.push(geo);
        const start = -step / 2 + 0.5;
        const position = Tools.MakeVector3(start - 0.5, start - 0.5, start + layer);

        for (let i = 0; i < 2; i++) {
            const mesh = new THREE.Mesh(geo, this.mat);
            const rot = Tools.MakeQuaternion(180 * i, Tools.MakeVector3(0, 0, 1));
            const pos = position.clone().applyQuaternion(rot);
            mesh.rotateZ((45 + i * 180) * THREE.Math.DEG2RAD);
            mesh.position.copy(pos);
            group.add(mesh);
        }
    }

    public dispose() {
        this.mat.dispose();
        this.disposeGeometries.forEach((value: THREE.BufferGeometry | THREE.Geometry,
            index: number, array: Array<THREE.BufferGeometry | THREE.Geometry>) => {
            value.dispose();
        });
    }

    Detach() {
        if (this.currentGroup !== undefined) {
            this.currentGroup.parent.remove(this.currentGroup);
            this.currentGroup = undefined;
        }
    }
}
