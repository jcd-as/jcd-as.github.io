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
	z2.playerControlFactory = z2.createComponentFactory();


	function createInputSystem( player )
	{
		if( game.scene.playerSys )
			throw new Error( "Trying to create multiple player input systems!" );

		game.scene.playerSys = new z2.System( 40, [z2.playerControlFactory, z2.inputFactory, z2.velocityFactory, z2.physicsBodyFactory],
		{
			init: function()
			{
				// initialize FSM
				this.fsm = new z2.StateMachine( this.states, this );
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

				// check input
				var jump = false;
				// only jump when standing on 'ground'
				if( bc.blocked_down && input.jump )
					jump = true;

				var state = this.fsm.getState();
				switch( state )
				{
				case 'walking':
					// reset horizontal velocity
	//					vc.x = 0;

					// can jump, fall, keep walking or stop
					if( jump )
						this.fsm.consumeEvent( 'jump', vc, bc, sc, sprite, dt );
					// TODO: this doesn't work, seems like every other frame this is
					// not true...
					// not touching ground ?
	//				else if( !bc.blocked_down )
	//					this.fsm.consumeEvent( 'fall', vc, bc );
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
						this.fsm.consumeEvent( 'stop', vc, bc, sc, sprite, dt );
					}
					break;
				case 'jumping':
				case 'falling':
					// reset horizontal velocity
	//					vc.x = 0;
					// for the first half-second of the jump...
					var t = z2.time.now();
//					if( t - this.jumpTimer < 500 )
					{
						// if jump button is *not* down, reduce upward velocity
						if( !input.jump && vc.y < 0 )
						{
//							vc.y += (this.v_vel_dec / dt);
							vc.y = 0;
						}
					}

					// if the jump button is
					// land?
					if( bc.blocked_down )
					{
	//					z2.playSound( 'land' );
						this.fsm.consumeEvent( 'land', vc, bc, sc, sprite, dt );
					}
					// can move side to side
					if( input.left )
					{
						if( sc && this.facing == 'right' )
							sc.sx *= -1; 
						this.facing = 'left';
						this.goLeft( vc, bc, sc, sprite, dt );
					}
					else if( input.right )
					{
						if( sc && this.facing == 'left' )
							sc.sx *= -1; 
						this.facing = 'right';
						this.goRight( vc, bc, sc, sprite, dt );
					}
					break;
				case 'idle':
					// reset horizontal velocity
	//					vc.x = 0;

					// can walk or jump
					if( jump )
						this.fsm.consumeEvent( 'jump', vc, bc, sc, sprite, dt );
					else if( input.left )
					{
						if( sc && this.facing == 'right' )
							sc.sx *= -1; 
						this.facing = 'left';
						this.fsm.consumeEvent( 'left', vc, bc, sc, sprite, dt );
					}
					else if( input.right )
					{
						if( sc && this.facing == 'left' )
							sc.sx *= -1; 
						this.facing = 'right';
						this.fsm.consumeEvent( 'right', vc, bc, sc, sprite, dt );
					}
					break;
				default:
					break;
				}
				////////////////////////////
			},
			facing : 'right',
			// velocity increments (in pixels-per-second)
			h_vel_inc : 225,
			v_vel_inc : 440,
			v_vel_dec : 750,
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
				if( this.facing == 'left' )
					this.goLeft( vc, bc, sc, sprite, dt );
				else if( this.facing == 'right' )
					this.goRight( vc, bc, sc, sprite, dt );
			},
			jumping : function( vc, bc, sc, sprite, dt )
			{
				var anims = sprite.animations;
				if( anims.playing != 'jump' )
					anims.play( 'jump' );
				// start the sprite jumping
				this.jumpTimer = z2.time.now();
				vc.y = -this.v_vel_inc;
				// set animation, facing
			},
			falling : function( vc, bc, sc, sprite, dt )
			{
				// set animation, facing
				var anims = sprite.animations;
				anims.stop();
			},
			goLeft : function( vc, bc, sc, sprite, dt )
			{
				vc.x += -this.h_vel_inc/dt;
			},
			goRight : function( vc, bc, sc, sprite, dt )
			{
				vc.x += this.h_vel_inc/dt;
			},
		} );
		z2.manager.get().addSystem( game.scene.playerSys );
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
				z2.playerControlFactory.create(),
				// gravity component
				z2.gravityFactory.create( {x: 0, y: 1000} ),
				// resistance component
				z2.resistanceFactory.create( {x: 5} ),
				// sprite component
				z2.spriteFactory.create( {sprite:sprite, animations:anims} ),
				// velocity component
				z2.velocityFactory.create( {x: 0, y: 0, maxx: 200, maxy: 500} ),
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
				z2.physicsBodyFactory.create( {aabb:[-32, -15, 32, 15], restitution:0.2, mass:1} ),
				// collision group for the player to collide against
				z2.collisionGroupFactory.create( {entities:[]} ),
				// tile map collision
				z2.collisionMapFactory.create( {map: null, data: null} ),
			] );

		return game.player;
	};

};

