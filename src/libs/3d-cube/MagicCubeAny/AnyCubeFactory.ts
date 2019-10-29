import { Assets } from '../Assets';
import {AnyCubeController} from './AnyCubeController';
import {FillColorCubeController} from './FillColorScene/FillColorCubeController';
import THREE from '../three';

export interface AnyCubeFactory {
    GenerateCube(position: THREE.Vector3, step: number): AnyCubeController;

    GenerateFillColorCube(position: THREE.Vector3, step: number): FillColorCubeController;

    AddStaticMeshToCube(cube: THREE.Group): void;
}
