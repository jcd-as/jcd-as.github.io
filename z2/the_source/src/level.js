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
				this.emitterSys = null;
				this.triggerSys = null;
				this.areaSys = null;
				this.alarmSys = null;
				this.jumperSys = null;

				// cut-scene object
				this.cut = null;

				// pre-create items that need to be in-place *before* maps and sprites
				// are created
				game.input = z2.inputFactory.create();
			},

			create : function()
			{
				// set the collision maps
				this.map._updateObjectCollisionMaps();

				// TODO: set the entities for collision groups
				var pcolg = game.player.getComponent( z2.collisionGroupFactory );
				pcolg.entities = this.collidables;

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

				// create a cut-scene object and start the cut-scene
				var type = z2.random( 0, 3, Math.round );
				var s;
				switch( type )
				{
					case 0:
						s = 'up';
						break;
					case 1:
						s = 'down';
						break;
					case 2:
						s = 'left';
						break;
					case 3:
						s = 'right';
						break;
				}
				this.cut = new z2.Swipe( s );
//				this.cut = new z2.Fade();
				this.cut.start();
			},

			update : function()
			{
				// only return true once the cut-scene is complete
				if( this.cut.complete )
					return true;
				else
					return this.cut.update();
			},

			destroy : function()
			{
				// clean up fields
				this.playerSys = null;
				this.catSys = null;
				this.oldmanSys = null;
				this.emitterSys = null;
				this.triggerSys = null;
				this.areaSys = null;
				this.alarmSys = null;
				this.jumperSys = null;
				this.cut = null;

				// remove all the level-specific assets from the loader
				var i;
				var assets = json.assets;
				for( i = 0; i < assets.length; i++ )
				{
					var asset = assets[i];
					z2.loader.deleteAsset( asset.key );
				}
				var sounds = json.sounds;
				for( i = 0; i < sounds.length; i++ )
				{
					var sound = sounds[i];
					z2.loader.deleteAsset( sound.key );
				}
				var spritesheets = json.spritesheets;
				for( i = 0; i < spritesheets.length; i++ )
				{
					var ss = spritesheets[i];
					z2.loader.deleteAsset( ss.key );
				}

				// TODO: anything else? ...
			}
		};
	};

};

