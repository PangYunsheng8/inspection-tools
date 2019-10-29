import 'zlibjs';
import * as THREE from 'three';
import 'imports-loader?THREE=three!three/examples/js/utils/SceneUtils.js';
import 'imports-loader?THREE=three!three/examples/js/loaders/LoaderSupport.js';
import 'imports-loader?THREE=three!three/examples/js/loaders/FBXLoader.js';
import 'imports-loader?THREE=three!three/examples/js/loaders/OBJLoader.js';
import 'imports-loader?THREE=three!three/examples/js/postprocessing/EffectComposer.js';
import 'imports-loader?THREE=three!three/examples/js/postprocessing/RenderPass.js';
import 'imports-loader?THREE=three!three/examples/js/postprocessing/UnrealBloomPass.js';
import 'imports-loader?THREE=three!three/examples/js/postprocessing/OutlinePass.js';
import 'imports-loader?THREE=three!three/examples/js/postprocessing/ShaderPass.js';
import 'imports-loader?THREE=three!three/examples/js/shaders/CopyShader.js';
import 'imports-loader?THREE=three!three/examples/js/shaders/FXAAShader.js';
import 'imports-loader?THREE=three!three/examples/js/shaders/LuminosityHighPassShader.js';

import { Zlib } from 'zlibjs/bin/zlib.min.js';
(window as any).Zlib = Zlib;

export default THREE;
