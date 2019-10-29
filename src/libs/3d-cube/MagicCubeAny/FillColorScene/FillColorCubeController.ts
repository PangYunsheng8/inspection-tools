import * as THREE from 'three';
import { FCColorMapping } from './FCColorMapping';
import { FaceTexturesHandle } from '../../Assets';
import { FillColorEventBinder } from './FillColorEventBinder';
import { FaceSide } from './FaceSide';

export class FillColorCubeController {
    private color: Array<FCColorMapping>;
    private wholeCube: THREE.Group;
    constructor(position: THREE.Vector3) {
        this.color = new Array<FCColorMapping>();
        this.wholeCube = new THREE.Group();
        this.wholeCube.position.copy(position);
    }

    public SetFaceActive(side: FaceSide, active: boolean) {
        switch (side) {
            case FaceSide.LEFT:
                if (this.color[3] !== undefined)
                    return this.color[3].SetActive(active);
                break;
            case FaceSide.RIGHT:
                if (this.color[2] !== undefined)
                    return this.color[2].SetActive(active);
                break;
            case FaceSide.DOWN:
                if (this.color[0] !== undefined)
                    return this.color[0].SetActive(active);
                break;
            case FaceSide.UP:
                if (this.color[1] !== undefined)
                    return this.color[1].SetActive(active);
                break;
            case FaceSide.BACK:
                if (this.color[4] !== undefined)
                    return this.color[4].SetActive(active);
                break;
            case FaceSide.FRONT:
                if (this.color[5] !== undefined)
                    return this.color[5].SetActive(active);
                break;
        }
    }

    public GetFaceColor(side: FaceSide): string {
        switch (side) {
            case FaceSide.LEFT:
                if (this.color[3] !== undefined)
                    return this.color[3].GetColor();
                else
                    return 'h';
            case FaceSide.RIGHT:
                if (this.color[2] !== undefined)
                    return this.color[2].GetColor();
                else
                    return 'h';
            case FaceSide.DOWN:
                if (this.color[0] !== undefined)
                    return this.color[0].GetColor();
                else
                    return 'h';
            case FaceSide.UP:
                if (this.color[1] !== undefined)
                    return this.color[1].GetColor();
                else
                    return 'h';
            case FaceSide.BACK:
                if (this.color[4] !== undefined)
                    return this.color[4].GetColor();
                else
                    return 'h';
            case FaceSide.FRONT:
                if (this.color[5] !== undefined)
                    return this.color[5].GetColor();
                else
                    return 'h';
        }
    }

    public SetColorToFace(side: FaceSide, color: string) {
        let index;
        switch (side) {
            case FaceSide.LEFT:
                index = 3;
                break;
            case FaceSide.RIGHT:
                index = 2;
                break;
            case FaceSide.DOWN:
                index = 0;
                break;
            case FaceSide.UP:
                index = 1;
                break;
            case FaceSide.BACK:
                index = 4;
                break;
            case FaceSide.FRONT:
                index = 5;
                break;
        }
        if (this.color[index] !== undefined) {
            this.color[index].UpdateColor(color);
        }
    }

    public GetWholeCube(): THREE.Group {
        return this.wholeCube;
    }

    public GetFace(side: FaceSide): THREE.Object3D {
        switch (side) {
            case FaceSide.LEFT:
                return this.color[3].GetFace();
            case FaceSide.RIGHT:
                return this.color[2].GetFace();
            case FaceSide.DOWN:
                return this.color[0].GetFace();
            case FaceSide.UP:
                return this.color[1].GetFace();
            case FaceSide.BACK:
                return this.color[4].GetFace();
            case FaceSide.FRONT:
                return this.color[5].GetFace();
        }
    }

    public AddFaces(faces: THREE.Mesh[], textures: FaceTexturesHandle[]): FillColorCubeController {
        for (let i = 0; i < faces.length; i++) {
            if (faces[i] !== undefined) {
                this.color.push(new FCColorMapping('h', faces[i], textures[i]));
                this.wholeCube.add(faces[i]);
            } else {
                this.color.push(undefined);
            }
        }
        return this;
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

    public OnBind(binder: FillColorEventBinder) {
        for (let i = 0; i < this.color.length; i++) {
            if (this.color[i] !== undefined)
                binder.Bind(this.color[i].GetUID(), this.color[i]);
        }
    }
}
