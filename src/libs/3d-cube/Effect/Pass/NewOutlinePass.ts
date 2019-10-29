import * as THREE from 'three';
import { OutlinePass } from './OutlinePass';
import { BeanParticleHandler } from '../ParticleSystem/ParticleSystemHandlers';

export default class NewOutlinePass extends OutlinePass {
    constructor(resolution: THREE.Vector2, scene: THREE.Scene, camera: THREE.Camera, selectedObjects?: THREE.Object3D[]) {
        super(resolution, scene, camera, selectedObjects);
    }

    public activesParticles: Map<string, BeanParticleHandler>;

    public setParticleVisibility(visibility: boolean) {
        if (this.activesParticles.size > 0) {
            this.activesParticles.forEach((value: BeanParticleHandler, key: string, map: Map<string, BeanParticleHandler>) => {
                value.GetContainer().visible = visibility;
            });
        }
    }


    public changeVisibilityOfSelectedObjects(bVisible: boolean): void {
        super.changeVisibilityOfSelectedObjects(bVisible);
        if (bVisible) this.setParticleVisibility(false);
    }

    public changeVisibilityOfNonSelectedObjects(bVisible: boolean): void {
        super.changeVisibilityOfNonSelectedObjects(bVisible);
        if (bVisible) this.setParticleVisibility(false);
    }
    public render(renderer: THREE.WebGLRenderer,
        writeBuffer: THREE.WebGLRenderTarget,
        readBuffer: THREE.WebGLRenderTarget,
        delta: number,
        maskActive: boolean) {
        super.render(renderer, writeBuffer, readBuffer, delta, maskActive);
        this.setParticleVisibility(true);
    }
}
