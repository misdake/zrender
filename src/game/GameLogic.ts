import { Spaceship, SpaceshipOwner } from './Spaceship';
import { UserInput } from '../engine/UserInput';
import { Scene } from '../engine/scene/Scene';

export class GameStateGlobal {
    constructor(scene: Scene) {
        this.scene = scene;
    }
    public readonly scene: Scene;

    //TODO spawn policy
}

class GameStateLevel {

    player: Spaceship;
    enemies: Spaceship[] = [];

}

export class GameLogic {

    public state: GameStateGlobal;
    public level: Level;

    constructor(state: GameStateGlobal) {
        this.state = state;
    }

    loadLevel(level: Level) {
        if (this.level) this.level.unload();
        this.level = level;
        level.load();
    }

    update(dt: number, input: UserInput) {
        if (this.level) {
            this.level.update(dt, input);
        }
    }
}

export class Level {
    public readonly globalState: GameStateGlobal;
    public readonly state = new GameStateLevel();

    constructor(globalState: GameStateGlobal) {
        this.globalState = globalState;
    }

    load() {
        this.state.player = new Spaceship(this.globalState.scene.root, SpaceshipOwner.player);

    }

    update(dt: number, input: UserInput) {
        let pressed = input.keyboard.pressed;

        //TODO extract key name constants
        this.state.player.playerMove(dt, pressed['w'], pressed['s'], pressed['a'], pressed['d']);

        if (pressed[' ']) {
            this.state.player.tryFire(dt);
        }
    }

    spawnEnemy() {

    }

    unload() {

    }
}
