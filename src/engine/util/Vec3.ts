import { AnimateFieldData, AnimateFieldDataType } from '../components/Animation';

export class Vec1 implements AnimateFieldData {
    private _x: number;

    private dirty: boolean;
    public isDirty(): boolean {
        return this.dirty;
    }
    public clearDirty(): boolean {
        let dirty = this.dirty;
        this.dirty = false;
        return dirty;
    }

    constructor(x: number = 0) {
        this._x = x;
    }

    set(x: number) {
        this._x = x;
        this.dirty = true;
    }

    get x(): number {
        return this._x;
    }
    set x(value: number) {
        this._x = value;
        this.dirty = true;
    }


    get_type(): AnimateFieldDataType {
        return AnimateFieldDataType.Vec1;
    }
    set_self(v: AnimateFieldData): void {
        this.set((v as Vec1)._x);
    }
    add_self(b: AnimateFieldData): AnimateFieldData {
        let b1 = b as Vec1;
        return new Vec1(this._x + b1._x);
    }
    mul_scalar(s: number): AnimateFieldData {
        return new Vec1(this._x  * s);
    }
    clone(): AnimateFieldData {
        return new Vec1(this._x);
    }
}

export class Vec3 implements AnimateFieldData {
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

    get_type(): AnimateFieldDataType {
        return AnimateFieldDataType.Vec3;
    }
    set_self(v: AnimateFieldData): void {
        this.setVec3(v as Vec3);
    }
    add(other: Vec3): Vec3 {
        return new Vec3(this._x + other._x, this._y + other._y, this._z + other._z);
    }
    add_self(other: AnimateFieldData): AnimateFieldData {
        return this.add(other as Vec3);
    }
    mul_scalar(n: number): Vec3 {
        return new Vec3(this._x * n, this._y * n, this._z * n);
    }
    clone(): AnimateFieldData {
        return new Vec3(this._x, this._y, this._z);
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
