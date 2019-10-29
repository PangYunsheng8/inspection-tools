import { BaseScene, MouseStatus } from '../Base/BaseScene';
import { ColorOptions } from '../../ColorOptions';
import { Assets } from '../../Assets';
import * as THREE from 'three';
import { FCColorMapping } from './FCColorMapping';
import { FillColorEventBinder } from './FillColorEventBinder';
import { FillColorCubeInstance } from './FillColorCubeInstance';
import { FaceSide } from './FaceSide';
import { Tools } from '../../Util/Tools';
import { Debug } from '../../Util/Debug';
import { AnyColorTable } from '../ColorRef/AnyColorTable';
import { AnyFaceDecoder } from '../TutorialScenes/AnyFaceDecoder';

export class AnyFillColorScene extends BaseScene implements FillColorEventBinder {
    protected static SelectableSides = [
        [FaceSide.FRONT, FaceSide.LEFT, FaceSide.UP],
        [FaceSide.RIGHT, FaceSide.DOWN, FaceSide.BACK]
    ];
    // private assets: Assets;     //  资源
    private step: number;
    //  填色选项
    private colorOption: ColorOptions;

    private selectableObjects: THREE.Object3D[];
    private mapping: Map<string, FCColorMapping>;

    private cubeInstance: FillColorCubeInstance;
    // private cameraTargetPosition: number;
    private currentStep: number;
    private renderEnable: boolean;
    private cameraRadius: number;

    protected colorCount: {
        red: number,
        yellow: number,
        blue: number,
        green: number,
        orange: number,
        white: number,
    }

    protected colorLimit: {
        red: number,
        yellow: number,
        blue: number,
        green: number,
        orange: number,
        white: number,
    }
    constructor(container: Element, step: number, assets: Assets) {
        super(container);
        this.step = step;
        this.colorOption = ColorOptions.B;
        this.camera.position.set(1, 1, 1).normalize().multiplyScalar(7 + step);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.selectableObjects = [];
        this.mapping = new Map<string, FCColorMapping>();

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(15, 15, 15);
        dirLight.intensity = 0.08;
        dirLight.target = this.scene;
        this.scene.add(dirLight);
        const dirLight2 = new THREE.DirectionalLight(0xffffff, 1);
        dirLight2.position.set(-15, 15, 15);
        dirLight2.intensity = 0.08;
        dirLight2.target = this.scene;
        this.scene.add(dirLight2);
        const dirLight3 = new THREE.DirectionalLight(0xffffff, 1);
        dirLight3.position.set(15, 15, -15);
        dirLight3.intensity = 0.08;
        dirLight3.target = this.scene;
        this.scene.add(dirLight3);
        const dirLight4 = new THREE.DirectionalLight(0xffffff, 1);
        dirLight4.position.set(-15, 15, -15);
        dirLight4.intensity = 0.08;
        dirLight4.target = this.scene;
        this.scene.add(dirLight4);

        this.scene.add(this.camera)
        this.scene.add(new THREE.AmbientLight(0xffffff));
        this.cubeInstance = new FillColorCubeInstance(assets, this.scene, this, this.step);
        this.cubeInstance.OnBind(this);
        this.currentStep = 0;
        this.UpdateStepStatus();
        this.renderEnable = true;
        this.colorCount = {
            red: 0,
            yellow: 0,
            blue: 0,
            green: 0,
            orange: 0,
            white: 0,
        }

        this.colorLimit = {
            red: this.step * step,
            yellow: this.step * step,
            blue: this.step * step,
            green: this.step * step,
            orange: this.step * step,
            white: this.step * step,
        }
        this.animate();
    }

    public UpdateStepStatus() {
        const faces = new Array<THREE.Object3D>();
        for (let i = 0; i < AnyFillColorScene.SelectableSides[this.currentStep].length; i++) {
            const objs = this.cubeInstance.GetFaces(AnyFillColorScene.SelectableSides[this.currentStep][i]);
            for (let j = 0; j < objs.length; j++) {
                faces.push(objs[j]);
            }
        }
        this.setSelectableObjects(faces);
    }

