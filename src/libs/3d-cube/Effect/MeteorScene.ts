import THREE from '../three';
import { Camera, AxesHelper, Vector3 } from 'three';
import SpriteMeteorController from './SpriteMeteorController';

const isMobile = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
const [E_START, E_MOVE, E_END, E_LEAVE] = isMobile
  ? ['touchstart', 'touchmove', 'touchend', 'touchleave']
  : ['mousedown', 'mousemove', 'mouseup', 'mouseleave'];

export default class MeteorScene {

  private camera: THREE.OrthographicCamera;  // 相机
  private renderer: THREE.WebGLRenderer;   // 渲染器
  private scene: THREE.Scene;
  private container: Element;
  private frameId: number;

  private backgroundPanel: THREE.Mesh;

  private clock: THREE.Clock;
  private tick: number;
  private nextEmitTime: number;

  private spriteMeteorController: SpriteMeteorController;
  public animate(): void {
    this.frameId = requestAnimationFrame(this.animate.bind(this));
    const delta = this.clock.getDelta();
    this.tick += delta;
    if (this.tick < 0) this.tick = 0;
    if (this.tick > this.nextEmitTime) {
      this.spriteMeteorController.emit(Math.round(2 * Math.random()));
      // this.spriteMeteorController.emit(1);
      // this.meteorController.emit(Math.round(3 * Math.random()));
      this.nextEmitTime = this.tick + 0.8;
    }

    // this.meteorController.update(this.tick, delta);
    this.spriteMeteorController.update(delta);
    this.renderer.render(this.scene, this.camera);
  }

  private onMouseDown = () => {
  }

  private onMouseUp = () => {
  }

  private onMouseMove = (event) => {
    // 兼容移动端事件
    event.preventDefault();
    event = isMobile ? event.touches[0] : event;
    const baseSize = isMobile ? document.body.clientWidth / 4 : document.body.clientWidth / 10; // 灵敏度
  }

  constructor(container: Element, background: THREE.Texture) {
    this.container = container;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.scene = new THREE.Scene();
    // tslint:disable-next-line:max-line-length
    this.camera = new THREE.OrthographicCamera(-background.image.width / 2, background.image.width / 2, background.image.height / 2, -background.image.height / 2, 1, 10000);
    this.camera.position.z = 10;
    this.camera.lookAt(this.scene.position);

    // this.scene.add(new THREE.AmbientLight(0xaaaaaa));
    // this.scene.background = new THREE.Color().setHSL(0.6, 0, 1);
    // this.scene.fog = new THREE.Fog(this.scene.background.getHex(), 1, 5000);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 0);
    const canvasDom = this.renderer.domElement;
    this.container.appendChild(this.renderer.domElement);

    // 兼容移动端事件
    canvasDom.addEventListener(E_START, this.onMouseDown, false);
    canvasDom.addEventListener(E_END, this.onMouseUp, false);
    canvasDom.addEventListener(E_LEAVE, this.onMouseUp, false);
    canvasDom.addEventListener(E_MOVE, this.onMouseMove, false);

    const axesHelper = new THREE.AxesHelper(10);
    this.scene.add(axesHelper);

    const geo = new THREE.PlaneBufferGeometry(background.image.width, background.image.height);
    const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: background });
    this.backgroundPanel = new THREE.Mesh(geo, mat);
    this.scene.add(this.backgroundPanel);
    this.backgroundPanel.position.set(0, 0, -1);

    const W = background.image.width;
    const H = background.image.height;
    const leftUp = new THREE.Vector3(-W / 2, H / 2, 0);
    const direction = new THREE.Vector3(-W / 2, -H / 2, 0).multiplyScalar(0.3);
    const P = leftUp.add(direction.clone().multiplyScalar(-1));
    // direction.multiplyScalar(2);
    // tslint:disable-next-line:max-line-length
    // this.meteorController = new MeteorController(this.scene, P, direction, 1000);
    this.spriteMeteorController = new SpriteMeteorController(this.scene, background.image.width, 10000, background);
    this.clock = new THREE.Clock();
    this.tick = 0;
    this.nextEmitTime = 0.8;
    this.animate();
  }

  public resize(width: number, height: number) {
    // this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose(): void {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    // TODO: 如有其它资源 还需要在此释放
    if (this.backgroundPanel) {
      (this.backgroundPanel.material as THREE.Material).dispose();
      this.backgroundPanel.geometry.dispose();
    }
    if (this.spriteMeteorController) {
      this.spriteMeteorController.dispose();
    }
  }
}

