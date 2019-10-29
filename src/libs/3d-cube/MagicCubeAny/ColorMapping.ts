import THREE from '../three';
import { FaceTexturesHandle } from '../Assets';

export class ColorMapping {
    protected color: string;
    protected face: THREE.Mesh;
    protected textures: FaceTexturesHandle;
    constructor(color: string, face: THREE.Mesh, textures: FaceTexturesHandle) {
        this.color = color;
        this.face = face;
        this.textures = textures;
        this.updateFace();
    }
    public UpdateColor(color: string) {
        this.color = color;
        this.updateFace();
    }
    public GetColor(): string {
        return this.color;
    }
    private updateFace() {
        switch (this.color) {
            case 'h':
                (this.face.material as THREE.MeshPhongMaterial).map = this.textures.GetBlack();
                break;
            case 'r':
                (this.face.material as THREE.MeshPhongMaterial).map = this.textures.GetRed();
                break;
            case 'g':
                (this.face.material as THREE.MeshPhongMaterial).map = this.textures.GetGreen();
                break;
            case 'b':
                (this.face.material as THREE.MeshPhongMaterial).map = this.textures.GetBlue();
                break;
            case 'o':
                (this.face.material as THREE.MeshPhongMaterial).map = this.textures.GetOrange();
                break;
            case 'y':
                (this.face.material as THREE.MeshPhongMaterial).map = this.textures.GetYellow();
                break;
            case 'w':
                (this.face.material as THREE.MeshPhongMaterial).map = this.textures.GetWhite();
                break;
        }
    }

    public GetFace(): THREE.Object3D {
        return this.face;
    }
}
