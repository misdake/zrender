import { DrawableAsset } from '../engine/components/Drawable';
import { AnimateAdd, Animation } from '../engine/components/Animation';
import { SceneNode } from '../engine/scene/SceneNode';
import { Vec3 } from '../engine/util/Vec3';
import { Particle } from '../engine/components/ParticleSystem';
import { isInScreen, RENDER_BOTTOM, RENDER_LEFT, RENDER_RIGHT, RENDER_TOP } from './Config';
import { Layer } from './Layer';
import { Circle2d, Linesegment2d, Point2d, Polygon2d } from '../engine/components/Collision';
import { Ellipse } from 'zdog';
import { now } from '../engine/Renderer';

interface SpaceshipType {
    color: string,
}

export enum SpaceshipOwner {
    player = 'player',
    enemy = 'enemy',
}

enum ShieldState {
    DOWN,
    DOWN_to_UP,
    UP,
    UP_to_DOWN,
}

const SPACESHIP_TYPES: { [key: string]: SpaceshipType } = {
    player: {
        color: 'rgba(238, 102, 51, 1.0)',
    },
    enemy: {
        color: 'rgba(34, 238, 51, 1.0)',
    },
};

const SHIELD_COLOR: Vec3 = new Vec3(0, 255, 234);

function generateShieldColor(alpha: number) {
    return `rgba(${SHIELD_COLOR.x}, ${SHIELD_COLOR.y}, ${SHIELD_COLOR.z}, ${alpha})`;
}

const polygon = [
    {x: 0, y: -1.2, z: 0},
    {x: -2, y: -2.2, z: 0},
    {x: 0, y: 2.8, z: 0},
    {x: 2, y: -2.2, z: 0},
];

function generateShape(color: string): DrawableAsset {
    return {
        shape: 'polyline',
        path: polygon,
        closed: true,
        stroke: 0.5,
        color: color,
    };
}

export class Spaceship {

    public readonly node: SceneNode;
    public readonly shipNode: SceneNode;
    public readonly shieldNode: SceneNode;
    public readonly bulletNode: SceneNode;
    public readonly bubbleNode: SceneNode;
    public readonly explosionNode: SceneNode;

    private static readonly SFX_ASSETS = {fire: 'fire.ogg', explosion: 'explosion.ogg', engine: 'engine.ogg'};

    constructor(parent: SceneNode, spaceshipOwner: SpaceshipOwner) {
        let spaceshipType = SPACESHIP_TYPES[spaceshipOwner];

        this.node = new SceneNode('spaceship');
        this.shipNode = new SceneNode('ship', {
            drawable: {
                asset: generateShape(spaceshipType.color),
            },
            sfx: {
                assets: Spaceship.SFX_ASSETS,
                channel: 2,
                baseFolder: 'assets/sound/',
            },
        });

        if (spaceshipOwner === SpaceshipOwner.player) {
            this.shieldNode = new SceneNode('shield', {
                drawable: {
                    asset: {
                        shape: 'ellipse',
                        diameter: 9,
                        stroke: 0.3,
                        color: generateShieldColor(0.8),
                    },
                },
            });
        }

        this.bulletNode = new SceneNode('bullet', {
            particle: {
                particleName: 'bullet',
                drawable: {
                    asset: {
                        shape: 'rect',
                        fill: true,
                        width: 0,
                        height: 1,
                        stroke: 0.5,
                        color: spaceshipType.color,
                    },
                },
                animations: [{
                    name: 'fire',
                    type: 'add',
                    field: 'position',
                    duration: 10000,
                    speed: null, //filled in initBullet
                }],
            },
            sfx: {
                assets: Spaceship.SFX_ASSETS,
                channel: 0,
                baseFolder: 'assets/sound/',
            },
        });
        this.bulletNode.particle.setCallbacks(
            (p, animations) => this.initBullet(p, animations),
            p => isInScreen(p.node.position, 2),
        );

        this.bubbleNode = new SceneNode('bullet', {
            particle: {
                particleName: 'bullet',
                drawable: {
                    asset: {
                        shape: 'cone',
                        diameter: 0.8,
                        length: 1.0,
                        stroke: false,
                        color: 'rgba(255, 0, 0, 0.6)',
                        backface: 'rgba(255, 0, 0, 0)',
                    },
                },
                animations: [{
                    name: 'scale',
                    type: 'lerp',
                    field: 'scale',
                    duration: 0.5,
                    target: new Vec3(0, 0, 0),
                }, {
                    name: 'move',
                    type: 'add',
                    field: 'position',
                    duration: 0.5,
                    speed: null,
                }],
            },
        });
        this.bubbleNode.particle.setCallbacks(
            (p, animations) => this.initBubble(p, animations),
            _ => true,
        );

        this.explosionNode = new SceneNode('explosion', {
            particle: {
                particleName: 'explosion',
                drawable: {
                    asset: {
                        shape: 'cone',
                        diameter: 1,
                        stroke: 0.2,
                        length: 0,
                        color: spaceshipType.color.replace('1.0)', '0.2)'),
                    },
                },
                animations: [{
                    name: 'scale',
                    type: 'lerp',
                    field: 'scale',
                    duration: 0.5,
                    target: new Vec3(0, 0, 0),
                }, {
                    name: 'move',
                    type: 'add',
                    field: 'position',
                    duration: 0.5,
                    speed: null,
                }],
            },
            sfx: {
                assets: Spaceship.SFX_ASSETS,
                channel: 1,
                baseFolder: 'assets/sound/',
            },
        });
        this.explosionNode.particle.setCallbacks(
            (p, animations, payload) => this.initExplosion(p, animations, payload),
            _ => true,
        );

        switch (spaceshipOwner) {
            case SpaceshipOwner.player:
                this.shipNode.position.z = Layer.player;
                this.shieldNode.position.z = Layer.player;
                this.bulletNode.position.z = Layer.player_bullet;
                this.bubbleNode.position.z = Layer.player_bubble;
                this.explosionNode.position.z = Layer.player_explosion;
                break;
            case SpaceshipOwner.enemy:
                this.shipNode.position.z = Layer.enemy;
                this.bulletNode.position.z = Layer.enemy_bullet;
                this.bubbleNode.position.z = Layer.enemy_bubble;
                this.explosionNode.position.z = Layer.enemy_explosion;
                break;
        }

        parent.addChild(this.node);
        if (this.shieldNode) this.shipNode.addChild(this.shieldNode);
        this.node.addChild(this.shipNode);
        this.node.addChild(this.bulletNode);
        this.node.addChild(this.bubbleNode);
        this.node.addChild(this.explosionNode);
    }

