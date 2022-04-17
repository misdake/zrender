export interface UserInput {
    // mouse?: { //TODO support mouse input
    //     x: number, y: number,
    //     click: boolean,
    //     isDown: boolean,
    // },
    keyboard?: {
        pressed: { [key: string]: boolean },
        // down: { [key: string]: boolean }, //TODO support down and up
        // up: { [key: string]: boolean },
    },
    //TODO support joystick
}

export class UserInputController {
    private canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    private pressedKeys: { [key: string]: boolean } = {};
    private keydown = (e: KeyboardEvent) => {
        this.pressedKeys[e.key] = true;
        // e.preventDefault();
    };
    private keyup = (e: KeyboardEvent) => {
        delete this.pressedKeys[e.key];
        // e.preventDefault();
    };

    getAllPressedKeys(): Set<string> {
        let r = new Set<string>();
        for (let key in this.pressedKeys) {
            r.add(key);
        }
        return r;
    }

    attach() {
        window.addEventListener('keydown', this.keydown);
        window.addEventListener('keyup', this.keyup);
    }

    detach() {
        window.removeEventListener('keydown', this.keydown);
        window.removeEventListener('keyup', this.keyup);
    }

    tick(): UserInput {
        return {
            keyboard: {
                pressed: this.pressedKeys,
            },
        };
    }

}