    public UpdateCameraRadius(newRadius: number): void {
        this.cameraRadius = newRadius;
        const dir = Tools.MakeVector3(1, 1, 1).normalize();
        const pos = dir.multiplyScalar(this.cameraRadius);
        this.camera.position.copy(pos);
        this.camera.updateProjectionMatrix();
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    public UpdateAttatude(rot: THREE.Quaternion, scale: number) {
        this.cubeInstance.UpdateAttatude(rot, scale);
    }

    public NextSide() {
        if (this.currentStep < 1) {
            this.currentStep++;
            const currentQuaternion = this.cubeInstance.GetGameObject().quaternion;
            const rot = Tools.MakeQuaternion(180, Tools.MakeVector3(-1, 0, 1));
            rot.multiply(currentQuaternion);
            Debug.Log('NextSide', rot);
            this.cubeInstance.UpdateAttatude(rot, 0.1);
            this.UpdateStepStatus();
        }
        // this.currentSide++;
        // this.cameraTargetPosition++;
        // if (this.currentSide > 5) this.currentSide = 5;
        // if (this.cameraTargetPosition > 5) this.cameraTargetPosition = 5;
        // this.setSelectableObjects(this.cubeInstance.GetFaces(AnyFillColorScene.SelectableSides[this.currentSide]));
    }

    public PreSide() {
        if (this.currentStep > 0) {
            this.currentStep--;
            const currentQuaternion = this.cubeInstance.GetGameObject().quaternion;
            const rot = Tools.MakeQuaternion(-180, Tools.MakeVector3(-1, 0, 1));
            rot.multiply(currentQuaternion);
            this.cubeInstance.UpdateAttatude(rot, 0.1);
            this.UpdateStepStatus();
        }
        // this.currentSide--;
        // this.cameraTargetPosition--;
        // if (this.currentSide < 0) this.currentSide = 0;
        // if (this.cameraTargetPosition < 0) this.cameraTargetPosition = 0;
        // this.setSelectableObjects(this.cubeInstance.GetFaces(AnyFillColorScene.SelectableSides[this.currentSide]));
    }

    public setLightToCamera(light: THREE.Object3D): void {
        this.camera.add(light);
    }


    public RenderEnable(): void {
        this.renderEnable = true;
    }

    public animate(): void {
        if (this.renderEnable) {
            // this.camera.position.lerp(AnyFillColorScene.CameraPosition[this.cameraTargetPosition], 0.02);
            // this.camera.lookAt(Tools.MakeVector3(0, 0, 0));
            this.cubeInstance.OnUpdate();
            this.Update();
            this.renderer.render(this.scene, this.camera);
            this.renderEnable = false;
        }
        this.frameId = requestAnimationFrame(this.animate.bind(this));
    }

    protected Update() {

    }

    public Bind(uuid: string, colorMapping: FCColorMapping) {
        this.mapping.set(uuid, colorMapping);
    }

    public SetColorOption(option: ColorOptions) {
        this.colorOption = option;
    }

    public GetAllColor(): Array<string> {
        return this.cubeInstance.GetAllColor();
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

    public GetColorRemain() {
        const colorRemain = {
            red: this.colorLimit.red - this.colorCount.red,
            yellow: this.colorLimit.yellow - this.colorCount.yellow,
            blue: this.colorLimit.blue - this.colorCount.blue,
            green: this.colorLimit.green - this.colorCount.green,
            orange: this.colorLimit.orange - this.colorCount.orange,
            white: this.colorLimit.white - this.colorCount.white
        }
        return colorRemain
    }

    // private initAssets(): Promise<Assets> {
    //     this.assets = new Assets();
    //     return this.assets.LoadAllAssets();
    // }

    private fillEnable(): boolean {
        switch (this.colorOption) {
            case ColorOptions.B:
                return this.colorCount.blue < this.colorLimit.blue;
            case ColorOptions.R:
                return this.colorCount.red < this.colorLimit.red;
            case ColorOptions.G:
                return this.colorCount.green < this.colorLimit.green;
            case ColorOptions.Y:
                return this.colorCount.yellow < this.colorLimit.yellow;
            case ColorOptions.O:
                return this.colorCount.orange < this.colorLimit.orange;
            case ColorOptions.W:
                return this.colorCount.white < this.colorLimit.white;
        }
    }

    private subColorCount(oldColor: string) {
        if (oldColor === 'h') return;
        switch (oldColor) {
            case 'r':
                this.colorCount.red--;
                break;
            case 'g':
                this.colorCount.green--;
                break;
            case 'b':
                this.colorCount.blue--;
                break;
            case 'o':
                this.colorCount.orange--;
                break;
            case 'w':
                this.colorCount.white--;
                break;
            case 'y':
                this.colorCount.yellow--;
                break;
        }
    }

    private addColorCount(option: ColorOptions, oldColor: string) {
        if (this.colorOption !== ColorOptions.UNKNOWN) {
            switch (this.colorOption) {
                case ColorOptions.B:
                    return this.colorCount.blue++;
                case ColorOptions.R:
                    return this.colorCount.red++;
                case ColorOptions.G:
                    return this.colorCount.green++;
                case ColorOptions.Y:
                    return this.colorCount.yellow++;
                case ColorOptions.O:
                    return this.colorCount.orange++;
                case ColorOptions.W:
                    return this.colorCount.white++;
            }
        } else {
            switch (oldColor) {
                case 'b':
                    return this.colorCount.blue--;
                case 'r':
                    return this.colorCount.red--;
                case 'g':
                    return this.colorCount.green--;
                case 'y':
                    return this.colorCount.yellow--;
                case 'o':
                    return this.colorCount.orange--;
                case 'w':
                    return this.colorCount.white--;
            }
        }

    }

    protected SetColorFace(position: THREE.Vector3, side: FaceSide, color: string) {
        this.cubeInstance.SetColorToFace(position, side, color);
    }

    protected SetFaceActive(position: THREE.Vector3, side: FaceSide, active: boolean) {
        this.cubeInstance.SetFaceActive(position, side, active);
    }


    protected OnMouseDown(event: any) {
        Debug.Log(event);
        if (this.mouseStatus === MouseStatus.DOWN && this.fillEnable()) {
            let intersects
            if (this.isMobile) {
                // tslint:disable-next-line:max-line-length
                intersects = this.getIntersects(event.clientX - event.target.offsetLeft, event.clientY - event.target.offsetTop);
            } else {
                intersects = this.getIntersects(event.layerX, event.layerY);
            }
            // let mat: THREE.MeshStandardMaterial;
            // const cnt = this.cubeLogicState.GetSpecificColorCount(this.colorOption)
            if (this.isMobile)
                Debug.Log(event.clientX, event.clientY, intersects);
            else
                Debug.Log(event.layerX, event.layerY, intersects);
            if (intersects.length > 0) {
                const object = intersects[0].object as THREE.Mesh;
                if (this.mapping.has(object.uuid) && this.mapping.get(object.uuid).IsActive()) {
                    const oldColor = this.mapping.get(object.uuid).OnClick(this.colorOption);
                    this.subColorCount(oldColor);
                    this.addColorCount(this.colorOption, oldColor);
                    // Debug.Log('Fill', this.cubeInstance.GetAllColor());
                }
            }
        }
    }

    protected OnMouseUp(event: any) {
    }

    protected OnMouseMove(event: any) {

    }

    protected SetColorToFace(position: THREE.Vector3, face: FaceSide, color: string) {
        this.cubeInstance.SetColorToFace(position, face, color);
    }

    private getIntersects(x: number, y: number): THREE.Intersection[] {
        x = (x / this.renderer.domElement.clientWidth) * 2 - 1.0;
        y = -(y / this.renderer.domElement.clientHeight) * 2 + 1.0;
        const mouseVector2 = new THREE.Vector2(x, y);
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseVector2, this.camera);
        // if (this.isMobile) raycaster.ray.direction.copy(Tools.MakeVector3(-0.5996299858014298, -0.5328289409918163, -0.5971073603375834))
        // tslint:disable-next-line:max-line-length
        Debug.Log(x, y, this.renderer.domElement.clientWidth, this.renderer.domElement.clientHeight, raycaster.ray.direction, raycaster.ray.origin);
        return raycaster.intersectObjects(this.selectableObjects, false);
    }

    private setSelectableObjects(objects: Array<THREE.Object3D>) {
        if (this.selectableObjects.length > 0) this.clearSelectableObjects();
        for (let i = 0; i < objects.length; i++) {
            this.selectableObjects.push(objects[i]);
        }
    }

    private clearSelectableObjects() {
        for (let i = 0; i < this.selectableObjects.length; i++) {
            this.selectableObjects.shift();
        }
    }
}
