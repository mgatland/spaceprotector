var Shot = function (level, pos, dir, owner) {
	extend(this, new Entity(pos, new Pos(5,1)));
	var _this = this;

	this.dir = dir;

	this.hitsMonsters = (owner === "player");
	this.killPlayerOnTouch = !this.hitsMonsters;

	this.pos.moveXY(2,1);

	if (dir === Dir.LEFT) {
		this.pos.moveXY(-8, 0);
	} else {
		this.pos.moveXY(3, 0);
	}
	this.update = function () {
		if (this.live === false) return;

		this.collisions.forEach(function (other) {
			if (other.ignoreShots !== true) {
				_this.live = false;
			}
		});
		
		this.collisions.length = 0;
		if (this.live === false) return;

		this.pos.moveInDir(this.dir, 2);
		var left = level.isPointColliding(this.pos);
		var right = level.isPointColliding(this.pos.clone().moveXY(this.size.x,0));
		if (left || right) {
			if (owner === "player") Events.playSound("hitwall", this.pos.clone());
			//destroy it
			this.live = false;
		}
	}
}