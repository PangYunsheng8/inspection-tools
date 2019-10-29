import THREE from './three';
import { debuglog } from 'util';
import { AnyCubeController } from './MagicCubeAny/AnyCubeController';
import { FillColorCubeController } from './MagicCubeAny/FillColorScene/FillColorCubeController';
import { AnyCubeFactory } from './MagicCubeAny/AnyCubeFactory';
import { Debug } from './Util/Debug';
import { Tools } from './Util/Tools';
import { Axis } from './GLObject';
import { CubeTexture } from 'three';

const textureLoader = new THREE.TextureLoader();
export async function loadTexture(url: string): Promise<THREE.Texture> {
    // return textureLoader.load(url);
    return new Promise<THREE.Texture>((resolve, reject) => {
        resolve(textureLoader.load(url));
    })
}

export const fbxLoader = new THREE.FBXLoader();
export class FaceTexturesPackage implements FaceTexturesHandle {
    public TexRed: THREE.Texture;
    public TexYellow: THREE.Texture;
    public TexGreen: THREE.Texture;
    public TexBlue: THREE.Texture;
    public TexOrange: THREE.Texture;
    public TexWhite: THREE.Texture;
    public TexBlack: THREE.Texture;

    GetRed(): THREE.Texture {
        return this.TexRed;
    }
    GetYellow(): THREE.Texture {
        return this.TexYellow;
    }
    GetGreen(): THREE.Texture {
        return this.TexGreen;
    }
    GetBlue(): THREE.Texture {
        return this.TexBlue;
    }
    GetOrange(): THREE.Texture {
        return this.TexOrange;
    }
    GetWhite(): THREE.Texture {
        return this.TexWhite;
    }
    GetBlack(): THREE.Texture {
        return this.TexBlack;
    }

    dispose() {
        this.TexYellow.dispose();
        this.TexRed.dispose();
        this.TexWhite.dispose();
        this.TexOrange.dispose();
        this.TexGreen.dispose();
        this.TexBlue.dispose();
    }
}

export interface FaceTexturesHandle {
    GetRed(): THREE.Texture;
    GetYellow(): THREE.Texture;
    GetGreen(): THREE.Texture;
    GetBlue(): THREE.Texture;
    GetOrange(): THREE.Texture;
    GetWhite(): THREE.Texture;
    GetBlack(): THREE.Texture;
}

export abstract class Assets implements AnyCubeFactory {
    protected disposeOperations: Array<() => void>;

    protected constructor() {
        this.disposeOperations = Array<() => void>();
    }

    public static async LoadAllAssets(): Promise<Assets> {
        const assets = new GDAssets();
        await assets.loadAllModelsAndTextures();
        await assets.generateMaterials();
        await assets.generateFaceMeshes();
        return assets;
    }

    public abstract GetBeamGeo(): THREE.BufferGeometry | THREE.Geometry;

    public abstract GetAxisArrowGeo(): THREE.BufferGeometry | THREE.Geometry;

    public abstract GenerateCube(position: THREE.Vector3, step: number): AnyCubeController;

    public abstract GenerateFillColorCube(position: THREE.Vector3, step: number): FillColorCubeController;

    public abstract AddStaticMeshToCube(cube: THREE.Group): void;

    public dispose() {
        for (let i = 0; i < this.disposeOperations.length; i++) {
            this.disposeOperations[i]();
        }
    }
}

export class TZAssets extends Assets {

    public UpFace: THREE.BufferGeometry | THREE.Geometry;
    public DownFace: THREE.BufferGeometry | THREE.Geometry;
    public LeftFace: THREE.BufferGeometry | THREE.Geometry;
    public RightFace: THREE.BufferGeometry | THREE.Geometry;
    public FrontFace: THREE.BufferGeometry | THREE.Geometry;
    public BackFace: THREE.BufferGeometry | THREE.Geometry;
    public AxisArrow: THREE.BufferGeometry | THREE.Geometry;
    public BeamGeo: THREE.BufferGeometry | THREE.Geometry;
    public TexBlack: THREE.Texture;
    public TexBump: THREE.Texture;
    public UpFaceTextures: FaceTexturesPackage;
    public DownFaceTextures: FaceTexturesPackage;
    public LeftFaceTextures: FaceTexturesPackage;
    public RightFaceTextures: FaceTexturesPackage;
    public FrontFaceTextures: FaceTexturesPackage;
    public BackFaceTextures: FaceTexturesPackage;
    public MatBlackFace: THREE.MeshPhongMaterial;
    public CubeUpFace: THREE.Mesh;
    public CubeDownFace: THREE.Mesh;
    public CubeLeftFace: THREE.Mesh;
    public CubeRightFace: THREE.Mesh;
    public CubeFrontFace: THREE.Mesh;
    public CubeBackFace: THREE.Mesh;

    constructor() {
        super();
    }

    public GenerateCube(position: THREE.Vector3, step: number): AnyCubeController {
        const up = this.CubeUpFace.clone();
        const down = this.CubeDownFace.clone();
        const left = this.CubeLeftFace.clone();
        const right = this.CubeRightFace.clone();
        const front = this.CubeFrontFace.clone();
        const back = this.CubeBackFace.clone();

        const upTex = this.UpFaceTextures;
        const downTex = this.DownFaceTextures;
        const leftTex = this.LeftFaceTextures;
        const rightTex = this.RightFaceTextures;
        const frontTex = this.FrontFaceTextures;
        const backTex = this.BackFaceTextures;

        up.material = this.MatBlackFace.clone();
        down.material = this.MatBlackFace.clone();
        left.material = this.MatBlackFace.clone();
        right.material = this.MatBlackFace.clone();
        front.material = this.MatBlackFace.clone();
        back.material = this.MatBlackFace.clone();
        const cubeController = new AnyCubeController(position);
        cubeController.AddFaces([down, up, right, left, back, front], [downTex, upTex, rightTex, leftTex, backTex, frontTex]);
        cubeController.UpdateColor(Tools.GenerateInitColorFromPosition(position, step));
        return cubeController;
    }

    public GenerateFillColorCube(position: THREE.Vector3, step: number): FillColorCubeController {
        const up = this.CubeUpFace.clone();
        const down = this.CubeDownFace.clone();
        const left = this.CubeLeftFace.clone();
        const right = this.CubeRightFace.clone();
        const front = this.CubeFrontFace.clone();
        const back = this.CubeBackFace.clone();

        const upTex = this.UpFaceTextures;
        const downTex = this.DownFaceTextures;
        const leftTex = this.LeftFaceTextures;
        const rightTex = this.RightFaceTextures;
        const frontTex = this.FrontFaceTextures;
        const backTex = this.BackFaceTextures;

        up.material = this.MatBlackFace.clone();
        down.material = this.MatBlackFace.clone();
        left.material = this.MatBlackFace.clone();
        right.material = this.MatBlackFace.clone();
        front.material = this.MatBlackFace.clone();
        back.material = this.MatBlackFace.clone();
        const cubeController = new FillColorCubeController(position);
        cubeController.AddFaces([down, up, right, left, back, front], [downTex, upTex, rightTex, leftTex, backTex, frontTex]);
        return cubeController;
    }

    public AddStaticMeshToCube(cube: THREE.Group): void {
    }

    public GetBeamGeo(): THREE.BufferGeometry | THREE.Geometry {
        return this.BeamGeo;
    }
    public GetAxisArrowGeo(): THREE.BufferGeometry | THREE.Geometry {
        return this.AxisArrow;
    }

    public async generateFaceMeshes(): Promise<void> {
        this.CubeUpFace = new THREE.Mesh(this.UpFace, this.MatBlackFace);
        this.CubeDownFace = new THREE.Mesh(this.DownFace, this.MatBlackFace);
        this.CubeFrontFace = new THREE.Mesh(this.FrontFace, this.MatBlackFace);
        this.CubeBackFace = new THREE.Mesh(this.BackFace, this.MatBlackFace);
        this.CubeLeftFace = new THREE.Mesh(this.LeftFace, this.MatBlackFace);
        this.CubeRightFace = new THREE.Mesh(this.RightFace, this.MatBlackFace);
        Debug.Log('Generate face meshes done.');
    }

    public async loadAllModelsAndTextures(): Promise<void> {
        await Promise.all([
            this.loadAllModels(),
            this.loadAllTextures()
        ]);
    }

    public generateMaterials(): void {
        this.MatBlackFace = new THREE.MeshPhongMaterial({
            map: this.TexBlack,
            shininess: 0,
            reflectivity: 0,
            bumpMap: this.TexBump,
            bumpScale: 0.02,
        });
        this.disposeOperations.push(() => {
            this.MatBlackFace.dispose();
        });
    }

    private async loadAllTextures() {
        this.UpFaceTextures = new FaceTexturesPackage();
        this.DownFaceTextures = new FaceTexturesPackage();
        this.LeftFaceTextures = new FaceTexturesPackage();
        this.RightFaceTextures = new FaceTexturesPackage();
        this.FrontFaceTextures = new FaceTexturesPackage();
        this.BackFaceTextures = new FaceTexturesPackage();
        await Promise.all([
            this.loadBumpTexture(),
            this.loadBlackTexture(),
            this.loadUpTextures(),
            this.loadDownTextures(),
            this.loadLeftTextures(),
            this.loadRightTextures(),
            this.loadFrontTextures(),
            this.loadBackTextures()
        ]);
        this.UpFaceTextures.TexBlack = this.TexBlack;
        this.DownFaceTextures.TexBlack = this.TexBlack;
        this.LeftFaceTextures.TexBlack = this.TexBlack;
        this.RightFaceTextures.TexBlack = this.TexBlack;
        this.FrontFaceTextures.TexBlack = this.TexBlack;
        this.BackFaceTextures.TexBlack = this.TexBlack;
        this.disposeOperations.push(() => {
            this.UpFaceTextures.dispose();
            this.DownFaceTextures.dispose();
            this.LeftFaceTextures.dispose();
            this.RightFaceTextures.dispose();
            this.FrontFaceTextures.dispose();
            this.BackFaceTextures.dispose();
            this.TexBlack.dispose();
            this.TexBump.dispose();
        });
    }

