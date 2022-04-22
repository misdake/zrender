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

    public set(x: number, y: number, z: number) {
        this._x = x;
        this._y = y;
        this._z = z;
        this.dirty = true;
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
}
