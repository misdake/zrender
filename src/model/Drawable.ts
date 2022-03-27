import { ShapeParam, Vec3 } from '../data/shape_types';
import * as Zdog from 'zdog';

export class Drawable {
    public readonly param: ShapeParam;
    public readonly zdog: Zdog.Anchor;

    constructor(param: ShapeParam) {
        this.param = param;
        this.zdog = createZdogObj(param);
    }

    update(position: Vec3, rotation: Vec3, scale: Vec3) {
        this.zdog.translate.set(position);
        this.zdog.rotate.set(rotation);
        this.zdog.scale.set(scale);
    }
}

const zdogObjConstructors: { [key: string]: ((param: ShapeParam) => Zdog.Anchor) } = {
    'anchor': param => new Zdog.Anchor(param),
    'rect': param => new Zdog.Rect(param),
    'round-rect': param => new Zdog.RoundedRect(param),
    'ellipse': param => new Zdog.Ellipse(param),
    'polygon': param => new Zdog.Polygon(param),
    'sphere': param => new Zdog.Polygon(param),
    'polyline': param => new Zdog.Shape(param),
};

function createZdogObj(param: ShapeParam): Zdog.Anchor {
    let c = zdogObjConstructors[param.shape];
    if (c) {
        return c(param);
    } else {
        console.log('cannot construct shape');
        debugger;
        return null;
    }
}
