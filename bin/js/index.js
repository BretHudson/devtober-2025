import { Game } from './canvas-lord/core/engine.js';
import { Scene } from './canvas-lord/core/scene.js';
import { Player } from './entities/player.js';
const game = new Game('game', {
    fps: 60,
    backgroundColor: '#323232',
});
const createPattern = () => {
    const offscreenCanvas = new OffscreenCanvas(128, 128);
    const offscreenCtx = offscreenCanvas.getContext('2d');
    if (!offscreenCtx)
        throw new Error('could not create offscreen canvas');
    offscreenCtx.fillStyle = '#4056aa';
    offscreenCtx.fillRect(0, 0, 128, 128);
    for (let x = 128; x >= 0; x -= 32) {
        offscreenCtx.fillStyle = x === 0 ? '#6179CF' : '#5168BD';
        offscreenCtx.fillRect(x, 0, 1, 128);
        offscreenCtx.fillRect(0, x, 128, 1);
    }
    const pattern = offscreenCtx.createPattern(offscreenCanvas, 'repeat');
    if (!pattern)
        throw new Error('pattern could not be created');
    return pattern;
};
const scene = new Scene();
scene.addEntity(new Player(30, 30));
const pattern = createPattern();
scene.onRender.add((ctx) => {
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
});
game.pushScene(scene);
game.start();
//# sourceMappingURL=index.js.map