    private async loadBumpTexture(): Promise<void> {
        this.TexBump = await loadTexture('assets/MagicCube/Texture/normalGroup_tmp.png');
        Debug.Log('Load bump texture done.', this.TexBump);
    }

    private async loadBlackTexture(): Promise<void> {
        this.TexBlack = await loadTexture('assets/MagicCube/Texture/new_textures/center/black.svg');
        Debug.Log('Load black texture done.', this.TexBlack);
    }

    private async loadUpTextures(): Promise<void> {
        [
            this.UpFaceTextures.TexRed,
            this.UpFaceTextures.TexGreen,
            this.UpFaceTextures.TexBlue,
            this.UpFaceTextures.TexYellow,
            this.UpFaceTextures.TexWhite,
            this.UpFaceTextures.TexOrange
        ] = await Promise.all([
            loadTexture('assets/MagicCube/Texture/new_textures/center/up/up_red.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/up/up_green.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/up/up_blue.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/up/up_yellow.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/up/up_white.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/up/up_orange.svg')
        ]);
        Debug.Log('Load up face textures done.');
    }

    private async loadDownTextures(): Promise<void> {
        [
            this.DownFaceTextures.TexRed,
            this.DownFaceTextures.TexGreen,
            this.DownFaceTextures.TexBlue,
            this.DownFaceTextures.TexYellow,
            this.DownFaceTextures.TexWhite,
            this.DownFaceTextures.TexOrange
        ] = await Promise.all([
            loadTexture('assets/MagicCube/Texture/new_textures/center/down/down_red.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/down/down_green.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/down/down_blue.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/down/down_yellow.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/down/down_white.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/down/down_orange.svg'),
        ]);
        Debug.Log('Load down face textures done.');
    }

    private async loadLeftTextures(): Promise<void> {
        [
            this.LeftFaceTextures.TexRed,
            this.LeftFaceTextures.TexGreen,
            this.LeftFaceTextures.TexBlue,
            this.LeftFaceTextures.TexYellow,
            this.LeftFaceTextures.TexWhite,
            this.LeftFaceTextures.TexOrange
        ] = await Promise.all([
            loadTexture('assets/MagicCube/Texture/new_textures/center/left/left_red.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/left/left_green.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/left/left_blue.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/left/left_yellow.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/left/left_white.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/left/left_orange.svg')
        ]);
        Debug.Log('Load left face textures done.');
    }

    private async loadRightTextures(): Promise<void> {
        [
            this.RightFaceTextures.TexRed,
            this.RightFaceTextures.TexGreen,
            this.RightFaceTextures.TexBlue,
            this.RightFaceTextures.TexYellow,
            this.RightFaceTextures.TexWhite,
            this.RightFaceTextures.TexOrange
        ] = await Promise.all([
            loadTexture('assets/MagicCube/Texture/new_textures/center/right/right_red.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/right/right_green.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/right/right_blue.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/right/right_yellow.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/right/right_white.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/right/right_orange.svg')
        ]);
        Debug.Log('Load right face textures done.');
    }

    private async loadFrontTextures(): Promise<void> {
        [
            this.FrontFaceTextures.TexRed,
            this.FrontFaceTextures.TexGreen,
            this.FrontFaceTextures.TexBlue,
            this.FrontFaceTextures.TexYellow,
            this.FrontFaceTextures.TexWhite,
            this.FrontFaceTextures.TexOrange
        ] = await Promise.all([
            loadTexture('assets/MagicCube/Texture/new_textures/center/front/front_red.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/front/front_green.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/front/front_blue.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/front/front_yellow.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/front/front_white.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/front/front_orange.svg')
        ]);
        Debug.Log('Load front face textures done.');
    }

    private async loadBackTextures(): Promise<void> {
        [
            this.BackFaceTextures.TexRed,
            this.BackFaceTextures.TexGreen,
            this.BackFaceTextures.TexBlue,
            this.BackFaceTextures.TexYellow,
            this.BackFaceTextures.TexWhite,
            this.BackFaceTextures.TexOrange
        ] = await Promise.all([
            loadTexture('assets/MagicCube/Texture/new_textures/center/back/back_red.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/back/back_green.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/back/back_blue.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/back/back_yellow.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/back/back_white.svg'),
            loadTexture('assets/MagicCube/Texture/new_textures/center/back/back_orange.svg')
        ]);
        Debug.Log('Load back face textures done.');
    }

    private async loadAllModels() {
        [this.BeamGeo, this.AxisArrow,
        this.UpFace, this.DownFace,
        this.LeftFace, this.RightFace,
        this.FrontFace, this.BackFace] = await Promise.all([
            this.loadBeamModel(),
            this.loadAxisArrow(),
            this.loadUpFace(),
            this.loadDownFace(),
            this.loadLeftFace(),
            this.loadRightFace(),
            this.loadFrontFace(),
            this.loadBackFace(),
        ]);
        this.disposeOperations.push(() => {
            this.BeamGeo.dispose();
            this.AxisArrow.dispose();
            this.UpFace.dispose();
            this.DownFace.dispose();
            this.LeftFace.dispose();
            this.RightFace.dispose();
            this.FrontFace.dispose();
            this.BackFace.dispose();
        });
    }

    private loadBeamModel(): Promise<THREE.BufferGeometry | THREE.Geometry> {
        return new Promise<THREE.BufferGeometry | THREE.Geometry>((resolve, reject) => {
            fbxLoader.load('assets/MagicCube/Effects/ETFX_AuraVertical.FBX', (object: THREE.Group) => {
                const geo = (object.children[0] as THREE.Mesh).geometry;
                geo.scale(1, 1, 18);
                resolve(geo);
            });
        });
    }

    private loadAxisArrow(): Promise<THREE.BufferGeometry | THREE.Geometry> {
        return new Promise<THREE.BufferGeometry | THREE.Geometry>((resolve, reject) => {
            fbxLoader.load('assets/MagicCube/Effects/AxisArrow.FBX', (object: THREE.Group) => {
                let axisArrow: THREE.BufferGeometry | THREE.Geometry;
                for (let i = 0; i < object.children.length; i++) {
                    if (object.children[i] instanceof THREE.Mesh) {
                        axisArrow = (object.children[i] as THREE.Mesh).geometry;
                        axisArrow.scale(1 / 20.0, 1 / 20.0, 1 / 20.0);
                        break;
                    }
                }
                resolve(axisArrow);
            });
        });
    }

    private loadUpFace(): Promise<THREE.BufferGeometry | THREE.Geometry> {
        return new Promise<THREE.BufferGeometry | THREE.Geometry>((resolve, reject) => {
            fbxLoader.load('assets/MagicCube/CubeFaces/Up.FBX', (object: THREE.Group) => {
                let upFace: THREE.BufferGeometry | THREE.Geometry;
                for (let i = 0; i < object.children.length; i++) {
                    if (object.children[i] instanceof THREE.Mesh) {
                        upFace = (object.children[i] as THREE.Mesh).geometry;
                        upFace.scale(0.01, 0.01, 0.01);
                        break;
                    }
                }
                Debug.Log('Load up face done.', upFace);
                resolve(upFace);
            });
        });
    }

    private loadDownFace(): Promise<THREE.BufferGeometry | THREE.Geometry> {
        return new Promise<THREE.BufferGeometry | THREE.Geometry>((resolve, reject) => {
            fbxLoader.load('assets/MagicCube/CubeFaces/Down.FBX', (object: THREE.Group) => {
                let downFace: THREE.BufferGeometry | THREE.Geometry;
                for (let i = 0; i < object.children.length; i++) {
                    if (object.children[i] instanceof THREE.Mesh) {
                        downFace = (object.children[i] as THREE.Mesh).geometry;
                        downFace.scale(0.01, 0.01, 0.01);
                        break;
                    }
                }
                // Debug.Log('Load down face done.', params.baseParams.assets.DownFace);
                Debug.Log('Load down face done.', downFace);
                resolve(downFace);
            });
        });
    }

    private loadLeftFace(): Promise<THREE.BufferGeometry | THREE.Geometry> {
        return new Promise<THREE.BufferGeometry | THREE.Geometry>((resolve, reject) => {
            fbxLoader.load('assets/MagicCube/CubeFaces/Left.FBX', (object: THREE.Group) => {
                let leftFace: THREE.BufferGeometry | THREE.Geometry;
                for (let i = 0; i < object.children.length; i++) {
                    if (object.children[i] instanceof THREE.Mesh) {
                        leftFace = (object.children[i] as THREE.Mesh).geometry;
                        leftFace.scale(0.01, 0.01, 0.01);
                        leftFace.translate(0.5, 0, 0);
                        break;
                    }
                }
                // Debug.Log('Load left face done.', params.baseParams.assets.LeftFace);
                Debug.Log('Load left face done.', leftFace);
                resolve(leftFace);
            });
        });
    }

    private loadRightFace(): Promise<THREE.BufferGeometry | THREE.Geometry> {
        return new Promise<THREE.BufferGeometry | THREE.Geometry>((resolve, reject) => {
            fbxLoader.load('assets/MagicCube/CubeFaces/Right.FBX', (object: THREE.Group) => {
                let rightFace: THREE.BufferGeometry | THREE.Geometry;
                for (let i = 0; i < object.children.length; i++) {
                    if (object.children[i] instanceof THREE.Mesh) {
                        rightFace = (object.children[i] as THREE.Mesh).geometry;
                        rightFace.scale(0.01, 0.01, 0.01);
                        rightFace.translate(-0.5, 0, 0);
                        break;
                    }
                }
                // Debug.Log('Load right face done.', params.baseParams.assets.RightFace);
                Debug.Log('Load right face done.', rightFace);
                resolve(rightFace);
            });
        });
    }

