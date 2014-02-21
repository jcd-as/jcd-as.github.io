// game.js
// Copyright 2014 Joshua C Shepard
// main 'game' object for the z-squared engine
//
// TODO:
// - 

zSquared.game = function( z2 )
{
	"use strict";

	z2.require( ["2d"] );

	/** 
	 * @class z2#z2.Game
	 * @classdesc Game class - this is where it all starts
	 * @constructor
	 * @arg {Canvas} canvas The HTML5 Canvas on which to draw the game
	 * @arg {boolean} [force_canvas] Should we force the use of the Canvas
	 * renderer (disabling WebGL)?
	 */
	z2.Game = function( canvas, force_canvas )
	{
		this.canvas = canvas;
		this.force_canvas = force_canvas || false;
		this.paused = false;
		this.scene = null;

		window.game = this;

		// TODO: support different widths/heights than the canvas'
		if( force_canvas )
			this.renderer = new PIXI.CanvasRenderer( canvas.width, canvas.height, canvas, true );
		else
			this.renderer = PIXI.autoDetectRenderer( canvas.width, canvas.height, canvas, true );

		// create a Pixi stage for everything to be drawn on
		this.stage = new PIXI.Stage( 0x800000 );
		this.stage.interactive = false;

		// create a view with some default values
		this.view = new z2.View( this.canvas.width, this.canvas.height );

		// setup handlers for visibility change events (pause game when focus is
		// lost)
		this.paused = false;
		var that = this;
		var visibilityChange = function( event )
		{
			if( that.paused === false && (event.type == 'pagehide' || event.type == 'blur' || document.hidden === true || document.webkitHidden === true))
				that.paused = true;
			else
				that.paused = false;

			if( that.paused )
			{
				z2.time.pause();
				z2.pauseSounds();
			}
			else
			{
				z2.resumeSounds();
				z2.time.resume();
			}
		};
		document.addEventListener( 'visibilitychange', visibilityChange, false );
		document.addEventListener( 'webkitvisibilitychange', visibilityChange, false );
		document.addEventListener( 'pagehide', visibilityChange, false );
		document.addEventListener( 'pageshow', visibilityChange, false );
		window.onblur = visibilityChange;
		window.onfocus = visibilityChange;
	};

};