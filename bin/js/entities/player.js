import { Entity } from '../canvas-lord/core/entity.js';
import { Sprite } from '../canvas-lord/graphic/index.js';
import { Vec2 } from '../canvas-lord/math/index.js';
import { Draw } from '../canvas-lord/util/draw.js';
function getAxis(input, neg, pos) {
    return +input.keyCheck(pos) - +input.keyCheck(neg);
}
const leftKeys = ['ArrowLeft', 'KeyA'];
const rightKeys = ['ArrowRight', 'KeyD'];
const upKeys = ['ArrowUp', 'KeyW'];
const downKeys = ['ArrowDown', 'KeyS'];
class Bullet extends Entity {
    timer = 60;
    dir;
    speed;
    constructor(x, y, dir, speed) {
        super(x, y);
        const sprite = Sprite.createRect(8, 8, 'white');
        sprite.centerOO();
        this.graphic = sprite;
        this.dir = dir;
        this.dir.normalize();
        this.speed = speed;
    }
    update() {
        console.log(this.dir);
        this.x += this.dir.x * this.speed;
        this.y += this.dir.y * this.speed;
    }
    postUpdate(_input) {
        console.log(this.timer);
        if (--this.timer <= 0) {
            this.scene.removeEntity(this);
            this.scene.removeRenderable(this);
        }
    }
}
export class Player extends Entity {
    aim = Vec2.zero;
    constructor(x, y) {
        super(x, y);
        const sprite = Sprite.createRect(32, 32, 'red');
        sprite.centerOO();
        this.graphic = sprite;
    }
    update(input) {
        const hInput = getAxis(input, leftKeys, rightKeys);
        const vInput = getAxis(input, upKeys, downKeys);
        const move = new Vec2(hInput, vInput);
        if (move.magnitude > 0)
            move.normalize();
        this.x += move.x * 3;
        this.y += move.y * 3;
        this.aim = input.mouse.pos;
        if (input.mousePressed()) {
            const toMouse = this.aim.sub(this.pos);
            this.scene.addEntity(new Bullet(this.x, this.y, toMouse, 6));
        }
    }
    render(ctx, camera) {
        const r = 20;
        Draw.circle(ctx, {
            color: 'yellow',
            type: 'stroke',
        }, this.aim.x - r, this.aim.y - r, r);
    }
}
//# sourceMappingURL=player.js.map