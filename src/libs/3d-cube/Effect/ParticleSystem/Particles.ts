import { ParticleRenderMode } from './ParticleRenderMode';
import * as THREE from 'three';
import {ShaderRepo} from '../../Shaders';
import {Particle} from './Particle';
import { Debug } from '../../Util/Debug';

export enum LifeProperty {
    Interval = 0,
    Permanent = 1,
}

export class Particles {
    //  options
    private speed: number;
    private max: number;
    private sizeStart: number;
    private sizeEnd: number;
    private colorStart: THREE.Vector4;
    private colorEnd: THREE.Vector4;
    private angularSpeed: number;
    private lifeProperty: LifeProperty;
    private life: number;

    private position: THREE.Vector3;
    private rotation: THREE.Euler;
    private invQuaternion: THREE.Quaternion;
    private front: THREE.Vector3;
    private rateOverTime: number;
    private randomness: THREE.Vector3;
    private rendermode: ParticleRenderMode;
    private sort: boolean;

    public system: THREE.Group;
    private pool: Array<Particle> = [];
    private buffer: Array<Particle> = [];
    private emissionTime: number;

    private geometry: THREE.BufferGeometry;
    private material: THREE.MeshBasicMaterial;
    private shaderMaterial: THREE.ShaderMaterial;

    private camera: THREE.PerspectiveCamera;

    public UpdatePosition(position: THREE.Vector3) {
        this.position.copy(position);
    }

    constructor(opts: any = {}, camera: THREE.PerspectiveCamera) {
        this.life = opts.life === undefined ? 1 : opts.life;
        this.lifeProperty = opts.lifeProperty === undefined ? LifeProperty.Interval : opts.lifeProperty;
        this.max = opts.max === undefined ? 10 : opts.max;
        this.sizeStart = opts.sizeStart === undefined ? 1 : opts.sizeStart;
        this.sizeEnd = opts.sizeEnd === undefined ? 1 : opts.sizeEnd;
        this.position = opts.position === undefined ? new THREE.Vector3(0, 0, 0) : opts.position;
        this.rotation = opts.rotation === undefined ? new THREE.Euler(0, 0, 0) : opts.rotation;

        this.randomness = opts.randomness === undefined ? new THREE.Vector3() : opts.randomness;
        this.speed = opts.speed === undefined ? 0 : opts.speed;
        this.colorStart = opts.colorStart === undefined ? new THREE.Vector4(1, 1, 1, 1) : opts.colorStart;
        this.colorEnd = opts.colorEnd === undefined ? new THREE.Vector4(1, 1, 1, 1) : opts.colorEnd;
        this.angularSpeed = opts.angularSpeed === undefined ? 0 : opts.angularSpeed * Math.PI / 180.0;
        this.front = opts.front === undefined ? new THREE.Vector3(0, 1, 0) : opts.front;
        this.rendermode = opts.rendermode === undefined ? ParticleRenderMode.Verticle : opts.rendermode;
        this.invQuaternion = new THREE.Quaternion();
        this.invQuaternion.setFromEuler(this.rotation).inverse();

        this.rateOverTime = opts.rateOverTime === undefined ? 1 : 1 / opts.rateOverTime;
        if (this.rateOverTime === 0) {
            this.rateOverTime = 1 / 0.00001;
        }

        if (this.rendermode !== ParticleRenderMode.Mesh) {
            const geoSize = opts.planeSize === undefined ? new THREE.Vector2(1, 1) : opts.planeSize;
            this.geometry = new THREE.PlaneBufferGeometry(geoSize.x, geoSize.y, 1);
        } else {
            this.geometry = opts.meshGeometry;
        }

        this.rendermode = opts.rendermode === undefined ? ParticleRenderMode.Verticle : opts.rendermode;
        if (this.rendermode === ParticleRenderMode.Horizontal) {
            const matrix = new THREE.Matrix4();
            matrix.makeRotationFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
            this.geometry.applyMatrix(matrix);
        }
        this.material = new THREE.MeshBasicMaterial({
            map: opts.map === undefined ? null : opts.map,
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: true,
            blending: THREE.AdditiveBlending,
            lights: false,
            color: new THREE.Color(0xffffff),
        });

        // this.front = new THREE.Vector3(0, 1, 0);
        this.camera = camera;
        this.build(opts);
    }

