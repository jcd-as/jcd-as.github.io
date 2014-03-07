// area.js
// Copyright 2013 Joshua C Shepard
// Area game objects for 'the source'
//
// TODO:
// -

zSquared.area = function( z2 )
{
	"use strict";

	z2.require( ['ecs'] );

	// create an "area" component factory
	z2.areaFactory = z2.createComponentFactory( {on_enter:null, on_exit:null, entity_name: null, target_name: null, entity_inside:false} );


	function createAreaSystem()
	{
		if( game.scene.areaSys )
			return;

		// create a trigger system
		var aabb1 = [0, 0, 0, 0];
		var aabb2 = [0, 0, 0, 0];
		game.scene.areaSys = new z2.System( 60, [z2.areaFactory, z2.sizeFactory, z2.positionFactory],
		{
			update: function( e, dt )
			{
				// handle action only on overlap with entity (player by default)
				var ar = e.getComponent( z2.areaFactory );
				var triggerer;
				if( ar.entity_name )
				{
					// have we retrieved the triggering entity already?
					if( ar.entity )
						triggerer = ar.entity;
					else if( ar.entity_name == 'player' )
						triggerer = game.player;
					// otherwise, look for it
					else
					{
						triggerer = z2.manager.get().getEntityByName( ar.entity_name );
						if( triggerer )
							ar.entity = triggerer;
					}
					// still not found?
					if( !triggerer )
						throw new Error( "Unable to find named entity '" + ar.entity_name + "' for Area" );
				}
				else
					triggerer = game.player;

				// target is also passed to the functions to operate on
				var target;
				if( ar.target_name )
				{
					// have we found the target already?
					if( ar.target )
						target = ar.target;
					else if( ar.target_name == 'player' )
						target = game.player;
					// else look for it
					else
					{
						target = z2.manager.get().getEntityByName( ar.target_name );
						if( target )
							ar.target = target;
					}
					// not found?
					if( !target )
						throw new Error( "Unable to find name target entity '" + ar.target_name + "' for Area" );
				}

				// area pos & size
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

				var collide = z2.testAabbVsAabb( aabb1, aabb2 );

				// TODO: is triggerer entering or exiting the area?
				// entered?
				if( collide && !ar.entity_inside )
				{
					ar.entity_inside = true;
					// call 'on_enter' function
					if( ar.on_enter && typeof( ar.on_enter ) == 'function' )
						ar.on_enter( triggerer, target );
					else if( z2[ar.on_enter] && typeof( z2[ar.on_enter] ) == 'function' )
						z2[ar.on_enter]( triggerer, target );
				}
				// exited?
				else if( !collide && ar.entity_inside )
				{
					ar.entity_inside = false;
					// call 'on_exit' function
					if( ar.on_exit && typeof( ar.on_exit ) == 'function' )
						ar.on_exit( triggerer, target );
					else if( z2[ar.on_exit] && typeof( z2[ar.on_exit] ) == 'function' )
						z2[ar.on_exit]( triggerer, target );
				}
			}
		});

		z2.manager.get().addSystem( game.scene.areaSys );

		return game.scene.areaSys;
	}

	// factory function to create Area
	z2.Area = function( obj )
	{
		var props = obj.properties;
		if( !props )
			return;

		// create an area
		var ar = z2.manager.get().createEntity( 
		[
			z2.areaFactory.create(
			{
				on_enter : props.on_enter,
				on_exit : props.on_exit,
				entity_name : props.entity,
				target_name : props.target
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

		createAreaSystem();

		return ar;
	};

};

