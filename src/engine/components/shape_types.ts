interface Vec3I {
    x: number,
    y: number,
    z: number,
}

export type AnchorParam = { addTo?: undefined, shape: 'anchor' }

export type ShapeCommonParam = { addTo?: undefined, color: string, stroke: number | false }

export type RectParam = ShapeCommonParam & { shape: 'rect', width: number, height: number, fill: boolean }

export type RoundRectParam = ShapeCommonParam & { shape: 'round-rect', width: number, height: number, cornerRadius: number, fill: boolean }

export type EllipseParam = ShapeCommonParam & { shape: 'ellipse', diameter: number, quarters?: 1 | 2 | 3 | 4 }

export type PolygonParam = ShapeCommonParam & { shape: 'polygon', radius: number, sides: number }

export type SphereParam = ShapeCommonParam & { shape: 'sphere' };

export type PolylineParam = ShapeCommonParam & { shape: 'polyline', path: Vec3I[], closed: boolean }

export type Hemisphere = ShapeCommonParam & { shape: 'hemisphere', diameter: number, backface?: string };

export type Cone = ShapeCommonParam & { shape: 'cone', diameter: number, length: number, backface?: string };

//type PathParam TODO

//TODO more types

export type ShapeParam = AnchorParam |
    RectParam | RoundRectParam | EllipseParam | PolygonParam | SphereParam | PolylineParam |
    Hemisphere | Cone;
