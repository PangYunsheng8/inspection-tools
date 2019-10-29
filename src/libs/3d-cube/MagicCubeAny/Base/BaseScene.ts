import { Assets } from '../../Assets';
import { SceneContainer } from '../../GLObject';
import * as THREE from 'three';
import { Vector3, ShaderPass } from 'three';
import { Debug } from '../../Util/Debug';
import { ShaderRepo } from '../../Shaders';

const isMobile = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
const [E_START, E_MOVE, E_END, E_LEAVE] = isMobile
    ? ['touchstart', 'touchmove', 'touchend', 'touchleave']
    : ['mousedown', 'mousemove', 'mouseup', 'mouseleave'];

export enum MouseStatus {
    DOWN = 0,
    UP = 1
}

export abstract class BaseScene implements SceneContainer {

    protected container: Element;     //  窗口
    protected scene: THREE.Scene;
    protected camera: THREE.PerspectiveCamera;  // 相机
    protected renderer: THREE.WebGLRenderer;   // 渲染器
    protected frameId: number;
    protected mobileMoveIndex: number; // 用于定位移动端的第一次移动事件，因为第一次移动事件数据会不准
    protected mouseStatus: MouseStatus;
    protected isMobile: boolean;
    protected effectComposer: THREE.EffectComposer;
    private passEndIndex: number;
    private effectCopy: THREE.ShaderPass;

    constructor(container: Element) {
        this.container = container;
        const width = container.clientWidth;
        const height = container.clientHeight;
        this.scene = new THREE.Scene();
        // this.scene.background = new THREE.Color(0x000000);
        this.scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000);

        this.camera = new THREE.PerspectiveCamera(30, width / height, 0.01, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height, true);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setClearAlpha(0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.autoClear = true;

        const pixelRatio = window.devicePixelRatio || 1;
        const canvasDom = this.renderer.domElement;
        this.container.appendChild(this.renderer.domElement);
        // 兼容移动端事件
        canvasDom.addEventListener(E_START, this.onMouseDown, false);
        canvasDom.addEventListener(E_END, this.onMouseUp, false);
        canvasDom.addEventListener(E_LEAVE, this.onMouseUp, false);
        canvasDom.addEventListener(E_MOVE, this.onMouseMove, false);
        this.isMobile = isMobile;
        this.mouseStatus = MouseStatus.UP;
        this.effectComposer = new THREE.EffectComposer(this.renderer);

        this.effectComposer.setSize(width * pixelRatio, height * pixelRatio);
        //  Render pass
        const renderPass = new THREE.RenderPass(this.scene, this.camera, undefined, new THREE.Color(0xffffff), 0);
        renderPass.setSize(width * pixelRatio, height * pixelRatio);
        // renderPass.renderToScreen = true;
        this.effectComposer.addPass(renderPass);

        // FXAA Pass
        this.effectCopy = new THREE.ShaderPass(ShaderRepo.FXAAShader);
        this.effectCopy.renderToScreen = true;
        this.effectCopy.uniforms['resolution'].value = new THREE.Vector2(1 / (pixelRatio * width), 1 / (pixelRatio * height));
        this.effectComposer.addPass(this.effectCopy);
        this.passEndIndex = 1;
    }

    protected addPass(pass: THREE.Pass) {
        this.effectComposer.insertPass(pass, this.passEndIndex++);
    }

    public SetScene(scene: THREE.Scene): void {
        this.scene = scene;
    }

    public GetScene(): THREE.Scene {
        return this.scene;
    }

    public abstract animate(): void;

    public resize(width: number, height: number): void {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        const pixelRatio = window.devicePixelRatio || 1;

        this.renderer.setSize(width, height);
        this.effectComposer.setSize(width * pixelRatio, height * pixelRatio);
        this.effectComposer.passes.forEach((value: THREE.Pass, index: number, array: THREE.Pass[]) => {
            value.setSize(width * pixelRatio, height * pixelRatio);
        });
        this.effectCopy.uniforms['resolution'].value = new THREE.Vector2(1 / (pixelRatio * width), 1 / (pixelRatio * height));
    }

    public dispose(): void {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
        }
    }

    protected abstract OnMouseDown(event: any);

    protected abstract OnMouseUp(event: any);

    protected abstract OnMouseMove(event: any);

    private onMouseDown = (event) => {
        // 兼容移动端事件
        event.preventDefault();
        // Debug.Log(event);
        event = isMobile ? event.touches[0] : event;
        this.mouseStatus = MouseStatus.DOWN;
        this.OnMouseDown(event);
    }

    private onMouseUp = (event) => {
        // 兼容移动端事件
        event.preventDefault();
        event = isMobile ? event.touches[0] : event;
        this.mouseStatus = MouseStatus.UP;
        this.mobileMoveIndex = 0;
        this.OnMouseUp(event);
    }

    private onMouseMove = (event) => {
        // 兼容移动端事件
        event.preventDefault();
        event = isMobile ? event.touches[0] : event;
        if (this.mobileMoveIndex === MouseStatus.UP && isMobile) {  // 过滤掉移动端第一次点击时移动距离可能会过大的问题
            this.mobileMoveIndex++;
            return;
        }
        this.OnMouseMove(event);
    }


}
