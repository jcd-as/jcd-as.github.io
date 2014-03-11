// player.js
// Copyright 2013 Joshua C Shepard
// player entity code
//
// TODO:
// -


zSquared.player = function( z2 )
{
	"use strict";

	// create a "player control" component factory
	z2.playerControlFactory = z2.createComponentFactory( {fsm:null} );

	var states =
	[
		{
			'name' : 'idle',
			'initial' : true,
			'events' :
			{
				'left' : 'walking',
				'right' : 'walking',
				'jump' : 'jumping',
				'hit' : 'stunned'
			}
		},
		{
			'name' : 'walking',
			'events' :
			{
				'stop' : 'idle',
				'jump' : 'jumping',
				'hit' : 'stunned'
			}
		},
		{
			'name' : 'jumping',
			'events' :
			{
				'land' : 'recovering',
				'hit' : 'stunned'
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
			'name' : 'stunned',
			'events' :
			{
				'hit' : 'stunned',
				'recover' : 'idle'
			}
		}

	];

	// velocity increments (in pixels-per-second)
	var h_vel_inc = 850;
	var v_vel_inc = 440;
	var v_vel_dec = 750;
	var hit_inc = 1000;

	// 'stunned' (hit by enemy) vars
	var stunnedTimer = 0;
	var stunnedTimeout = 500;

	// 'recovery' (landed from jump) vars
	var recoveryTimer = 0;
	var recoveryTimeout = 150;

	// player facing 
	var facing = 'right';

	function createInputSystem( player )
	{
		if( game.scene.playerSys )
			throw new Error( "Trying to create multiple player input systems!" );

		game.scene.playerSys = new z2.System( 40, [z2.playerControlFactory, z2.inputFactory, z2.velocityFactory, z2.physicsBodyFactory],
		{
			init: function()
			{
				// initialize FSM
//				this.fsm = new z2.StateMachine( this.states, this );
			},
			update: function( e, dt )
			{
//				if( z2.kbd.isDown( z2.kbd.SPACEBAR ) )
//				{
//					game.scene.restart();
//					return;
//				}

				// get the velocity component
				var vc = e.getComponent( z2.velocityFactory );

				// get the physics body
				var bc = e.getComponent( z2.physicsBodyFactory );

				// get the scale component
				var sc = e.getComponent( z2.scaleFactory );

				// get the sprite component
				var sprite = e.getComponent( z2.spriteFactory );

				// get the input component
				var input = e.getComponent( z2.inputFactory );

				// get the 'player control' component
				var pc = e.getComponent( z2.playerControlFactory );

				// check input
				var jump = false;
				// only jump when standing on 'ground' and haven't landed w/in
				// a certain period of time (recovery period)
				if( (bc.blocked_down || bc.was_blocked_down) && input.jump && z2.time.now() - recoveryTimer > recoveryTimeout )
					jump = true;

				var state = pc.fsm.getState();
				switch( state )
				{
				case 'walking':
					// reset horizontal velocity
//					vc.x = 0;

					// can jump, keep walking or stop
					if( jump )
						pc.fsm.consumeEvent( 'jump', vc, bc, sc, sprite, dt );
					else if( input.left )
					{
						this.goLeft( vc, bc, sc, sprite, dt );
					}
					else if( input.right )
					{
						this.goRight( vc, bc, sc, sprite, dt );
					}
					else
					{
						// stop
						pc.fsm.consumeEvent( 'stop', vc, bc, sc, sprite, dt );
					}
					break;
				case 'jumping':
					// reset horizontal velocity
//					vc.x = 0;
					// for the first half-second of the jump...
					var t = z2.time.now();
					// if jump button is *not* down, reduce upward velocity
					if( !input.jump && vc.y < 0 )
					{
						vc.y += (v_vel_dec * (dt * 0.001));
//						vc.y = 0;
					}

					// land?
					if( bc.blocked_down )
					{
//						z2.playSound( 'land' );
						pc.fsm.consumeEvent( 'land', vc, bc, sc, sprite, dt );
					}
					// can move side to side
					if( input.left )
					{
						if( sc && facing == 'right' )
							sc.sx *= -1; 
						facing = 'left';
						this.goLeft( vc, bc, sc, sprite, dt );
					}
					else if( input.right )
					{
						if( sc && facing == 'left' )
							sc.sx *= -1; 
						facing = 'right';
						this.goRight( vc, bc, sc, sprite, dt );
					}
					break;
				case 'stunned':
					// can't do anything until we recover
					if( z2.time.now() - stunnedTimer > stunnedTimeout )
						pc.fsm.consumeEvent( 'recover', vc, bc, sc, sprite, dt );
					break;
				case 'recovering':
					// recover straight-away
					pc.fsm.consumeEvent( 'recover', vc, bc, sc, sprite, dt );
					break;
				case 'idle':
					// reset horizontal velocity
//						vc.x = 0;

					// can walk or jump
					if( jump )
						pc.fsm.consumeEvent( 'jump', vc, bc, sc, sprite, dt );
					else if( input.left )
					{
						if( sc && facing == 'right' )
							sc.sx *= -1; 
						facing = 'left';
						pc.fsm.consumeEvent( 'left', vc, bc, sc, sprite, dt );
					}
					else if( input.right )
					{
						if( sc && facing == 'left' )
							sc.sx *= -1; 
						facing = 'right';
						pc.fsm.consumeEvent( 'right', vc, bc, sc, sprite, dt );
					}
					break;
				default:
					break;
				}
				////////////////////////////
			},
			// state handlers
			idle : function( vc, bc, sc, sprite, dt )
			{
				// set animation, facing
				var anims = sprite.animations;
				anims.stop();
			},
			walking : function( vc, bc, sc, sprite, dt )
			{
				// set animation, facing
				var anims = sprite.animations;
				if( anims.playing != 'walk' )
					anims.play( 'walk' );
				if( facing == 'left' )
					this.goLeft( vc, bc, sc, sprite, dt );
				else if( facing == 'right' )
					this.goRight( vc, bc, sc, sprite, dt );
			},
			jumping : function( vc, bc, sc, sprite, dt )
			{
				// reset the recovery timer
				recoveryTimer = 0;

				// set animation, facing
				var anims = sprite.animations;
				if( anims.playing != 'jump' )
					anims.play( 'jump' );
				// start the sprite jumping
				vc.y = -v_vel_inc;
			},
			stunned : function( vc, bc, sc, sprite, dt )
			{
				// if we're not already stunned, start the timer
				var now = z2.time.now();
				if( now - stunnedTimer < stunnedTimeout )
					return;
				stunnedTimer = now;
				// play the animation
				var anims = sprite.animations;
				anims.play( 'stunned' );
			},
			recovering : function( vc, bc, sc, sprite, dt )
			{
				// start the timer
				recoveryTimer = z2.time.now();
				// stop animation
				var anims = sprite.animations;
				anims.stop();
			},
			goLeft : function( vc, bc, sc, sprite, dt )
			{
				vc.x += -h_vel_inc * (dt * 0.001);
			},
			goRight : function( vc, bc, sc, sprite, dt )
			{
				vc.x += h_vel_inc * (dt * 0.001);
			},
		} );
		z2.manager.get().addSystem( game.scene.playerSys );
	}

	// collision callback
	function collide( e1, e2 )
	{
		var player;
		var other;
		// is one of the entities the player?
		var pc = e1.getComponent( z2.playerControlFactory );
		if( pc )
		{
			player = e1;
			other = e2;
		}
		else
		{
			pc = e2.getComponent( z2.playerControlFactory );
			if( pc )
			{
				player = e2;
				other = e1;
			}
			// no? bail
			else
				return;
		}
	
		// 'jumper'
		var jb = other.getComponent( z2.jumperBrainFactory );
		if( jb )
		{
			// TODO: also reverse y velocity
			// TODO: if player is *already* stunned, throw in *same* direction!
			// throw player back
			var vc = player.getComponent( z2.velocityFactory );
			if( vc.x < 0 )
				vc.x += hit_inc;
			else if( vc.x > 0 )
				vc.x -= hit_inc;
			else
			{
				if( facing == 'right' )
					vc.x -= hit_inc;
				else
					vc.x += hit_inc;
			}

			var sprite = player.getComponent( z2.spriteFactory );
			pc.fsm.consumeEvent( 'hit', vc, null, null, sprite );
		}
	}

	// factory function to create player sprite
	z2.Player = function( obj )
	{
		var mgr = z2.manager.get();

		// create an input system
		createInputSystem();

		// image, texture & pixi sprite for player sprite:
		var s_img = z2.loader.getAsset( 'man' );
		var anims = new z2.AnimationSet();
		anims.add( 'walk', [[0, 250], [1, 250]] );
		anims.add( 'jump', [[4, 250], [5, 250]] );
		anims.add( 'stunned', [[8, 2000]] );
		var sbasetexture = new PIXI.BaseTexture( s_img );
		var stexture = new PIXI.Texture( sbasetexture );
		var sprite = new PIXI.Sprite( stexture );
		game.view.add( sprite );

		// adjust position from Tiled upper-left coordinates to our center
		// coordinates
		var x = obj.x + obj.width/2;
		var y = obj.y + obj.height/2;

		game.player = mgr.createEntity( 
			[
				// make renderable
				z2.renderableFactory,
				// the "one" central input handler
				z2.inputHandlerFactory,
				// reads the input
				game.input,
				// "player control" component
				z2.playerControlFactory.create( {fsm: new z2.StateMachine( states, game.scene.playerSys )} ),
				// gravity component
				z2.gravityFactory.create( {x: 0, y: 1000} ),
				// resistance component
				z2.resistanceFactory.create( {x: 5} ),
				// sprite component
				z2.spriteFactory.create( {sprite:sprite, animations:anims} ),
				// velocity component
				z2.velocityFactory.create( {x: 0, y: 0, maxx: 500, maxy: 500} ),
				// position component
				z2.positionFactory.create( {x: x, y: y} ),
				// rotation component
				z2.rotationFactory.create( {theta: 0} ),
				//z2.rotationFactory.create( {theta: z2.math.d2r(10)} );
				// scale component
				z2.scaleFactory.create( {sx: 1, sy: 1} ),
				// size component
				z2.sizeFactory.create( {width: 64, height: 64} ),
				// center component
				z2.centerFactory.create( {cx: 0.5, cy: 0.5} ),
				// position constraints component
				z2.positionConstraintsFactory.create( {minx: 16, maxx: game.scene.map.worldWidth-16, miny: 32, maxy: game.scene.map.worldHeight-32} ),
				// physics body component
				z2.physicsBodyFactory.create( {aabb:[-32, -15, 32, 15], restitution:0.2, mass:1, collisionCallback:collide} ),
				// collision group for the player to collide against
				z2.collisionGroupFactory.create( {entities:[]} ),
				// tile map collision
				z2.collisionMapFactory.create( {map: null, data: null} ),
			] );

		// add to the list of collidable entities
		game.scene.collidables.push( game.player );

		return game.player;
	};

};

