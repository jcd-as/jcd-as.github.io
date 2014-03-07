// cat.js
// Copyright 2013 Joshua C Shepard
// cat entity code
//
// TODO:
// - add a state machine & more behaviour
// - 


zSquared.cat = function( z2 )
{
	// 'cat' component
	"use strict";

	// create a "cat brain" component factory
	z2.catBrainFactory = z2.createComponentFactory();


	function createCatSystem()
	{
		if( game.scene.catSys )
			return;

		var aabb1 = [0, 0, 0, 0];
		var aabb2 = [0, 0, 0, 0];
		game.scene.catSys = new z2.System( 50, [z2.catBrainFactory, z2.inputFactory, z2.velocityFactory, z2.physicsBodyFactory],
		{
			fsm : null,
			active : false,
			states : 
			[
				{
					'name' : 'idle',
					'initial' : true,
					'events' :
					{
						'left' : 'walking',
						'right' : 'walking'
					}
				},
				{
					'name' : 'walking',
					'events' :
					{
						'stop' : 'idle'
					}
				}
			],
			init: function()
			{
				// initialize FSM
				this.fsm = new z2.StateMachine( this.states, this );
			},
			update: function( e, dt )
			{
				var input = e.getComponent( z2.inputFactory );
				if( input.action )
				{
					if( this.actionize( e ) )
						input.action = false;
				}

				// update the FSM
				switch( this.fsm.getState() )
				{
					case 'idle':
						if( this.active )
						{
							this.fsm.consumeEvent( 'right', e );
						}
						break;
					case 'walking':
						{
							// just keep going
							var vc = e.getComponent( z2.velocityFactory );
							vc.x = 50;
						}
						break;
				}
			},
			idle: function( e )
			{
				var sprite = e.getComponent( z2.spriteFactory );
				sprite.animations.play( 'idle' );
			},
			walking: function( e )
			{
				// start walking
				var sprite = e.getComponent( z2.spriteFactory );
				sprite.animations.play( 'walk' );
				var vc = e.getComponent( z2.velocityFactory );
				vc.x = 50;
			},
			actionize: function( e )
			{
				// TODO: note that this code assumes only a single cat!
				// cat already active?
				if( this.active )
					return false;

				// test for overlap with player sprite
				var body = e.getComponent( z2.physicsBodyFactory );
				var pos = e.getComponent( z2.positionFactory );
				if( body && pos )
				{
					var pbody = game.player.getComponent( z2.physicsBodyFactory );
					var ppos = game.player.getComponent( z2.positionFactory );

					aabb1[0] = pbody.aabb[0] + ppos.y;
					aabb1[1] = pbody.aabb[1] + ppos.x;
					aabb1[2] = pbody.aabb[2] + ppos.y;
					aabb1[3] = pbody.aabb[3] + ppos.x;

					aabb2[0] = body.aabb[0] + pos.y;
					aabb2[1] = body.aabb[1] + pos.x;
					aabb2[2] = body.aabb[2] + pos.y;
					aabb2[3] = body.aabb[3] + pos.x;
					if( !z2.testAabbVsAabb( aabb1, aabb2 ) )
						return false;
				}
				z2.createMessage( "MEOW" );
				z2.playSound( 'meow' );
				// activate
				if( !this.active )
					this.active = true;
				return true;
			},
		} );
		z2.manager.get().addSystem( game.scene.catSys );
	}

	// factory function to create Cat sprite
	z2.Cat = function( obj )
	{
		var mgr = z2.manager.get();

		// create a system to control the cat
		createCatSystem();

		// image, texture & pixi sprite for player sprite:
		var s_img = z2.loader.getAsset( 'cat' );
		var anims = new z2.AnimationSet();
		anims.add( 'walk', [[0, 250], [1, 250], [2, 250], [3, 250]] );
		anims.add( 'idle', [[0, 250], [4, 250], [5, 250], [6, 250], [5, 250], [4, 250], [0, 750], [9, 250], [0, 500]] );
		var sbasetexture = new PIXI.BaseTexture( s_img );
		var stexture = new PIXI.Texture( sbasetexture );
		var sprite = new PIXI.Sprite( stexture );
		game.view.add( sprite );

		// adjust position from Tiled upper-left coordinates to our center
		// coordinates
		var x = obj.x + obj.width/2;
		var y = obj.y + obj.height/2;

		var cat = mgr.createEntity(
			[
				// can be rendered
				z2.renderableFactory,
				// use game input
				game.input,
				// cat 'brain'
				z2.catBrainFactory.create(),
				// gravity component
				z2.gravityFactory.create( {x: 0, y: 1000} ),
				// sprite component
				z2.spriteFactory.create( {sprite:sprite, animations:anims} ),
				// velocity component
				z2.velocityFactory.create( {x: 0, y: 0, maxx: 200, maxy: 500} ),
				// position component
				z2.positionFactory.create( {x: x, y: y} ),
				// scale component
				z2.scaleFactory.create( {sx: 1, sy: 1} ),
				// size (of sprite image) component
				z2.sizeFactory.create( {width: 32, height: 32} ),
				// center component
				z2.centerFactory.create( {cx: 0.5, cy: 0.5} ),
				// physics body component
				z2.physicsBodyFactory.create( {aabb:[-15, -15, 15, 15], restitution:0.2, mass:1} ),
				// tile map collision
				z2.collisionMapFactory.create( {map: null, data: null} )
			] );

		// start the idle animation
		anims.play( 'idle' );

		return cat;
	};

};

