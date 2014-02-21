// alarm.js
// Copyright 2013 Joshua C Shepard
// Alarm game objects for 'the source'
//
// TODO:
// -

(function()
{
	"use strict";

	z2.require( ['ecs'] );

	// create an "area" component factory
	z2.alarmFactory = z2.createComponentFactory( {call:null, period:NaN, repeating: false, target_name: null} );


	function createAlarmSystem()
	{
		if( game.scene.alarmSys )
			return;

		// create a trigger system
		game.scene.alarmSys = new z2.System( 60, [z2.alarmFactory],
		{
			update: function( e, dt )
			{
				var ar = e.getComponent( z2.alarmFactory );

				// get target if we don't yet have one
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
				}

				// get last triggered time
				if( ar.last_alarm === undefined )
					ar.last_alarm = 0;

				// already fired?
				if( ar.last_alarm !== 0 && !ar.repeating )
					return;

				// is it time to be triggered?
				if( z2.time.now() - ar.last_alarm > ar.period )
				{
					if( ar.call && typeof( ar.call ) == 'function' )
						ar.call( target );
					else if( z2[ar.call] && typeof( z2[ar.call] ) == 'function' )
						z2[ar.call]( target );

					// set last time triggered
					ar.last_alarm = z2.time.now();
				}
			}
		} );

		z2.manager.get().addSystem( game.scene.alarmSys );

		return game.scene.alarmSys;
	};

	// factory function to create Alarm
	z2.Alarm = function( obj )
	{
		var props = obj.properties;
		if( !props )
			return;

		// create an alarm
		var ar = z2.manager.get().createEntity( 
		[
			z2.alarmFactory.create(
			{
				call : props.call,
				period : +props.period,
				repeating : props.repeating === 'true',
				target_name : props.target
			} )
		] );

		createAlarmSystem();

		return ar;
	};

})();