    private loadFrontFace(): Promise<THREE.BufferGeometry | THREE.Geometry> {
        return new Promise<THREE.BufferGeometry | THREE.Geometry>((resolve, reject) => {
            fbxLoader.load('assets/MagicCube/CubeFaces/Front.FBX', (object: THREE.Group) => {
                let frontFace: THREE.BufferGeometry | THREE.Geometry;
                for (let i = 0; i < object.children.length; i++) {
                    if (object.children[i] instanceof THREE.Mesh) {
                        frontFace = (object.children[i] as THREE.Mesh).geometry;
                        frontFace.scale(0.01, 0.01, 0.01);
                        frontFace.translate(0, 0, 0.5);
                        break;
                    }
                }
                // Debug.Log('Load front face done.', params.baseParams.assets.FrontFace);
                Debug.Log('Load front face done.', frontFace);
                resolve(frontFace);
            });
        });
    }

    private loadBackFace(): Promise<THREE.BufferGeometry | THREE.Geometry> {
        return new Promise<THREE.BufferGeometry | THREE.Geometry>((resolve, reject) => {
            fbxLoader.load('assets/MagicCube/CubeFaces/Back.FBX', (object: THREE.Group) => {
                let backFace: THREE.BufferGeometry | THREE.Geometry;
                for (let i = 0; i < object.children.length; i++) {
                    if (object.children[i] instanceof THREE.Mesh) {
                        backFace = (object.children[i] as THREE.Mesh).geometry;
                        backFace.scale(0.01, 0.01, 0.01);
                        backFace.translate(0, 0, -0.5);
                        break;
                    }
                }
                Debug.Log('Load back face done.', backFace);
                resolve(backFace);
            });
        });
    }
}

enum CubeType {
    U = 100,
    D = 200,
    L = 10,
    R = 20,
    F = 1,
    B = 2,
    UL = CubeType.U + CubeType.L,
    UR = CubeType.U + CubeType.R,
    UB = CubeType.U + CubeType.B,
    UF = CubeType.U + CubeType.F,
    DL = CubeType.D + CubeType.L,
    DR = CubeType.D + CubeType.R,
    DF = CubeType.D + CubeType.F,
    DB = CubeType.D + CubeType.B,
    LF = CubeType.L + CubeType.F,
    LB = CubeType.L + CubeType.B,
    RF = CubeType.R + CubeType.F,
    RB = CubeType.R + CubeType.B,
    ULF = CubeType.UL + CubeType.F,
    ULB = CubeType.UL + CubeType.B,
    URF = CubeType.UR + CubeType.F,
    URB = CubeType.UR + CubeType.B,
    DLF = CubeType.DL + CubeType.F,
    DLB = CubeType.DL + CubeType.B,
    DRF = CubeType.DR + CubeType.F,
    DRB = CubeType.DR + CubeType.B
}

export class TPAssets extends Assets {
    public AxisArrow: THREE.BufferGeometry | THREE.Geometry;
    public BeamGeo: THREE.BufferGeometry | THREE.Geometry;
    public OriginWholeCube: THREE.Group;

    public TexBump: THREE.Texture;
    public FaceTextures: FaceTexturesPackage;
    public WhiteCenterTextures: FaceTexturesPackage;

    public MatBlackFace: THREE.MeshPhongMaterial;

    private cubeMap: Map<CubeType, THREE.Group>;

    constructor() {
        super();
        this.FaceTextures = new FaceTexturesPackage();
        this.WhiteCenterTextures = new FaceTexturesPackage();
        this.cubeMap = new Map<CubeType, THREE.Group>();
        for (let y = CubeType.D; y >= 0; y -= 100) {
            for (let x = CubeType.R; x >= 0; x -= 10) {
                for (let z = CubeType.B; z >= 0; z -= 1) {
                    const cubeType = y + x + z;
                    const group = new THREE.Group();
                    group.position.set(0, 0, 0);
                    this.cubeMap.set(cubeType, group);
                }
            }
        }
    }

    public GetBeamGeo(): THREE.BufferGeometry | THREE.Geometry {
        return this.BeamGeo;
    }

    public GetAxisArrowGeo(): THREE.BufferGeometry | THREE.Geometry {
        return this.AxisArrow;
    }

    public GenerateCube(position: THREE.Vector3, step: number): AnyCubeController {
        const lowLimit = -step / 2.0 + 0.5;
        const hightLimit = step / 2 - 0.5;
        const X = this.selectCubeType(position.x, lowLimit, hightLimit, CubeType.R, CubeType.L);
        const Y = this.selectCubeType(position.y, lowLimit, hightLimit, CubeType.D, CubeType.U);
        const Z = this.selectCubeType(position.z, lowLimit, hightLimit, CubeType.B, CubeType.F);
        const cubeType = X + Y + Z;
        const cube = this.cubeMap.get(cubeType);
        const faces = [undefined, undefined, undefined, undefined, undefined, undefined];
        let inFace: THREE.Object3D;
        for (let i = 0; i < cube.children.length; i++) {
            switch (cube.children[i].name) {
                case 'D':
                    faces[0] = cube.children[i].clone();
                    faces[0].material = this.MatBlackFace.clone();
                    break;
                case 'U':
                    faces[1] = cube.children[i].clone();
                    faces[1].material = this.MatBlackFace.clone();
                    break;
                case 'R':
                    faces[2] = cube.children[i].clone();
                    faces[2].material = this.MatBlackFace.clone();
                    break;
                case 'L':
                    faces[3] = cube.children[i].clone();
                    faces[3].material = this.MatBlackFace.clone();
                    break;
                case 'B':
                    faces[4] = cube.children[i].clone();
                    faces[4].material = this.MatBlackFace.clone();
                    break;
                case 'F':
                    faces[5] = cube.children[i].clone();
                    faces[5].material = this.MatBlackFace.clone();
                    break;
                case '0':
                    inFace = cube.children[i].clone();
                    (inFace as THREE.Mesh).material = this.MatBlackFace.clone();
                    break;
            }
        }
        for (let i = 0; i < 6; i++) {
            if (faces[i] === undefined) {
                faces[i] = inFace;
            }
            if (faces[i] !== undefined) {
                (faces[i] as THREE.Mesh).receiveShadow = true;
            }
        }
        const res = new AnyCubeController(position);
        let faceTextures = [];
        if (cube.children.length === 2 && faces[0].name === 'D') {
            faceTextures = [this.WhiteCenterTextures, this.FaceTextures,
            this.FaceTextures, this.FaceTextures,
            this.FaceTextures, this.FaceTextures]
        } else {
            faceTextures = [this.FaceTextures, this.FaceTextures,
            this.FaceTextures, this.FaceTextures,
            this.FaceTextures, this.FaceTextures];
        }
        res.AddFaces(faces, faceTextures);
        res.UpdateColor(Tools.GenerateInitColorFromPosition(position, step));
        return res;
    }

    public AddStaticMeshToCube(cube: THREE.Group): void {
    }

    private selectCubeType(value: number, l: number, h: number, sel_l: CubeType, sel_h): CubeType {
        if (value === l) return sel_l;
        else if (value === h) return sel_h;
        else return 0;
    }

    public GenerateFillColorCube(position: THREE.Vector3, step: number): FillColorCubeController {
        const lowLimit = -step / 2.0 + 0.5;
        const hightLimit = step / 2 - 0.5;
        const X = this.selectCubeType(position.x, lowLimit, hightLimit, CubeType.R, CubeType.L);
        const Y = this.selectCubeType(position.y, lowLimit, hightLimit, CubeType.D, CubeType.U);
        const Z = this.selectCubeType(position.z, lowLimit, hightLimit, CubeType.B, CubeType.F);
        const cubeType = X + Y + Z;
        const cube = this.cubeMap.get(cubeType);
        const faces = [undefined, undefined, undefined, undefined, undefined, undefined];
        let inFace: THREE.Object3D;
        for (let i = 0; i < cube.children.length; i++) {
            switch (cube.children[i].name) {
                case 'D':
                    faces[0] = cube.children[i].clone();
                    faces[0].material = this.MatBlackFace.clone();
                    break;
                case 'U':
                    faces[1] = cube.children[i].clone();
                    faces[1].material = this.MatBlackFace.clone();
                    break;
                case 'R':
                    faces[2] = cube.children[i].clone();
                    faces[2].material = this.MatBlackFace.clone();
                    break;
                case 'L':
                    faces[3] = cube.children[i].clone();
                    faces[3].material = this.MatBlackFace.clone();
                    break;
                case 'B':
                    faces[4] = cube.children[i].clone();
                    faces[4].material = this.MatBlackFace.clone();
                    break;
                case 'F':
                    faces[5] = cube.children[i].clone();
                    faces[5].material = this.MatBlackFace.clone();
                    break;
                case '0':
                    inFace = cube.children[i].clone();
                    (inFace as THREE.Mesh).material = this.MatBlackFace.clone();
                    break;
            }
        }
        for (let i = 0; i < 6; i++) {
            if (faces[i] === undefined) {
                faces[i] = inFace;
            }
            if (faces[i] !== undefined) {
                (faces[i] as THREE.Mesh).receiveShadow = true;
            }
        }

        let faceTextures = [];
        if (cube.children.length === 2 && faces[0].name === 'D') {
            faceTextures = [this.WhiteCenterTextures, this.FaceTextures,
            this.FaceTextures, this.FaceTextures,
            this.FaceTextures, this.FaceTextures]
        } else {
            faceTextures = [this.FaceTextures, this.FaceTextures,
            this.FaceTextures, this.FaceTextures,
            this.FaceTextures, this.FaceTextures];
        }

        const cubeController = new FillColorCubeController(position);
        cubeController.AddFaces(faces, faceTextures);
        return cubeController;
    }

