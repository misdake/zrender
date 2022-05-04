import { Spaceship } from './Spaceship';
import { GameStateLevel } from './GameLogic';
import { RENDER_SIZE } from './Config';

enum AiMode {
    //normal modes
    HEAD_ON = 0,
    KEEP_DISTANCE,
    ATTACK,
    NORMAL_MODE_COUNT,

    //keep last
    KEEP_PRESSING = 100,
}

export class EnemyAi {
    private enemyShip: Spaceship;
    private playerShip: Spaceship;

    private static readonly MODE_TIMER_MAX = 5;
    private static readonly FIRE_INTERVAL_MIN = 2;
    private static readonly FIRE_INTERVAL_MAX = 3.5;

    private modeTimer: number;
    private mode: AiMode;

    init(enemyShip: Spaceship, playerShip: Spaceship) {
        this.enemyShip = enemyShip;
        this.playerShip = playerShip;
        this.setModeRandom();
        this.lastFire = 0;
    }

    private setModeRandom() {
        let mode = Math.floor(Math.random() * AiMode.NORMAL_MODE_COUNT);
        this.setMode(mode as AiMode);
    }
    private setMode(mode: AiMode) {
        console.log('setMode', mode);
        this.mode = mode;

        this.modeTimer = EnemyAi.MODE_TIMER_MAX;

        this.angleTolerant = true;

        this.rand1 = Math.random();
        this.rand2 = Math.random();
        this.rand3 = Math.random();
        this.rand4 = Math.random();
    }

    updateMove(dt: number, levelState: GameStateLevel) {
        if (!levelState.player.enabled) return;
        this.modeTimer -= dt;
        if (this.modeTimer < 0) {
            this.setModeRandom();
        }

        this.lastFire += dt;

        let func = this.modeFunctions[this.mode];
        if (func) {
            func(dt);
        }
    }

    private borderDistance() {
        let x = this.enemyShip.position.x;
        let y = this.enemyShip.position.y;
        let max = Math.max(Math.abs(x), Math.abs(y));
        return max;
    }
    private isNearBorder(): boolean {
        let max = this.borderDistance();
        return max > RENDER_SIZE / 2 * 0.9;
    }
    private isOnBorder(): boolean {
        let max = this.borderDistance();
        return max > RENDER_SIZE / 2 * 0.98;
    }

    private static getRot(x1: number, y1: number, x2: number, y2: number): number {
        let dx = x2 - x1;
        let dy = y2 - y1;
        return Math.atan2(dx, dy);
    }
    private static rotDiff(from: number, to: number): number {
        to = to % (Math.PI * 2);
        let f2 = from % (Math.PI * 2);
        let f1 = from - Math.PI * 2;
        let f3 = from + Math.PI * 2;
        let d1 = Math.abs(f1 - to);
        let d2 = Math.abs(f2 - to);
        let d3 = Math.abs(f3 - to);
        let d = Math.min(d1, d2, d3);
        if (d === d1) return f1 - to;
        if (d === d2) return f2 - to;
        if (d === d3) return f3 - to;
        return 0;
    }

    private rotTarget(x: number, y: number, tolerance: number, timeAhead: number): { l: boolean, r: boolean } {
        let target = EnemyAi.getRot(this.enemyShip.position.x, this.enemyShip.position.y, x, y);
        let current = this.enemyShip.rot + this.enemyShip.rotSpeed * timeAhead;
        let diff = EnemyAi.rotDiff(current, target);
        if (Math.abs(diff) <= tolerance) {
            return {l: false, r: false};
        } else if (diff > tolerance) {
            return {l: true, r: false};
        } else {
            return {l: false, r: true};
        }
    }

    //HEAD_ON
    private angleTolerant: boolean = true;
    //KEEP_DISTANCE
    private keepDistance1: number = 5;
    private keepDistance2: number = 10;

    private rand1: number = 0;
    private rand2: number = 0;
    private rand3: number = 0;
    private rand4: number = 0;

    private keepKey: boolean[];
    private keepTime: number = 0;
    private keepPressing(f: boolean, b: boolean, l: boolean, r: boolean, time: number) {
        this.setMode(AiMode.KEEP_PRESSING);
        this.keepKey = [f, b, l, r];
        this.keepTime = time;
    }

