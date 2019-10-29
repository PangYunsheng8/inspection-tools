import SpriteMeteorController from './SpriteMeteorController';
import * as THREE from 'three';

export default class SpriteMeteorElement {
    private velocity: THREE.Vector3;

    private life: number;

    private mesh: THREE.Mesh;

    private time: number;

    constructor(controller: SpriteMeteorController, position: THREE.Vector3, velocity: THREE.Vector3, life: number) {
        // parent.add(this.mesh);

        const tex = controller.getTexture();
        const container = controller.getContainer();

        // console.log(tex);
        const geo = new THREE.PlaneBufferGeometry(tex.image.width, tex.image.height);
        const mat = new THREE.MeshBasicMaterial({ map: tex, color: 0xffffff, side: THREE.DoubleSide, transparent: true, });
        this.mesh = new THREE.Mesh(geo, mat);
        container.add(this.mesh);
        this.mesh.position.copy(position);
        this.velocity = velocity;
        this.life = life;
        this.time = 0;
    }

    public update(deltaTime: number): void {
        this.time += deltaTime;
        const ds = -4.9 * this.time * deltaTime;
        const dv = new THREE.Vector3(0, ds, 0);
        this.mesh.position.add(dv.multiplyScalar(300));
        // this.mesh.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        this.life -= deltaTime;
    }

    public getLife(): number {
        return this.life;
    }

    public dispose() {
        if (this.mesh) {
            (this.mesh.material as THREE.Material).dispose();
            this.mesh.geometry.dispose();
        }
    }
}