    public readonly position: Vec3 = new Vec3();
    public readonly speed: Vec3 = new Vec3();
    public rot: number = 0;
    public rotSpeed: number = 0;
    public keepInScreen = false;

    //spaceship model
    private accS: number = 5;
    private accF: number = (this.accS + 20);
    private accB: number = -(this.accS + 10);
    private speedMax: number = 30;
    private rotAccS: number = 10;
    private rotAccL: number = -(this.rotAccS + 20);
    private rotAccR: number = (this.rotAccS + 20);
    private rotSpeedMax: number = 4;

    transformToWorld(local: Vec3): Vec3 {
        return local.rotateZ(this.rot).add(this.position);
    }
    rotateLocal(local: Vec3): Vec3 {
        return local.rotateZ(this.rot);
    }

    private engineSfx?: AudioBufferSourceNode;

    move(dt: number, forward: boolean, backward: boolean, left: boolean, right: boolean, enableEngineSfx: boolean = false) {
        let acc = 0;
        if (forward) acc += this.accF;
        if (backward) acc += this.accB;

        let rotAcc = 0;
        if (left) rotAcc += this.rotAccL;
        if (right) rotAcc += this.rotAccR;

        this.rotSpeed += rotAcc * dt;
        let rotDvS = this.rotAccS * dt;
        if (Math.abs(this.rotSpeed) < rotDvS) {
            this.rotSpeed = 0;
        } else {
            this.rotSpeed -= Math.sign(this.rotSpeed) * rotDvS;
        }
        this.rotSpeed = Math.sign(this.rotSpeed) * Math.min(Math.abs(this.rotSpeed), this.rotSpeedMax);
        this.rot += this.rotSpeed * dt;
        this.rot = this.rot % (Math.PI * 2);

        let dir = new Vec3(0, acc * dt, 0);
        dir.rotateZSet(this.rot);
        this.speed.setVec3(this.speed.add(dir));

        let speedLen = this.speed.length();
        let speedDvS = this.accS * dt;
        if (speedLen < speedDvS) {
            speedLen = 0;
        } else {
            speedLen -= speedDvS;
        }
        speedLen = Math.min(speedLen, this.speedMax);
        this.speed.setLength(speedLen);

        this.position.setVec3(this.position.add(this.speed.multiplyScalar(dt)));

        //fit in screen
        if (this.keepInScreen) {
            let position = this.position, margin = -2;
            if (position.x < RENDER_LEFT - margin) {
                position.x = RENDER_LEFT - margin;
                this.speed.x = 0;
            }
            if (position.x > RENDER_RIGHT + margin) {
                position.x = RENDER_RIGHT + margin;
                this.speed.x = 0;
            }
            if (position.y < RENDER_TOP - margin) {
                position.y = RENDER_TOP - margin;
                this.speed.y = 0;
            }
            if (position.y > RENDER_BOTTOM + margin) {
                position.y = RENDER_BOTTOM + margin;
                this.speed.y = 0;
            }
        }

        //apply scene
        this.shipNode.position.setVec3(this.position);
        this.shipNode.rotation.z = -this.rot;

        if (forward) {
            this.tryEmit(dt);
            if (!this.engineSfx && enableEngineSfx) {
                this.engineSfx = this.shipNode.sfx.play(Spaceship.SFX_ASSETS.engine, 0.3, true);
            }
        } else {
            if (this.engineSfx) {
                this.engineSfx.stop();
                this.engineSfx = null;
            }
        }
    }

