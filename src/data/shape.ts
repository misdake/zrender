interface Vec3 {
    x: number,
    y: number,
    z: number,
}

type ShapeCommonParam = { color: string, position: Vec3, rotate: Vec3, scale: Vec3, stroke: number }

type RectParam = ShapeCommonParam & { shape: 'rect', width: number, height: number }

type RoundRectParam = RectParam & { shape: 'round-rect', cornerRadius: number }

type EllipseParam = ShapeCommonParam & { shape: 'ellipse', diameter: number, quarters: 1 | 2 | 3 | 4 }

type PolygonParam = ShapeCommonParam & { shape: 'polygon', radius: number, sides: number }

type SphereParam = ShapeCommonParam & { shape: 'sphere' };

//type PathParam TODO

type PolylineParam = ShapeCommonParam & { shape: 'polyline', path: Vec3[], closed: boolean }
