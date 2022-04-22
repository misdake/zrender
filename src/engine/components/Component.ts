import { SceneNode } from '../scene/SceneNode';

export class Component {

    public readonly node: SceneNode;

    constructor(node: SceneNode) {
        this.node = node;
    }

}