    public async generateFaceMeshes(): Promise<void> {
        Debug.Log('Generate face meshes done.');
    }

    public async generateMaterials(): Promise<void> {
        this.MatBlackFace = new THREE.MeshPhongMaterial({
            map: this.FaceTextures.GetBlack(),
            // specular: 0x888888,
            // shininess: 64,
            // reflectivity: 2,
            side: THREE.DoubleSide,
            // color: new THREE.Color(1, 1, 1),
            //  bumpMap: this.TexBump,
            // bumpScale: 0.2,
        });
        this.disposeOperations.push(() => {
            this.MatBlackFace.dispose();
        });
    }

    public async loadAllModelsAndTextures(): Promise<void> {
        await Promise.all([
            this.loadAllModels(),
            this.loadAllTextures(),
        ]);
    }

    private async loadAllTextures() {
        [this.TexBump,
        this.FaceTextures.TexYellow,
        this.FaceTextures.TexWhite,
        this.FaceTextures.TexRed,
        this.FaceTextures.TexOrange,
        this.FaceTextures.TexBlue,
        this.FaceTextures.TexGreen,
        this.FaceTextures.TexBlack,
        this.WhiteCenterTextures.TexWhite] = await Promise.all([
            loadTexture('assets/MagicCube/Texture/normalGroup_tmp.png'),
            loadTexture('assets/MagicCube/Texture/new_textures/tp_texture/tp_yellow.png'),
            loadTexture('assets/MagicCube/Texture/new_textures/tp_texture/tp_white.png'),
            loadTexture('assets/MagicCube/Texture/new_textures/tp_texture/tp_red.png'),
            loadTexture('assets/MagicCube/Texture/new_textures/tp_texture/tp_orange.png'),
            loadTexture('assets/MagicCube/Texture/new_textures/tp_texture/tp_blue.png'),
            loadTexture('assets/MagicCube/Texture/new_textures/tp_texture/tp_green.png'),
            loadTexture('assets/MagicCube/Texture/new_textures/tp_texture/tp_black.png'),
            loadTexture('assets/MagicCube/Texture/new_textures/tp_texture/tp_white_c.png')
        ]);
        this.WhiteCenterTextures.TexRed = this.FaceTextures.TexRed.clone();
        this.WhiteCenterTextures.TexBlack = this.FaceTextures.TexBlack.clone();
        this.WhiteCenterTextures.TexGreen = this.FaceTextures.TexGreen.clone();
        this.WhiteCenterTextures.TexBlue = this.FaceTextures.TexBlue.clone();
        this.WhiteCenterTextures.TexOrange = this.FaceTextures.TexOrange.clone();
        this.WhiteCenterTextures.TexYellow = this.FaceTextures.TexYellow.clone();
        this.disposeOperations.push(() => {
            this.FaceTextures.dispose();
            this.WhiteCenterTextures.dispose();
        });
    }

    private async loadAllModels() {
        [this.BeamGeo, this.AxisArrow,
        this.OriginWholeCube,
        ] = await Promise.all([
            this.loadBeamModel(),
            this.loadAxisArrow(),
            this.loadBaseCube(),
        ]);
        this.disposeOperations.push(() => {
            this.BeamGeo.dispose();
            this.AxisArrow.dispose();
        });
    }

    private loadBaseCube(): Promise<THREE.Group> {
        return new Promise<THREE.Group>((resolve, reject) => {
            fbxLoader.load('assets/MagicCube/CubeFaces/WholeCube.FBX', (object: THREE.Group) => {

                const childrenCount = object.children.length;
                const children = new Array<THREE.Object3D>();
                for (let i = 0; i < childrenCount; i++) {
                    if (object.children[i] instanceof THREE.Mesh) {
                        children.push(object.children[i].clone());
                    }
                }

                children.forEach((value: THREE.Object3D, index: number) => {
                    const str = value.name.split('_', 2);
                    (value as THREE.Mesh).geometry.scale(1 / 18, 1 / 18, 1 / 18);
                    value.position.set(0, 0, 0)
                    value.name = str[1];
                    this.addFaceByName(str[0], value as THREE.Mesh);
                });

                Debug.Log('Load Base Cube', this.cubeMap);
                resolve(object);
            })
        });
    }

    private addFaceByName(typeStr: string, face: THREE.Mesh) {
        let cubeType: CubeType;
        switch (typeStr) {
            case 'DLB':
                cubeType = CubeType.DLB;
                break;
            case 'DRB':
                cubeType = CubeType.DRB;
                break;
            case 'DRF':
                cubeType = CubeType.DRF;
                break;
            case 'DLF':
                cubeType = CubeType.DLF;
                break;
            case 'ULB':
                cubeType = CubeType.ULB;
                break;
            case 'URB':
                cubeType = CubeType.URB;
                break;
            case 'URF':
                cubeType = CubeType.URF;
                break;
            case 'ULF':
                cubeType = CubeType.ULF;
                break;
            case 'DB':
                cubeType = CubeType.DB;
                break;
            case 'DR':
                cubeType = CubeType.DR;
                break;
            case 'DF':
                cubeType = CubeType.DF;
                break;
            case 'DL':
                cubeType = CubeType.DL;
                break;
            case 'UB':
                cubeType = CubeType.UB;
                break;
            case 'UR':
                cubeType = CubeType.UR;
                break;
            case 'UF':
                cubeType = CubeType.UF;
                break;
            case 'UL':
                cubeType = CubeType.UL;
                break;
            case 'LB':
                cubeType = CubeType.LB;
                break;
            case 'RB':
                cubeType = CubeType.RB;
                break;
            case 'RF':
                cubeType = CubeType.RF;
                break;
            case 'LF':
                cubeType = CubeType.LF;
                break;
            case 'D':
                cubeType = CubeType.D;
                break;
            case 'U':
                cubeType = CubeType.U;
                break;
            case 'L':
                cubeType = CubeType.L;
                break;
            case 'R':
                cubeType = CubeType.R;
                break;
            case 'F':
                cubeType = CubeType.F;
                break;
            case 'B':
                cubeType = CubeType.B;
                break;
        }
        if (!this.cubeMap.has(cubeType)) {
            Debug.Log('Cube Type Error', cubeType, typeStr);
        }
        this.cubeMap.get(cubeType).add(face);
    }

    private loadBeamModel(): Promise<THREE.BufferGeometry | THREE.Geometry> {
        return new Promise<THREE.BufferGeometry | THREE.Geometry>((resolve, reject) => {
            fbxLoader.load('assets/MagicCube/Effects/ETFX_AuraVertical.FBX', (object: THREE.Group) => {
                const geo = (object.children[0] as THREE.Mesh).geometry;
                geo.scale(1, 1, 18);
                Debug.Log('Load Beam Model');
                resolve(geo);
            });
        });
    }

    private loadAxisArrow(): Promise<THREE.BufferGeometry | THREE.Geometry> {
        return new Promise<THREE.BufferGeometry | THREE.Geometry>((resolve, reject) => {
            fbxLoader.load('assets/MagicCube/Effects/AxisArrow.FBX', (object: THREE.Group) => {
                let axisArrow: THREE.BufferGeometry | THREE.Geometry;
                for (let i = 0; i < object.children.length; i++) {
                    if (object.children[i] instanceof THREE.Mesh) {
                        axisArrow = (object.children[i] as THREE.Mesh).geometry;
                        axisArrow.scale(1 / 20.0, 1 / 20.0, 1 / 20.0);
                        break;
                    }
                }
                Debug.Log('Load Axis Arrow');
                resolve(axisArrow);
            });
        });
    }
}

export class GDAssets extends Assets {
    public AxisArrow: THREE.BufferGeometry | THREE.Geometry;
    public BeamGeo: THREE.BufferGeometry | THREE.Geometry;
    public OriginWholeCube: THREE.Group;

    public TexBump: THREE.Texture;
    public FaceTextures: FaceTexturesPackage;
    // public WhiteCenterTextures: FaceTexturesPackage;

    public MatBlackFace: THREE.MeshPhongMaterial;

    private cubeMap: Map<CubeType, THREE.Group>;
    public CenterBall: THREE.Mesh;

    constructor() {
        super();
        this.FaceTextures = new FaceTexturesPackage();
        // this.WhiteCenterTextures = new FaceTexturesPackage();
        this.cubeMap = new Map<CubeType, THREE.Group>();
        for (let y = CubeType.D; y >= 0; y -= 100) {
            for (let x = CubeType.R; x >= 0; x -= 10) {
                for (let z = CubeType.B; z >= 0; z -= 1) {
                    const cubeType = y + x + z;
                    const group = new THREE.Group();
                    group.position.set(0, 0, 0);
                    this.cubeMap.set(cubeType, group);
                }
            }
        }
    }
    public GetBeamGeo(): THREE.BufferGeometry | THREE.Geometry {
        return this.BeamGeo;
    }

    public GetAxisArrowGeo(): THREE.BufferGeometry | THREE.Geometry {
        return this.AxisArrow;
    }

