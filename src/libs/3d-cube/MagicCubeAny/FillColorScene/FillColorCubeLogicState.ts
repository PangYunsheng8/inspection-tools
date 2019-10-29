import { FillColorCubeNode } from './FillColorCubeNode';
import { AnyCubeFactory } from '../AnyCubeFactory';
import * as THREE from 'three';
import { Tools } from '../../Util/Tools';
import { FaceSide } from './FaceSide';
import { FillColorEventBinder } from './FillColorEventBinder';

export class FillColorCubeLogicState {
    private step: number;
    private cubeMapping: Map<string, FillColorCubeNode>;
    private faces: Array<Array<THREE.Object3D>>;
    constructor(step: number, cubeGenerator: AnyCubeFactory, root: THREE.Group) {
        this.step = step;
        this.cubeMapping = new Map<string, FillColorCubeNode>();
        this.faces = new Array<Array<THREE.Object3D>>();
        for (let i = 0; i < 6; i++) {
            this.faces[i] = new Array<THREE.Object3D>();
        }
        const start = -step / 2.0 + 0.5;
        const end = step / 2.0 - 0.5;

        for (let y = start; y <= end; y++) {
            for (let x = start; x <= end; x++) {
                for (let z = start; z <= end; z++) {
                    if (y === start || y === end || x === start || x === end || z === start || z === end) {
                        const position = new THREE.Vector3(x, y, z);
                        const node = new FillColorCubeNode(position);
                        const controller = cubeGenerator.GenerateFillColorCube(position, this.step);
                        node.SetController(controller);
                        this.cubeMapping.set(Tools.PositionToKey(position), node);
                        root.add(node.GetWholeCube());
                        if (this.isStart(y)) {
                            this.faces[FaceSide.DOWN].push(node.GetFace(FaceSide.DOWN));
                        } else if (this.isEnd(y)) {
                            this.faces[FaceSide.UP].push(node.GetFace(FaceSide.UP));
                        }

                        if (this.isStart(x)) {
                            this.faces[FaceSide.RIGHT].push(node.GetFace(FaceSide.RIGHT));
                        } else if (this.isEnd(x)) {
                            this.faces[FaceSide.LEFT].push(node.GetFace(FaceSide.LEFT));
                        }

                        if (this.isStart(z)) {
                            this.faces[FaceSide.BACK].push(node.GetFace(FaceSide.BACK));
                        } else if (this.isEnd(z)) {
                            this.faces[FaceSide.FRONT].push(node.GetFace(FaceSide.FRONT));
                        }
                    }
                }
            }
        }
        // console.log('fill color', root);
    }

    public SetFaceActive(position: THREE.Vector3, side: FaceSide, active: boolean) {
        if (this.cubeMapping.has(Tools.PositionToKey(position))) {
            this.cubeMapping.get(Tools.PositionToKey(position)).SetFaceActive(side, active);
        }
    }

    public SetColorToFace(position: THREE.Vector3, face: FaceSide, color: string) {
        if (this.cubeMapping.has(Tools.PositionToKey(position))) {
            this.cubeMapping.get(Tools.PositionToKey(position)).SetColorToFace(face, color);
        }
    }

    public GetFaceColor(position: THREE.Vector3, side: FaceSide): string {
        if (this.cubeMapping.has(Tools.PositionToKey(position))) {
            return this.cubeMapping.get(Tools.PositionToKey(position)).GetFaceColor(side);
        }
    }

    public OnBind(binder: FillColorEventBinder) {
        this.cubeMapping.forEach((value: FillColorCubeNode, key: string, map: Map<string, FillColorCubeNode>) => {
            value.OnBind(binder);
        });
    }

    public GetFaces(side: FaceSide): Array<THREE.Object3D> {
        return this.faces[side];
    }

    private isStart(value: number): boolean {
        return value === (-this.step / 2.0 + 0.5);
    }

    private isEnd(value: number): boolean {
        return value === (this.step / 2.0 - 0.5);
    }

    public GetAllColor(): Array<string> {
        const start = -this.step / 2.0 + 0.5;
        const end = this.step / 2.0 - 0.5;
        const res = new Array<string>();
        for (let y = start; y <= end; y++) {
            for (let x = start; x <= end; x++) {
                for (let z = start; z <= end; z++) {
                    if (y === start || y === end || x === start || x === end || z === start || z === end) {
                        const position = new THREE.Vector3(x, y, z);
                        const key = Tools.PositionToKey(position);
                        const node = this.cubeMapping.get(key);
                        const colorString = node.GetColorString();
                        res.push(colorString);
                    }
                }
            }
        }
        return res;
    }
}
