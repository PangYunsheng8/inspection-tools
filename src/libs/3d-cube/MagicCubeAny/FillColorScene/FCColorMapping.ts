import { ColorMapping } from '../ColorMapping';
import { FaceTexturesHandle } from '../../Assets';
import { ColorOptions } from '../../ColorOptions';
import THREE from '../../three';
import { Color } from 'three';
export class FCColorMapping extends ColorMapping {
    private active: boolean
    constructor(color: string, face: THREE.Mesh, textures: FaceTexturesHandle) {
        super(color, face, textures);
        this.active = true;
    }

    public SetActive(active: boolean) {
        this.active = active;
    }

    public IsActive(): boolean {
        return this.active;
    }

    public GetUID(): string {
        return this.face.uuid;
    }

    public GetFace(): THREE.Object3D {
        return this.face;
    }

    public OnClick(color: ColorOptions): string {
        const oldColor = this.color;
        switch (color) {
            case ColorOptions.B:
                this.UpdateColor('b');
                break;
            case ColorOptions.G:
                this.UpdateColor('g');
                break;
            case ColorOptions.O:
                this.UpdateColor('o');
                break;
            case ColorOptions.R:
                this.UpdateColor('r');
                break;
            case ColorOptions.W:
                this.UpdateColor('w');
                break;
            case ColorOptions.Y:
                this.UpdateColor('y');
                break;
            case ColorOptions.UNKNOWN:
                this.UpdateColor('h');
                break;
        }
        return oldColor;
    }
}
