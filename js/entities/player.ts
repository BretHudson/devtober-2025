import type { Camera, Input, Key } from 'canvas-lord';
import { Entity } from 'canvas-lord/core/entity';
import { Sprite } from 'canvas-lord/graphic';
import { Vec2 } from 'canvas-lord/math';
import { Ctx } from 'canvas-lord/util/canvas';
import { Draw } from 'canvas-lord/util/draw';

function getAxis(input: Input, neg: Key[], pos: Key[]) {
	return +input.keyCheck(pos) - +input.keyCheck(neg);
}

const leftKeys: Key[] = ['ArrowLeft', 'KeyA'];
const rightKeys: Key[] = ['ArrowRight', 'KeyD'];
const upKeys: Key[] = ['ArrowUp', 'KeyW'];
const downKeys: Key[] = ['ArrowDown', 'KeyS'];

class Bullet extends Entity {
	timer = 60;
	dir: Vec2;
	speed: number;

	constructor(x: number, y: number, dir: Vec2, speed: number) {
		super(x, y);

		const sprite = Sprite.createRect(8, 8, 'white');
		sprite.centerOO();
		this.graphic = sprite;
		this.dir = dir;
		this.dir.normalize();
		this.speed = speed;
	}

	update(): void {
		console.log(this.dir);
		this.x += this.dir.x * this.speed;
		this.y += this.dir.y * this.speed;
	}

	postUpdate(_input: Input): void {
		console.log(this.timer);
		if (--this.timer <= 0) {
			this.scene.removeEntity(this);
			this.scene.removeRenderable(this);
		}
	}
}

export class Player extends Entity {
	aim = Vec2.zero;

	constructor(x: number, y: number) {
		super(x, y);

		const sprite = Sprite.createRect(32, 32, 'red');
		sprite.centerOO();
		this.graphic = sprite;
	}

	update(input: Input): void {
		const hInput = getAxis(input, leftKeys, rightKeys);
		const vInput = getAxis(input, upKeys, downKeys);

		const move = new Vec2(hInput, vInput);
		if (move.magnitude > 0) move.normalize();

		this.x += move.x * 3;
		this.y += move.y * 3;

		this.aim = input.mouse.pos;

		if (input.mousePressed()) {
			const toMouse = this.aim.sub(this.pos);
			this.scene.addEntity(new Bullet(this.x, this.y, toMouse, 6));
		}
	}

	render(ctx: Ctx, camera: Camera): void {
		const r = 20;
		Draw.circle(
			ctx,
			{
				color: 'yellow',
				type: 'stroke',
			},
			this.aim.x - r,
			this.aim.y - r,
			r,
		);
	}
}