    enable(position: Vec3, rotateTarget: Vec3) {
        this.position.setVec3(position);
        //atan2(x,y) not atan2(y,x) is intentional, because rot definition is different
        this.rot = Math.atan2(rotateTarget.x - position.x, rotateTarget.y - position.y);
        this.speed.set(0, 0, 0);
        this.rotSpeed = 0;

        this.shipNode.position.setVec3(this.position);
        this.shipNode.rotation.z = -this.rot;

        this.shieldState = ShieldState.UP;
        this.shieldStateTimer = 0;
    }
    disable() {
        this.position.set(-10000, -10000, 0);
        this.rot = 0;
        this.speed.set(0, 0, 0);
        this.rotSpeed = 0;

        this.shipNode.position.setVec3(this.position);
        this.shipNode.rotation.z = -this.rot;
        //no need to reset particles, keep updating
        if (this.engineSfx) {
            this.engineSfx.stop();
            this.engineSfx = null;
        }
    }
    updateTime(dt: number) {
        this.sinceLastFire += dt;
    }

    private fireIntervalMin = 0.1;
    private sinceLastFire: number = 0;
    tryFire(enableSfx: boolean, volume: number = 0.7) {
        if (this.sinceLastFire >= this.fireIntervalMin) {
            if (enableSfx) {
                this.bulletNode.sfx.play(Spaceship.SFX_ASSETS.fire, volume);
            }
            this.sinceLastFire = 0;
            this.fire();
        }
    }

    private bulletRecoilSpeedDelta = new Vec3(0, -1, 0);
    private bulletFireSpeedDelta = new Vec3(0, 50, 0);
    private fire() {
        this.bulletNode.particle.spawn();
    }
    private initBullet(p: Particle, animations: Animation[]) {
        let moveAnimation = animations[0] as AnimateAdd;
        p.node.position.setVec3(this.position.add(this.rotateLocal(new Vec3(0, 3, 0))));
        p.node.rotation.z = -this.rot;

        this.speed.setVec3(this.speed.add(this.rotateLocal(this.bulletRecoilSpeedDelta)));

        let speed = moveAnimation.speed = new Vec3();
        speed.setVec3(this.rotateLocal(this.bulletFireSpeedDelta));
        speed.setVec3(speed.add(this.speed));

        p.data = this;
    }

    private shieldState: ShieldState = ShieldState.UP;
    private shieldStateTimer: number = 0;
    private static readonly SHIELD_REGEN_TIME = 3;
    private static readonly SHIELD_UP2DOWN_TIME = 0.1;
    private static readonly SHIELD_DOWN2UP_TIME = 0.1;
    isShieldUp(): boolean {
        return this.shieldState === ShieldState.UP;
    }
    updateShield(dt: number): void {
        this.shieldStateTimer -= dt;
        while (this.shieldStateTimer < 0) {
            switch (this.shieldState) { //find next state
                case ShieldState.DOWN:
                    this.shieldState = ShieldState.DOWN_to_UP;
                    this.shieldStateTimer += Spaceship.SHIELD_DOWN2UP_TIME;
                    break;
                case ShieldState.DOWN_to_UP:
                    this.shieldState = ShieldState.UP;
                    this.shieldStateTimer = 0;
                    break;
                case ShieldState.UP:
                    this.shieldStateTimer = 0;
                    break;
                case ShieldState.UP_to_DOWN:
                    this.shieldState = ShieldState.DOWN;
                    this.shieldStateTimer += Spaceship.SHIELD_REGEN_TIME;
                    break;
            }
        }

        let time = now();
        const CYCLE = 0.8;
        let bias = Math.sin((time * 0.001) % CYCLE / CYCLE * Math.PI * 2);

        let baseAlpha = 0.5 + 0.1 * bias;
        let ratio = 0;

        switch (this.shieldState) {
            case ShieldState.DOWN:
                this.shieldNode.drawable.visible = false;
                break;
            case ShieldState.DOWN_to_UP:
                this.shieldNode.drawable.visible = true;
                ratio = 1 - this.shieldStateTimer / Spaceship.SHIELD_DOWN2UP_TIME;
                break;
            case ShieldState.UP:
                this.shieldNode.drawable.visible = true;
                ratio = 1;
                break;
            case ShieldState.UP_to_DOWN:
                this.shieldNode.drawable.visible = true;
                ratio = this.shieldStateTimer / Spaceship.SHIELD_DOWN2UP_TIME;
                break;
        }

        (this.shieldNode.drawable.zdog as Ellipse).color = generateShieldColor(baseAlpha * ratio);
    }
    breakShield() {
        this.shieldState = ShieldState.UP_to_DOWN;
        this.shieldStateTimer = Spaceship.SHIELD_UP2DOWN_TIME;
    }

