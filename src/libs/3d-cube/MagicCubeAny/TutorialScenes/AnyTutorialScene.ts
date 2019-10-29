import { AnyCubeBaseScene } from '../AnyCubeBaseScene';
import * as THREE from 'three';
import { MCInputStruct } from '../../MCInputCache';
import { AnyFaceDecoder } from './AnyFaceDecoder';
import BeanEffectManager from './BeanEffectManager';
import { BeanStatusTable } from './BeanStatusTable';
import { Assets } from '../../Assets';
import AnyAxisArrowModel from '../AnyAxisArrowModel';
import { Axis, UTIL } from '../../GLObject';
import NewOutlinePass from '../../Effect/Pass/NewOutlinePass';
import { CameraViewState } from '../../CameraViewState';
import { Debug } from '../../Util/Debug';

export class AnyTutorialScene extends AnyCubeBaseScene {
    private currentCommand: string;
    private beanEffectManager: BeanEffectManager;

    private outlinePass: NewOutlinePass;
    private anyAxisArrow: AnyAxisArrowModel;
    private initHAngle: number;
    private initVAngle: number;

    constructor(container: Element, step: number, viewState: CameraViewState, assets: Assets,
        dragEnable: boolean = true) {
        super(container, step, viewState, assets, dragEnable);
        this.initHAngle = this.HAngle;
        this.initVAngle = this.VAngle;
        this.currentCommand = '';
        this.beanEffectManager = new BeanEffectManager(this.step, this.cubeInstance, this.camera, this.assets.GetBeamGeo());

        this.outlinePass = new NewOutlinePass(new THREE.Vector2(this.container.clientWidth, this.container.clientHeight),
            this.scene, this.camera);
        this.outlinePass.edgeStrength = 3.0;
        this.outlinePass.edgeGlow = 0.0;
        this.outlinePass.edgeThickness = 1.0;
        this.outlinePass.pulsePeriod = 0;
        this.outlinePass.usePatternTexture = false;
        this.outlinePass.hiddenEdgeColor = new THREE.Color(0xaaaaaa);
        const pixelRatio = window.devicePixelRatio | 1;
        this.outlinePass.setSize(this.container.clientWidth * pixelRatio, this.container.clientHeight * pixelRatio);
        this.addPass(this.outlinePass);
        this.anyAxisArrow = new AnyAxisArrowModel(this.step, this.assets.GetAxisArrowGeo(), this.cubeInstance.GetGameObject());

        this.outlinePass.activesParticles = this.beanEffectManager.GetActiveParticle();
    }

    public ResetCamera() {
        this.HAngle = this.initHAngle;
        this.VAngle = this.initVAngle;
        this.updateCamera();
    }

    protected Update() {
        if (this.beanEffectManager !== undefined) {
            this.beanEffectManager.OnUpdate(0.02);
        }
        if (this.anyAxisArrow) {
            this.anyAxisArrow.Update(0.02);
        }
    }

    public ShowArrow(axis: Axis | Axis[], status: number, rotateSpeed: number = 90) {
        if (axis instanceof Array) {
            const axises = axis as Axis[];
            const layers = [];
            const input = new MCInputStruct();
            for (let i = 0; i < axises.length; i++) {
                input.translateRotateData(axises[i], this.step, 4, 1000);
                layers.push(input.layer);
            }
            this.ShowArrowForMultiLayers(axises[0], layers, status);
        } else {
            this.ShowSingleArrow(axis, status, rotateSpeed);
        }
    }

    private ShowSingleArrow(face: Axis, status: number, rotateSpeed: number = 90) {
        if (status === 0) {
            this.hightLightAllCubes();
            this.anyAxisArrow.Detach();
        } else {
            const input = new MCInputStruct();
            input.translateRotateData(face, this.step, status, 1000);
            this.anyAxisArrow.ShowArrow(input.axis, input.layer, input.circle > 0 ? 0 : 1, rotateSpeed);
            this.darkLightAllCube();
            const cubes = this.cubeInstance.GetCubes(input.axis, input.layer);
            for (let j = 0; j < cubes.length; j++) {
                this.hightLightCube(cubes[j]);
            }
        }
    }

    private ShowArrowForMultiLayers(axis: Axis, layers: Array<number>, status: number, rotateSpeed: number = 90) {
        if (status === 0) {
            this.hightLightAllCubes();
            this.anyAxisArrow.Detach();
        } else {
            const input = new MCInputStruct();
            input.translateRotateData(axis, this.step, status, 1000);
            const size = layers.length;
            let sum = 0;
            layers.forEach((value: number, index: number, array: number[]) => {
                sum += value;
            });
            const p = sum / size;
            const scale = 1 + (size - 1) * 0.3;
            this.anyAxisArrow.ShowArrowForMultiLayers(input.axis, p, scale, input.circle > 0 ? 0 : 1, rotateSpeed);
            this.darkLightAllCube();
            for (let i = 0; i < size; i++) {
                const cubes = this.cubeInstance.GetCubes(input.axis, layers[i]);
                for (let j = 0; j < cubes.length; j++) {
                    this.hightLightCube(cubes[j]);
                }
            }
            // this.anyAxisArrow.ShowArrow(input.axis, layer, input.circle > 0 ? 0 : 1, rotateSpeed);
        }
    }

