import { Spaceship, SpaceshipOwner } from './Spaceship';
import { UserInput } from '../engine/UserInput';
import { Scene } from '../engine/scene/Scene';
import { Vec3 } from '../engine/util/Vec3';
import { isInScreen, RENDER_BOTTOM, RENDER_LEFT, RENDER_RIGHT, RENDER_TOP } from './Config';
import { Collision2d } from '../engine/components/Collision';
import { Particle } from '../engine/components/ParticleSystem';

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

    killCount: number = 0;
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

    //TODO unload
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

    update(dt: number, input: UserInput) {
        this.updateSpaceshipMove(input, dt);

        this.trySpawnEnemy(dt);

        this.testPlayerBullets();

        // this.testEnemyBullets();

        // this.testPlayerEnemyCrash();
    }

    private updateSpaceshipMove(input: UserInput, dt: number) {
        let pressed = input.keyboard.pressed;

        //TODO extract key name constants
        this.state.player.playerMove(dt, pressed['w'], pressed['s'], pressed['a'], pressed['d']);
        if (pressed[' ']) {
            this.state.player.tryFire(dt, true);
        }

        for (let enemy of this.state.enemies) {
            if (enemy.enabled) {
                if (isInScreen(enemy.spaceship.position, -2)) {
                    enemy.spaceship.keepInScreen = true;
                    //TODO update ai
                    enemy.spaceship.playerMove(dt, Math.random() > 0.8, false, false, false);
                    if (Math.random() > 0.9) enemy.spaceship.tryFire(dt, false); //TODO set a max interval for enableSfx
                } else if (!isInScreen(enemy.spaceship.position, 10)) {
                    console.log('out of bounds', enemy.spaceship.position, isInScreen(enemy.spaceship.position, -10));
                    enemy.enabled = false;
                    enemy.spaceship.disable();
                } else {
                    enemy.spaceship.playerMove(dt, true, false, false, false);
                }
            }
        }
        return pressed;
    }

    private lastSpawn = 0;
    private readonly spawnInterval = 2;
    trySpawnEnemy(dt: number) {
        this.lastSpawn += dt;
        while (this.lastSpawn > this.spawnInterval) {
            this.lastSpawn -= this.spawnInterval;

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
                enemy.spaceship.keepInScreen = false; //enabled in updateSpaceshipMove
                enemy.spaceship.enable(new Vec3(x, y, 0), this.state.player.position);
            }
        }
    }

    private testPlayerBullets() {
        let player = this.state.player;
        let bullets = player.getBulletLinesegment2d();
        if (bullets.length === 0) return;

        let enemies = this.state.enemies.filter(i => i.enabled);
        for (let enemy of enemies) {
            let enemyShape = enemy.spaceship.getPolygon2d();

            //TODO keep track of bullet instance

            let insideResult = Collision2d.inside(enemyShape, ...bullets);
            let anyInside = insideResult.length > 0;

            let testResult = Collision2d.test(enemyShape, ...bullets);
            let anyCollision = testResult.length > 0;

            if (anyInside || anyCollision) {
                let collisionPoint = new Vec3();
                collisionPoint.setVec3(player.position);
                for (let r of insideResult) {
                    if (r.shape2.data && Array.isArray(r.shape2.data)) {
                        (r.shape2.data[1] as Particle).keepAlive = false;
                    }
                }
                for (let r of testResult) {
                    if (r.shape2.data && Array.isArray(r.shape2.data)) {
                        (r.shape2.data[1] as Particle).keepAlive = false;
                        collisionPoint.set(r.point.x, r.point.y, 0);
                    }
                }

                this.state.killCount++;
                enemy.spaceship.explode(collisionPoint);
                enemy.spaceship.disable();
                enemy.enabled = false;
            }
        }
    }

    unload() {
    }
}