    private explosionParticleCount = 20;
    explode(explosionPoint: Vec3) {
        this.explosionNode.particle.clear();
        for (let i = 0; i < this.explosionParticleCount; i++) {
            this.explosionNode.particle.spawn(explosionPoint);
        }
        this.explosionNode.sfx.play(Spaceship.SFX_ASSETS.explosion, 0.6);
    }
    private initExplosion(p: Particle, animations: Animation[], explosionPoint: Vec3) {
        let moveAnimation = animations[1] as AnimateAdd;
        let direction = Math.random() * Math.PI * 2;
        let nx = Math.cos(direction);
        let ny = Math.sin(direction);
        let speedScalar = Math.random() * 20;

        p.time = Math.random() * 0.4 - 0.2;
        p.node.scale.set(10, 10, 10);
        p.node.position.setVec3(explosionPoint.add(this.speed.multiplyScalar(-p.time / 2)));
        if (p.time < 0) {
            p.node.scale.setVec3(p.node.scale.multiplyScalar(1 / (1 - p.time)));
        }

        let speed = moveAnimation.speed = new Vec3(nx * speedScalar, ny * speedScalar, 0);
        speed.setVec3(speed.add(this.speed));

        p.data = this;
    }

    private emitIntervalMin = 0.03;
    private sinceLastEmit: number = 0;
    tryEmit(dt: number) {
        this.sinceLastEmit += dt;
        while (this.sinceLastEmit >= this.emitIntervalMin) {
            this.sinceLastEmit = 0;
            this.emitBubble();
        }
    }
    private emitBubble() {
        this.bubbleNode.particle.spawn();
    }
    private bubbleSpeedDelta = new Vec3(0, -35, 0);
    private initBubble(p: Particle, animations: Animation[]) {
        let size = 1 + Math.random();
        let offsetX = Math.random() + Math.random() - 1;
        let offsetY = (Math.random() * 2 - 1) * 0.2;
        p.node.position.setVec3(this.position.add(this.rotateLocal(new Vec3(offsetX, -1.5 + offsetY, 0))));
        p.node.scale.set(size, size, size);
        p.node.rotation.set(Math.PI / 2, this.rot, 0);

        let moveAnimation = animations[1] as AnimateAdd;
        let speed = moveAnimation.speed = new Vec3();
        speed.setVec3(this.rotateLocal(this.bubbleSpeedDelta));
        speed.setVec3(speed.add(this.speed));
    }

    getShipShape(): Polygon2d {
        return new Polygon2d(polygon.map(point => {
            let p = this.transformToWorld(new Vec3(point.x, point.y, point.z));
            return new Point2d(p.x, p.y);
        })).setData(this);
    }
    getShieldShape() {
        return new Circle2d(new Point2d(this.position.x, this.position.y), 4.5);
    }
    getBulletShapes(): Linesegment2d[] {
        let particles = this.bulletNode.particle.getParticles();
        return particles.filter(p => p.keepAlive).map(particle => {
            let p = particle.node.position;
            let p1 = new Vec3(0, 0.5, 0).rotateZ(-particle.node.rotation.z).add(p);
            let p2 = new Vec3(0, -0.5, 0).rotateZ(-particle.node.rotation.z).add(p);
            return new Linesegment2d(new Point2d(p1.x, p1.y), new Point2d(p2.x, p2.y)).setData([this, particle]);
        });
    }
}
