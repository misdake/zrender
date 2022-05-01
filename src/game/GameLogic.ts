import { Spaceship, SpaceshipOwner } from './Spaceship';
import { UserInput } from '../engine/UserInput';
import { Scene } from '../engine/scene/Scene';
import { Vec3 } from '../engine/util/Vec3';
import { RENDER_BOTTOM, RENDER_LEFT, RENDER_RIGHT, RENDER_TOP } from './Config';

export class GameStateGlobal {
    constructor(scene: Scene) {
        this.scene = scene;
    }
    public readonly scene: Scene;

    //TODO spawn policy
}

class GameStateLevel {
    player: Spaceship;
    enemies: Enemy[] = [];
}

class Enemy {
    spaceship: Spaceship;
    enabled: boolean;

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

    public readonly ENEMY_MAX = 5;

    constructor(globalState: GameStateGlobal) {
        this.globalState = globalState;
    }

    load() {
        //player
        //  enabled at start
        //  never disable
        this.state.player = new Spaceship(this.globalState.scene.root, SpaceshipOwner.player);
        this.state.player.enable(new Vec3(0, 0, 0), new Vec3(0, 10, 0));
        this.state.player.keepInScreen = true;

        //enemy
        //  enabled in spawnEnemy
        //  disabled in ? TODO
        for (let i = 0; i < this.ENEMY_MAX; i++) {
            let enemyShip = new Spaceship(this.globalState.scene.root, SpaceshipOwner.enemy);
            let enemy = new Enemy();
            enemy.spaceship = enemyShip;
            enemy.enabled = false;
            this.state.enemies.push(enemy);
            enemyShip.disable();
        }
    }

    private lastSpawn = 0;
    private spawnInterval = 2;
    update(dt: number, input: UserInput) {
        let pressed = input.keyboard.pressed;

        //TODO extract key name constants
        this.state.player.playerMove(dt, pressed['w'], pressed['s'], pressed['a'], pressed['d']);

        this.lastSpawn += dt;
        while (this.lastSpawn > this.spawnInterval) {
            this.spawnEnemy();
            this.lastSpawn -= this.spawnInterval;
        }

        for (let enemy of this.state.enemies) {
            if (enemy.enabled) {
                enemy.spaceship.playerMove(dt, Math.random() > 0.5, false, false, false);
            } else {
                enemy.spaceship.disable();
            }
        }

        if (pressed[' ']) {
            this.state.player.tryFire(dt);
        }
    }

    spawnEnemy() {
        let valid = this.state.enemies.filter(i => !i.enabled);
        if (valid.length) {
            let enemy = valid[0];

            let side = Math.floor(Math.random() * 4);
            let v = Math.random();

            const l = RENDER_LEFT - 4;
            const r = RENDER_RIGHT + 4;
            const t = RENDER_TOP - 4;
            const b = RENDER_BOTTOM + 4;

            let x: number = 0, y: number = 0;
            switch (side) {
                case 0:
                    x = r;
                    y = v * (b - t) + t;
                    break;
                case 1:
                    x = l;
                    y = v * (b - t) + t;
                    break;
                case 2:
                    x = v * (r - l) + l;
                    y = t;
                    break;
                case 3:
                    x = v * (r - l) + l;
                    y = b;
                    break;
            }

            enemy.enabled = true;
            enemy.spaceship.enable(new Vec3(x, y, 0), this.state.player.position);
        }
    }

    unload() {

    }
}
