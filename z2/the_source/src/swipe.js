// swipe.js
// Copyright 2013 Joshua C Shepard
// swipe cut-Scene object for 'the source' game,
// using the z-squared engine
//
// TODO:
// -

zSquared.swipe = function( z2 )
{
	"use strict";

	/** Swipe cut-scene class
	 * @class z2#z2.Swipe
	 * @classdesc Swipe class - cut-scene class
	 * @constructor
	 * @arg {string} dir The direction of the swipe (up, down, left, right)
	 * @arg {number} color The hex color to swipe with
	 */
	z2.Swipe = function( dir, color )
	{
		this.direction = dir;
		this.bg = new PIXI.Graphics();
		this.color = 0 | (color || 0x000000);
		this.bg.beginFill( this.color );
		this.bg.drawRect( 0, 0, game.view.width, game.view.height );
		this.bg.endFill();

		this.complete = false;
		switch( this.direction )
		{
			case 'up':
			case 'down':
				this.endCondition = game.view.height;
				break;
			case 'left':
			case 'right':
				this.endCondition = game.view.width;
				break;
		}
	};

	z2.Swipe.prototype.start = function()
	{
		this._start = z2.time.now();
		game.view.add( this.bg, true );
	};

	z2.Swipe.prototype.update = function()
	{
		if( this.complete )
			return true;

		if( z2.time.now() - this._start > 500 )
		{
			// swipe
			var test;
			switch( this.direction )
			{
				case 'up':
					test = -(this.bg.position.y -= 16);
					break;
				case 'down':
					test = this.bg.position.y += 16;
					break;
				case 'left':
					test = -(this.bg.position.x -= 16);
					break;
				case 'right':
					test = this.bg.position.x += 16;
					break;
			}

			if( test > this.endCondition )
			{
				game.view.remove( this.bg, true );
				this.bg = null;
				this.complete = true;
				return true;
			}
		}
		return false;
	};

};

