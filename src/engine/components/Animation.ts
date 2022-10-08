import { SceneNode } from '../scene/SceneNode';

export enum AnimateField {
    Position,
    Rotation,
    Scale,
    Color,
    Opacity,
}
export enum AnimateFieldDataType {
    Vec3,
    Vec1,
}
export interface AnimateFieldData {
    mul_scalar(s: number): AnimateFieldData;
    add_self(b: AnimateFieldData): AnimateFieldData;

    get_type(): AnimateFieldDataType;
    set_self(v: AnimateFieldData): void;
    clone(): AnimateFieldData;
}

type FieldGetter = (node: SceneNode) => { src: AnimateFieldData };
const fieldGetter: { [key in AnimateField]: FieldGetter } = {
    [AnimateField.Position]: node => ({src: node.position}),
    [AnimateField.Rotation]: node => ({src: node.rotation}),
    [AnimateField.Scale]: node => ({src: node.scale}),
    [AnimateField.Color]: node => ({src: node.color}),
    [AnimateField.Opacity]: node => ({src: node.opacity}),
};

export enum AnimateType {
    set = 'set',
    add = 'add',
    lerp = 'lerp',
}

export interface AnimationAssetBase {
    name: string,
    type: AnimateType,
    field: AnimateField,
    // startTime?: number, //TODO support startTime
    duration: number,
    src?: AnimateFieldData,
}

export interface AnimationBase extends AnimationAssetBase {
    src: AnimateFieldData,
}

// Set: value = target
export interface AnimateAssetSet extends AnimationAssetBase {
    type: AnimateType.set,
    target: AnimateFieldData,
}

// Add: value = src + {speed} * t
export interface AnimateAssetAdd extends AnimationAssetBase {
    type: AnimateType.add,
    speed: AnimateFieldData,
}

// Lerp: value = src * (1 - t / {duration}) + {target} * t / {duration}
export interface AnimateAssetLerp extends AnimationAssetBase {
    type: AnimateType.lerp,
    target: AnimateFieldData,
}

export type AnimationSet = AnimateAssetSet & AnimationBase;
export type AnimationAdd = AnimateAssetAdd & AnimationBase;
export type AnimationLerp = AnimateAssetLerp & AnimationBase;

export type Animation = AnimationSet | AnimationAdd | AnimationLerp;
export type AnimationAsset = AnimateAssetSet | AnimateAssetAdd | AnimateAssetLerp;

// t is start-calibrated time: [0, duration)
type AnimateFunction = (result: AnimateFieldData, src: AnimateFieldData, t: number, animation: AnimationBase) => void;

const animateFunctions: { [key in AnimateType]: AnimateFunction } = {
    'set': (result, _src, _t, animation: AnimationSet) => {
        result.set_self(animation.target);
    },
    'add': (result, src, t, animation: AnimationAdd) => {
        result.set_self(src.add_self(animation.speed.mul_scalar(t)));
    },
    'lerp': (result, src, t, animation: AnimationLerp) => {
        let part2 = t / animation.duration;
        let part1 = 1 - part2;
        result.set_self((src.mul_scalar(part1)).add_self(animation.target.mul_scalar(part2)));
    },
};

//TODO make it a component!?

export function animationInit(node: SceneNode, animationAssets: AnimationAsset[]): Animation[] {
    let animations = animationAssets.map(a => Object.assign({}, a)) as Animation[];
    return animations;
}

export function animationFillSrc(node: SceneNode, animations: Animation[]): Animation[] {
    for (let animation of animations) {
        if (!animation.src) {
            let field = fieldGetter[animation.field](node);
            animation.src = field.src.clone();
        }
    }
    return animations;
}

export function animationUpdate(node: SceneNode, animations: Animation[], time: number) {
    let updated = false;
    for (let i = 0; i < animations.length; i++) {
        let animation = animations[i];
        if (time > animation.duration) continue;
        let src: AnimateFieldData = animation.src;
        let field = fieldGetter[animation.field](node);
        let animateFunction = animateFunctions[animation.type];
        animateFunction(field.src, src, time, animation);
        updated = true;
    }
    return updated;
}
