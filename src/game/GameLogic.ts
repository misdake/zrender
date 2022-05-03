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
    player: ShipState;
    enemies: ShipState[] = [];

    killCount: number = 0;
    state: LevelState = LevelState.PLAYING;
    gameTime: number = 0;
}

class ShipState {
    enabled: boolean;
    spaceship: Spaceship;
}

export class GameLogic {

    public state: GameStateGlobal;
    public level: Level;

    constructor(state: GameStateGlobal) {
        this.state = state;
        this.background = new Image();
        this.background.src = './assets/background.jpg';
        this.background.addEventListener('load', () => {
            this.backgroundLoaded = true;
        }, false);
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

    private background: HTMLImageElement;
    private backgroundLoaded: boolean = false;
    preRender(context: CanvasRenderingContext2D, width: number, height: number) {
        if (this.backgroundLoaded) {
            let min = Math.min(this.background.width, this.background.height);
            let ox = this.background.width > this.background.height ? (this.background.width - this.background.height) / 2 : 0;
            let oy = this.background.width < this.background.height ? (this.background.height - this.background.width) / 2 : 0;
            context.drawImage(this.background, ox, oy, min, min, 0, 0, width, height);
        }
        if (this.level) this.level.preRender(context, width, height);
    }
    postRender(context: CanvasRenderingContext2D, width: number, height: number) {
        if (this.level) this.level.postRender(context, width, height);
    }
}

enum LevelState {
    PLAYING,
    DEAD,
}

export class Level {
    public readonly globalState: GameStateGlobal;
    public readonly state = new GameStateLevel();

    private readonly ENEMY_MAX = 5;

    constructor(globalState: GameStateGlobal) {
        this.globalState = globalState;
    }

    load() {
        //player
        //  enabled at start
        //  never disable
        this.state.player = {
            enabled: true,
            spaceship: new Spaceship(this.globalState.scene.root, SpaceshipOwner.player),
        };

        this.switchStatePlaying();

        //enemy
        //  enabled in spawnEnemy
        //  disabled in ? TODO
        for (let i = 0; i < this.ENEMY_MAX; i++) {
            let enemyShip = new Spaceship(this.globalState.scene.root, SpaceshipOwner.enemy);
            let enemy = new ShipState();
            enemy.spaceship = enemyShip;
            enemy.enabled = false;
            this.state.enemies.push(enemy);
            enemyShip.disable();
        }
    }

    update(dt: number, input: UserInput) {
        switch (this.state.state) {
            case LevelState.PLAYING:
                this.state.gameTime += dt;
                this.updateSpaceshipMove(input, dt);
                this.trySpawnEnemy(dt);
                this.testPlayerBullets();
                if (this.state.gameTime > 1) {
                    this.testEnemyBullets();
                }
                break;

            case LevelState.DEAD:
                this.fadeTime += dt;
                if (input.keyboard.pressed['Enter']) {
                    this.switchStatePlaying();
                }
                break;
        }
    }


    private updateSpaceshipMove(input: UserInput, dt: number) {
        let pressed = input.keyboard.pressed;

        //TODO extract key name constants
        let player = this.state.player;
        if (player.enabled) {
            player.spaceship.playerMove(dt, pressed['w'], pressed['s'], pressed['a'], pressed['d']);
            if (pressed[' ']) {
                player.spaceship.tryFire(dt, true);
            }
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
                enemy.spaceship.enable(new Vec3(x, y, 0), this.state.player.spaceship.position);
            }
        }
    }

    private testPlayerBullets() {
        let player = this.state.player;
        let bullets = player.spaceship.getBulletLinesegment2d();
        if (bullets.length === 0) return;

        let enemies = this.state.enemies.filter(i => i.enabled);
        for (let enemy of enemies) {
            let enemyShape = enemy.spaceship.getPolygon2d();

            let insideResult = Collision2d.inside(enemyShape, ...bullets);
            let anyInside = insideResult.length > 0;

            let testResult = Collision2d.test(enemyShape, ...bullets);
            let anyCollision = testResult.length > 0;

            if (anyInside || anyCollision) {
                let collisionPoint = new Vec3();
                collisionPoint.setVec3(enemy.spaceship.position);
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

    private testEnemyBullets() {
        let bulletLists = this.state.enemies.map(enemy => enemy.spaceship.getBulletLinesegment2d());
        let bullets = bulletLists.reduce((acc, val) => acc.concat(val), []);

        let player = this.state.player;
        let playerShape = player.spaceship.getPolygon2d();

        let insideResult = Collision2d.inside(playerShape, ...bullets);
        let anyInside = insideResult.length > 0;

        let testResult = Collision2d.test(playerShape, ...bullets);
        let anyCollision = testResult.length > 0;

        if (anyInside || anyCollision) {
            let collisionPoint = new Vec3();
            collisionPoint.setVec3(player.spaceship.position);
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

            player.spaceship.explode(collisionPoint);
            this.switchStateDead();
        }
    }

    unload() {
    }


    private fadeTime = 0;
    private switchStatePlaying() {
        this.state.state = LevelState.PLAYING;
        this.state.gameTime = 0;

        this.state.player.spaceship.enable(new Vec3(0, 0, 0), new Vec3(0, 10, 0));
        this.state.player.spaceship.keepInScreen = true;
        this.state.player.enabled = true;
    }
    private switchStateDead() {
        this.state.state = LevelState.DEAD;
        this.fadeTime = 0;

        this.state.player.enabled = false;
        this.state.player.spaceship.disable();
    }


    preRender(_context: CanvasRenderingContext2D, _width: number, _height: number) {

    }
    postRender(context: CanvasRenderingContext2D, width: number, height: number) {
        switch (this.state.state) {
            case LevelState.PLAYING:
                let fontSize0 = height * 0.02;
                context.textBaseline = 'top';
                context.fillStyle = 'white';
                context.font = `${fontSize0}px sans-serif`;
                context.fillText(`WASD to move, hold SPACE to fire`, height * 0.01, height * 0.01);
                context.fillText(`kill: ${this.state.killCount}`, height * 0.01, height * 0.035);
                break;

            case LevelState.DEAD:
                let maskAlpha = Math.min(1, Math.max(0, this.fadeTime * 0.5));
                maskAlpha = maskAlpha * maskAlpha * 0.8;
                context.fillStyle = `rgba(0, 0, 0, ${maskAlpha})`;
                context.fillRect(0, 0, width, height);

                let textAlpha = Math.min(1, Math.max(0, this.fadeTime - 2) * 0.7);
                textAlpha = Math.sqrt(textAlpha);
                context.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
                let fontSize1 = height * 0.1;
                let fontSize2 = height * 0.05;
                let fontSize3 = height * 0.05;
                let text1 = 'Game Over';
                let text2 = `Kill Count: ${this.state.killCount}`;
                let text3 = `Press ENTER to continue`;
                context.textBaseline = 'top';
                context.font = `${fontSize1}px sans-serif`;
                context.fillText(text1, width * 0.1, height * 0.1);
                context.font = `${fontSize2}px sans-serif`;
                context.fillText(text2, width * 0.1, height * 0.225);
                context.font = `${fontSize3}px sans-serif`;
                context.textBaseline = 'bottom';
                context.fillText(text3, width * 0.1, height * 0.9);
                break;
        }
    }
}
