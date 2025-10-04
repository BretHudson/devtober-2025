import { Delegate } from 'canvas-lord/util/delegate';

export class Timer {
	timeLeft = 0;
	duration = 0;
	onFinish = new Delegate();

	constructor(duration?: number) {
		this.reset(duration);
	}

	get running() {
		return this.timeLeft > 0;
	}

	get finished() {
		return this.timeLeft <= 0;
	}

	tick() {
		--this.timeLeft;
		if (this.timeLeft === 0) {
			this.onFinish.invoke();
		}
	}

	reset(duration?: number) {
		if (duration) this.duration = duration;
		this.timeLeft = this.duration;
	}

	restart() {
		this.timeLeft = this.duration;
	}

	earlyFinish() {
		this.timeLeft = 0;
	}
}
