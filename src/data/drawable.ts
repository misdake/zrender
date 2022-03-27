import { ShapeParam, Vec3 } from './shape_types';

export class Drawable {
    public readonly name: string;
    public readonly position: Vec3 = new Vec3(1, 1, 1);

    public readonly param: ShapeParam;

    
}
