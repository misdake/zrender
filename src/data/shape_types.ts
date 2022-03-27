interface Vec3I {
    x: number,
    y: number,
    z: number,
}

export class Vec3 {
    public x: number;
    public y: number;
    public z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

export type ShapeCommonParam = { color: string, position: Vec3I, rotate: Vec3I, scale: Vec3I, stroke: number }

export type RectParam = ShapeCommonParam & { shape: 'rect', width: number, height: number }

export type RoundRectParam = RectParam & { shape: 'round-rect', cornerRadius: number }

export type EllipseParam = ShapeCommonParam & { shape: 'ellipse', diameter: number, quarters: 1 | 2 | 3 | 4 }

export type PolygonParam = ShapeCommonParam & { shape: 'polygon', radius: number, sides: number }

export type SphereParam = ShapeCommonParam & { shape: 'sphere' };

export type PolylineParam = ShapeCommonParam & { shape: 'polyline', path: Vec3I[], closed: boolean }

//type PathParam TODO

export type ShapeParam = RectParam | RoundRectParam | EllipseParam | PolygonParam | SphereParam | PolylineParam;
