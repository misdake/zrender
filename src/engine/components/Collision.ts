// {shape1} and {shape2} collide at {point}
interface CollisionResult {
    point: Point2d;
    shape1: Shape2d;
    shape2: Shape2d;
}

// {shape1} is inside {shape2}
interface InsideResult {
    shape1: Shape2d;
    shape2: Shape2d;
}

type Shape2dType = 'point' | 'linesegment' | 'polygon' | 'circle';

// expected operations:
// +-------------+----------+-------------+-------------+-------------+
// | type        | point    | linesegment | polygon     | circle      |
// +-------------+----------+-------------+-------------+-------------+
// | point       |          | on          | on/in       | on/in       |
// +-------------+----------+-------------+-------------+-------------+
// | linesegment |          | test        | test/in/out | test/in/out |
// +-------------+----------+-------------+-------------+-------------+
// | polygon     |          |             | test/in/out | test/in/out |
// +-------------+----------+-------------+-------------+-------------+
// | circle      |          |             |             | test/in/out |
// +-------------+----------+-------------+-------------+-------------+

// implemented:
// +-------------+----------+-------------+-------------+-------------+
// | type        | point    | linesegment | polygon     | circle      |
// +-------------+----------+-------------+-------------+-------------+
// | point       |          |             | in          | in          |
// +-------------+----------+-------------+-------------+-------------+
// | linesegment |          | test        | in/test     |             |
// +-------------+----------+-------------+-------------+-------------+
// | polygon     |          |             |             |             |
// +-------------+----------+-------------+-------------+-------------+
// | circle      |          |             |             |             |
// +-------------+----------+-------------+-------------+-------------+

export class Shape2d {
    readonly type: Shape2dType;
    data: any;

    setData<T extends Shape2d>(data: any): T {
        this.data = data;
        return this as any as T;
    }
}

type InsideFunction = (shape1: Shape2d, shape2: Shape2d) => boolean;
type TestFunction = (shape1: Shape2d, shape2: Shape2d) => CollisionResult[];

const insideFunctions: { [key: string]: { [key: string]: { flip?: boolean, func: InsideFunction } } } = {
    //TODO more
    'point': {
        'polygon': {func: point_polygon_inside},
        'circle': {func: point_circle_inside},
    },
    'linesegment': {
        'polygon': {func: linesegment_polygon_inside},
    },
    'polygon': {
        'point': {func: point_polygon_inside, flip: true},
        'linesegment': {func: linesegment_polygon_inside, flip: true},
    },
};

const testFunctions: { [key: string]: { [key: string]: { flip?: boolean, func: TestFunction } } } = {
    //TODO more
    'linesegment': {
        'linesegment': {func: linesegment_linesegment_test},
        'polygon': {func: linesegment_polygon_test},
    },
    'polygon': {
        'linesegment': {func: linesegment_polygon_test, flip: true},
    },
};

export class Collision2d {
    static inside(shape: Shape2d, ...targets: Shape2d[]): InsideResult[] {
        let result: InsideResult[] = [];

        let functions = insideFunctions[shape.type];
        if (!functions) {
            console.error('unsupported type:', shape.type);
            return [];
        }

        for (let target of targets) {
            let pack = functions[target.type];
            if (!pack) {
                console.error('unsupported type:', shape.type, target.type);
                return [];
            }

            let r: boolean = pack.flip ? pack.func(target, shape) : pack.func(shape, target);
            if (r) {
                if (pack.flip) {
                    result.push({shape1: target, shape2: shape});
                } else {
                    result.push({shape1: shape, shape2: target});
                }
            }
        }

        return result;
    }
    static test(shape: Shape2d, ...targets: Shape2d[]): CollisionResult[] {
        let result: CollisionResult[] = [];

        let functions = testFunctions[shape.type];
        if (!functions) {
            console.error('unsupported type:', shape.type);
            return [];
        }

        for (let target of targets) {
            let pack = functions[target.type];
            if (!pack) {
                console.error('unsupported type:', shape.type, target.type);
                return [];
            }

            let r = pack.flip ? pack.func(target, shape) : pack.func(shape, target);
            if (r && r.length) {
                if (pack.flip) {
                    for (let single of r) {
                        let shape1 = single.shape1;
                        let shape2 = single.shape2;
                        single.shape2 = shape1;
                        single.shape1 = shape2;
                    }
                }
                result.push(...r);
            }
        }

        return result;
    }
}