    public GenerateCube(position: THREE.Vector3, step: number): AnyCubeController {
        const lowLimit = -step / 2.0 + 0.5;
        const hightLimit = step / 2 - 0.5;
        const X = this.selectCubeType(position.x, lowLimit, hightLimit, CubeType.R, CubeType.L);
        const Y = this.selectCubeType(position.y, lowLimit, hightLimit, CubeType.D, CubeType.U);
        const Z = this.selectCubeType(position.z, lowLimit, hightLimit, CubeType.B, CubeType.F);
        const cubeType = X + Y + Z;
        const cube = this.cubeMap.get(cubeType);
        const faces = [undefined, undefined, undefined, undefined, undefined, undefined];
        let inFace: THREE.Object3D;
        for (let i = 0; i < cube.children.length; i++) {
            switch (cube.children[i].name) {
                case 'D':
                    faces[0] = cube.children[i].clone();
                    faces[0].material = this.MatBlackFace.clone();
                    break;
                case 'U':
                    faces[1] = cube.children[i].clone();
                    faces[1].material = this.MatBlackFace.clone();
                    break;
                case 'R':
                    faces[2] = cube.children[i].clone();
                    faces[2].material = this.MatBlackFace.clone();
                    break;
                case 'L':
                    faces[3] = cube.children[i].clone();
                    faces[3].material = this.MatBlackFace.clone();
                    break;
                case 'B':
                    faces[4] = cube.children[i].clone();
                    faces[4].material = this.MatBlackFace.clone();
                    break;
                case 'F':
                    faces[5] = cube.children[i].clone();
                    faces[5].material = this.MatBlackFace.clone();
                    break;
                case '0':
                    inFace = cube.children[i].clone();
                    (inFace as THREE.Mesh).material = this.MatBlackFace.clone();
                    break;
            }
        }
        for (let i = 0; i < 6; i++) {
            if (faces[i] === undefined) {
                faces[i] = inFace;
            }
            if (faces[i] !== undefined) {
                (faces[i] as THREE.Mesh).receiveShadow = true;
            }
        }
        const res = new AnyCubeController(position);
        let faceTextures = [];
        // if (cube.children.length === 2 && faces[0].name === 'D') {
        //     faceTextures = [this.WhiteCenterTextures, this.FaceTextures,
        //     this.FaceTextures, this.FaceTextures,
        //     this.FaceTextures, this.FaceTextures]
        // } else {
        faceTextures = [this.FaceTextures, this.FaceTextures,
        this.FaceTextures, this.FaceTextures,
        this.FaceTextures, this.FaceTextures];
        // }
        res.AddFaces(faces, faceTextures);
        res.UpdateColor(Tools.GenerateInitColorFromPosition(position, step));
        return res;
    }

    public AddStaticMeshToCube(cube: THREE.Group): void {
        cube.add(this.CenterBall.clone());
    }

    private selectCubeType(value: number, l: number, h: number, sel_l: CubeType, sel_h): CubeType {
        if (value === l) return sel_l;
        else if (value === h) return sel_h;
        else return 0;
    }

    public GenerateFillColorCube(position: THREE.Vector3, step: number): FillColorCubeController {
        const lowLimit = -step / 2.0 + 0.5;
        const hightLimit = step / 2 - 0.5;
        const X = this.selectCubeType(position.x, lowLimit, hightLimit, CubeType.R, CubeType.L);
        const Y = this.selectCubeType(position.y, lowLimit, hightLimit, CubeType.D, CubeType.U);
        const Z = this.selectCubeType(position.z, lowLimit, hightLimit, CubeType.B, CubeType.F);
        const cubeType = X + Y + Z;
        const cube = this.cubeMap.get(cubeType);
        const faces = [undefined, undefined, undefined, undefined, undefined, undefined];
        let inFace: THREE.Object3D;
        for (let i = 0; i < cube.children.length; i++) {
            switch (cube.children[i].name) {
                case 'D':
                    faces[0] = cube.children[i].clone();
                    faces[0].material = this.MatBlackFace.clone();
                    break;
                case 'U':
                    faces[1] = cube.children[i].clone();
                    faces[1].material = this.MatBlackFace.clone();
                    break;
                case 'R':
                    faces[2] = cube.children[i].clone();
                    faces[2].material = this.MatBlackFace.clone();
                    break;
                case 'L':
                    faces[3] = cube.children[i].clone();
                    faces[3].material = this.MatBlackFace.clone();
                    break;
                case 'B':
                    faces[4] = cube.children[i].clone();
                    faces[4].material = this.MatBlackFace.clone();
                    break;
                case 'F':
                    faces[5] = cube.children[i].clone();
                    faces[5].material = this.MatBlackFace.clone();
                    break;
                case '0':
                    inFace = cube.children[i].clone();
                    (inFace as THREE.Mesh).material = this.MatBlackFace.clone();
                    break;
            }
        }
        for (let i = 0; i < 6; i++) {
            if (faces[i] === undefined) {
                faces[i] = inFace;
            }
            if (faces[i] !== undefined) {
                (faces[i] as THREE.Mesh).receiveShadow = true;
            }
        }

        let faceTextures = [];
        // if (cube.children.length === 2 && faces[0].name === 'D') {
        //     faceTextures = [this.WhiteCenterTextures, this.FaceTextures,
        //     this.FaceTextures, this.FaceTextures,
        //     this.FaceTextures, this.FaceTextures]
        // } else {
        faceTextures = [this.FaceTextures, this.FaceTextures,
        this.FaceTextures, this.FaceTextures,
        this.FaceTextures, this.FaceTextures];
        // }

        const cubeController = new FillColorCubeController(position);
        cubeController.AddFaces(faces, faceTextures);
        return cubeController;
    }

    public async generateFaceMeshes(): Promise<void> {
        Debug.Log('Generate face meshes done.');
    }

    public async generateMaterials(): Promise<void> {
        this.MatBlackFace = new THREE.MeshPhongMaterial({
            map: this.FaceTextures.GetBlack(),
            side: THREE.DoubleSide,
        });
        this.disposeOperations.push(() => {
            this.MatBlackFace.dispose();
        });
    }

    public async loadAllModelsAndTextures(): Promise<void> {
        await Promise.all([
            this.loadAllModels(),
            this.loadAllTextures(),
        ]);
    }

    private async loadAllTextures() {
        [this.TexBump,
        this.FaceTextures.TexYellow,
        this.FaceTextures.TexWhite,
        this.FaceTextures.TexRed,
        this.FaceTextures.TexOrange,
        this.FaceTextures.TexBlue,
        this.FaceTextures.TexGreen,
        this.FaceTextures.TexBlack] = await Promise.all([
            loadTexture('assets/MagicCube/Texture/normalGroup_tmp.png'),
            loadTexture('assets/MagicCube/CubeModels/GDCube/tp_yellow.png'),
            loadTexture('assets/MagicCube/CubeModels/GDCube/tp_white.png'),
            loadTexture('assets/MagicCube/CubeModels/GDCube/tp_red.png'),
            loadTexture('assets/MagicCube/CubeModels/GDCube/tp_orange.png'),
            loadTexture('assets/MagicCube/CubeModels/GDCube/tp_blue.png'),
            loadTexture('assets/MagicCube/CubeModels/GDCube/tp_green.png'),
            loadTexture('assets/MagicCube/CubeModels/GDCube/tp_black.png'),
        ]);
        this.disposeOperations.push(() => {
            this.FaceTextures.dispose();
        });
    }

    private async loadAllModels() {
        [this.BeamGeo, this.AxisArrow,
        this.OriginWholeCube,
        ] = await Promise.all([
            this.loadBeamModel(),
            this.loadAxisArrow(),
            this.loadBaseCube(),
        ]);
        this.disposeOperations.push(() => {
            this.BeamGeo.dispose();
            this.AxisArrow.dispose();
        });
    }

    private loadBaseCube(): Promise<THREE.Group> {
        return new Promise<THREE.Group>((resolve, reject) => {
            fbxLoader.load('assets/MagicCube/CubeModels/GDCube/Cube.FBX', (object: THREE.Group) => {

                const childrenCount = object.children.length;
                const children = new Array<THREE.Object3D>();
                for (let i = 0; i < childrenCount; i++) {
                    if (object.children[i] instanceof THREE.Mesh) {
                        children.push(object.children[i].clone());
                    }
                }

                children.forEach((value: THREE.Object3D, index: number) => {
                    (value as THREE.Mesh).geometry.scale(1 / 18, 1 / 18, 1 / 18);
                    if (value.name !== '0') {
                        const str = value.name.split('_', 2);
                        value.position.set(0, 0, 0)
                        value.name = str[1];
                        this.addFaceByName(str[0], value as THREE.Mesh);
                    } else {
                        this.CenterBall = (value as THREE.Mesh).clone();
                    }
                });

                Debug.Log('Load Base Cube', this.cubeMap);
                resolve(object);
            })
        });
    }

    private addFaceByName(typeStr: string, face: THREE.Mesh) {
        let cubeType: CubeType;
        switch (typeStr) {
            case 'DLB':
                cubeType = CubeType.DLB;
                break;
            case 'DRB':
                cubeType = CubeType.DRB;
                break;
            case 'DRF':
                cubeType = CubeType.DRF;
                break;
            case 'DLF':
                cubeType = CubeType.DLF;
                break;
            case 'ULB':
                cubeType = CubeType.ULB;
                break;
            case 'URB':
                cubeType = CubeType.URB;
                break;
            case 'URF':
                cubeType = CubeType.URF;
                break;
            case 'ULF':
                cubeType = CubeType.ULF;
                break;
            case 'DB':
                cubeType = CubeType.DB;
                break;
            case 'DR':
                cubeType = CubeType.DR;
                break;
            case 'DF':
                cubeType = CubeType.DF;
                break;
            case 'DL':
                cubeType = CubeType.DL;
                break;
            case 'UB':
                cubeType = CubeType.UB;
                break;
            case 'UR':
                cubeType = CubeType.UR;
                break;
            case 'UF':
                cubeType = CubeType.UF;
                break;
            case 'UL':
                cubeType = CubeType.UL;
                break;
            case 'LB':
                cubeType = CubeType.LB;
                break;
            case 'RB':
                cubeType = CubeType.RB;
                break;
            case 'RF':
                cubeType = CubeType.RF;
                break;
            case 'LF':
                cubeType = CubeType.LF;
                break;
            case 'D':
                cubeType = CubeType.D;
                break;
            case 'U':
                cubeType = CubeType.U;
                break;
            case 'L':
                cubeType = CubeType.L;
                break;
            case 'R':
                cubeType = CubeType.R;
                break;
            case 'F':
                cubeType = CubeType.F;
                break;
            case 'B':
                cubeType = CubeType.B;
                break;
        }
        if (!this.cubeMap.has(cubeType)) {
            Debug.Log('Cube Type Error', cubeType, typeStr);
        }
        this.cubeMap.get(cubeType).add(face);
    }

