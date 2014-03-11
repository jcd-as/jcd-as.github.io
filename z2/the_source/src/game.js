// game.js
// Copyright 2013 Joshua C Shepard
// main entry point for 'the source' game,
// using the z-squared engine
//
// TODO:
// x all the other sprites and entities
// - refactor / improve organization
// - player 'falling' logic not working (seems to not be 'blocked' by ground
// every other frame because of separation/gravity)
// - music & sound fx
// x preloader with progress indicator
// x splash screen
// x handle orientation change events & reset size
// x handle resize events & reset size
// x follow mode allows level-1 to scroll up off the top of the background image
// x player should be able to jump lower/higher by holding jump key down
// less/more time
// x save/load game/state using local storage
// * common assets load (in main menu?) to load assets that will be used in all
// levels (don't need this, just don't unload assets loaded during
// splash/menu/whatever)
// * prime the JIT (in splash? main menu?) by running game/tilemap code without
// rendering... (a half-second pause in cut-scene should help accomplish this)
// x support cut-scenes (fade-out/fade-in, swipe, etc)
// x 'rain' emitter not right on level 2
// x skip splash screen/menu when 'lvl' query strings is set
// - implement (more) sloped tiles (22.5 degree slopes? 67.5 degree slopes?)
// - physics for sloped tiles (gravity & friction) ???
// - keep a "stack" of Scenes in the Game object instead of just the current
// scene (means having a Pixi Stage per-scene instead of game-wide) ?
// - need a better way of colliding sprites against each other (currently all in
// one group which can collide against itself for n^2 performance)
// x BUG: no 'loading' image for subsequent levels
// - 

(function()
{
"use strict";

var WIDTH = 512;
var HEIGHT = 384;

window.z2 = zSquared();

// require z2 modules
z2.require( ["device", "loader", "input", "game", "tiledscene", "audio", "statemachine", "inputreceiver", "message", "level", "splash", "emitter_obj", "trigger", "alarm", "area", "swipe", "fade", "player", "oldman", "cat", "ball", "jumper"] );
 
// create a canvas
var canvas = z2.createCanvas( WIDTH, HEIGHT, null, true );

// determine best rendering method based on device/os:
var force_canvas = false;
// TODO: handle ejecta, cocoonJS etc
if( z2.device.iOS )
{
	// iOS / Safari oddly hates RENDER_OPT_PAGES and draws everything herky
	// jerky...
	force_canvas = true;
	z2.setRenderMethod( z2.renderers.RENDER_SIMPLE );
}
else if( z2.device.android )
{
	// Pixi 1.5 has an android perf regression that means that canvas is faster
	// than webgl :(
	// fixed in dev branch!!
	if( z2.device.crosswalk )
	{
//		force_canvas = true;
//		z2.setRenderMethod( z2.renderers.RENDER_OPT_PAGES );
	}
//	else if( z2.device.cocoonJS )
//	{
//	}
	else
	{
//		force_canvas = true;
//		z2.setRenderMethod( z2.renderers.RENDER_OPT_PAGES );
	}
}

// TODO: move this into game class ?
// setup mobile
function setSizeMobile()
{
	var w = window.innerWidth;
	var h = window.innerHeight;

	var aspect = WIDTH / HEIGHT;

	// stretch to available space, but retain aspect ratio
	// in portrait mode
	if( w < h )
	{
		canvas.style.width = w;
		canvas.style.height = w / aspect;
	}
	// in landscape mode
	else
	{
		canvas.style.height = h;
		canvas.style.width = h * aspect;
	}

	// center the canvas
	canvas.style.padding = 0;
	canvas.style.margin = 'auto';
	canvas.style.display = 'block';
	canvas.style.position = 'absolute';
	canvas.style.top = 0;
	canvas.style.bottom = 0;
	canvas.style.left = 0;
	canvas.style.right = 0;
}
function setSizeDesktop()
{
	var w = window.innerWidth;
	var h = window.innerHeight;

	// if there's room, double the res
	if( w >= WIDTH*2 && h >= HEIGHT*2 )
	{
		canvas.style.width = WIDTH*2;
		canvas.style.height = HEIGHT*2;
	}
	else
	{
		canvas.style.width = WIDTH;
		canvas.style.height = HEIGHT;
	}
	
	// TODO: this won't work for hosting on sites that want to place banners
	// etc:
	// center the canvas
	canvas.style.padding = 0;
	canvas.style.margin = 'auto';
	canvas.style.display = 'block';
	canvas.style.position = 'absolute';
	canvas.style.top = 0;
	canvas.style.bottom = 0;
	canvas.style.left = 0;
	canvas.style.right = 0;
}
var orientation;
// mobile
if( z2.device.mobile )
{
	// get device orientation
	if( window['orientation'] )
		orientation = window['orientation'];
	else
	{
		if( window.outerWidth > window.outerHeight )
			orientation = 90;
		else
			orientation = 0;
	}
	// set orientation change listener
	window.addEventListener( 'orientationchange', setSizeMobile, false );
	
	// set size
	setSizeMobile();
}
// desktop
else
{
	window.addEventListener( 'resize', setSizeDesktop, false );

	setSizeDesktop();
}

// read options from query string
//
// force Canvas?
var r, debug, start_level;
var skip_splash;
// get from query string
var key_vals = location.search.substring( 1 ).split( '&' );
for( var i in key_vals )
{
    var key = key_vals[i].split( '=' );
    if( key.length > 1 )
    {
		// 'render='
        if( decodeURIComponent( key[0] ) === 'render' )
            r = decodeURIComponent( key[1].replace( /\+/g, ' ' ) );
		// TODO:
		// 'dbg='
        if( decodeURIComponent( key[0] ) === 'dbg' )
            debug = !!+decodeURIComponent( key[1].replace( /\+/g, ' ' ) );
		// 'lvl='
        if( decodeURIComponent( key[0] ) === 'lvl' )
            start_level = +decodeURIComponent( key[1].replace( /\+/g, ' ' ) );
    }
}
if( start_level )
	skip_splash = true;
if( typeof( r ) == 'string' )
{
    if( r === 'canvas' )
        force_canvas = true;
}
// if we didn't get a level from the query string,
// load starting level from saved game in local storage:
if( !start_level )
{
	var save_file = 'the-source';
	var saved_state = z2.loadState( save_file );
	if( saved_state )
	{
		// start the appropriate level
		start_level = saved_state.level;
	}
	else
	{
		// start at level 1 by default
		start_level = 1;
	}
}

// global game object
var game = new z2.Game( canvas, force_canvas );
game.debug = debug;

// TODO: move this to Game class:
// stats fps display
if( debug )
{
	z2.stats = new Stats();
	document.body.appendChild( z2.stats.domElement );
	z2.stats.domElement.style.position = 'absolute';
	z2.stats.domElement.style.top = '0px';
}

// global set-up stuff

z2.loader.setBaseUrl( 'assets/' );
z2.loader.setImageBaseUrl( 'img/' );
z2.loader.setAudioBaseUrl( 'snd/' );
z2.loader.setFontBaseUrl( 'fnt/' );

// TODO: move these fcns somewhere:
// trigger, area and alarm functions for this level:
z2.reverseGravity = function( triggerer, target )
{
	// TODO: something interesting
//	z2.playSound( 'meow' );
	var gc = target.getComponent( z2.gravityFactory );
	gc.y *= -1;
};
z2.meow = function( target )
{
	z2.playSound( 'meow' );
};


// start the splash screen, which will cascade to our level
game.startScene( z2.splash, WIDTH, HEIGHT, start_level, skip_splash );

// start the main loop
game.start();

})();

