import { SceneNode } from './SceneNode';

export class Scene {
    public readonly root: SceneNode;

    constructor() {
        this.root = new SceneNode('root', {shape: 'anchor'});
    }
}