    private loadBeamModel(): Promise<THREE.BufferGeometry | THREE.Geometry> {
        return new Promise<THREE.BufferGeometry | THREE.Geometry>((resolve, reject) => {
            fbxLoader.load('assets/MagicCube/Effects/ETFX_AuraVertical.FBX', (object: THREE.Group) => {
                const geo = (object.children[0] as THREE.Mesh).geometry;
                geo.scale(1, 1, 18);
                Debug.Log('Load Beam Model');
                resolve(geo);
            });
        });
    }

    private loadAxisArrow(): Promise<THREE.BufferGeometry | THREE.Geometry> {
        return new Promise<THREE.BufferGeometry | THREE.Geometry>((resolve, reject) => {
            fbxLoader.load('assets/MagicCube/Effects/AxisArrow.FBX', (object: THREE.Group) => {
                let axisArrow: THREE.BufferGeometry | THREE.Geometry;
                for (let i = 0; i < object.children.length; i++) {
                    if (object.children[i] instanceof THREE.Mesh) {
                        axisArrow = (object.children[i] as THREE.Mesh).geometry;
                        axisArrow.scale(1 / 20.0, 1 / 20.0, 1 / 20.0);
                        break;
                    }
                }
                Debug.Log('Load Axis Arrow');
                resolve(axisArrow);
            });
        });
    }


}

export class DDAssets extends Assets {
    public AxisArrow: THREE.BufferGeometry | THREE.Geometry;
    public BeamGeo: THREE.BufferGeometry | THREE.Geometry;
    public OriginWholeCube: THREE.Group;

    public TexBump: THREE.Texture;
    public FaceTextures: FaceTexturesPackage;

    public MatBlackFace: THREE.MeshPhongMaterial;

    private cubeMap: Map<CubeType, THREE.Group>;
    public CenterBall: THREE.Mesh;

    constructor() {
        super();
        this.FaceTextures = new FaceTexturesPackage();
        this.cubeMap = new Map<CubeType, THREE.Group>();
        for (let y = CubeType.D; y >= 0; y -= 100) {
            for (let x = CubeType.R; x >= 0; x -= 10) {
                for (let z = CubeType.B; z >= 0; z -= 1) {
                    const cubeType = y + x + z;
                    const group = new THREE.Group();
                    group.position.set(0, 0, 0);
                    this.cubeMap.set(cubeType, group);
                }
            }
        }
    }
    public GetBeamGeo(): THREE.BufferGeometry | THREE.Geometry {
        return this.BeamGeo;
    }

    public GetAxisArrowGeo(): THREE.BufferGeometry | THREE.Geometry {
        return this.AxisArrow;
    }

    public GenerateCube(position: THREE.Vector3, step: number): AnyCubeController {
        const lowLimit = -step / 2.0 + 0.5;
        const hightLimit = step / 2 - 0.5;
        const X = this.selectCubeType(position.x, lowLimit, hightLimit, CubeType.R, CubeType.L);
        const Y = this.selectCubeType(position.y, lowLimit, hightLimit, CubeType.D, CubeType.U);
        const Z = this.selectCubeType(position.z, lowLimit, hightLimit, CubeType.B, CubeType.F);
        const cubeType = X + Y + Z;
        const cube = this.cubeMap.get(cubeType);
        const faces = [undefined, undefined, undefined, undefined, undefined, undefined];
        for (let i = 0; i < cube.children.length; i++) {
            switch (cube.children[i].name) {
                case 'D':
                    faces[0] = cube.children[i].clone();
                    faces[0].material = this.MatBlackFace.clone();
                    break;
                case 'U':
                    faces[1] = cube.children[i].clone();
                    faces[1].material = this.MatBlackFace.clone();
                    break;
                case 'R':
                    faces[2] = cube.children[i].clone();
                    faces[2].material = this.MatBlackFace.clone();
                    break;
                case 'L':
                    faces[3] = cube.children[i].clone();
                    faces[3].material = this.MatBlackFace.clone();
                    break;
                case 'B':
                    faces[4] = cube.children[i].clone();
                    faces[4].material = this.MatBlackFace.clone();
                    break;
                case 'F':
                    faces[5] = cube.children[i].clone();
                    faces[5].material = this.MatBlackFace.clone();
                    break;
            }
        }
        for (let i = 0; i < 6; i++) {
            if (faces[i] !== undefined) {
                (faces[i] as THREE.Mesh).receiveShadow = true;
            }
        }
        const res = new AnyCubeController(position);
        let faceTextures = [];
        faceTextures = [this.FaceTextures, this.FaceTextures,
        this.FaceTextures, this.FaceTextures,
        this.FaceTextures, this.FaceTextures];
        res.AddFaces(faces, faceTextures);
        res.UpdateColor(Tools.GenerateInitColorFromPosition(position, step));
        return res;
    }

    public AddStaticMeshToCube(cube: THREE.Group): void {
        cube.add(this.CenterBall.clone());
    }

    private selectCubeType(value: number, l: number, h: number, sel_l: CubeType, sel_h): CubeType {
        if (value === l) return sel_l;
        else if (value === h) return sel_h;
        else return 0;
    }

    public GenerateFillColorCube(position: THREE.Vector3, step: number): FillColorCubeController {
        const lowLimit = -step / 2.0 + 0.5;
        const hightLimit = step / 2 - 0.5;
        const X = this.selectCubeType(position.x, lowLimit, hightLimit, CubeType.R, CubeType.L);
        const Y = this.selectCubeType(position.y, lowLimit, hightLimit, CubeType.D, CubeType.U);
        const Z = this.selectCubeType(position.z, lowLimit, hightLimit, CubeType.B, CubeType.F);
        const cubeType = X + Y + Z;
        const cube = this.cubeMap.get(cubeType);
        const faces = [undefined, undefined, undefined, undefined, undefined, undefined];
        for (let i = 0; i < cube.children.length; i++) {
            switch (cube.children[i].name) {
                case 'D':
                    faces[0] = cube.children[i].clone();
                    faces[0].material = this.MatBlackFace.clone();
                    break;
                case 'U':
                    faces[1] = cube.children[i].clone();
                    faces[1].material = this.MatBlackFace.clone();
                    break;
                case 'R':
                    faces[2] = cube.children[i].clone();
                    faces[2].material = this.MatBlackFace.clone();
                    break;
                case 'L':
                    faces[3] = cube.children[i].clone();
                    faces[3].material = this.MatBlackFace.clone();
                    break;
                case 'B':
                    faces[4] = cube.children[i].clone();
                    faces[4].material = this.MatBlackFace.clone();
                    break;
                case 'F':
                    faces[5] = cube.children[i].clone();
                    faces[5].material = this.MatBlackFace.clone();
                    break;
            }
        }
        for (let i = 0; i < 6; i++) {
            if (faces[i] !== undefined) {
                (faces[i] as THREE.Mesh).receiveShadow = true;
            }
        }

        let faceTextures = [];
        faceTextures = [this.FaceTextures, this.FaceTextures,
        this.FaceTextures, this.FaceTextures,
        this.FaceTextures, this.FaceTextures];

        const cubeController = new FillColorCubeController(position);
        cubeController.AddFaces(faces, faceTextures);
        return cubeController;
    }

    public async generateFaceMeshes(): Promise<void> {
        Debug.Log('Generate face meshes done.');
    }

    public async generateMaterials(): Promise<void> {
        this.MatBlackFace = new THREE.MeshPhongMaterial({
            map: this.FaceTextures.GetBlack(),
            side: THREE.DoubleSide,
        });
        this.disposeOperations.push(() => {
            this.MatBlackFace.dispose();
        });
    }

    public async loadAllModelsAndTextures(): Promise<void> {
        await Promise.all([
            this.loadAllModels(),
            this.loadAllTextures(),
        ]);
    }

    private async loadAllTextures() {
        [this.TexBump,
        this.FaceTextures.TexYellow,
        this.FaceTextures.TexWhite,
        this.FaceTextures.TexRed,
        this.FaceTextures.TexOrange,
        this.FaceTextures.TexBlue,
        this.FaceTextures.TexGreen,
        this.FaceTextures.TexBlack] = await Promise.all([
            loadTexture('assets/MagicCube/Texture/normalGroup_tmp.png'),
            loadTexture('assets/MagicCube/CubeModels/DDCube/tp_yellow.png'),
            loadTexture('assets/MagicCube/CubeModels/DDCube/tp_white.png'),
            loadTexture('assets/MagicCube/CubeModels/DDCube/tp_red.png'),
            loadTexture('assets/MagicCube/CubeModels/DDCube/tp_orange.png'),
            loadTexture('assets/MagicCube/CubeModels/DDCube/tp_blue.png'),
            loadTexture('assets/MagicCube/CubeModels/DDCube/tp_green.png'),
            loadTexture('assets/MagicCube/CubeModels/DDCube/tp_black.png'),
        ]);
        this.disposeOperations.push(() => {
            this.FaceTextures.dispose();
        });
    }

