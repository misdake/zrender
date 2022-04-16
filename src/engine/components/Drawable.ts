import { ShapeParam, Vec3 } from './shape_types';
import * as Zdog from 'zdog';
import { SceneNode } from '../scene/SceneNode';

export type DrawableAsset = ShapeParam

export interface DrawableParam {
    asset: DrawableAsset;
}

export class Drawable {
    public readonly asset: DrawableAsset;
    public readonly zdog: Zdog.Anchor;

    constructor(node: SceneNode, param: DrawableParam) {
        this.asset = param.asset;
        this.zdog = createZdogObj(param.asset);
    }

    update(position: Vec3, rotation: Vec3, scale: Vec3) {
        this.zdog.translate.set(position);
        this.zdog.rotate.set(rotation);
        this.zdog.scale.set(scale);
    }
}

const zdogObjConstructors: { [key: string]: ((asset: DrawableAsset) => Zdog.Anchor) } = {
    'anchor': asset => new Zdog.Anchor(asset),
    'rect': asset => new Zdog.Rect(asset),
    'round-rect': asset => new Zdog.RoundedRect(asset),
    'ellipse': asset => new Zdog.Ellipse(asset),
    'polygon': asset => new Zdog.Polygon(asset),
    'sphere': asset => new Zdog.Polygon(asset),
    'polyline': asset => new Zdog.Shape(asset),
};

function createZdogObj(asset: DrawableAsset): Zdog.Anchor {
    let c = zdogObjConstructors[asset.shape];
    if (c) {
        return c(asset);
    } else {
        console.log('cannot construct shape');
        debugger;
        return null;
    }
}
