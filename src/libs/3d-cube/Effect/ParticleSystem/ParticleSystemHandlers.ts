import { Particles, LifeProperty } from './Particles';
import * as THREE from 'three';
import { ParticleRenderMode } from './ParticleRenderMode';
import { Debug } from '../../Util/Debug';
import { Tools } from '../../Util/Tools';
import { Object3D, Color } from 'three';

export enum BeanStatus {
    CLOSE = 0,
    NORMAL = 1,
    FLOW = 2,
    TARGET = 3
}


export class BeanParticleHandler {
    //  PARAM::光束处于普通状态时的样色 RGBA
    private static BeanNormalColor: THREE.Vector4 = new THREE.Vector4(0.3, 0.3, 0.3, 0.8);
    //  PARAM::光束处于目标状态时的样色 RGBA
    private static BeanTargetColor: THREE.Vector4 = new THREE.Vector4(0.58, 0.0, 0.82, 0.8);
    private container: THREE.Group;
    private circle: Particles;
    private circleTex: THREE.Texture;
    private bean: Particles;
    private beanTex: THREE.Texture;
    private beanGeo: THREE.Geometry | THREE.BufferGeometry;

    private points: Particles;
    private pointsTex: THREE.Texture;
    private root: THREE.Object3D;
    private flowColor: THREE.Vector4;
    private status: BeanStatus;
    constructor(camera: THREE.PerspectiveCamera, root: THREE.Object3D, flowColor: THREE.Vector4
        , circleTex: THREE.Texture, beanTex: THREE.Texture, pointTex: THREE.Texture, beanGeo: THREE.Geometry | THREE.BufferGeometry) {
        this.container = new THREE.Group();
        this.circleTex = circleTex;
        this.circle = new Particles({
            map: this.circleTex,
            sizeStart: 0.5,
            sizeEnd: 1.6,
            lifeProperty: LifeProperty.Interval,
            life: 1.5,
            max: 5,
            speed: 0.00,
            rateOverTime: 1,
            position: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(Math.PI / 2, 0, 0),
            colorStart: new THREE.Vector4(0.1, 0.1, 0.1, 1),
            colorEnd: new THREE.Vector4(1, 1, 1, 0.2),
            rendermode: ParticleRenderMode.Horizontal,
        }, camera);
        this.container.add(this.circle.system);
        // scene.add(this.circle.system);

        this.beanTex = beanTex;
        this.beanGeo = beanGeo;
        this.bean = new Particles({
            map: this.beanTex,
            sizeStart: 0.008,
            sizeEnd: 0.008,
            lifeProperty: LifeProperty.Permanent,   //  PARAM::粒子类型,Permanent为永久型,设置为Interval的话可以增加life参数设置粒子生命,
            max: 1,     //  PARAM::最大粒子数
            speed: 0,
            rateOverTime: 1,    //  PARAM::粒子生成d的频率
            position: new THREE.Vector3(0, 0, -1),
            rotation: new THREE.Euler(0, 0, 0),
            // colorStart: new THREE.Vector4(1, 0x0000f6 / 0x0000ff, 0x000042 / 0x0000ff, 0.0),
            // colorEnd: new THREE.Vector4(1, 0x0000f6 / 0x0000ff, 0x000042 / 0x0000ff, 0.05),
            colorStart: new THREE.Vector4(0.3, 0.3, 0.3, 0.0),
            colorEnd: new THREE.Vector4(0.3, 0.3, 0.3, 0.08),
            rendermode: ParticleRenderMode.Mesh,
            meshGeometry: this.beanGeo,
        }, camera);
        this.container.add(this.bean.system);

        this.pointsTex = pointTex;
        this.points = new Particles({
            map: this.pointsTex,
            randomness: new THREE.Vector3(0.9, 0.9, 0),
            sizeStart: 0.1,
            sizeEnd: 0.4,
            lifeProperty: LifeProperty.Interval,
            life: 1.4,
            max: 3,
            speed: 2.2,
            rateOverTime: 2.7,
            position: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(Math.PI / 2, 0, 0),
            colorStart: new THREE.Vector4(0.1, 0.1, 0.1, 1),
            colorEnd: new THREE.Vector4(1, 1, 1, 1),
            rendermode: ParticleRenderMode.Verticle,
        }, camera);
        this.container.add(this.points.system);
        root.add(this.container);
        this.root = root;
        this.flowColor = new THREE.Vector4().copy(flowColor);
        this.status = BeanStatus.CLOSE;
    }

    public UpdateStatus(status: BeanStatus) {
        const oldStatus = this.status;
        this.status = status;
        let color: THREE.Vector4;
        switch (this.status) {
            case BeanStatus.CLOSE:
                color = this.flowColor;
                break;
            case BeanStatus.FLOW:
                color = this.flowColor;
                break;
            case BeanStatus.NORMAL:
                color = BeanParticleHandler.BeanNormalColor;
                break;
            case BeanStatus.TARGET:
                color = BeanParticleHandler.BeanTargetColor;
                break;
        }
        //  PARAM:更新面颜色时修改的跟随颜色,目前光束为永久型，不会消失
        //  颜色也不会跟随Life变化
        this.bean.UpdateStartColor(color);
        this.bean.UpdateEndColor(color);
        if (oldStatus !== BeanStatus.CLOSE && this.status === BeanStatus.CLOSE) {
            this.Detach();
        } else if (oldStatus === BeanStatus.CLOSE && this.status !== BeanStatus.CLOSE) {
            this.Attach();
        }
    }

    public Attach() {
        this.root.add(this.container);
    }

    public Detach() {
        this.root.remove(this.container);
    }

    public UpdateBeanColor(color: THREE.Vector4) {
        this.bean.UpdateEndColor(color);
    }

    public MoveTo(x: number, y: number, z: number) {
        this.container.position.copy(Tools.MakeVector3(x, y, z));
    }

    public RotateY(angle: number) {
        this.container.rotateY(THREE.Math.DEG2RAD * angle);
    }

    public RotateX(angle: number) {
        this.container.rotateX(THREE.Math.DEG2RAD * angle);
    }

    public RotateZ(angle: number) {
        this.container.rotateZ(THREE.Math.DEG2RAD * angle);
    }

    public GetContainer(): THREE.Object3D {
        return this.container;
    }

    public Update(deltaTime: number) {
        if (this.bean)
            this.bean.update(deltaTime);
        this.circle.update(deltaTime);
        this.points.update(deltaTime);
    }

    public UpdateFlowColor(flowColor: THREE.Vector4) {
        this.flowColor.copy(flowColor);
    }

    public UpdateCircleColor(circleColor: THREE.Vector4) {
        this.circle.UpdateEndColor(circleColor);
    }
}
