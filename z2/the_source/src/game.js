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
// - 

(function()
{
"use strict";

var WIDTH = 512;
var HEIGHT = 384;

window.z2 = zSquared();

// require z2 modules
z2.require( ["loader", "input", "tiledscene", "audio", "statemachine", "inputreceiver", "message"] );
 
// global game object
window.game = {};

// create a canvas
var canvas = z2.createCanvas( WIDTH, HEIGHT, true );

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

// TODO: move this to a "game" class??
var paused = false;
var visibilityChange = function( event )
{
	if( paused === false && (event.type == 'pagehide' || event.type == 'blur' || document.hidden === true || document.webkitHidden === true))
		paused = true;
	else
		paused = false;

	if( paused )
		z2.pauseSounds();
	else
		z2.resumeSounds();
};
document.addEventListener( 'visibilitychange', visibilityChange, false );
document.addEventListener( 'webkitvisibilitychange', visibilityChange, false );
document.addEventListener( 'pagehide', visibilityChange, false );
document.addEventListener( 'pageshow', visibilityChange, false );
window.onblur = visibilityChange;
window.onfocus = visibilityChange;

z2.Cat = function( obj )
{
};
z2.OldMan = function( obj )
{
};

// create an object defining our scene
// (load, create and update methods)
var level_one = 
{
	load : function()
	{
		z2.loader.queueAsset( 'man', 'stylized.png' );
//		z2.loader.queueAsset( 'field', 'field.mp3' );
//		z2.loader.queueAsset( 'field', 'field.ogg' );
//		z2.loader.queueAsset( 'land', 'landing.mp3' );
//		z2.loader.queueAsset( 'land', 'landing.ogg' );
//		z2.loader.queueAsset( 'logo', 'logo.mp3' );
//		z2.loader.queueAsset( 'logo', 'logo.ogg' );
		z2.loader.queueAsset( 'meow', 'meow.mp3' );
//		z2.loader.queueAsset( 'meow', 'meow.ogg' );

		z2.loader.queueAsset( 'oldman', 'oldman.png' );
		z2.loader.queueAsset( 'cat', 'cat.png' );

		z2.loader.queueAsset( 'firefly', 'firefly.png' );

		z2.loader.queueAsset( 'font', 'open_sans_italic_20.fnt' );

		// touchscreen control images
		z2.loader.queueAsset( 'left', 'button_left.png' );
		z2.loader.queueAsset( 'right', 'button_right.png' );
		z2.loader.queueAsset( 'circle', 'button_circle.png' );
		z2.loader.queueAsset( 'square', 'button_square.png' );

		// pre-create items that need to be in-place *before* maps and sprites
		// are created
		game.input = z2.inputFactory.create();
	},

	create : function()
	{
		for( var i = 0; i < this.map.objectGroups.length; i++ )
		{
			var grp = this.map.objectGroups[i];
			for( var j = 0; j < grp.length; j++ )
			{
				var obj = grp[j];
				var cmc = obj.getComponent( z2.collisionMapFactory );
				if( cmc )
				{
					cmc.map = this.map;
					cmc.data = this.map.collisionMap;
				}
			}
		}

		// TODO: set the entities for collision groups
//		var pcolg = game.player.getComponent( z2.collisionGroupFactory );
//		pcolg.entities = [];

		// follow the player sprite
		this.view.follow_mode = z2.FOLLOW_MODE_PLATFORMER;
		var sprp = game.player.getComponent( z2.positionFactory );
		this.view.target = sprp;

		// create input system
		var is = z2.createInputSystem();
		this.mgr.addSystem( is );

		// create an actionable system
//		var as = z2.createActionableSystem();
//		this.mgr.addSystem( as );

		// create a message display system
		var msgs = z2.createMessageSystem();
		this.mgr.addSystem( msgs );

		// create a movement system
		var ms = z2.createMovementSystem( 20 );
		this.mgr.addSystem( ms );

		// start soundtrack for this level
//		z2.playSound( 'field', 0, 1, true );
	},

	update : function( dt )
	{
	}
};


// create a Tiled map scene using our scene definition object
game.scene = new z2.TiledScene( canvas, 'assets/maps/level-1.json', level_one );
// TODO: these don't work so well with tile maps
//game.scene.view.rotation = z2.math.d2r(10);
//game.scene.view.sx = 2;

// start the scene
game.scene.start();

// start the main ecs loop
//z2.main( z2.ecsUpdate );
function mainloop( et )
{
	stats.begin();
	// TODO: problem with this is that ecsUpdate calculates the time delta, so
	// by intercepting here the dt doesn't get updated properly
	if( !paused )
		z2.ecsUpdate( et );
	stats.end();
}
z2.main( mainloop );

})();

