import {AnyCubeInstance} from '../AnyCubeInstance';
import {AnyFaceDecoder} from './AnyFaceDecoder';
import { Tools } from '../../Util/Tools';
import { BeanParticleHandler, BeanStatus } from '../../Effect/ParticleSystem/ParticleSystemHandlers';
import { FaceSide } from '../FillColorScene/FaceSide';
import { Debug } from '../../Util/Debug';
import { BeanStatusTable } from './BeanStatusTable';
import * as THREE from 'three';

export default class BeanEffectManager {
    private step: number;
    private cubeInstance: AnyCubeInstance;
    private beanHandlers: Map<string, BeanParticleHandler>;
    private activeBeanHandlers: Map<string, BeanParticleHandler>;
    private flowColorMapping: Map<string, THREE.Vector4>;
    constructor(step: number, cubeInstance: AnyCubeInstance, camera: THREE.PerspectiveCamera,
        beamGeo: THREE.BufferGeometry | THREE.Geometry) {
        this.step = step;
        this.cubeInstance = cubeInstance;
        this.beanHandlers = new Map<string, BeanParticleHandler>();
        this.activeBeanHandlers = new Map<string, BeanParticleHandler>();
        this.flowColorMapping = new Map<string, THREE.Vector4>();
        const circleTex = new THREE.TextureLoader().load('assets/MagicCube/Texture/particle/002.png');
        const beanTex = new THREE.TextureLoader().load('assets/MagicCube/Texture/particle/aura_vertical_soft.png');
        const pointsTex = new THREE.TextureLoader().load('assets/MagicCube/Texture/particle/spark.png');

        //  PARAM::蓝色面的光束的跟随颜色 RGBA
        const flowColor = Tools.MakeVector4(0, 0, 1, 0.8);
        this.flowColorMapping.set('b', Tools.MakeVector4(0, 0, 1, 0.8));
        for (let j = 0; j < step * step; j++) {
            const result = AnyFaceDecoder.Decode(step, 2, j);
            const face = this.cubeInstance.GetFace(result.position, result.side);
            const handler = new BeanParticleHandler(camera, face, flowColor, circleTex, beanTex, pointsTex, beamGeo);
            handler.MoveTo(0, 0, 0.55);
            this.beanHandlers.set(face.uuid, handler);
        }

        //  PARAM::黄色面的光束的跟随颜色 RGBA
        flowColor.copy(Tools.MakeVector4(1, 1, 0, 0.4));
        this.flowColorMapping.set('y', Tools.MakeVector4(1, 1, 0, 0.8));
        for (let j = 0; j < step * step; j++) {
            const result = AnyFaceDecoder.Decode(step, 0, j);
            const face = this.cubeInstance.GetFace(result.position, result.side);
            const handler = new BeanParticleHandler(camera, face, flowColor, circleTex, beanTex, pointsTex, beamGeo);
            handler.MoveTo(0, 0.55, 0);
            handler.RotateX(-90);
            this.beanHandlers.set(face.uuid, handler);
        }

        //  PARAM::橘色面的光束的跟随颜色 RGBA
        flowColor.copy(Tools.MakeVector4(1, 0.54, 0, 0.8));
        this.flowColorMapping.set('o', Tools.MakeVector4(1, 0.54, 0, 0.8));
        for (let j = 0; j < step * step; j++) {
            const result = AnyFaceDecoder.Decode(step, 1, j);
            const face = this.cubeInstance.GetFace(result.position, result.side);
            const handler = new BeanParticleHandler(camera, face, flowColor, circleTex, beanTex, pointsTex, beamGeo);
            handler.MoveTo(-0.55, 0, 0);
            handler.RotateY(-90);
            this.beanHandlers.set(face.uuid, handler);
        }

        //  PARAM::红色面的光束的跟随颜色 RGBA
        flowColor.copy(Tools.MakeVector4(1, 0, 0, 0.8));
        this.flowColorMapping.set('r', Tools.MakeVector4(1, 0, 0, 0.8));
        for (let j = 0; j < step * step; j++) {
            const result = AnyFaceDecoder.Decode(step, 3, j);
            const face = this.cubeInstance.GetFace(result.position, result.side);
            const handler = new BeanParticleHandler(camera, face, flowColor, circleTex, beanTex, pointsTex, beamGeo);
            handler.MoveTo(0.55, 0, 0);
            handler.RotateY(90);
            this.beanHandlers.set(face.uuid, handler);
        }

        //  PARAM::绿色面的光束的跟随颜色 RGBA
        flowColor.copy(Tools.MakeVector4(0, 1, 0, 0.8));
        this.flowColorMapping.set('g', Tools.MakeVector4(0, 1, 0, 0.8));
        for (let j = 0; j < step * step; j++) {
            const result = AnyFaceDecoder.Decode(step, 4, j);
            const face = this.cubeInstance.GetFace(result.position, result.side);
            const handler = new BeanParticleHandler(camera, face, flowColor, circleTex, beanTex, pointsTex, beamGeo);
            handler.MoveTo(0, 0, -0.55);
            handler.RotateY(180);
            this.beanHandlers.set(face.uuid, handler);
        }

        //  PARAM:白色色面的光束的跟随颜色 RGBA
        flowColor.copy(Tools.MakeVector4(0.3, 0.3, 0.3, 0.8));
        this.flowColorMapping.set('w', Tools.MakeVector4(0.3, 0.3, 0.3, 0.8));
        for (let j = 0; j < step * step; j++) {
            const result = AnyFaceDecoder.Decode(step, 5, j);
            const face = this.cubeInstance.GetFace(result.position, result.side);
            const handler = new BeanParticleHandler(camera, face, flowColor, circleTex, beanTex, pointsTex, beamGeo);
            handler.MoveTo(0, -0.55, 0);
            handler.RotateX(90);
            this.beanHandlers.set(face.uuid, handler);
        }
        this.flowColorMapping.set('h', Tools.MakeVector4(0.0, 0.0, 0.0, 0.00));

    }

    public GetActiveParticle(): Map<string, BeanParticleHandler> {
        return this.activeBeanHandlers;
    }

    public UpdateBeanStatus(beanStatusTable: BeanStatusTable) {
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < this.step * this.step; j++) {
                const result = AnyFaceDecoder.Decode(this.step, i, j);
                const status = beanStatusTable.GetStatus(i, j);
                const face = this.cubeInstance.GetFace(result.position, result.side);
                const handler = this.beanHandlers.get(face.uuid);
                handler.UpdateStatus(status);

                switch (status) {
                    case BeanStatus.CLOSE:
                        if (this.activeBeanHandlers.has(face.uuid)) {
                            this.activeBeanHandlers.delete(face.uuid);
                        }
                        break;
                    default:
                        this.activeBeanHandlers.set(face.uuid, handler);
                        break;
                }
            }
        }
    }

    public OnUpdate(deltaTime: number) {
        this.activeBeanHandlers.forEach((value: BeanParticleHandler, key: string, map: Map<string, BeanParticleHandler>) => {
            value.Update(deltaTime);
        });
    }

    public OnUpdateFaceFlowColor(position: THREE.Vector3, side: FaceSide, color: string) {
        const face = this.cubeInstance.GetFace(position, side);
        const handler = this.beanHandlers.get(face.uuid);
        const flowColor = this.flowColorMapping.get(color);
        handler.UpdateFlowColor(flowColor);
        if (color === 'h') {
            handler.UpdateCircleColor(Tools.MakeVector4(0, 0, 0, 0));
        } else {
            handler.UpdateCircleColor(Tools.MakeVector4(0.1, 0.1, 0.1, 1));
        }
    }
}
