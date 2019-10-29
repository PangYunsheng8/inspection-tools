import * as THREE from 'three';
import { FaceTexturesHandle } from '../Assets';
import { Vector3 } from 'three';
import { RotateAxis } from '../MCInputCache';
import { ColorMapping } from './ColorMapping';
import { FaceSide } from './FillColorScene/FaceSide';
export class AnyCubeController {
    private static ColorSwapChain: Array<Array<Array<number>>> = [
        [
            [5, 3, 4, 2, 5],
            [5, 2, 4, 3, 5]
        ],
        [
            [1, 5, 0, 4, 1],
            [1, 4, 0, 5, 1]
        ],
        [
            [1, 2, 0, 3, 1],
            [1, 3, 0, 2, 1]
        ]

    ];
    private color: Array<ColorMapping>;
    private wholeCube: THREE.Group;
    constructor(position: THREE.Vector3) {
        this.color = new Array<ColorMapping>();
        this.wholeCube = new THREE.Group();
        this.wholeCube.position.copy(position);
    }

    public ReplaceWholeCube(wholeCube: THREE.Group) {
        wholeCube.position.copy(this.wholeCube.position);
        this.wholeCube = wholeCube;
    }

    public Reset(position: THREE.Vector3) {
        this.wholeCube.quaternion.copy(new THREE.Quaternion(0, 0, 0, 1));
        this.wholeCube.position.copy(position);
        for (let i = 0; i < this.color.length; i++) {
            if (this.color[i] !== undefined)
                this.color[i].UpdateColor('h');
        }
    }

    public AddFaces(faces: THREE.Mesh[], textures: FaceTexturesHandle[]): AnyCubeController {
        for (let i = 0; i < faces.length; i++) {
            // this.faces.push(faces[i]);
            // this.textures.push(textures[i]);
            if (faces[i] !== undefined) {
                this.color.push(new ColorMapping('h', faces[i], textures[i]));
                this.wholeCube.add(faces[i]);
            } else {
                this.color.push(undefined);
            }
        }
        return this;
    }

    public GetFaceColor(side: FaceSide): string {
        switch (side) {
            case FaceSide.LEFT:
                if (this.color[3] === undefined)
                    return 'h';
                else
                    return this.color[3].GetColor();
            case FaceSide.RIGHT:
                if (this.color[2] === undefined)
                    return 'h';
                else
                    return this.color[2].GetColor();
            case FaceSide.DOWN:
                if (this.color[0] === undefined)
                    return 'h';
                else
                    return this.color[0].GetColor();
            case FaceSide.UP:
                if (this.color[1] === undefined)
                    return 'h';
                else
                    return this.color[1].GetColor();
            case FaceSide.BACK:
                if (this.color[4] === undefined)
                    return 'h';
                else
                    return this.color[4].GetColor();
            case FaceSide.FRONT:
                if (this.color[5] === undefined)
                    return 'h';
                else
                    return this.color[5].GetColor();
        }
    }

    public SetColorToFace(face: FaceSide, color: string) {
        switch (face) {
            case FaceSide.LEFT:
                if (this.color[3] !== undefined)
                    this.color[3].UpdateColor(color);
                break;
            case FaceSide.RIGHT:
                if (this.color[2] !== undefined)
                    this.color[2].UpdateColor(color);
                break;
            case FaceSide.DOWN:
                if (this.color[0] !== undefined)
                    this.color[0].UpdateColor(color);
                break;
            case FaceSide.UP:
                if (this.color[1] !== undefined)
                    this.color[1].UpdateColor(color);
                break;
            case FaceSide.BACK:
                if (this.color[4] !== undefined)
                    this.color[4].UpdateColor(color);
                break;
            case FaceSide.FRONT:
                if (this.color[5] !== undefined)
                    this.color[5].UpdateColor(color);
                break;
        }
    }

    public UpdateColor(colors: string) {
        for (let i = 0; i < colors.length; i++) {
            if (this.color[i] !== undefined)
                this.color[i].UpdateColor(colors[i]);
        }
    }

    public GetWholeCube(): THREE.Group {
        return this.wholeCube;
    }

    public GetFace(side: FaceSide): THREE.Object3D {
        switch (side) {
            case FaceSide.LEFT:
                if (this.color[3] !== undefined)
                    return this.color[3].GetFace();
                else
                    return undefined;
            case FaceSide.RIGHT:
                if (this.color[2] !== undefined)
                    return this.color[2].GetFace();
                else
                    return undefined;
            case FaceSide.DOWN:
                if (this.color[0] !== undefined)
                    return this.color[0].GetFace();
                else
                    return undefined;
            case FaceSide.UP:
                if (this.color[1] !== undefined)
                    return this.color[1].GetFace();
                else
                    return undefined;
            case FaceSide.BACK:
                if (this.color[4] !== undefined)
                    return this.color[4].GetFace();
                else
                    return undefined;
            case FaceSide.FRONT:
                if (this.color[5] !== undefined)
                    return this.color[5].GetFace();
                else
                    return undefined;
        }
    }

    public GetColorString(): string {
        let res = '';
        for (let i = 0; i < this.color.length; i++) {
            if (this.color[i] !== undefined)
                res += this.color[i].GetColor();
            else
                res += 'h';
        }
        return res;
    }

    public RotateColorMapping(axis: RotateAxis, direction: number) {
        direction = THREE.Math.clamp(direction, 0, 1);
        axis = THREE.Math.clamp(axis, RotateAxis.Y_AXIS, RotateAxis.Z_AXIS);
        const swapChain = AnyCubeController.ColorSwapChain[axis][direction];
        let currentColorMapping = this.color[swapChain[0]];
        for (let i = 1; i < swapChain.length; i++) {
            const nextColorMapping = this.color[swapChain[i]];
            this.color[swapChain[i]] = currentColorMapping;
            currentColorMapping = nextColorMapping;
        }
    }
}
