export class Timer {
	timeLeft = 0;
	duration = 0;

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
	}

	reset(duration?: number) {
		if (duration) this.duration = duration;
		this.timeLeft = this.duration;
	}

	earlyFinish() {
		this.timeLeft = 0;
	}
}
