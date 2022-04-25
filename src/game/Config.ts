import { RendererOptions } from '../engine/Renderer';
import { Vec3 } from '../engine/util/Vec3';

export const rendererOptions: RendererOptions = {
    maxTick: 0.1,
    canvasBackground: '#222',
    aspectRatio: 1,
    logicalHeight: 100,
};

export const RENDER_WIDTH = 100;
export const RENDER_HEIGHT = 100;
export const RENDER_LEFT = -50;
export const RENDER_RIGHT = 50;
export const RENDER_TOP = -50;
export const RENDER_BOTTOM = 50;

export function isInScreen(position: Vec3, margin: number = 0): boolean {
    return Math.abs(position.x) <= (RENDER_WIDTH / 2 + margin)
        && Math.abs(position.y) <= (RENDER_HEIGHT / 2 + margin);
}

export function setInScreen(position: Vec3, margin: number = 0) {
    if (position.x < RENDER_LEFT - margin) position.x = RENDER_LEFT - margin;
    if (position.x < RENDER_RIGHT + margin) position.x = RENDER_RIGHT + margin;
    if (position.y < RENDER_TOP - margin) position.y = RENDER_TOP - margin;
    if (position.y < RENDER_BOTTOM + margin) position.y = RENDER_BOTTOM + margin;
}
