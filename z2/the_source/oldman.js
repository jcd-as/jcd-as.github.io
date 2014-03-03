// oldman.js
// Copyright 2013 Joshua C Shepard
// old man entity code
//
// TODO:
// - 


(function()
{
	"use strict";

	// create a "oldman brain" component factory
	z2.oldmanBrainFactory = z2.createComponentFactory();


	function createOldmanSystem()
	{
		if( game.scene.oldmanSys )
			return;

		var aabb1 = [0, 0, 0, 0];
		var aabb2 = [0, 0, 0, 0];
		game.scene.oldmanSys = new z2.System( 50, [z2.oldmanBrainFactory, z2.inputFactory, z2.physicsBodyFactory],
		{
			update: function( e, dt )
			{
				var input = e.getComponent( z2.inputFactory );
				if( input.action )
				{
					if( this.actionize( e ) )
						input.action = false;
				}
			},
			actionize: function( e )
			{
				// don't allow if there is a msg showing already
				if( z2.isMessageVisible() )
					return false;

				// do we have messages to choose from?
				var msgs = e.getComponent( z2.messagesFactory );
				if( msgs && msgs.messages && msgs.messages.length > 0 )
				{
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

					// get a random message
//						var rnd = 0 | Math.random() * (msgs.messages.length-1);
//						z2.createMessage( msgs.messages[rnd] );
					z2.createMessage( msgs.messages[0] );
					return true;
				}
			},
		} );
		z2.manager.get().addSystem( game.scene.oldmanSys );
	}


	// factory function to create player sprite
	z2.OldMan = function( obj )
	{

		// create a system to control the oldman
		createOldmanSystem();

		var mgr = z2.manager.get();

		// image, texture & pixi sprite for player sprite:
		var s_img = z2.loader.getAsset( 'oldman' );
		var anims = new z2.AnimationSet();
		anims.add( 'idle', [[0, 500], [1, 500]] );
		var sbasetexture = new PIXI.BaseTexture( s_img );
		var stexture = new PIXI.Texture( sbasetexture );
		var sprite = new PIXI.Sprite( stexture );
		game.view.add( sprite );

		// adjust position from Tiled upper-left coordinates to our center
		// coordinates
		var x = obj.x + obj.width/2;
		var y = obj.y + obj.height/2;

		var oldman = mgr.createEntity( 
			[
				// can be rendered
				z2.renderableFactory, 
				// uses the input
				game.input,
				// oldman "brain" 
				z2.oldmanBrainFactory.create(),
				// sprite component
				z2.spriteFactory.create( {sprite:sprite, animations:anims} ),
				// position component
				// (account for the fact that we're centering by adding half
				// width/height)
				z2.positionFactory.create( {x: x, y: y} ),
				// size component
				z2.sizeFactory.create( {width: 64, height: 64} ),
				// center component
				z2.centerFactory.create( {cx: 0.5, cy: 0.5} ),
				// physics body component
				z2.physicsBodyFactory.create( {aabb:[-32, -15, 30, 15], restitution:0, mass:1} ),
				// tile map collision
				z2.collisionMapFactory.create( {map: null, data: null} ),
				// messages component
				z2.messagesFactory.create( { messages:[obj.properties.msg] } )
			] );

		// start the idle animation
		anims.play( 'idle' );

		return oldman;
	};

})();

