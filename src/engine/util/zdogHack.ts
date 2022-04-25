import { Anchor } from 'zdog';

interface AnchorHack {
    children: Anchor[];
}

export function zdogReplaceChild(parent: Anchor, child: Anchor, replacement: Anchor) {
    let p = parent as any as AnchorHack;

    let index = p.children.indexOf(child);
    if (index != -1) {
        p.children.splice(index, 1, replacement);
    } else {
        console.error('cannot find child', parent, child);
        debugger;
    }
}
