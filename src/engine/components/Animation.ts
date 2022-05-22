import { Vec3, Vec3Mask } from '../util/Vec3';
import { SceneNode } from '../scene/SceneNode';

type AnimateField = 'position' | 'rotation' | 'scale'; //TODO more: color? opacity?

type FieldGetter = (node: SceneNode) => { src: Vec3, mask?: Vec3Mask };
const fieldGetter: { [key in AnimateField]: FieldGetter } = {
    'position': node => ({src: node.position}),
    'rotation': node => ({src: node.rotation}),
    'scale': node => ({src: node.scale}),
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
    mask?: Vec3Mask,
    // startTime?: number, //TODO support startTime
    duration: number,
    src?: Vec3,
}

export interface AnimationBase extends AnimationAssetBase {
    mask: Vec3Mask,
    src: Vec3,
}

// Set: value = target
export interface AnimateAssetSet extends AnimationAssetBase {
    type: AnimateType.set,
    target: Vec3,
}

// Add: value = src + {speed} * t
export interface AnimateAssetAdd extends AnimationAssetBase {
    type: AnimateType.add,
    speed: Vec3,
}

// Lerp: value = src * (1 - t / {duration}) + {target} * t / {duration}
export interface AnimateAssetLerp extends AnimationAssetBase {
    type: AnimateType.lerp,
    target: Vec3,
}

export type AnimationSet = AnimateAssetSet & AnimationBase;
export type AnimationAdd = AnimateAssetAdd & AnimationBase;
export type AnimationLerp = AnimateAssetLerp & AnimationBase;

export type Animation = AnimationSet | AnimationAdd | AnimationLerp;
export type AnimationAsset = AnimateAssetSet | AnimateAssetAdd | AnimateAssetLerp;

// t is start-calibrated time: [0, duration)
type AnimateFunction = (result: Vec3, src: Vec3, t: number, animation: AnimationBase) => void;

const animateFunctions: { [key in AnimateType]: AnimateFunction } = {
    'set': (result, _src, _t, animation: AnimationSet) => {
        result.setVec3WithMask(animation.target, animation.mask);
    },
    'add': (result, src, t, animation: AnimationAdd) => {
        let x = src.x + animation.speed.x * t;
        let y = src.y + animation.speed.y * t;
        let z = src.z + animation.speed.z * t;
        result.setWithMask(x, y, z, animation.mask);
    },
    'lerp': (result, src, t, animation: AnimationLerp) => {
        let part2 = t / animation.duration;
        let part1 = 1 - part2;
        let x = src.x * part1 + animation.target.x * part2;
        let y = src.y * part1 + animation.target.y * part2;
        let z = src.z * part1 + animation.target.z * part2;
        result.setWithMask(x, y, z, animation.mask);
    },
};

//TODO make it a component!?

export function animationInit(node: SceneNode, animationAssets: AnimationAsset[]): Animation[] {
    let animations = animationAssets.map(a => Object.assign({}, a)) as Animation[];
    return animations;
}

export function animationFillSrc(node: SceneNode, animations: Animation[]): Animation[] {
    for (let animation of animations) {
        let field = fieldGetter[animation.field](node);
        animation.mask = (animation.mask ?? Vec3Mask.XYZ) & (field.mask ?? Vec3Mask.XYZ);
        let src: Vec3 = field.src;
        if (!animation.src) animation.src = new Vec3(src.x, src.y, src.z);
    }
    return animations;
}

export function animationUpdate(node: SceneNode, animations: Animation[], time: number) {
    let updated = false;
    for (let i = 0; i < animations.length; i++) {
        let animation = animations[i];
        if (time > animation.duration) continue;
        let src: Vec3 = animation.src;
        let field = fieldGetter[animation.field](node);
        let animateFunction = animateFunctions[animation.type];
        animateFunction(field.src, src, time, animation);
        updated = true;
    }
    return updated;
}
