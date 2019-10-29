import * as THREE from 'three';
import { Debug } from '../../Util/Debug';
export class Particle {
    public life: number;
    public color: THREE.Vector4;
    public velocity: THREE.Vector3;
    public available: boolean;
    public sprite: THREE.Mesh;
    public speed: number;
    public constructor(geo: THREE.BufferGeometry, mat: THREE.ShaderMaterial) {
        this.life = 0.0;
        this.sprite = new THREE.Mesh(geo, mat);
        this.sprite.position.set(0, 0, 0);
        this.sprite.scale.set(1, 1, 1);
        this.velocity = new THREE.Vector3();
        this.available = true;
        this.color = new THREE.Vector4(1, 1, 1, 1);
        this.speed = 0;
    }
    public Reset(): void {
        if (this.sprite.parent !== null) {
            this.sprite.parent.remove(this.sprite);
        }
        this.life = 0.0;
        this.available = true;
        this.sprite.scale.set(1, 1, 1);
        this.velocity.set(0, 0, 0);
        this.color = new THREE.Vector4(1, 1, 1, 1);
        this.speed = 0;
    }
}
