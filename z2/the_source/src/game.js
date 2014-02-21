// game.js
// Copyright 2013 Joshua C Shepard
// main entry point for 'the source' game,
// using the z-squared engine
//
// TODO:
// - all the other sprites and entities (switches etc)
// - refactor / improve organization
// - player 'falling' logic not working (seems to not be 'blocked' by ground
// every other frame)
// - music & sound fx
// - preloader with progress indicator
// - splash screen
// - handle orientation change events & reset size
// - 

(function()
{
"use strict";

var WIDTH = 512;
var HEIGHT = 384;

window.z2 = zSquared();

// require z2 modules
z2.require( ["device", "loader", "input", "game", "tiledscene", "audio", "statemachine", "inputreceiver", "message", "level"] );
 
// create a canvas
var canvas = z2.createCanvas( WIDTH, HEIGHT, null, true );

// determine best rendering method based on device/os:
var force_canvas = false;
// TODO: handle ejecta, cocoonJS etc
if( z2.device.iOS )
{
	force_canvas = true;
	z2.setRenderMethod( z2.renderers.RENDER_SIMPLE );
}
else if( z2.device.android )
{
	if( z2.device.crosswalk )
	{
		// (on Nexus 7) crosswalk still seems to be faster using canvas than
		// webGL
		force_canvas = true;
		z2.setRenderMethod( z2.renderers.RENDER_OPT_PAGES );
	}
//	else if( z2.device.cocoonJS )
//	{
//	}
	else
	{
		force_canvas = true;
		z2.setRenderMethod( z2.renderers.RENDER_OPT_PAGES );
	}
}

// TODO: move this into game class ?
// setup mobile
if( z2.device.mobile )
{
	// TODO: force rotate to landscape??
	
	var w = window.innerWidth;
	var h = window.innerHeight;

	var aspect = WIDTH / HEIGHT;

//	canvas.style.width = w;
//	canvas.style.height = h;
	
	// if there's room, double the res
//	if( w >= WIDTH*2 && h >= HEIGHT*2 )
//	{
//		canvas.style.width = WIDTH*2;
//		canvas.style.height = HEIGHT*2;
//	}
	
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
}

// global game object
var game = new z2.Game( canvas, force_canvas );

// stats fps display
var stats = new Stats();
document.body.appendChild( stats.domElement );
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';

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

// TODO: load the splash screen here, which should cascade to the main menu and
// eventually the game levels

// load the json for our first level
z2.loader.queueAsset( 'level-1', 'levels/level-1.json' );
z2.loader.load( start );

// create a Tiled map scene using our scene definition object
function start()
{
	// level (asset) json is loaded, load the Tiled map
	var level = z2.loader.getAsset( 'level-1' );
	var level_one = z2.level( level );

	game.scene = new z2.TiledScene( 'assets/maps/level-1.json', level_one );
	// TODO: these don't work so well with tile maps
	//game.view.rotation = z2.math.d2r(10);
	//game.view.sx = 2;

	// start the scene
	game.scene.start();

	// start the main game loop
	z2.main( mainloop );
}

// start the main ecs loop
//z2.main( z2.ecsUpdate );
function mainloop( et )
{
	stats.begin();
	// TODO: problem with this is that ecsUpdate calculates the time delta, so
	// by intercepting here the dt doesn't get updated properly
	if( !game.paused )
		z2.ecsUpdate( et );
	stats.end();
}

})();

