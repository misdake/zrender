import { SceneNode } from './SceneNode';
import { printSceneTree } from '../util/debug';

export class Scene {
    public readonly root: SceneNode;

    constructor() {
        this.root = new SceneNode('root');
    }

    printSceneTree() {
        printSceneTree(this, {prefix: '', idLength: 3})
    }
}
