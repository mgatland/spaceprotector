var Shot = function (level, pos, dir) {
	this.pos = pos;
	this.dir = dir;

	this.size = new Pos(5,1);

	this.pos.moveXY(2,1);
	this.live = true;

	if (dir === Dir.LEFT) {
		this.pos.moveXY(-8, 0);
	} else {
		this.pos.moveXY(3, 0);
	}
	this.update = function () {
		if (this.live === false) return;
		this.pos.moveInDir(this.dir, 2);
		var left = level.isPointColliding(this.pos);
		var right = level.isPointColliding(this.pos.clone().moveXY(this.size.x,0));
		if (left || right) {
			//destroy it
			this.live = false;
		}
	}
}