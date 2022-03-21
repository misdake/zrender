type Vec3 = { x: number, y: number, z: number };

type ShapeCommon = { color: string, position: Vec3, rotate: Vec3, scale: Vec3 };

type RectParam = ShapeCommon & { shape: "rect", width: number, height: number, stroke: number };

function newRect(param: RectParam) {

}
