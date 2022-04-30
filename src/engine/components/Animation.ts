import { Vec3 } from '../util/Vec3';
import { SceneNode } from '../scene/SceneNode';

type AnimateField = 'position' | 'rotation' | 'scale';
export type Animation = AnimateNone | AnimateAdd | AnimateLerp;

export interface AnimateBase {
    name: string,
    field: AnimateField,
    duration: number,
    // timeOffset?: number, //TODO support timeOffset
}

export interface AnimateNone extends AnimateBase {
    type: 'none',
}

// value = src + {speed} * t
export interface AnimateAdd extends AnimateBase {
    type: 'add',
    speed: Vec3,
}

// value = src * (1 - t / {duration}) + {dst} * t / {duration}
export interface AnimateLerp extends AnimateBase {
    type: 'lerp',
    target: Vec3,
}


// t is timeOffset-calibrated time: [0, duration)
type AnimateFunction = (result: Vec3, src: Vec3, t: number, animation: AnimateBase) => void;

const functions: { [key: string]: AnimateFunction } = {
    'none': () => {
    },
    'add': (result, src, t, animation: AnimateAdd) => {
        let x = src.x + animation.speed.x * t;
        let y = src.y + animation.speed.y * t;
        let z = src.z + animation.speed.z * t;
        result.set(x, y, z);
    },
    'lerp': (result, src, t, animation: AnimateLerp) => {
        let part2 = t / animation.duration;
        let part1 = 1 - part2;
        let x = src.x * part1 + animation.target.x * part2;
        let y = src.y * part1 + animation.target.y * part2;
        let z = src.z * part1 + animation.target.z * part2;
        result.set(x, y, z);
    },
};

//TODO make it a component!?

export function animate(node: SceneNode, animations: Animation[], srcs: Vec3[], time: number) {
    let updated = false;
    for (let i = 0; i < animations.length; i++) {
        let animation = animations[i];
        if (time > animation.duration) continue;
        let src: Vec3 = srcs[i];
        functions[animation.type](node[animation.field], src, time, animation);
        updated = true;
    }
    return updated;
}
