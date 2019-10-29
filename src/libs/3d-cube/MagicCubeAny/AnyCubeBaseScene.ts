import { SceneContainer, CubeBase, Axis, CameraState } from '../GLObject';
import { Assets } from '../Assets';
import * as THREE from 'three';
import { AnyCubeInstance } from './AnyCubeInstance';
import { MCInputStruct } from '../MCInputCache';
import { BaseScene, MouseStatus } from './Base/BaseScene';
import { FaceSide } from './FillColorScene/FaceSide';
import { Tools } from '../Util/Tools';
import { AnyFaceDecoder } from './TutorialScenes/AnyFaceDecoder';
import { AnyColorTable } from './ColorRef/AnyColorTable';
import { CameraViewState } from '../CameraViewState';

export abstract class AnyCubeBaseScene extends BaseScene implements CubeBase {
    protected assets: Assets;     //  资源
    protected step: number;
    protected cameraRadius: number;
    protected HAngle: number;
    protected VAngle: number;
    protected cameraUpdateEnable: boolean;
    protected useEffectComposer = true;
    private clientX: number;
    private clientY: number;
    private hemisphereLight: THREE.HemisphereLight;

    //  cube
    protected cubeInstance: AnyCubeInstance;

    constructor(container: Element, step: number, viewState: CameraViewState, assets: Assets,
        dragEnable: boolean = true, cameraRadius: number = 16) {
        super(container);

        this.step = step;

        this.camera.position.set(1, 1, 1).normalize().multiplyScalar(7 + step);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.cameraRadius = cameraRadius;
        this.SetCameraViewState(viewState);
        this.cameraUpdateEnable = dragEnable;
        const dirLight = new THREE.DirectionalLight(0xeeeeee, 1);
        dirLight.position.set(15, 15, 15);
        dirLight.intensity = 0.08;
        dirLight.target = this.scene;
        // dirLight.castShadow = true;
        this.scene.add(dirLight);
        const dirLight2 = new THREE.DirectionalLight(0xeeeeee, 1);
        dirLight2.position.set(-15, 15, 15);
        dirLight2.intensity = 0.08;
        dirLight2.target = this.scene;
        // dirLight2.castShadow = true;
        this.scene.add(dirLight2);
        const dirLight3 = new THREE.DirectionalLight(0xeeeeee, 1);
        dirLight3.position.set(15, 15, -15);
        dirLight3.intensity = 0.08;
        dirLight3.target = this.scene;
        // dirLight3.castShadow = true;
        this.scene.add(dirLight3);
        const dirLight4 = new THREE.DirectionalLight(0xeeeeee, 1);
        dirLight4.position.set(-15, 15, -15);
        dirLight4.intensity = 0.08;
        dirLight4.target = this.scene;
        // dirLight4.castShadow = true;
        this.scene.add(dirLight4);

        const hemiSphereLight = new THREE.HemisphereLight(0xffffff, 0x050505);
        hemiSphereLight.position.set(10, 10, 10);
        // hemiSphereLight.castShadow = true;
        hemiSphereLight.intensity = 1;
        this.hemisphereLight = hemiSphereLight;

        const pointLight = new THREE.PointLight(0xffffff, 0.08, 20);
        pointLight.castShadow = true;
        this.hemisphereLight.add(pointLight);
        this.scene.add(this.hemisphereLight);

        this.scene.add(this.camera)
        // this.scene.add(new THREE.AmbientLight(new THREE.Color(1, 1, 1), 0.2));
        this.assets = assets;
        this.cubeInstance = new AnyCubeInstance(assets, this.scene, this, this.step);

        this.clientX = 0;
        this.clientY = 0;
        this.renderEnable = false;
        this.animate();
    }

    protected renderEnable: boolean;
    public RenderEnable(): void {
        this.renderEnable = true;
    }

    public animate(): void {
        this.frameId = requestAnimationFrame(this.animate.bind(this));
        if (this.renderEnable) {
            this.OnRenderBegin();

            this.cubeInstance.OnUpdate(0.02);
            this.Update();
            // this.renderer.render(this.scene, this.camera);
            if (this.useEffectComposer === true)
                this.effectComposer.render();
            else
                this.renderer.render(this.scene, this.camera);
            this.hemisphereLight.position.copy(this.camera.position);
            this.OnRenderDone();
            this.renderEnable = false;
        }
    }

    protected abstract Update();

    protected OnRenderBegin(): void { }

    protected OnRenderDone(): void { }

    SetCameraViewState(viewState: CameraViewState) {
        this.camera.position.copy(viewState.position);
        this.camera.quaternion.copy(viewState.quaternion);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        const HV = new THREE.Vector3(this.camera.position.x, 0, this.camera.position.z).normalize();
        const VV = this.camera.position.clone().normalize();
        const L = new THREE.Vector3(1, 0, 0);
        const U = new THREE.Vector3(0, 1, 0);
        const LDHV = L.dot(HV);
        this.HAngle = 2 * Math.PI - Math.acos(LDHV);
        const VVDU = VV.dot(U);
        this.VAngle = Math.acos(VVDU);
        this.updateCamera();
    }

