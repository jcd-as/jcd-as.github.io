// z2 version of 'the source' game
// TODO:
// - all the other sprites and entities (switches etc)
// - refactor / improve organization
// - move to separate dir (from z2) & break into separate files
// - player 'falling' logic not working
// - music & sound fx
// - preloader with progress indicator
// - splash screen
// - 

(function()
{
"use strict";

var WIDTH = 512;
var HEIGHT = 384;

var z2 = zSquared();

// require z2 modules
z2.require( ["loader", "input", "tiledscene", "audio", "statemachine"] );
 
// global game object
window.game = {};

// create a canvas
var canvas = z2.createCanvas( WIDTH, HEIGHT, true );

// global set-up stuff
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

// factory functions to create sprites
z2.Player = function( obj )
{
	var mgr = z2.manager.get();
	// create a "player control" component
	var player = z2.createComponentFactory();
	// create an input system
	var input_sys = new z2.System( 50, [player, z2.velocityFactory, z2.physicsBodyFactory],
	{
		init: function()
		{
			// initialize FSM
			this.fsm = new z2.StateMachine( this.states, this );
			
			// initialize keyboard
			z2.kbd.start();
			z2.kbd.addKey( z2.kbd.UP );
			z2.kbd.addKey( z2.kbd.LEFT );
			z2.kbd.addKey( z2.kbd.RIGHT );
		},
		update: function( e, dt )
		{
			// get the velocity component
			var vc = e.getComponent( z2.velocityFactory.mask );

			// get the physics body
			var bc = e.getComponent( z2.physicsBodyFactory.mask );

			// get the scale component
			var sc = e.getComponent( z2.scaleFactory.mask );

			// check keys
			var left = false;
			var right = false;
			var jump = false;
			// only jump when standing on 'ground'
			if( bc.blocked_down && z2.kbd.isDown( z2.kbd.UP ) )
				jump = true;
			if( z2.kbd.isDown( z2.kbd.LEFT ) )
				left = true;
			else if( z2.kbd.isDown( z2.kbd.RIGHT ) )
				right = true;

			var state = this.fsm.getState();
			switch( state )
			{
			case 'walking':
				// reset horizontal velocity
//					vc.x = 0;

				// can jump, fall, keep walking or stop
				if( jump )
					this.fsm.consumeEvent( 'jump', vc, bc );
				// TODO: this doesn't work, seems like every other frame this is
				// not true...
				// not touching ground ?
//				else if( !bc.blocked_down )
//					this.fsm.consumeEvent( 'fall', vc, bc );
				else if( left )
				{
					this.goLeft( vc, bc, sc );
				}
				else if( right )
				{
					this.goRight( vc, bc, sc );
				}
				else
				{
					// stop
					this.fsm.consumeEvent( 'stop' );
				}
				break;
			case 'jumping':
			case 'falling':
				// reset horizontal velocity
//					vc.x = 0;

				// land?
				if( bc.blocked_down )
				{
//					z2.playSound( 'land' );
					this.fsm.consumeEvent( 'land', vc, bc, sc );
				}
				// can move side to side
				if( left )
				{
					this.facing = 'left';
					this.goLeft( vc, bc, sc );
				}
				else if( right )
				{
					this.facing = 'right';
					this.goRight( vc, bc, sc );
				}
				break;
			case 'idle':
				// reset horizontal velocity
//					vc.x = 0;

				// can walk or jump
				if( jump )
					this.fsm.consumeEvent( 'jump', vc, bc, sc );
				else if( left )
				{
					this.facing = 'left';
					this.fsm.consumeEvent( 'left', vc, bc, sc );
				}
				else if( right )
				{
					this.facing = 'right';
					this.fsm.consumeEvent( 'right', vc, bc, sc );
				}
				break;
			default:
				break;
			}
			////////////////////////////
		},
		facing : 'left',
		h_vel_inc : 100,
		v_vel_inc : 475,
//		v_vel_inc : 750,
		// finite state machine states for player sprite
		fsm : null,
		states : 
		[
			{
				'name' : 'idle',
				'initial' : true,
				'events' :
				{
					'left' : 'walking',
					'right' : 'walking',
					'jump' : 'jumping',
				}
			},
			{
				'name' : 'walking',
				'events' :
				{
					'stop' : 'idle',
					'jump' : 'jumping',
					'fall' : 'falling',
				}
			},
			{
				'name' : 'jumping',
				'events' :
				{
					'land' : 'idle',
					'fall' : 'falling'
				}
			},
			{
				'name' : 'recovering',
				'events' :
				{
					'recover' : 'idle'
				}
			},
			{
				'name' : 'falling',
				'events' : 
				{
					'land' : 'idle',
				}
			}
		],
		// state handlers
		idle : function( vc, bc, sc )
		{
			// set animation, facing
			anims.stop();
		},
		walking : function( vc, bc, sc )
		{
			// set animation, facing
			if( anims.playing != 'walk' )
				anims.play( 'walk' );
			if( this.facing == 'left' )
				this.goLeft( vc, bc, sc );
			else if( this.facing == 'right' )
				this.goRight( vc, bc, sc );
//				else error
		},
		jumping : function( vc, bc, sc )
		{
			if( anims.playing != 'jump' )
				anims.play( 'jump' );
			vc.y = -this.v_vel_inc;
			// set animation, facing
		},
		falling : function( vc, bc, sc )
		{
			// set animation, facing
			anims.stop();
		},
		goLeft : function( vc, bc, sc )
		{
			vc.x += -this.h_vel_inc;
			if( sc )
				sc.sx = -1; 
		},
		goRight : function( vc, bc, sc )
		{
			vc.x += this.h_vel_inc;
			if( sc )
				sc.sx = 1; 
		},
	} );
	mgr.addSystem( input_sys );

	// TODO: use obj.properties to set position etc

	// image, texture & pixi sprite for player sprite:
	var s_img = z2.loader.getAsset( 'man' );
	var anims = new z2.AnimationSet();
	anims.add( 'walk', [[0, 250], [1, 250]] );
	anims.add( 'jump', [[4, 250], [5, 250]] );
	var sbasetexture = new PIXI.BaseTexture( s_img );
	var stexture = new PIXI.Texture( sbasetexture );
	var sprite = new PIXI.Sprite( stexture );
	game.scene.view.doc.addChild( sprite );

	// components for the player sprite:
	// gravity component
	var gravc = z2.gravityFactory.create( {x: 0, y: 1000} );
	// sprite component
	var sprc = z2.spriteFactory.create( {sprite:sprite, animations:anims} );
	// velocity component
	var sprv = z2.velocityFactory.create( {x: 0, y: 0, maxx: 200, maxy: 500} );
	// position component
	var sprp = z2.positionFactory.create( {x: obj.x, y: obj.y} );
	// rotation component
	var sprr = z2.rotationFactory.create( {theta: 0} );
//	var sprr = z2.rotationFactory.create( {theta: z2.math.d2r(10)} );
	// scale component
	var sprs = z2.scaleFactory.create( {sx: 1, sy: 1} );
	// size component
	var sprsz = z2.sizeFactory.create( {width: 64, height: 64} );
	// center component
	var sprcc = z2.centerFactory.create( {cx: 0.5, cy: 0.5} );
	// position constraints component
	var sprpc = z2.positionConstraintsFactory.create( {minx: 16, maxx: game.scene.map.width-16, miny: 32, maxy: game.scene.map.height-32} );
	// physics body component
	var sprbody = z2.physicsBodyFactory.create( {aabb:[-32, -15, 32, 15], restitution:0.2, mass:1, resistance_x:5} );
	// collision group for the player to collide against
	var pcolg = z2.collisionGroupFactory.create( {entities:[]} );
	// tile map collision
	var cmc = z2.collisionMapFactory.create( {map: null, data: null} );

	// create the player sprite entity
	game.player = mgr.createEntity( [z2.renderableFactory, gravc, cmc, sprbody, player, sprv, sprp, sprsz, sprs, sprc, sprcc, sprr, sprpc, pcolg] );

	// start the walk animation
//	anims.play( 'walk' );
};

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
		z2.loader.queueAsset( 'man', 'assets/img/stylized.png' );
//		z2.loader.queueAsset( 'field', 'assets/snd/field.mp3' );
//		z2.loader.queueAsset( 'field', 'assets/snd/field.ogg' );
//		z2.loader.queueAsset( 'land', 'assets/snd/landing.mp3' );
//		z2.loader.queueAsset( 'land', 'assets/snd/landing.ogg' );
//		z2.loader.queueAsset( 'logo', 'assets/snd/logo.mp3' );
//		z2.loader.queueAsset( 'logo', 'assets/snd/logo.ogg' );
	},

	create : function()
	{
		// create a collision map
//		var collisionMap = z2.buildCollisionMap( this.map.layers[1].data, this.map.widthInTiles, this.map.heightInTiles, [0,1,2,3,4] );

		// create a collision map component
//		var cmc = z2.collisionMapFactory.create( {map: this.map, data: collisionMap} );
		// TODO: set the collision map on the sprites
		var cmc = game.player.getComponent( z2.collisionMapFactory.mask );
		cmc.map = this.map;
		cmc.data = this.map.collisionMap;

		// TODO: set the entities for collision groups
//		var pcolg = game.player.getComponent( z2.collisionGroupFactory.mask );
//		pcolg.entities = [];

		// follow the player sprite
//		this.view.follow_mode = z2.FOLLOW_MODE_TIGHT;
		this.view.follow_mode = z2.FOLLOW_MODE_PLATFORMER;
		var sprp = game.player.getComponent( z2.positionFactory.mask );
		this.view.target = sprp;

		// create a movement system
		var ms = z2.createMovementSystem( 200 );
		this.mgr.addSystem( ms );

//		z2.playSound( 'field', 0, 1, true );
//		z2.playSound( 'logo', 0, 1, true );
	},

	update : function( dt )
	{
	}
};


// create a Tiled map scene using our scene definition object
game.scene = new z2.TiledScene( canvas, 'assets/maps/level-1.json', level_one );

// start the scene
game.scene.start();

// start the main ecs loop
//z2.main( z2.ecsUpdate );
function mainloop( et )
{
	// TODO: problem with this is that ecsUpdate calculates the time delta, so
	// by intercepting here the dt doesn't get updated properly
	if( !paused )
		z2.ecsUpdate( et );
}
z2.main( mainloop );

})();