    private async loadAllModels() {
        [this.BeamGeo, this.AxisArrow,
        this.OriginWholeCube,
        ] = await Promise.all([
            this.loadBeamModel(),
            this.loadAxisArrow(),
            this.loadBaseCube(),
        ]);
        this.disposeOperations.push(() => {
            this.BeamGeo.dispose();
            this.AxisArrow.dispose();
        });
    }

    private loadBaseCube(): Promise<THREE.Group> {
        return new Promise<THREE.Group>((resolve, reject) => {
            fbxLoader.load('assets/MagicCube/CubeModels/DDCube/Cube.FBX', (object: THREE.Group) => {

                const childrenCount = object.children.length;
                const children = new Array<THREE.Object3D>();
                for (let i = 0; i < childrenCount; i++) {
                    if (object.children[i] instanceof THREE.Mesh) {
                        children.push(object.children[i].clone());
                    }
                }

                children.forEach((value: THREE.Object3D, index: number) => {
                    (value as THREE.Mesh).geometry.scale(1 / 18, 1 / 18, 1 / 18);
                    if (value.name !== '0') {
                        const str = value.name.split('_', 2);
                        value.position.set(0, 0, 0)
                        value.name = str[1];
                        this.addFaceByName(str[0], value as THREE.Mesh);
                    } else {
                        this.CenterBall = (value as THREE.Mesh).clone();
                    }
                });

                Debug.Log('Load Base Cube', this.cubeMap);
                resolve(object);
            })
        });
    }

    private addFaceByName(typeStr: string, face: THREE.Mesh) {
        let cubeType: CubeType;
        switch (typeStr) {
            case 'DLB':
                cubeType = CubeType.DLB;
                break;
            case 'DRB':
                cubeType = CubeType.DRB;
                break;
            case 'DRF':
                cubeType = CubeType.DRF;
                break;
            case 'DLF':
                cubeType = CubeType.DLF;
                break;
            case 'ULB':
                cubeType = CubeType.ULB;
                break;
            case 'URB':
                cubeType = CubeType.URB;
                break;
            case 'URF':
                cubeType = CubeType.URF;
                break;
            case 'ULF':
                cubeType = CubeType.ULF;
                break;
            case 'DB':
                cubeType = CubeType.DB;
                break;
            case 'DR':
                cubeType = CubeType.DR;
                break;
            case 'DF':
                cubeType = CubeType.DF;
                break;
            case 'DL':
                cubeType = CubeType.DL;
                break;
            case 'UB':
                cubeType = CubeType.UB;
                break;
            case 'UR':
                cubeType = CubeType.UR;
                break;
            case 'UF':
                cubeType = CubeType.UF;
                break;
            case 'UL':
                cubeType = CubeType.UL;
                break;
            case 'LB':
                cubeType = CubeType.LB;
                break;
            case 'RB':
                cubeType = CubeType.RB;
                break;
            case 'RF':
                cubeType = CubeType.RF;
                break;
            case 'LF':
                cubeType = CubeType.LF;
                break;
            case 'D':
                cubeType = CubeType.D;
                break;
            case 'U':
                cubeType = CubeType.U;
                break;
            case 'L':
                cubeType = CubeType.L;
                break;
            case 'R':
                cubeType = CubeType.R;
                break;
            case 'F':
                cubeType = CubeType.F;
                break;
            case 'B':
                cubeType = CubeType.B;
                break;
        }
        if (!this.cubeMap.has(cubeType)) {
            Debug.Log('Cube Type Error', cubeType, typeStr);
        }
        this.cubeMap.get(cubeType).add(face);
    }

    private loadBeamModel(): Promise<THREE.BufferGeometry | THREE.Geometry> {
        return new Promise<THREE.BufferGeometry | THREE.Geometry>((resolve, reject) => {
            fbxLoader.load('assets/MagicCube/Effects/ETFX_AuraVertical.FBX', (object: THREE.Group) => {
                const geo = (object.children[0] as THREE.Mesh).geometry;
                geo.scale(1, 1, 18);
                Debug.Log('Load Beam Model');
                resolve(geo);
            });
        });
    }

    private loadAxisArrow(): Promise<THREE.BufferGeometry | THREE.Geometry> {
        return new Promise<THREE.BufferGeometry | THREE.Geometry>((resolve, reject) => {
            fbxLoader.load('assets/MagicCube/Effects/AxisArrow.FBX', (object: THREE.Group) => {
                let axisArrow: THREE.BufferGeometry | THREE.Geometry;
                for (let i = 0; i < object.children.length; i++) {
                    if (object.children[i] instanceof THREE.Mesh) {
                        axisArrow = (object.children[i] as THREE.Mesh).geometry;
                        axisArrow.scale(1 / 20.0, 1 / 20.0, 1 / 20.0);
                        break;
                    }
                }
                Debug.Log('Load Axis Arrow');
                resolve(axisArrow);
            });
        });
    }


}

export class GDTZAssets extends Assets {
    public AxisArrow: THREE.BufferGeometry | THREE.Geometry;
    public BeamGeo: THREE.BufferGeometry | THREE.Geometry;
    public OriginWholeCube: THREE.Group;

    public TexBump: THREE.Texture;
    public FaceTextures: FaceTexturesPackage;
    // public WhiteCenterTextures: FaceTexturesPackage;

    // public MatBlackFace: THREE.MeshPhongMaterial;
    public MatBlackFace: THREE.MeshStandardMaterial;
    public MatColorFace: THREE.MeshPhongMaterial;

    private cubeMap: Map<CubeType, THREE.Group>;
    public CenterBall: THREE.Mesh;

    constructor() {
        super();
        this.FaceTextures = new FaceTexturesPackage();
        this.cubeMap = new Map<CubeType, THREE.Group>();
        for (let y = CubeType.D; y >= 0; y -= 100) {
            for (let x = CubeType.R; x >= 0; x -= 10) {
                for (let z = CubeType.B; z >= 0; z -= 1) {
                    const cubeType = y + x + z;
                    const group = new THREE.Group();
                    group.position.set(0, 0, 0);
                    this.cubeMap.set(cubeType, group);
                }
            }
        }
    }
    public async generateFaceMeshes(): Promise<void> {
        Debug.Log('Generate face meshes done.');
    }
    public GetBeamGeo(): THREE.BufferGeometry | THREE.Geometry {
        return this.BeamGeo;
    }

    public GetAxisArrowGeo(): THREE.BufferGeometry | THREE.Geometry {
        return this.AxisArrow;
    }

    public GenerateCube(position: THREE.Vector3, step: number): AnyCubeController {
        const lowLimit = -step / 2.0 + 0.5;
        const hightLimit = step / 2 - 0.5;
        const X = this.selectCubeType(position.x, lowLimit, hightLimit, CubeType.R, CubeType.L);
        const Y = this.selectCubeType(position.y, lowLimit, hightLimit, CubeType.D, CubeType.U);
        const Z = this.selectCubeType(position.z, lowLimit, hightLimit, CubeType.B, CubeType.F);
        const cubeType = X + Y + Z;
        const cube = this.cubeMap.get(cubeType);
        const faces = [undefined, undefined, undefined, undefined, undefined, undefined];
        let inFace: THREE.Object3D;
        for (let i = 0; i < cube.children.length; i++) {
            switch (cube.children[i].name) {
                case 'D':
                    faces[0] = cube.children[i].clone();
                    faces[0].material = this.MatColorFace.clone();
                    break;
                case 'U':
                    faces[1] = cube.children[i].clone();
                    faces[1].material = this.MatColorFace.clone();
                    break;
                case 'R':
                    faces[2] = cube.children[i].clone();
                    faces[2].material = this.MatColorFace.clone();
                    break;
                case 'L':
                    faces[3] = cube.children[i].clone();
                    faces[3].material = this.MatColorFace.clone();
                    break;
                case 'B':
                    faces[4] = cube.children[i].clone();
                    faces[4].material = this.MatColorFace.clone();
                    break;
                case 'F':
                    faces[5] = cube.children[i].clone();
                    faces[5].material = this.MatColorFace.clone();
                    break;
                case '0':
                    inFace = cube.children[i].clone();
                    (inFace as THREE.Mesh).material = this.MatBlackFace.clone();
                    break;
            }
        }
        for (let i = 0; i < 6; i++) {
            if (faces[i] === undefined) {
                faces[i] = inFace;
            }
            if (faces[i] !== undefined) {
                (faces[i] as THREE.Mesh).receiveShadow = true;
            }
        }
        const res = new AnyCubeController(position);
        let faceTextures = [];
        faceTextures = [this.FaceTextures, this.FaceTextures,
        this.FaceTextures, this.FaceTextures,
        this.FaceTextures, this.FaceTextures];

        res.AddFaces(faces, faceTextures);
        res.UpdateColor(Tools.GenerateInitColorFromPosition(position, step));
        return res;
    }

    private selectCubeType(value: number, l: number, h: number, sel_l: CubeType, sel_h): CubeType {
        if (value === l) return sel_l;
        else if (value === h) return sel_h;
        else return 0;
    }

