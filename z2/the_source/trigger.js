// trigger.js
// Copyright 2013 Joshua C Shepard
// Trigger game objects for 'the source'
//
// TODO:
// - SetTileTrigger: don't assume trigger tile is on main layer
// -

(function()
{
	"use strict";

	z2.require( ['ecs'] );

	// create an "triggerable" component factory
	z2.triggerableFactory = z2.createComponentFactory( {on:null, off:null, is_on: false, entity_name: null, on_touch: false} );


	function createTriggerSystem()
	{
		if( game.scene.triggerSys )
			return;

		// create a trigger system
		var aabb1 = [0, 0, 0, 0];
		var aabb2 = [0, 0, 0, 0];
		game.scene.triggerSys = new z2.System( 60, [z2.triggerableFactory, z2.sizeFactory, z2.positionFactory, z2.inputFactory],
		{
			update: function( e, dt )
			{
				// handle action only on overlap with entity (player by default)
				var tr = e.getComponent( z2.triggerableFactory );
				var triggerer;
				if( tr.entity_name )
				{
					// have we retrieved the triggering entity already?
					if( tr.entity )
						triggerer = tr.entity;
					else if( tr.entity_name == 'player' )
						triggerer = game.player;
					// otherwise, look for it
					else
					{
						triggerer = z2.manager.get().getEntityByName( tr.entity_name );
						if( triggerer )
							tr.entity = triggerer;
					}
					// still not found?
					if( !triggerer )
						throw new Error( "Unable to find named entity '" + tr.entity_name + "' for trigger" );
				}
				else
					triggerer = game.player;

				// trigger pos & size
				var size = e.getComponent( z2.sizeFactory );
				var pos = e.getComponent( z2.positionFactory );

				// triggerer pos & bounding box
				var pbody = triggerer.getComponent( z2.physicsBodyFactory );
				var ppos = triggerer.getComponent( z2.positionFactory );

				aabb1[0] = pbody.aabb[0] + ppos.y;
				aabb1[1] = pbody.aabb[1] + ppos.x;
				aabb1[2] = pbody.aabb[2] + ppos.y;
				aabb1[3] = pbody.aabb[3] + ppos.x;

				aabb2[0] = pos.y;
				aabb2[1] = pos.x;
				aabb2[2] = pos.y + size.height;
				aabb2[3] = pos.x + size.width;

				if( !z2.testAabbVsAabb( aabb1, aabb2 ) )
					return;

				// on touch or on action?
				if( !tr.on_touch )
				{
					var input = e.getComponent( z2.inputFactory );
					// 'action' key is down, take action!
					if( !input.action )
						return;
				}

				// on or off?
				if( tr.is_on )
				{
					// turn off
					tr.is_on = false;
					// call 'off' fcn
					if( tr.off && typeof( tr.off ) == 'function' )
					   tr.off();
				   else if( z2[tr.off] && typeof( z2[tr.off] ) == 'function' )
						z2[tr.off]();
				}
				else
				{
					// turn on
					tr.is_on = true;
					// call 'on' fcn
					if( tr.on && typeof( tr.on ) == 'function' )
					   tr.on();
				   else if( z2[tr.on] && typeof( z2[tr.on] ) == 'function' )
						z2[tr.on]();
				}
			}
		});

		z2.manager.get().addSystem( game.scene.triggerSys );

		return game.scene.triggerSys;
	}

	// factory function to create Trigger
	z2.Trigger = function( obj )
	{
		var props = obj.properties;
		if( !props )
			return;

		// create a trigger
		var tr = z2.manager.get().createEntity( 
		[
			z2.triggerableFactory.create(
			{
				on : z2[props.on],
				off : z2[props.off],
				entity_name : props.entity,
				is_on : props.is_on == 'true',
				on_touch : props.trigger_on_touch == 'true'
			} ),
			z2.positionFactory.create(
			{
				x : obj.x,
				y : obj.y
			} ),
			z2.sizeFactory.create(
			{
				width : obj.width,
				height : obj.height
			} )
		] );

		createTriggerSystem();

		return tr;
	};

	/* Create a trigger that shows a message (text)
	 * @function z2#MsgTrigger
	 * <p>Tiled properties:</p>
	 * <ul>
	 * <li>text: Message text to be displayed
	 * <li>is_on: boolean - (start) in the 'on' state?</li>
	 * <li>trigger_on_touch: boolean - Is this trigger turned on merely by contacting it</li>
	 * </ul>
	 */
	z2.MsgTrigger = function( obj )
	{
		var showMsg = function( text )
		{
			return function()
			{
				z2.createMessage( text );
			};
		};

		var props = obj.properties;
		if( !props )
			return;

		// create a trigger 
		var tr = z2.manager.get().createEntity( 
		[
			z2.triggerableFactory.create(
			{
				on : showMsg( props.text ),
				off : null,
				is_on : props.is_on == 'true',
				on_touch : props.trigger_on_touch == 'true'
			} ),
			z2.positionFactory.create(
			{
				x : obj.x,
				y : obj.y
			} ),
			z2.sizeFactory.create(
			{
				width : obj.width,
				height : obj.height
			} ),
			game.input
		] );

		createTriggerSystem();

		return tr;
	};

	/* Create a trigger that resets the level back to its initial state
	 * @function z2#ResetLevelTrigger
	 * <p>Tiled properties:</p>
	 * <ul>
	 * <li>is_on: boolean - (start) in the 'on' state?</li>
	 * <li>entity: string - Name of the Entity that can flip this trigger</li>
	 * <li>trigger_on_touch: boolean - Is this trigger turned on merely by contacting it</li>
	 * </ul>
	 */
	z2.ResetLevelTrigger = function( obj )
	{
		var reset = function()
		{
			game.scene.restart();
		};

		var props = obj.properties;
		if( !props )
			return;

		// create a trigger 
		var tr = z2.manager.get().createEntity( 
		[
			z2.triggerableFactory.create(
			{
				on : reset,
				off : null,
				is_on : props.is_on == 'true',
				entity_name : props.entity,
				on_touch : props.trigger_on_touch !== 'false'
			} ),
			z2.positionFactory.create(
			{
				x : obj.x,
				y : obj.y
			} ),
			z2.sizeFactory.create(
			{
				width : obj.width,
				height : obj.height
			} ),
			game.input
		] );

		createTriggerSystem();

		return tr;
	};

	/* Create a trigger that sets tiles in the tile map
	 * @function z2#SetTileTrigger
	 * <p>Tiled properties:</p>
	 * <ul>
	 * <li>target_x: x coordinate of the target tile</li>
	 * <li>target_y: y coordinate of the target tile</li>
	 * <li>new_tile: The index of the tile that will replace the target tile</li>
	 * <li>new_trigger_tile: The index of the tile that will replace the tile at the trigger's location (so the player can see the trigger state)</li>
	 * <li>entity: string - Name of the Entity that can flip this trigger</li>
	 * <li>trigger_on_touch: boolean - Is this trigger turned on merely by contacting it</li>
	 * </ul>
	 */
	z2.SetTileTrigger = function( obj )
	{
		// TODO: don't assume trigger tile is on main layer

		var props = obj.properties;
		if( !props )
			return;

		var x = obj.x;
		var y = obj.y;
		var width = obj.width;
		var height = obj.height;
		var targetX = +props.target_x;
		var targetY = +props.target_y;
		// JSON for new tiles has tile, layer, x and y properties
		var newTile = [null, null, null];
		if( props.new_tile_1 ) newTile[1] = JSON.parse( props.new_tile_1 );
		if( props.new_tile_2 ) newTile[2] = JSON.parse( props.new_tile_2 );
		if( props.new_tile_3 ) newTile[3] = JSON.parse( props.new_tile_3 );
		// TODO: don't assume trigger tile is on main layer
		var newTriggerTile = +props.new_trigger_tile;
		var soundEffect = props.sound_effect;
		var volume = +props.volume || 1;

		// vars to capture inside closure
		var origTile = [null, null, null];
		var origLyr = [null, null, null];
		var origTriggerTile;
		var map = game.scene.map;
		var ml = map.mainLayer;
		var tw = map.tileWidth;
		var th = map.tileHeight;
		var setTile = function()
		{
			// play the sound
			if( soundEffect )
				z2.playSound( soundEffect, 0, volume );

			// set the tiles
			var lyr, tile, tilex, tiley;
			var setTileLambda = function( i )
			{
				lyr = z2.findByName( map.layers, newTile[i].layer );			
				origLyr[i] = lyr;

				// save original tile
				origTile[i] = lyr.data[targetY * map.widthInTiles + targetX];

				// set new tile
				lyr.data[newTile[i].y * map.widthInTiles + newTile[i].x] = newTile[i].tile;
				// force the layer to be re-drawn
				lyr.forceDirty();

				// collision layer?
				if( lyr.solid )
				{
					// re-generate collision map
					map._buildCollisionMap( lyr.data );
					map._updateObjectCollisionMaps();
				}
			};
			if( newTile[1] )
				setTileLambda( 1 );
			if( newTile[2] )
				setTileLambda( 2 );
			if( newTile[3] )
				setTileLambda( 3 );

			// set the trigger tile
			if( newTriggerTile )
			{
				// TODO: don't assume trigger tile is on main layer
				// save original tile
				origTriggerTile = ml.data[y/th * map.widthInTiles + x/tw];
				// set new tile
				ml.data[y/th * map.widthInTiles + x/tw] = newTriggerTile;
				// TODO: this could be repetitive & wasteful
				// (i.e. we may have already done this for the main layer)
				ml.forceDirty();
			}
		};
		var resetTile = function()
		{
			// play the sound
			if( soundEffect )
				z2.playSound( soundEffect, 0, volume );

			var resetTileLambda = function( i )
			{
				// (re)set tile
				origLyr[i].data[targetY * map.widthInTiles + targetX] = origTile[i];
				// force the layer to be re-drawn
				origLyr[i].forceDirty();

				// collision layer?
				if( origLyr[i].solid )
				{
					// re-generate collision map
					map._buildCollisionMap( origLyr[i].data );
					map._updateObjectCollisionMaps();
				}
			};
			if( origTile[1] )
			{
				resetTileLambda( 1 );
			}
			if( origTile[2] )
			{
				resetTileLambda( 2 );
			}
			if( origTile[3] )
			{
				resetTileLambda( 3 );
			}
			if( origTriggerTile )
			{
				// TODO: don't assume trigger is on main layer
				// (re)set tile
				ml.data[y/th * map.widthInTiles + x/tw] = origTriggerTile;
				// TODO: this could be repetitive & wasteful
				// (i.e. we may have already done this for the main layer)
				// force the layer to be re-drawn
				ml.forceDirty();
			}
		};

		// create a trigger 
		var tr = z2.manager.get().createEntity( 
		[
			z2.triggerableFactory.create(
			{
				on : setTile,
				off : resetTile,
				is_on : props.is_on == 'true',
				entity_name : props.entity,
				on_touch : props.trigger_on_touch == 'true'
			} ),
			z2.positionFactory.create(
			{
				x : obj.x,
				y : obj.y
			} ),
			z2.sizeFactory.create(
			{
				width : obj.width,
				height : obj.height
			} ),
			game.input
		] );

		createTriggerSystem();

		return tr;
	};



})();