    private modeFunctions: { [key in AiMode]: (dt: number) => void } = {
        0: (dt) => {
            // HEAD_ON
            let tolerance = this.angleTolerant ? Math.PI / 15 : Math.PI / 90;
            let playerPosition = this.playerShip.position;
            let enemyPosition = this.enemyShip.position;
            let playerSpeed = this.playerShip.speed;
            let enemySpeed = this.enemyShip.speed;
            let distance = Math.hypot(enemyPosition.x - playerPosition.x, enemyPosition.y - playerPosition.y);
            let aheadTime = distance / 50;

            let tx = playerPosition.x + (playerSpeed.x - enemySpeed.x) * (0.5 + 0.5 * this.rand1) * aheadTime;
            let ty = playerPosition.y + (playerSpeed.y - enemySpeed.y) * (0.5 + 0.5 * this.rand1) * aheadTime;
            let {l, r} = this.rotTarget(tx, ty, tolerance, this.rand1 * 0.4);
            if (this.angleTolerant && (l || r)) {
                this.angleTolerant = false;
            } else if (!this.angleTolerant && (!l && !r)) {
                this.angleTolerant = true;
            }
            if (Math.abs(this.enemyShip.rotSpeed) > 1) {
                l = false;
                r = false;
            }
            let f = Math.random() > 0.5 + 0.2 * this.rand2;
            this.enemyShip.move(dt, f, false, l, r);
            this.tryRandomFire();
        },
        1: (dt) => {
            // KEEP_DISTANCE
            let playerPosition = this.playerShip.position;
            let enemyPosition = this.enemyShip.position;
            let distance = Math.hypot(enemyPosition.x - playerPosition.x, enemyPosition.y - playerPosition.y);

            let target = EnemyAi.getRot(enemyPosition.x, enemyPosition.y, playerPosition.x, playerPosition.y);
            let current = this.enemyShip.rot + this.enemyShip.rotSpeed * this.rand1 * 0.4;

            let keepDistance1 = this.keepDistance1 * (0.9 + 0.4 * this.rand2);
            let keepDistance2 = this.keepDistance2 * (0.9 + 0.4 * this.rand2);

            let ratio = 0.5;
            let enemySpeedScalar = this.enemyShip.speed.length();
            if (distance < keepDistance1) ratio = 0.2 + 0.1 * enemySpeedScalar / 20;
            if (distance > keepDistance2) ratio = 0.2 - 0.1 * enemySpeedScalar / 20;

            let diff1 = EnemyAi.rotDiff(current, target + Math.PI * ratio);
            let diff2 = EnemyAi.rotDiff(current, target - Math.PI * ratio);
            let tolerance = Math.PI / 15;

            let l: boolean = false, r: boolean = false;

            if (Math.abs(diff1) < Math.abs(diff2)) {
                if (diff1 < -tolerance) {
                    r = true;
                } else if (diff1 > tolerance) {
                    l = true;
                } else {
                    this.setModeRandom();
                }
            } else {
                if (diff2 < -tolerance) {
                    l = true;
                } else if (diff2 > tolerance) {
                    r = true;
                } else {
                    this.setModeRandom();
                }
            }

            let f = Math.random() > (0.3 + enemySpeedScalar / 40);
            this.enemyShip.move(dt, f, false, l, r);
            this.tryRandomFire();
        },
        2: (dt) => {
            // ATTACK
            let playerPosition = this.playerShip.position;
            let enemyPosition = this.enemyShip.position;
            let playerSpeed = this.playerShip.speed;
            let enemySpeed = this.enemyShip.speed;
            let distance = Math.hypot(enemyPosition.x - playerPosition.x, enemyPosition.y - playerPosition.y);
            let aheadTime = distance / 50;

            let tx = playerPosition.x + (playerSpeed.x - enemySpeed.x) * (0.5 + 0.5 * this.rand1) * aheadTime;
            let ty = playerPosition.y + (playerSpeed.y - enemySpeed.y) * (0.5 + 0.5 * this.rand1) * aheadTime;
            let {l, r} = this.rotTarget(tx, ty, 0, 0);
            if (Math.abs(this.enemyShip.rotSpeed) > 1) {
                l = false;
                r = false;
            }
            let f = Math.random() > 0.6 + 0.3 * this.rand2;
            this.enemyShip.move(dt, f, false, l, r);
            this.tryRandomFire();
        },
        3: (dt) => {
            console.error('unreachable');
        },
        100: (dt: number) => {
            // KEEP_PRESSING, from this.keepPressing
            this.keepTime -= dt;
            if (this.keepTime < 0) {
                this.setModeRandom();
                return;
            } else {
                this.enemyShip.move(dt, this.keepKey[0], this.keepKey[1], this.keepKey[2], this.keepKey[3]);
                this.tryRandomFire();
            }
        },
    };

    private lastFire: number;
    private tryRandomFire() {
        if (this.lastFire > EnemyAi.FIRE_INTERVAL_MIN) {
            this.lastFire -= EnemyAi.FIRE_INTERVAL_MIN + Math.random() * (EnemyAi.FIRE_INTERVAL_MAX - EnemyAi.FIRE_INTERVAL_MIN);
            this.enemyShip.tryFire(true, 0.2);
        }
    }
}
