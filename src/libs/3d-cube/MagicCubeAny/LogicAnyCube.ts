import {AnyCubeNode} from './LogicAnyCubeNode';
import * as THREE from 'three';
import { Layers, Vector3 } from 'three';
import { RotateAxis } from '../MCInputCache';
import {AnyCubeFactory} from './AnyCubeFactory';
import { AnyCubeRotateEventObserver } from './AnyCubeRotateAngleAccumulator';
import { Tools } from '../Util/Tools';
import { Debug } from '../Util/Debug';
import { FaceSide } from './FillColorScene/FaceSide';

class LayersDesc {
    public XLayer: number;
    public YLayer: number;
    public ZLayer: number;
}

export class LogicAnyCube implements AnyCubeRotateEventObserver {
    constructor(step: number, cubeGenerator: AnyCubeFactory, root: THREE.Group) {
        this.step = step;
        this.axisCubesContainer = new Array<Array<Array<AnyCubeNode>>>();
        for (let i = 0; i < 3; i++) {
            this.axisCubesContainer.push(new Array<Array<AnyCubeNode>>());
            for (let j = 0; j < step; j++) {
                this.axisCubesContainer[i].push(new Array<AnyCubeNode>());
            }
        }
        this.cubeMapping = new Map<string, AnyCubeNode>();
        const start = -step / 2.0 + 0.5;
        const end = step / 2.0 - 0.5;

        for (let y = start; y <= end; y++) {
            for (let x = start; x <= end; x++) {
                for (let z = start; z <= end; z++) {
                    if (y === start || y === end || x === start || x === end || z === start || z === end) {
                        const node = new AnyCubeNode(new THREE.Vector3(x, y, z));
                        this.cubeMapping.set(node.GetKey(), node);
                        const layers = this.getLayers(this.step, node.GetPosition());
                        this.axisCubesContainer[RotateAxis.X_AXIS][layers.XLayer].push(node);
                        this.axisCubesContainer[RotateAxis.Y_AXIS][layers.YLayer].push(node);
                        this.axisCubesContainer[RotateAxis.Z_AXIS][layers.ZLayer].push(node);
                        const controller = cubeGenerator.GenerateCube(new THREE.Vector3(x, y, z), this.step);
                        node.SetController(controller);
                        root.add(node.GetWholeCube());
                    }
                }
            }
        }

        cubeGenerator.AddStaticMeshToCube(root);

        this.rotateStartPosition = new Array<Array<Array<THREE.Vector3>>>();
        for (let i = 0; i < 3; i++) {
            this.rotateStartPosition.push(new Array<Array<THREE.Vector3>>());
            for (let j = 0; j < step; j++) {
                this.rotateStartPosition[i].push(new Array<THREE.Vector3>());
            }
        }
        this.generateYStartPosition();
        this.generateXStartPosition();
        this.generateZStartPosition();
    }
    private step: number;
    private axisCubesContainer: Array<Array<Array<AnyCubeNode>>>;
    private rotateStartPosition: Array<Array<Array<THREE.Vector3>>>;
    private cubeMapping: Map<string, AnyCubeNode>;

    private generateYStartPosition() {
        const start = -this.step / 2.0 + 0.5;
        const end = this.step / 2.0 - 0.5;
        for (let i = 0; i < this.step; i++) {
            const fixedY = start + i;
            if (i === 0 || i === this.step - 1) {
                const level_count = Math.floor(this.step / 2.0);
                let curX = start;
                let startZ = start;
                let endZ = end;
                let curLevel = level_count;
                while (curLevel > 0) {
                    for (let j = startZ; j < endZ; j++) {
                        this.rotateStartPosition[RotateAxis.Y_AXIS][i].push(new THREE.Vector3(curX, fixedY, j));
                    }
                    startZ += 1.0;
                    endZ -= 1.0;
                    curX += 1.0;
                    curLevel -= 1;
                }
            } else {
                const fixedX = start;
                for (let j = start; j < end; j++) {
                    this.rotateStartPosition[RotateAxis.Y_AXIS][i].push(new THREE.Vector3(fixedX, fixedY, j));
                }
            }
        }
    }

    private generateXStartPosition() {
        const start = -this.step / 2.0 + 0.5;
        const end = this.step / 2.0 - 0.5;
        for (let i = 0; i < this.step; i++) {
            const fixedX = start + i;
            if (i === 0 || i === this.step - 1) {
                const level_count = Math.floor(this.step / 2.0);
                let curY = start;
                let startZ = start;
                let endZ = end;
                let curLevel = level_count;
                while (curLevel > 0) {
                    for (let j = startZ; j < endZ; j++) {
                        this.rotateStartPosition[RotateAxis.X_AXIS][i].push(new THREE.Vector3(fixedX, curY, j));
                    }
                    startZ += 1.0;
                    endZ -= 1.0;
                    curY += 1.0;
                    curLevel -= 1;
                }
            } else {
                const fixedY = start;
                for (let j = start; j < end; j++) {
                    this.rotateStartPosition[RotateAxis.X_AXIS][i].push(new THREE.Vector3(fixedX, fixedY, j));
                }
            }
        }
    }