    public setOutlineStatus(axis: Axis | Axis[], status: number) {
        if (!(axis instanceof Array)) {
            this.setFaceOutlineStatus(axis as Axis, status);
        } else if (axis instanceof Array) {
            const axises = axis as Axis[];
            const layers = [];
            const input = new MCInputStruct();
            for (let i = 0; i < axises.length; i++) {
                input.translateRotateData(axises[i], this.step, 4, 1000);
                layers.push(input.layer);
            }
            this.setOutlineStatusForMultiLayers(axises[0], layers, status);
        }
    }

    private setFaceOutlineStatus(face: Axis, status: number) {
        const length = this.outlinePass.selectedObjects.length;
        for (let i = 0; i < length; i++) {
            this.outlinePass.selectedObjects[0].layers.toggle(0);
            this.outlinePass.selectedObjects.shift();
        }
        if (status === 1) {
            const input = new MCInputStruct();
            input.translateRotateData(face, this.step, 4, 1000);
            const cubes = this.cubeInstance.GetCubes(input.axis, input.layer);
            this.outlinePass.selectedObjects = cubes;
        }
    }

    private setOutlineStatusForMultiLayers(axis: Axis, layers: number[], status: number) {
        const length = this.outlinePass.selectedObjects.length;
        for (let i = 0; i < length; i++) {
            this.outlinePass.selectedObjects[0].layers.toggle(0);
            this.outlinePass.selectedObjects.shift();
        }
        if (status === 1) {
            const input = new MCInputStruct();
            input.translateRotateData(axis, this.step, 4, 1000);
            const outlineCubes = [];
            for (let i = 0; i < layers.length; i++) {
                const cubes = this.cubeInstance.GetCubes(input.axis, layers[i]);
                cubes.forEach((value: THREE.Object3D, index: number, array: THREE.Group[]) => {
                    outlineCubes.push(value);
                });
            }

            this.outlinePass.selectedObjects = outlineCubes;
        }
    }

    public UpdateBeanStatus(beanStatusTable: BeanStatusTable) {
        this.beanEffectManager.UpdateBeanStatus(beanStatusTable);
    }

    public UpdateFaceColor(sideIndex: number, faceIndex: number, color: string) {
        super.UpdateFaceColor(sideIndex, faceIndex, color);
        const result = AnyFaceDecoder.Decode(this.step, sideIndex, faceIndex);
        this.beanEffectManager.OnUpdateFaceFlowColor(result.position, result.side, color);
    }

    public SetNextCommand(cmd: string) {
        if (this.currentCommand !== '') {
            this.cancelTutorialEffect(this.currentCommand);
        }
        // this.darkLightAllCube();
        this.currentCommand = cmd;
        this.showTutorialEffect(this.currentCommand);
    }

    public OnSuccess() {
        this.hightLightAllCubes();
        this.currentCommand = '';
    }

    private showTutorialEffect(cmd: string) {
        const input = new MCInputStruct();
        input.translateTutorialRotateData(cmd, this.step);
        this.anyAxisArrow.ShowArrow(input.axis, input.layer, input.circle > 0 ? 1 : 0, 90);

        const cubes = this.cubeInstance.GetCubes(input.axis, input.layer);
        const length = this.outlinePass.selectedObjects.length;
        for (let i = 0; i < length; i++) {
            this.outlinePass.selectedObjects.shift();
        }
        this.outlinePass.selectedObjects = cubes;
        for (let i = 0; i < cubes.length; i++) {
            this.hightLightCube(cubes[i]);
        }
    }

    private hightLightCube(cube: THREE.Group) {
        for (let i = 0; i < cube.children.length; i++) {
            const face = cube.children[i] as THREE.Mesh;
            const mat = face.material as THREE.MeshStandardMaterial;
            mat.setValues({ color: 0xffffff });
        }
    }

    private darkLightCube(cube: THREE.Group) {
        for (let i = 0; i < cube.children.length; i++) {
            const face = cube.children[i] as THREE.Mesh;
            const mat = face.material as THREE.MeshStandardMaterial;
            mat.setValues({ color: 0x444444 });
        }
    }


    private cancelTutorialEffect(cmd: string) {
    }

    private darkLightAllCube() {
        this.cubeInstance.ForAllCubes(this.darkLightCube);
    }

    private hightLightAllCubes() {
        this.cubeInstance.ForAllCubes(this.hightLightCube);
    }

    protected UpdateCamera(horizontal: number, vertical: number): void {
        if (this.cameraUpdateEnable) {
            if (horizontal > 1.0) horizontal = 1.0
            if (horizontal < -1.0) horizontal = -1.0;
            if (vertical > 1.0) vertical = 1.0;
            if (vertical < -1.0) vertical = -1.0;
            this.HAngle += horizontal * 0.025;
            this.VAngle += vertical * 0.025;
            if (this.HAngle > 2 * Math.PI)
                this.HAngle -= 2 * Math.PI;
            if (this.HAngle < 0)
                this.HAngle = 2 * Math.PI - this.HAngle;
            if (this.VAngle > 150 * Math.PI / 180.0)
                this.VAngle = 150 * Math.PI / 180.0;
            if (this.VAngle < 30 * Math.PI / 180.0)
                this.VAngle = 30 * Math.PI / 180.0;
        }
        this.updateCamera();
    }
}
