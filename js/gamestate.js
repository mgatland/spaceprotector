"use strict";
/* A game state that entities can ask for information about the world, like:
 Is an enemy nearby?
 Am I standing on the ground?
 */
define([], function () {
	var GameState = function (level) {
		this.shots = [];
		this.explosions = [];
		this.players = [];
		this.local = 0;
		this.other = 1;
		this.monsters = [];
		this.level = level;
	};
	return GameState;
});