    private generateZStartPosition() {
        const start = -this.step / 2.0 + 0.5;
        const end = this.step / 2.0 - 0.5;
        for (let i = 0; i < this.step; i++) {
            const fixedZ = start + i;
            if (i === 0 || i === this.step - 1) {
                const level_count = Math.floor(this.step / 2.0);
                let curY = start;
                let startX = start;
                let endX = end;
                let curLevel = level_count;
                while (curLevel > 0) {
                    for (let j = startX; j < endX; j++) {
                        this.rotateStartPosition[RotateAxis.Z_AXIS][i].push(new THREE.Vector3(j, curY, fixedZ));
                    }
                    startX += 1.0;
                    endX -= 1.0;
                    curY += 1.0;
                    curLevel -= 1;
                }
            } else {
                const fixedY = start;
                for (let j = start; j < end; j++) {
                    this.rotateStartPosition[RotateAxis.Z_AXIS][i].push(new THREE.Vector3(j, fixedY, fixedZ));
                }
            }
        }
    }

    private getLayers(step: number, position: THREE.Vector3): LayersDesc {
        const start = -step / 2 + 0.5;
        const layers = new LayersDesc();
        layers.XLayer = Math.fround(position.x - start);
        layers.YLayer = Math.fround(position.y - start);
        layers.ZLayer = Math.fround(position.z - start);
        return layers;
    }

    public ForAllCubes(func: (cube: THREE.Group) => void) {
        this.cubeMapping.forEach((value: AnyCubeNode, key: string, map: Map<string, AnyCubeNode>) => {
            func(value.GetWholeCube());
        });
    }

    public GetFaceColor(position: THREE.Vector3, side: FaceSide): string {
        if (this.cubeMapping.has(Tools.PositionToKey(position))) {
            return this.cubeMapping.get(Tools.PositionToKey(position)).GetFaceColor(side);
        }
    }

    public SetColorToFace(position: THREE.Vector3, face: FaceSide, color: string) {
        if (this.cubeMapping.has(Tools.PositionToKey(position))) {
            this.cubeMapping.get(Tools.PositionToKey(position)).SetColorToFace(face, color);
        }
    }

    public GetRotateCubes(axis: RotateAxis, layer: number): Array<AnyCubeNode> {
        return this.axisCubesContainer[axis][layer];
    }

    public GetWholeCube(position: THREE.Vector3): THREE.Object3D {
        if (this.cubeMapping.has(Tools.PositionToKey(position))) {
            return this.cubeMapping.get(Tools.PositionToKey(position)).GetWholeCube();
        }
    }

    public GetCubeFace(position: THREE.Vector3, side: FaceSide): THREE.Object3D {
        if (this.cubeMapping.has(Tools.PositionToKey(position))) {
            return this.cubeMapping.get(Tools.PositionToKey(position)).GetFace(side);
        } else {
            return undefined;
        }
    }

    public OnRotate90(axis: RotateAxis, layer: number, direction: number): void {
        const positions = this.rotateStartPosition[axis][layer];
        const transferTarget = direction === 1 ? 1 : 0;
        for (let i = 0; i < positions.length; i++) {
            let currentNode = this.cubeMapping.get(Tools.PositionToKey(positions[i]));
            let currentCtrl = currentNode.GetController();
            for (let j = 0; j < 4; j++) {
                const nextKey = currentNode.GetNextKey(axis, transferTarget);
                const nextNode = this.cubeMapping.get(nextKey);
                if (!this.cubeMapping.has(nextKey)) {
                    Debug.Log('key not found', nextKey);
                }
                const nextCtrl = nextNode.GetController();
                nextNode.SetController(currentCtrl);
                currentCtrl = nextCtrl;
                currentNode = nextNode;
            }
        }

        const nodes = this.GetRotateCubes(axis, layer);
        const newDirection = direction === 1 ? 0 : 1;
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].OnRotate(axis, newDirection);
        }
    }

    public ResetAll() {
        this.cubeMapping.forEach((value: AnyCubeNode, key: string, map: Map<string, AnyCubeNode>) => {
            value.Reset();
        });
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

    public SetAllColor(colorStrings: Array<string>) {
        const start = -this.step / 2.0 + 0.5;
        const end = this.step / 2.0 - 0.5;
        for (let y = start; y <= end; y++) {
            for (let x = start; x <= end; x++) {
                for (let z = start; z <= end; z++) {
                    if (y === start || y === end || x === start || x === end || z === start || z === end) {
                        const position = new THREE.Vector3(x, y, z);
                        const key = Tools.PositionToKey(position);
                        const node = this.cubeMapping.get(key);
                        const colorString = colorStrings[0]
                        node.SetColor(colorString);
                        colorStrings.shift();
                    }
                }
            }
        }
    }
}
