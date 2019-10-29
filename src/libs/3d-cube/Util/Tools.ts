import * as THREE from 'three';

export class Tools {

    public static MakeColor(r: number, g: number, b: number): THREE.Color {
        return new THREE.Color(r, g, b);
    }

    public static MakeVector4(x: number, y: number, z: number, w: number): THREE.Vector4 {
        return new THREE.Vector4(x, y, z, w);
    }

    public static MakeVector3(x: number, y: number, z: number): THREE.Vector3 {
        return new THREE.Vector3(x, y, z);
    }

    public static MakeQuaternion(degree: number, axis: THREE.Vector3): THREE.Quaternion {
        axis.normalize();
        const radian = degree * THREE.Math.DEG2RAD;
        const halfRad = radian / 2.0;
        const cos = Math.cos(halfRad);
        const sin = Math.sin(halfRad);
        return new THREE.Quaternion(sin * axis.x, sin * axis.y, sin * axis.z, cos);
    }

    public static PositionToKey(position: THREE.Vector3): string {
        let x = Math.fround(position.x);
        let y = Math.fround(position.y);
        let z = Math.fround(position.z);

        if (Math.abs(x) < 0.01) x = 0;
        if (Math.abs(y) < 0.01) y = 0;
        if (Math.abs(z) < 0.01) z = 0;
        position.set(x, y, z);
        return `[${Math.fround(position.x)},${Math.fround(position.y)},${Math.fround(position.z)}]`;
    }

    public static GenerateInitColorFromPosition(position: THREE.Vector3, step: number): string {
        const res = new Array<string>();
        for (let i = 0; i < 6; i++) {
            res.push('h');
        }
        const start = -step / 2.0 + 0.5;
        const end = step / 2.0 - 0.5;

        if (position.y === start) res[0] = 'w';
        else if (position.y === end) res[1] = 'y';

        if (position.x === start) res[2] = 'o';
        else if (position.x === end) res[3] = 'r';

        if (position.z === start) res[4] = 'g';
        else if (position.z === end) res[5] = 'b';
        return res.join('');
    }
}