    public GenerateFillColorCube(position: THREE.Vector3, step: number): FillColorCubeController {
        const lowLimit = -step / 2.0 + 0.5;
        const hightLimit = step / 2 - 0.5;
        const X = this.selectCubeType(position.x, lowLimit, hightLimit, CubeType.R, CubeType.L);
        const Y = this.selectCubeType(position.y, lowLimit, hightLimit, CubeType.D, CubeType.U);
        const Z = this.selectCubeType(position.z, lowLimit, hightLimit, CubeType.B, CubeType.F);
        const cubeType = X + Y + Z;
        const cube = this.cubeMap.get(cubeType);
        const faces = [undefined, undefined, undefined, undefined, undefined, undefined];
        let inFace: THREE.Object3D;
        for (let i = 0; i < cube.children.length; i++) {
            switch (cube.children[i].name) {
                case 'D':
                    faces[0] = cube.children[i].clone();
                    faces[0].material = this.MatBlackFace.clone();
                    break;
                case 'U':
                    faces[1] = cube.children[i].clone();
                    faces[1].material = this.MatBlackFace.clone();
                    break;
                case 'R':
                    faces[2] = cube.children[i].clone();
                    faces[2].material = this.MatBlackFace.clone();
                    break;
                case 'L':
                    faces[3] = cube.children[i].clone();
                    faces[3].material = this.MatBlackFace.clone();
                    break;
                case 'B':
                    faces[4] = cube.children[i].clone();
                    faces[4].material = this.MatBlackFace.clone();
                    break;
                case 'F':
                    faces[5] = cube.children[i].clone();
                    faces[5].material = this.MatBlackFace.clone();
                    break;
                case '0':
                    inFace = cube.children[i].clone();
                    (inFace as THREE.Mesh).material = this.MatBlackFace.clone();
                    break;
            }
        }
        for (let i = 0; i < 6; i++) {
            if (faces[i] === undefined) {
                faces[i] = inFace;
            }
            if (faces[i] !== undefined) {
                (faces[i] as THREE.Mesh).receiveShadow = true;
            }
        }

        let faceTextures = [];
        // if (cube.children.length === 2 && faces[0].name === 'D') {
        //     faceTextures = [this.WhiteCenterTextures, this.FaceTextures,
        //     this.FaceTextures, this.FaceTextures,
        //     this.FaceTextures, this.FaceTextures]
        // } else {
        faceTextures = [this.FaceTextures, this.FaceTextures,
        this.FaceTextures, this.FaceTextures,
        this.FaceTextures, this.FaceTextures];
        // }

        const cubeController = new FillColorCubeController(position);
        cubeController.AddFaces(faces, faceTextures);
        return cubeController;
    }
    public AddStaticMeshToCube(cube: THREE.Group): void {
        cube.add(this.CenterBall.clone());
    }

    public async generateMaterials(): Promise<void> {
        // this.MatBlackFace = new THREE.MeshPhongMaterial({
        //     map: this.FaceTextures.GetBlack(),
        //     side: THREE.DoubleSide,
        // });
        this.MatBlackFace = new THREE.MeshStandardMaterial({
            map: this.FaceTextures.GetBlack(),
            side: THREE.DoubleSide,
            roughness: 0.5,
            color: 0xffffff,
        });

        this.MatColorFace = new THREE.MeshPhongMaterial({
            map: this.FaceTextures.GetBlack(),
            side: THREE.DoubleSide,
            shininess: 0,
        });
        this.disposeOperations.push(() => {
            this.MatBlackFace.dispose();
        });
    }

    public async loadAllModelsAndTextures(): Promise<void> {
        await Promise.all([
            this.loadAllModels(),
            this.loadAllTextures(),
        ]);
    }

    private async loadAllTextures() {
        [this.TexBump,
        this.FaceTextures.TexYellow,
        this.FaceTextures.TexWhite,
        this.FaceTextures.TexRed,
        this.FaceTextures.TexOrange,
        this.FaceTextures.TexBlue,
        this.FaceTextures.TexGreen,
        this.FaceTextures.TexBlack] = await Promise.all([
            loadTexture('assets/MagicCube/Texture/normalGroup_tmp.png'),
            loadTexture('assets/MagicCube/CubeModels/GDTZCube/tz_yellow.png'),
            loadTexture('assets/MagicCube/CubeModels/GDTZCube/tz_white.png'),
            loadTexture('assets/MagicCube/CubeModels/GDTZCube/tz_red.png'),
            loadTexture('assets/MagicCube/CubeModels/GDTZCube/tz_orange.png'),
            loadTexture('assets/MagicCube/CubeModels/GDTZCube/tz_blue.png'),
            loadTexture('assets/MagicCube/CubeModels/GDTZCube/tz_green.png'),
            loadTexture('assets/MagicCube/CubeModels/GDTZCube/tz_black.png'),
        ]);
        this.disposeOperations.push(() => {
            this.FaceTextures.dispose();
        });
    }

    private async loadAllModels() {
        [this.BeamGeo, this.AxisArrow,
        this.OriginWholeCube,
        ] = await Promise.all([
            this.loadBeamModel(),
            this.loadAxisArrow(),
            this.loadBaseCube(),
        ]);
        this.disposeOperations.push(() => {
            this.BeamGeo.dispose();
            this.AxisArrow.dispose();
        });
    }

    private loadBaseCube(): Promise<THREE.Group> {
        return new Promise<THREE.Group>((resolve, reject) => {
            fbxLoader.load('assets/MagicCube/CubeModels/GDTZCube/GDTZCube.FBX', (object: THREE.Group) => {

                const childrenCount = object.children.length;
                const children = new Array<THREE.Object3D>();
                for (let i = 0; i < childrenCount; i++) {
                    if (object.children[i] instanceof THREE.Mesh) {
                        children.push(object.children[i].clone());
                    }
                }

                children.forEach((value: THREE.Object3D, index: number) => {
                    (value as THREE.Mesh).geometry.scale(1 / 18, 1 / 18, 1 / 18);
                    if (value.name !== '0') {
                        const str = value.name.split('_', 2);
                        value.position.set(0, 0, 0)
                        value.name = str[1];
                        this.addFaceByName(str[0], value as THREE.Mesh);
                        switch (value.name) {
                            case 'R':
                                (value as THREE.Mesh).geometry.translate(-0.01, 0, 0);
                                break;
                            case 'L':
                                (value as THREE.Mesh).geometry.translate(0.01, 0, 0);
                                break;
                            case 'D':
                                (value as THREE.Mesh).geometry.translate(0, -0.01, 0);
                                break;
                            case 'U':
                                (value as THREE.Mesh).geometry.translate(0, 0.01, 0);
                                break;
                            case 'F':
                                (value as THREE.Mesh).geometry.translate(0, 0, 0.01);
                                break;
                            case 'B':
                                (value as THREE.Mesh).geometry.translate(0, 0, -0.01);
                                break;
                        }
                    } else {
                        this.CenterBall = (value as THREE.Mesh).clone();
                    }
                });

                Debug.Log('Load Base Cube', this.cubeMap);
                resolve(object);
            })
        });
    }

    private addFaceByName(typeStr: string, face: THREE.Mesh) {
        let cubeType: CubeType;
        switch (typeStr) {
            case 'DLB':
                cubeType = CubeType.DLB;
                break;
            case 'DRB':
                cubeType = CubeType.DRB;
                break;
            case 'DRF':
                cubeType = CubeType.DRF;
                break;
            case 'DLF':
                cubeType = CubeType.DLF;
                break;
            case 'ULB':
                cubeType = CubeType.ULB;
                break;
            case 'URB':
                cubeType = CubeType.URB;
                break;
            case 'URF':
                cubeType = CubeType.URF;
                break;
            case 'ULF':
                cubeType = CubeType.ULF;
                break;
            case 'DB':
                cubeType = CubeType.DB;
                break;
            case 'DR':
                cubeType = CubeType.DR;
                break;
            case 'DF':
                cubeType = CubeType.DF;
                break;
            case 'DL':
                cubeType = CubeType.DL;
                break;
            case 'UB':
                cubeType = CubeType.UB;
                break;
            case 'UR':
                cubeType = CubeType.UR;
                break;
            case 'UF':
                cubeType = CubeType.UF;
                break;
            case 'UL':
                cubeType = CubeType.UL;
                break;
            case 'LB':
                cubeType = CubeType.LB;
                break;
            case 'RB':
                cubeType = CubeType.RB;
                break;
            case 'RF':
                cubeType = CubeType.RF;
                break;
            case 'LF':
                cubeType = CubeType.LF;
                break;
            case 'D':
                cubeType = CubeType.D;
                break;
            case 'U':
                cubeType = CubeType.U;
                break;
            case 'L':
                cubeType = CubeType.L;
                break;
            case 'R':
                cubeType = CubeType.R;
                break;
            case 'F':
                cubeType = CubeType.F;
                break;
            case 'B':
                cubeType = CubeType.B;
                break;
        }
        if (!this.cubeMap.has(cubeType)) {
            Debug.Log('Cube Type Error', cubeType, typeStr);
        }
        this.cubeMap.get(cubeType).add(face);
    }

    private loadBeamModel(): Promise<THREE.BufferGeometry | THREE.Geometry> {
        return new Promise<THREE.BufferGeometry | THREE.Geometry>((resolve, reject) => {
            fbxLoader.load('assets/MagicCube/Effects/ETFX_AuraVertical.FBX', (object: THREE.Group) => {
                const geo = (object.children[0] as THREE.Mesh).geometry;
                geo.scale(1, 1, 18);
                Debug.Log('Load Beam Model');
                resolve(geo);
            });
        });
    }

    private loadAxisArrow(): Promise<THREE.BufferGeometry | THREE.Geometry> {
        return new Promise<THREE.BufferGeometry | THREE.Geometry>((resolve, reject) => {
            fbxLoader.load('assets/MagicCube/Effects/AxisArrow.FBX', (object: THREE.Group) => {
                let axisArrow: THREE.BufferGeometry | THREE.Geometry;
                for (let i = 0; i < object.children.length; i++) {
                    if (object.children[i] instanceof THREE.Mesh) {
                        axisArrow = (object.children[i] as THREE.Mesh).geometry;
                        axisArrow.scale(1 / 20.0, 1 / 20.0, 1 / 20.0);
                        break;
                    }
                }
                Debug.Log('Load Axis Arrow');
                resolve(axisArrow);
            });
        });
    }
}