    private build(opts: any = {}): void {
        this.emissionTime = 0;
        this.pool = [];
        this.buffer = [];
        for (let i = 0; i < this.max; i++) {
            const p = new Particle(this.geometry, new THREE.ShaderMaterial({
                side: THREE.DoubleSide,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                uniforms: {
                    tDiffuse: { value: opts.map === undefined ? null : opts.map },
                    tAdd: { value: opts.map === undefined ? null : opts.map },
                    fCoeff: { value: 1.0 },
                    vTintColor: { value: this.colorStart }
                },
                vertexShader: ShaderRepo.Additive.vertexShader,
                fragmentShader: ShaderRepo.Additive.fragmentShader,
            }));
            this.pool.push(p);
            this.buffer.push(p);
        }

        this.system = new THREE.Group();
        this.system.position.copy(this.position);
        this.system.rotation.copy(this.rotation);
    }

    public emit(count: number): void {
        const emitable = Math.min(count, this.pool.length);
        for (let i = 0; i < emitable; i++) {
            const p = this.pool.pop();
            p.available = false;
            p.life = 1.0;
            this.system.add(p.sprite);
            p.sprite.position.set(0, 0, 0);
            p.sprite.scale.set(0, 0, 0);
            p.color.copy(this.colorStart);
            const mat = p.sprite.material as THREE.ShaderMaterial;
            mat.uniforms.vTintColor.value = p.color;
            p.sprite.visible = true;
            p.speed = this.speed;
        }
    }

    private randomVector(): THREE.Vector3 {
        return new THREE.Vector3(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
        )
    }

    public update(deltaTime: number): void {
        this.emissionTime += deltaTime;
        const ageing = deltaTime / this.life;
        const cameraPos = new THREE.Vector3();
        this.camera.getWorldPosition(cameraPos);
        cameraPos.y = 0;
        // Debug.Log(this.buffer.length);
        if (this.emissionTime >= this.rateOverTime || this.pool.length === this.max) {
            this.emit(1);
            this.emissionTime -= this.rateOverTime;
        }
        for (let i = 0; i < this.buffer.length; i++) {
            const p = this.buffer[i];
            if (p.available) continue;
            if (this.lifeProperty === LifeProperty.Interval)
                p.life -= ageing;
            if (p.life <= 0 && !p.available) {
                p.Reset();
                this.pool.push(p);
                continue;
            }
            const dl = 1 - p.life;

            //  更新尺寸大小
            const size = new THREE.Vector3(1, 1, 1);
            const sizeLerp = THREE.Math.lerp(this.sizeStart, this.sizeEnd, dl);
            size.multiplyScalar(sizeLerp);
            p.sprite.scale.copy(size);

            //  更新颜色
            const cs = this.colorStart.clone();
            const ce = this.colorEnd.clone();
            const color = cs.lerp(ce, dl);
            p.color.copy(color);
            const mat = p.sprite.material as THREE.ShaderMaterial;
            mat.uniforms.vTintColor.value = p.color;

            //  更新位置
            const dv = new THREE.Vector3();
            dv.copy(this.system.up).add(
                this.randomVector().multiply(this.randomness)
            ).normalize().multiplyScalar(deltaTime * p.speed);
            p.sprite.position.add(dv);

            if (this.angularSpeed !== 0) {
                p.sprite.rotateOnAxis(this.front, this.angularSpeed * deltaTime);
            }

            if (this.rendermode === ParticleRenderMode.Verticle) {
                // const front = new THREE.Vector3();
                // p.sprite.getWorldDirection(front);
                // const target = cameraPos.clone().applyQuaternion(this.invQuaternion);
                // const angle = front.angleTo(target);
                // p.sprite.rotateOnAxis(p.sprite.up, angle);
                p.sprite.lookAt(this.camera.position);
            }
        }
    }

    public UpdateStartColor(color: THREE.Vector4) {
        this.colorStart.copy(color);
    }

    public UpdateEndColor(color: THREE.Vector4) {
        this.colorEnd.copy(color);
    }
}


