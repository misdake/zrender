import { Spaceship } from './Spaceship';
import { GameStateLevel } from './GameLogic';

enum AiMode {

}

export class EnemyAi {

    private mode: AiMode;

    init() {

    }

    updateMove(dt: number, levelState: GameStateLevel, enemyShip: Spaceship, playerShip: Spaceship) {
        if (!levelState.player.enabled) return;

        enemyShip.playerMove(dt, Math.random() > 0.8, false, false, false);
        if (levelState.gameTime > 3 && Math.random() > 0.9) enemyShip.tryFire(dt, false);
    }

}
