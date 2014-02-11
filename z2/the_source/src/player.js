// player.js
// Copyright 2013 Joshua C Shepard
// player entity code
//
// TODO:
// -


(function()
{
	"use strict";

	// create a "player control" component factory
	z2.playerControlFactory = z2.createComponentFactory();

	function createInputSystem( player )
	{
		z2.manager.get().addSystem( 
			new z2.System( 40, [z2.playerControlFactory, z2.inputFactory, z2.velocityFactory, z2.physicsBodyFactory],
			{
				init: function()
				{
					// initialize FSM
					this.fsm = new z2.StateMachine( this.states, this );
				},
				update: function( e, dt )
				{
					// get the velocity component
					var vc = e.getComponent( z2.velocityFactory.mask );

					// get the physics body
					var bc = e.getComponent( z2.physicsBodyFactory.mask );

					// get the scale component
					var sc = e.getComponent( z2.scaleFactory.mask );

					// get the sprite component
					var sprite = e.getComponent( z2.spriteFactory.mask );

					// get the input component
					var input = e.getComponent( z2.inputFactory.mask );

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
							this.fsm.consumeEvent( 'jump', vc, bc, sc, sprite );
						// TODO: this doesn't work, seems like every other frame this is
						// not true...
						// not touching ground ?
		//				else if( !bc.blocked_down )
		//					this.fsm.consumeEvent( 'fall', vc, bc );
						else if( input.left )
						{
							this.goLeft( vc, bc, sc, sprite );
						}
						else if( input.right )
						{
							this.goRight( vc, bc, sc, sprite );
						}
						else
						{
							// stop
							this.fsm.consumeEvent( 'stop', vc, bc, sc, sprite );
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
							this.fsm.consumeEvent( 'land', vc, bc, sc, sprite );
						}
						// can move side to side
						if( input.left )
						{
							if( sc && this.facing == 'right' )
								sc.sx *= -1; 
							this.facing = 'left';
							this.goLeft( vc, bc, sc, sprite );
						}
						else if( input.right )
						{
							if( sc && this.facing == 'left' )
								sc.sx *= -1; 
							this.facing = 'right';
							this.goRight( vc, bc, sc, sprite );
						}
						break;
					case 'idle':
						// reset horizontal velocity
		//					vc.x = 0;

						// can walk or jump
						if( jump )
							this.fsm.consumeEvent( 'jump', vc, bc, sc, sprite );
						else if( input.left )
						{
							if( sc && this.facing == 'right' )
								sc.sx *= -1; 
							this.facing = 'left';
							this.fsm.consumeEvent( 'left', vc, bc, sc, sprite );
						}
						else if( input.right )
						{
							if( sc && this.facing == 'left' )
								sc.sx *= -1; 
							this.facing = 'right';
							this.fsm.consumeEvent( 'right', vc, bc, sc, sprite );
						}
						break;
					default:
						break;
					}
					////////////////////////////
				},
				facing : 'right',
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
				idle : function( vc, bc, sc, sprite )
				{
					// set animation, facing
					var anims = sprite.animations;
					anims.stop();
				},
				walking : function( vc, bc, sc, sprite )
				{
					// set animation, facing
					var anims = sprite.animations;
					if( anims.playing != 'walk' )
						anims.play( 'walk' );
					if( this.facing == 'left' )
						this.goLeft( vc, bc, sc );
					else if( this.facing == 'right' )
						this.goRight( vc, bc, sc );
		//				else error
				},
				jumping : function( vc, bc, sc, sprite )
				{
					var anims = sprite.animations;
					if( anims.playing != 'jump' )
						anims.play( 'jump' );
					vc.y = -this.v_vel_inc;
					// set animation, facing
				},
				falling : function( vc, bc, sc, sprite )
				{
					// set animation, facing
					var anims = sprite.animations;
					anims.stop();
				},
				goLeft : function( vc, bc, sc, sprite )
				{
					vc.x += -this.h_vel_inc;
//					if( sc )
//						sc.sx = -1; 
				},
				goRight : function( vc, bc, sc, sprite )
				{
					vc.x += this.h_vel_inc;
//					if( sc )
//						sc.sx = 1; 
				},
			} )
		);
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
		game.scene.view.add( sprite );

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
				z2.positionConstraintsFactory.create( {minx: 16, maxx: game.scene.map.width-16, miny: 32, maxy: game.scene.map.height-32} ),
				// physics body component
				z2.physicsBodyFactory.create( {aabb:[-32, -15, 32, 15], restitution:0.2, mass:1, resistance_x:5} ),
				// collision group for the player to collide against
				z2.collisionGroupFactory.create( {entities:[]} ),
				// tile map collision
				z2.collisionMapFactory.create( {map: null, data: null} ),
			] );

		return game.player;
	};

})();