    SetScene(scene: THREE.Scene): void {
        this.scene = scene;
    }

    GetScene(): THREE.Scene {
        return this.scene;
    }

    public updateQuaternionAnimation(rot: THREE.Quaternion, animateTime: number) {
        this.cubeInstance.updateQuaternionAnimation(rot, animateTime);
    }

    public setLightToCamera(light: THREE.Object3D): void {
        this.camera.add(light);
    }

    rotateFace(face: Axis, circle: number, during: number): void {
        const input: MCInputStruct = new MCInputStruct();
        input.translateRotateData(face, this.step, circle, during);
        this.cubeInstance.PushInput(input);
    }

    updateAttitude(rot: THREE.Quaternion, scale: number): void {
        this.cubeInstance.UpdateAttatude(rot, scale)
    }

    setCameraState(state: CameraState): void {
    }

    public SetDragEnable(dragEnable: boolean) {
        this.cameraUpdateEnable = dragEnable;
    }

    protected OnMouseDown(event: any) {
    }

    protected OnMouseUp(event: any) {
    }

    protected OnMouseMove(event: any) {
        if (this.cameraUpdateEnable) {
            const mouseX = this.isMobile ? event.clientX - event.target.offsetLeft : event.layerX;
            const mouseY = this.isMobile ? event.clientY - event.target.offsetTop : event.layerY;
            const movementX = mouseX - this.clientX;
            const movementY = mouseY - this.clientY;
            this.clientX = mouseX;
            this.clientY = mouseY;
            if (this.mouseStatus === MouseStatus.DOWN) {
                this.UpdateCamera(-movementX, -movementY);
            }

        }
    }

    protected GetCube(position: THREE.Vector3): THREE.Object3D {
        return this.cubeInstance.GetCube(position);
    }

    protected GetFace(position: THREE.Vector3, side: FaceSide): THREE.Object3D {
        return this.cubeInstance.GetFace(position, side);
    }

    public SetColorToFace(position: THREE.Vector3, side: FaceSide, color: string) {
        this.cubeInstance.SetColorToFace(position, side, color);
    }

    public SetColorByColorTable(colorTable: AnyColorTable) {
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < this.step * this.step; j++) {
                this.UpdateFaceColor(i, j, colorTable.GetColor(i, j));
            }
        }
    }

    public GetFaceColor(sideIndex: number, faceIndex: number): string {
        const result = AnyFaceDecoder.Decode(this.step, sideIndex, faceIndex);
        return this.cubeInstance.GetFaceColor(result.position, result.side);
    }

    public GetColorTable(): AnyColorTable {
        const res = new AnyColorTable(this.step);
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < this.step * this.step; j++) {
                res.SetColor(i, j, this.GetFaceColor(i, j));
            }
        }
        return res;
    }

    public UpdateFaceColor(sideIndex: number, faceIndex: number, color: string) {
        const result = AnyFaceDecoder.Decode(this.step, sideIndex, faceIndex);
        this.cubeInstance.SetColorToFace(result.position, result.side, color);
    }

    public GetAllColor(): string[] {
        return this.cubeInstance.GetAllColor();
    }

    public SetAllColor(colors: string[]) {
        this.cubeInstance.SetAllColor(colors);
    }
    protected abstract UpdateCamera(horizontal: number, vertical: number): void

    protected updateCamera() {
        const HRot = new THREE.Quaternion(0, Math.sin(this.HAngle / 2.0), 0, Math.cos(this.HAngle / 2.0));
        const L = new THREE.Vector3(1, 0, 0);
        const hproj = L.clone().applyQuaternion(HRot);
        const U = new THREE.Vector3(0, 1, 0);
        const axis = U.clone().cross(hproj);
        const VRot = new THREE.Quaternion(
            axis.x * Math.sin(this.VAngle / 2.0),
            axis.y * Math.sin(this.VAngle / 2.0),
            axis.z * Math.sin(this.VAngle / 2.0),
            Math.cos(this.VAngle / 2.0));
        const dir = U.clone().applyQuaternion(VRot);
        const pos = dir.multiplyScalar(this.cameraRadius);
        this.camera.position.copy(pos);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    public UpdateCameraRadius(newRadius: number): void {
        this.cameraRadius = newRadius;
        const dir = this.camera.position.clone().normalize();
        const pos = dir.multiplyScalar(this.cameraRadius);
        this.camera.position.copy(pos);
        this.camera.updateProjectionMatrix();
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    public SwitchToHollow() {
        this.cubeInstance.SwitchToHollow();
    }

    public SwitchToUnhollow() {
        this.cubeInstance.SwitchToUnhollow();
    }

    public dispose(): void {
        // if (this.assets) {
        //     this.assets.dispose();
        // }
        super.dispose();
    }
}
