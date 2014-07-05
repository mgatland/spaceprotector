"use strict";
define([], function () {
	var Events = new function () {
		this.shots = [];
		this.monsters = [];
		this.wonLevel = false;
		this.sounds = [];
		this.explosions = [];
		this.players = [];
		this.shoot = function (shot) {
			this.shots.push(shot);
		}
		this.monster = function (m) {
			this.monsters.push(m);
		}
		this.winLevel = function () {
			if (this.wonLevel) return;
			this.wonLevel = true;
			Events.playSound("winlevel", null);
		}
		this.playSound = function (name, pos) {
			this.sounds.push({name: name, pos:pos});
		}
		this.explosion = function (exp) {
			this.explosions.push(exp);
		}
		this.player = function(p) {
			this.players.push(p);
		}
	};
	return Events;
});