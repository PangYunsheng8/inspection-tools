import { FaceSide } from '../FillColorScene/FaceSide';
import * as THREE from 'three';

export class DecodeResult {
    public position: THREE.Vector3;
    public side: FaceSide;
}

export class AnyFaceDecoder {
    private static Side = [FaceSide.UP, FaceSide.RIGHT, FaceSide.FRONT, FaceSide.LEFT, FaceSide.BACK, FaceSide.DOWN]
    public static Decode(step: number, sideIndex: number, faceIndex: number): DecodeResult {
        const res = new DecodeResult();
        res.side = AnyFaceDecoder.Side[sideIndex];
        res.position = new THREE.Vector3();
        const start = -step / 2.0 + 0.5;
        const end = step / 2 - 0.5;
        switch (res.side) {
            case FaceSide.UP:
                res.position.setY(end);
                AnyFaceDecoder.DecodeInUpFace(step, start, end, faceIndex, res);
                break;
            case FaceSide.DOWN:
                res.position.setY(start);
                AnyFaceDecoder.DecodeInDownFace(step, start, end, faceIndex, res);
                break;
            case FaceSide.LEFT:
                res.position.setX(end);
                AnyFaceDecoder.DecodeInLeftFace(step, start, end, faceIndex, res);
                break;
            case FaceSide.RIGHT:
                res.position.setX(start);
                AnyFaceDecoder.DecodeInRightFace(step, start, end, faceIndex, res);
                break;
            case FaceSide.FRONT:
                res.position.setZ(end);
                AnyFaceDecoder.DecodeInFrontFace(step, start, end, faceIndex, res);
                break;
            case FaceSide.BACK:
                res.position.setZ(start);
                AnyFaceDecoder.DecodeInBackFace(step, start, end, faceIndex, res);
                break;
        }
        return res;
    }

    private static DecodeInUpFace(step: number, start: number, end: number, faceIndex: number, res: DecodeResult) {
        const offsetInX = faceIndex % step;
        const offsetInZ = Math.floor(faceIndex / step);
        const x = start + offsetInX;
        const z = start + offsetInZ;
        res.position.setX(x);
        res.position.setZ(z);
    }

    private static DecodeInDownFace(step: number, start: number, end: number, faceIndex: number, res: DecodeResult) {
        const offsetInX = faceIndex % step;
        const offsetInZ = Math.floor(faceIndex / step);
        const x = start + offsetInX;
        const z = end - offsetInZ;
        res.position.setX(x);
        res.position.setZ(z);
    }

    private static DecodeInLeftFace(step: number, start: number, end: number, faceIndex: number, res: DecodeResult) {
        const offsetInZ = faceIndex % step;
        const offsetInY = Math.floor(faceIndex / step);
        const z = end - offsetInZ;
        const y = end - offsetInY;
        res.position.setZ(z);
        res.position.setY(y);
    }

    private static DecodeInFrontFace(step: number, start: number, end: number, faceIndex: number, res: DecodeResult) {
        const offsetInX = faceIndex % step;
        const offsetInY = Math.floor(faceIndex / step);
        const x = start + offsetInX;
        const y = end - offsetInY;
        res.position.setX(x);
        res.position.setY(y);
    }

    private static DecodeInRightFace(step: number, start: number, end: number, faceIndex: number, res: DecodeResult) {
        const offsetInZ = faceIndex % step;
        const offsetInY = Math.floor(faceIndex / step);
        const z = start + offsetInZ;
        const y = end - offsetInY;
        res.position.setZ(z);
        res.position.setY(y);
    }

    private static DecodeInBackFace(step: number, start: number, end: number, faceIndex: number, res: DecodeResult) {
        const offsetInX = faceIndex % step;
        const offsetInY = Math.floor(faceIndex / step);
        const x = end - offsetInX;
        const y = end - offsetInY;
        res.position.setX(x);
        res.position.setY(y);
    }
}