const EPSINON = 1e-8;

function point_polygon_inside(point: Point2d, polygon: Polygon2d): boolean {
    let r: boolean = false;
    const p = point;
    let segments = polygon.segments;
    for (let segment of segments) {
        const pi = segment.point1;
        const pj = segment.point2;
        if (((pi.y > p.y) != (pj.y > p.y)) && (p.x < (pj.x - pi.x) * (p.y - pi.y) / (pj.y - pi.y) + pi.x))
            r = !r;
    }
    return r;
}

function point_circle_inside(point: Point2d, circle: Circle2d): boolean {
    let dx = point.x - circle.center.x;
    let dy = point.y - circle.center.y;
    return dx * dx + dy * dy < circle.radius * circle.radius;
}

function linesegment_polygon_inside(line: Linesegment2d, polygon: Polygon2d): boolean {
    //no intersections
    let r = linesegment_polygon_test(line, polygon);
    if (r && r.length) return false;
    //points are all inside polygon
    return point_polygon_inside(line.point1, polygon) && point_polygon_inside(line.point2, polygon);
}

function linesegment_linesegment_test(l1: Linesegment2d, l2: Linesegment2d): CollisionResult[] {
    const a = l1.point1;
    const b = l1.point2;
    const c = l2.point1;
    const d = l2.point2;

    const n2x = d.y - c.y;
    const n2y = c.x - d.x;
    const dist_c_n2 = c.x * n2x + c.y * n2y;
    const dist_a_n2 = a.x * n2x + a.y * n2y;
    const dist_b_n2 = b.x * n2x + b.y * n2y;
    if ((dist_a_n2 - dist_c_n2) * (dist_b_n2 - dist_c_n2) >= -EPSINON) return [];

    const n1x = b.y - a.y;
    const n1y = a.x - b.x;
    const dist_a_n1 = a.x * n1x + a.y * n1y;
    const dist_c_n1 = c.x * n1x + c.y * n1y;
    const dist_d_n1 = d.x * n1x + d.y * n1y;
    if ((dist_c_n1 - dist_a_n1) * (dist_d_n1 - dist_a_n1) >= -EPSINON) return [];

    const denominator = n1x * n2y - n1y * n2x;
    const fraction = (dist_a_n2 - dist_c_n2) / denominator;
    let rx = a.x + fraction * n1y;
    let ry = a.y - fraction * n1x;
    let r = new Point2d(rx, ry);
    return [{point: r, shape1: l1, shape2: l2}];
}

function linesegment_polygon_test(line: Linesegment2d, polygon: Polygon2d): CollisionResult[] {
    let results: CollisionResult[][] = polygon.segments.map(l2 => {
        let results = linesegment_linesegment_test(line, l2);
        results.map(result => result.shape2 = polygon);
        return results;
    }).filter(i => i);
    let r = results.reduce((acc, val) => acc.concat(val), []);
    return r;
}

export class Point2d extends Shape2d {
    readonly type = 'point';
    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
    }
}

export class Linesegment2d extends Shape2d {
    readonly type = 'linesegment';
    readonly point1: Point2d;
    readonly point2: Point2d;

    constructor(point1: Point2d, point2: Point2d) {
        super();
        this.point1 = point1;
        this.point2 = point2;
    }
}

export class Circle2d extends Shape2d {
    readonly type = 'circle';
    readonly center: Point2d;
    readonly radius: number;

    constructor(center: Point2d, radius: number) {
        super();
        this.center = center;
        this.radius = radius;
    }
}

export class Polygon2d extends Shape2d {
    readonly type = 'polygon';
    readonly points: readonly Point2d[];
    readonly segments: readonly Linesegment2d[];

    constructor(points: readonly Point2d[]) {
        super();
        this.points = [...points];
        let segments = [];
        for (let i = 0, j = points.length - 1; i < points.length; j = i, i++) {
            segments.push(new Linesegment2d(points[i], points[j]));
        }
        this.segments = segments;
    }
}
