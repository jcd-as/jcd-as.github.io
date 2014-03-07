// jumper.js
// Copyright 2013 Joshua C Shepard
// 'slithy tove' entity code
//
// TODO:
// - doesn't "hit" player sprite
// - 


zSquared.jumper = function( z2 )
{
	// 'jumper' component
	"use strict";

	z2.require( ["time"] );

	// create a "jumper brain" component factory
	z2.jumperBrainFactory = z2.createComponentFactory( {fsm:null, jumpTimer:0} );

	var idlePeriod = 1500;
	var jumpVelocity = 600;

	var states =
	[
		{
			'name' : 'idle',
			'initial' : true,
			'events' :
			{
				'jump' : 'jumping'
			}
		},
		{
			'name' : 'jumping',
			'events' :
			{
				'stop' : 'idle'
			}
		}
	];

	function createJumperSystem()
	{
		if( game.scene.jumperSys )
			return;

		var aabb1 = [0, 0, 0, 0];
		var aabb2 = [0, 0, 0, 0];
		game.scene.jumperSys = new z2.System( 50, [z2.jumperBrainFactory, z2.velocityFactory, z2.physicsBodyFactory],
		{
			active : false,
			update: function( e, dt )
			{
				// get the physics body
				var bc = e.getComponent( z2.physicsBodyFactory );

				// get the 'brain'
				var brain = e.getComponent( z2.jumperBrainFactory );

				// update the FSM
				switch( brain.fsm.getState() )
				{
					case 'idle':
						// TODO: wait for idle period, then jump
						var now = z2.time.now();
						if( now - brain.jumpTimer > idlePeriod )
						{
							brain.jumpTimer = now;
							brain.fsm.consumeEvent( 'jump', e );
						}
						break;
					case 'jumping':
						{
							// if we've landed, stop
							if( bc.blocked_down )
								brain.fsm.consumeEvent( 'stop', e );
						}
						break;
				}
			},
			idle: function( e )
			{
				// TODO:
				var sprite = e.getComponent( z2.spriteFactory );
				sprite.animations.play( 'idle' );
			},
			jumping: function( e )
			{
				// start jump
				var sprite = e.getComponent( z2.spriteFactory );
				sprite.animations.play( 'jump' );
				// TODO: set frame
				var vc = e.getComponent( z2.velocityFactory );
				vc.y = -jumpVelocity;
			},
		} );
		z2.manager.get().addSystem( game.scene.jumperSys );
	}

	// factory function to create Jumper sprite
	z2.Jumper = function( obj )
	{
		var mgr = z2.manager.get();

		// create a system to control the cat
		createJumperSystem();

		// image, texture & pixi sprite for player sprite:
		var s_img = z2.loader.getAsset( 'slithy-tove' );
		var anims = new z2.AnimationSet();
		// idle is frame 0, jump is frame 1
		anims.add( 'jump', [[1, 2000]] );
		anims.add( 'idle', [[0, 2000]] );
		var sbasetexture = new PIXI.BaseTexture( s_img );
		var stexture = new PIXI.Texture( sbasetexture );
		var sprite = new PIXI.Sprite( stexture );
		game.view.add( sprite );

		// adjust position from Tiled upper-left coordinates to our center
		// coordinates
		var x = obj.x + obj.width/2;
		var y = obj.y + obj.height/2;

		var jumper = mgr.createEntity(
			[
				// can be rendered
				z2.renderableFactory,
				// use game input
				game.input,
				// jumper 'brain'
				z2.jumperBrainFactory.create( {fsm:new z2.StateMachine( states, game.scene.jumperSys), jumpTimer:z2.time.now()} ),
				// gravity component
				z2.gravityFactory.create( {x: 0, y: 1000} ),
				// sprite component
				z2.spriteFactory.create( {sprite:sprite, animations:anims} ),
				// velocity component
				z2.velocityFactory.create( {x: 0, y: 0, maxx: 200, maxy: 500} ),
				// resistance component
				z2.resistanceFactory.create( {x:100, y:0} ),
				// position component
				z2.positionFactory.create( {x: x, y: y} ),
				// scale component
				z2.scaleFactory.create( {sx: 1, sy: 1} ),
				// size (of sprite image) component
				z2.sizeFactory.create( {width: 32, height: 32} ),
				// center component
				z2.centerFactory.create( {cx: 0.5, cy: 0.5} ),
				// physics body component
				z2.physicsBodyFactory.create( {aabb:[-15, -15, 15, 15], restitution:0.2, mass:100} ),
				// collision group
				z2.collisionGroupFactory.create( {entities:game.collidables} ),
				// tile map collision
				z2.collisionMapFactory.create( {map: null, data: null} )
			] );

		// start the idle animation
		anims.play( 'idle' );

		// add to the list of entities that can collide with the player sprite
		game.collidables.push( jumper );

		return jumper;
	};

};


