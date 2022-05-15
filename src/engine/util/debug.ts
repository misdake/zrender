import { Scene } from '../scene/Scene';
import { SceneNode } from '../scene/SceneNode';

interface PrintConfig {
    prefix: string,
    idLength: number,
}

function alignString(src: any, length: number): string {
    let r = `${src}`;
    if (length > r.length) {
        r = ' '.repeat(length - r.length) + r;
    }
    return r;
}

export function printSceneTree(scene: Scene, config: PrintConfig) {
    let root = scene.root;
    printSceneNode(root, config);
}

function printSceneNode(node: SceneNode, config: PrintConfig) {
    if (!node) return;
    let id = alignString(node.id, config.idLength);
    let name = node.name;
    console.log(`${config.prefix}[${id}] ${name}`);
    let childConfig: PrintConfig = {
        prefix: config.prefix + '  ',
        idLength: config.idLength,
    };
    for (let child of node.getChildren()) {
        printSceneNode(child, childConfig);
    }
}
