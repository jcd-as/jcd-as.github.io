// fade.js
// Copyright 2013 Joshua C Shepard
// fade cut-Scene object for 'the source' game,
// using the z-squared engine
//
// TODO:
// -

(function()
{
	"use strict";

	/** Fade cut-scene class
	 * @class z2#z2.Fade
	 * @classdesc Fade class - cut-scene class
	 * @constructor
	 * @arg {number} color The hex color to fade-in from
	 */
	z2.Fade = function( color )
	{
		this.bg = new PIXI.Graphics();
		this.color = 0 | (color || 0x000000);
		this.bg.beginFill( this.color );
		this.bg.drawRect( 0, 0, game.view.width, game.view.height );
		this.bg.endFill();
		this.bg.alpha = 1;

		this.complete = false;
	};

	z2.Fade.prototype.start = function()
	{
		this._start = z2.time.now();
		game.view.add( this.bg, true );
	};

	z2.Fade.prototype.update = function()
	{
		if( this.complete )
			return true;

		if( z2.time.now() - this._start > 500 )
		{
			// swipe
			this.bg.alpha -= 0.05;

			if( this.bg.alpha <= 0 )
			{
				game.view.remove( this.bg, true );
				this.bg = null;
				this.complete = true;
				return true;
			}
		}
		return false;
	};

})();

