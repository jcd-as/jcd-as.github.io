// ball.js
// Copyright 2013 Joshua C Shepard
// (stone) ball entity code
//
// TODO:
// - 


zSquared.ball = function( z2 )
{
	"use strict";


	// factory function to create player sprite
	z2.Ball = function( obj )
	{
		var mgr = z2.manager.get();

		// image, texture & pixi sprite for player sprite:
		var s_img = z2.loader.getAsset( 'ball' );
//		var anims = new z2.AnimationSet();
//		anims.add( 'idle', [[0, 500], [1, 500]] );
		var sbasetexture = new PIXI.BaseTexture( s_img );
		var stexture = new PIXI.Texture( sbasetexture );
		var sprite = new PIXI.Sprite( stexture );
		game.view.add( sprite );

		// adjust position from Tiled upper-left coordinates to our center
		// coordinates
		var x = obj.x + obj.width/2;
		var y = obj.y + obj.height/2;

		var ball = mgr.createEntity( 
			[
				// can be rendered
				z2.renderableFactory, 
				// sprite component
//				z2.spriteFactory.create( {sprite:sprite, animations:anims} ),
				z2.spriteFactory.create( {sprite:sprite} ),
				// position component
				// (account for the fact that we're centering by adding half
				// width/height)
				z2.positionFactory.create( {x: x, y: y} ),
				// size component
				z2.sizeFactory.create( {width: 32, height: 32} ),
				// center component
				z2.centerFactory.create( {cx: 0.5, cy: 0.5} ),
				// velocity component
				z2.velocityFactory.create( {x:0, y:0} ),
				// gravity component
				z2.gravityFactory.create( {x: 0, y: 1000} ),
				// physics body component
				z2.physicsBodyFactory.create( {aabb:[-15, -15, 15, 15], restitution:0.3, mass:1} ),
				// resistance component
				z2.resistanceFactory.create( {x: 0.5} ),
				// tile map collision
				z2.collisionMapFactory.create( {map: null, data: null} ),
			] );

		// start the idle animation
//		anims.play( 'idle' );

		// add to the list of entities that can collide with the player sprite
		game.scene.collidables.push( ball );

		return ball;
	};

};


