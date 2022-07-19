export enum Vec3Mask {
    None = 0,
    X = 1,
    Y = 2,
    Z = 4,
    XY = 3,
    XZ = 5,
    YZ = 6,
    XYZ = 7,
}

export class Vec3 {
    private _x: number;
    private _y: number;
    private _z: number;

    private dirty: boolean;
    public isDirty(): boolean {
        return this.dirty;
    }
    public clearDirty(): boolean {
        let dirty = this.dirty;
        this.dirty = false;
        return dirty;
    }

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.set(x, y, z);
    }

    set(x: number, y: number, z: number) {
        this._x = x;
        this._y = y;
        this._z = z;
        this.dirty = true;
    }
    setVec3(other: Vec3) {
        this.set(other._x, other._y, other._z);
    }

    setWithMask(x: number, y: number, z: number, mask: Vec3Mask) {
        if (mask > 0) this.dirty = true;
        if (mask === Vec3Mask.XYZ) {
            this._x = x;
            this._y = y;
            this._z = z;
        } else {
            if ((mask & Vec3Mask.X) > 0) this._x = x;
            if ((mask & Vec3Mask.Y) > 0) this._y = y;
            if ((mask & Vec3Mask.Z) > 0) this._z = z;
        }
    }
    setVec3WithMask(other: Vec3, mask: Vec3Mask) {
        this.setWithMask(other._x, other._y, other._z, mask);
    }

    get z(): number {
        return this._z;
    }
    set z(value: number) {
        this._z = value;
        this.dirty = true;
    }
    get y(): number {
        return this._y;
    }
    set y(value: number) {
        this._y = value;
        this.dirty = true;
    }
    get x(): number {
        return this._x;
    }
    set x(value: number) {
        this._x = value;
        this.dirty = true;
    }

    lengthSqr() {
        return this._x * this._x + this._y + this._y + this._z * this._z;
    }
    length() {
        return Math.hypot(this._x, this._y, this._z);
    }

    normalizeSelf() {
        this.setLength(1);
    }
    setLength(targetLen: number) {
        let len = this.length();
        if (len > 0) {
            let scale = targetLen / len;
            this.set(this._x * scale, this._y * scale, this._z * scale);
        } else {
            this.set(0, 0, 0);
        }
    }

    add(other: Vec3): Vec3 {
        return new Vec3(this._x + other._x, this._y + other._y, this._z + other._z);
    }
    multiplyScalar(n: number): Vec3 {
        return new Vec3(this._x * n, this._y * n, this._z * n);
    }

    rotateZSet(z: number) {
        let sin = Math.sin(z);
        let cos = Math.cos(z);
        this.set(
            this._x * cos + this._y * sin,
            -this._x * sin + this._y * cos,
            this.z,
        );
    }
    rotateZ(z: number): Vec3 {
        let sin = Math.sin(z);
        let cos = Math.cos(z);
        return new Vec3(
            this._x * cos + this._y * sin,
            -this._x * sin + this._y * cos,
            this.z,
        );
    }
}
