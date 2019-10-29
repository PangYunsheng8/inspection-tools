import SpriteMeteorElement from './SpriteMeteorElement';
import * as THREE from 'three';

export default class SpriteMeteorController {
    private texture: THREE.Texture;

    private maxElementCount: number;
    private elementsBuffer: Array<SpriteMeteorElement>;
    private scene: THREE.Scene;

    private group: THREE.Group;

    private width: number;
    private spawnStartPosition: THREE.Vector3;
    private spawnDirection: THREE.Vector3;

    constructor(scene: THREE.Scene, width: number, maxElementCount: number, background: THREE.Texture) {
        this.scene = scene;
        this.maxElementCount = maxElementCount;
        this.elementsBuffer = new Array<SpriteMeteorElement>();
        this.texture = new THREE.TextureLoader().load('assets/MagicCube/Texture/ui/meteor.png');
        this.group = new THREE.Group();
        this.scene.add(this.group);
        this.spawnDirection = new THREE.Vector3(1, 0, 0);
        this.spawnStartPosition = new THREE.Vector3(-width / 2.0, 0, 0);
        this.width = width;
        this.group.rotateZ(45 * Math.PI / 180.0);
        this.group.position.set(-background.image.width / 1.5, background.image.height / 2.0, 0);
    }

    public getTexture(): THREE.Texture {
        return this.texture;
    }

    public getContainer(): THREE.Group {
        return this.group;
    }

    public update(deltaTime: number): void {
        while (this.elementsBuffer.length > 0 && this.elementsBuffer[0].getLife() <= 0.0) {
            this.elementsBuffer[0].dispose();
            this.elementsBuffer.shift();
        }

        for (let i = 0; i < this.elementsBuffer.length; i++) {
            this.elementsBuffer[i].update(deltaTime);
        }
    }

    public emit(count: number): void {
        while (count !== 0 && this.elementsBuffer.length < this.maxElementCount) {
            // tslint:disable-next-line:max-line-length
            const startPosition = this.spawnStartPosition.clone().add(this.spawnDirection.clone().multiplyScalar(Math.random() * this.width));
            const randomHeight = Math.random() * 500;
            startPosition.y = randomHeight;
            this.elementsBuffer.push(new SpriteMeteorElement(this, startPosition, new THREE.Vector3(0, -200, 0), 2.5));
            count--;
        }
    }

    public dispose() {
        this.texture.dispose();
        if (this.elementsBuffer.length > 0) {
            while (this.elementsBuffer.length > 0) {
                this.elementsBuffer[0].dispose();
                this.elementsBuffer.shift();
            }
        }
    }
}
