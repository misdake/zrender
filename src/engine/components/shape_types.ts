interface Vec3I {
    x: number,
    y: number,
    z: number,
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
}

export type AnchorParam = { addTo?: undefined, shape: 'anchor' }

export type ShapeCommonParam = { addTo?: undefined, color: string, stroke: number }

export type RectParam = ShapeCommonParam & { shape: 'rect', width: number, height: number, fill: boolean }

export type RoundRectParam = ShapeCommonParam & { shape: 'round-rect', width: number, height: number, cornerRadius: number, fill: boolean }

export type EllipseParam = ShapeCommonParam & { shape: 'ellipse', diameter: number, quarters?: 1 | 2 | 3 | 4 }

export type PolygonParam = ShapeCommonParam & { shape: 'polygon', radius: number, sides: number }

export type SphereParam = ShapeCommonParam & { shape: 'sphere' };

export type PolylineParam = ShapeCommonParam & { shape: 'polyline', path: Vec3I[], closed: boolean }

//type PathParam TODO

//TODO more types

export type ShapeParam = AnchorParam | RectParam | RoundRectParam | EllipseParam | PolygonParam | SphereParam | PolylineParam;
