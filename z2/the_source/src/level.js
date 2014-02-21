// level.js
// Copyright 2013 Joshua C Shepard
// game level Scene object for 'the source' game,
// using the z-squared engine
//
// TODO:
// -

zSquared.level = function( z2 )
{
	"use strict";

	z2.level = function( json )
	{
		return {
			load : function()
			{
				var i;

				// load all the assets that don't require special handling
				// (images, fonts etc)
				var assets = json.assets;
				for( i = 0; i < assets.length; i++ )
				{
					var asset = assets[i];
					z2.loader.queueAsset( asset.key, asset.url );
				}
				// sounds
				// for firefox load ogg files, everyone else load mp3s
				var sounds = json.sounds;
				for( i = 0; i < sounds.length; i++ )
				{
					var sound = sounds[i];
					if( z2.device.firefox )
						z2.loader.queueAsset( sound.key, sound.name + ".ogg" );
					else
						z2.loader.queueAsset( sound.key, sound.name + ".mp3" );
				}
				// spritesheets
				var spritesheets = json.spritesheets;
				for( i = 0; i < spritesheets.length; i++ )
				{
					var ss = spritesheets[i];
					z2.loader.queueAsset( ss.key, ss.url, 'spritesheet', ss.width, ss.height );
				}
			},

			init : function()
			{
				// systems for this scene
				this.playerSys = null;
				this.catSys = null;
				this.oldmanSys = null;
				this.triggerSys = null;
				this.areaSys = null;
				this.alarmSys = null;

				// pre-create items that need to be in-place *before* maps and sprites
				// are created
				game.input = z2.inputFactory.create();
			},

			create : function()
			{
				// set the collision maps
				this.map._updateObjectCollisionMaps();

				// TODO: set the entities for collision groups
		//		var pcolg = game.player.getComponent( z2.collisionGroupFactory );
		//		pcolg.entities = [];

				// follow the player sprite
				game.view.follow_mode = z2.FOLLOW_MODE_PLATFORMER;
				var sprp = game.player.getComponent( z2.positionFactory );
				game.view.target = sprp;

				// create input system
				var is = z2.createInputSystem();
				z2.manager.get().addSystem( is );

				// create a message display system
				var msgs = z2.createMessageSystem();
				z2.manager.get().addSystem( msgs );

				// create a movement system
				var ms = z2.createMovementSystem( 20 );
				z2.manager.get().addSystem( ms );

				// start soundtrack for this level
		//		z2.playSound( 'field', 0, 1, true );
			}
		};
	};

// create an object defining our scene
// (load, create and update methods)
//var level_one = 
//{
//	json : 'assets/maps/level-1.json',
//
//	load : function()
//	{
//		z2.loader.queueAsset( 'man', 'stylized.png' );
////		z2.loader.queueAsset( 'field', 'field.mp3' );
////		z2.loader.queueAsset( 'field', 'field.ogg' );
////		z2.loader.queueAsset( 'land', 'landing.mp3' );
////		z2.loader.queueAsset( 'land', 'landing.ogg' );
////		z2.loader.queueAsset( 'logo', 'logo.mp3' );
////		z2.loader.queueAsset( 'logo', 'logo.ogg' );
//		z2.loader.queueAsset( 'meow', 'meow.mp3' );
////		z2.loader.queueAsset( 'meow', 'meow.ogg' );
//
//		z2.loader.queueAsset( 'click', 'click.mp3' );
////		z2.loader.queueAsset( 'click', 'click.ogg' );
//
//		z2.loader.queueAsset( 'oldman', 'oldman.png' );
//		z2.loader.queueAsset( 'cat', 'cat.png' );
//
//		z2.loader.queueAsset( 'firefly', 'firefly.png', 'spritesheet', 8, 8 );
////		z2.loader.queueAsset( 'raindrop', 'raindrop.png', 'spritesheet', 8, 8 );
//
//		z2.loader.queueAsset( 'font', 'open_sans_italic_20.fnt' );
//
//		// touchscreen control images
//		z2.loader.queueAsset( 'left', 'button_left.png' );
//		z2.loader.queueAsset( 'right', 'button_right.png' );
//		z2.loader.queueAsset( 'circle', 'button_circle.png' );
//		z2.loader.queueAsset( 'square', 'button_square.png' );
//	},
//
//	init : function()
//	{
//		// systems for this scene
//		this.playerSys = null;
//		this.catSys = null;
//		this.oldmanSys = null;
//		this.triggerSys = null;
//		this.areaSys = null;
//		this.alarmSys = null;
//
//		// pre-create items that need to be in-place *before* maps and sprites
//		// are created
//		game.input = z2.inputFactory.create();
//	},
//
//	create : function()
//	{
//		// set the collision maps
//		this.map._updateObjectCollisionMaps();
//
//		// TODO: set the entities for collision groups
////		var pcolg = game.player.getComponent( z2.collisionGroupFactory );
////		pcolg.entities = [];
//
//		// follow the player sprite
//		game.view.follow_mode = z2.FOLLOW_MODE_PLATFORMER;
//		var sprp = game.player.getComponent( z2.positionFactory );
//		game.view.target = sprp;
//
//		// create input system
//		var is = z2.createInputSystem();
//		z2.manager.get().addSystem( is );
//
//		// create a message display system
//		var msgs = z2.createMessageSystem();
//		z2.manager.get().addSystem( msgs );
//
//		// create a movement system
//		var ms = z2.createMovementSystem( 20 );
//		z2.manager.get().addSystem( ms );
//
//		// start soundtrack for this level
////		z2.playSound( 'field', 0, 1, true );
//	},
//};

};

