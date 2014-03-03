// actionable.js
// Copyright 2013 Joshua C Shepard
// 'actionable' system
//
// TODO:
// - do we need this ???
// - setTile actionable (for SetTileTrigger)
// - actionable that sends a system a message (string) - can be used to initiate
// action etc. (have a 'message' component & check it in 'control' systems) (use
// for making cat start walking, making old man speak etc)
// -


(function()
{
	"use strict";

	z2.require( ['time', 'ecs'] );

	// create an "actionable" component factory
	z2.actionableFactory = z2.createComponentFactory();

	// create a factory for components that play a sound on 'action'
	z2.actionPlaySoundFactory = z2.createComponentFactory( {sound: null} );

	z2.createActionableSystem = function()
	{
		var time = 0;
		var pv = [0, 0];
		var aabb1 = [0, 0, 0, 0];
		var aabb2 = [0, 0, 0, 0];
		return new z2.System( 60, [z2.actionableFactory],
		{
//			init: function()
//			{
//			},
			update: function( e, dt )
			{
				// 'action' key is down, take action!
				if( z2.kbd.isDown( z2.kbd.Z ) )
				{
					// only allow the action key every quarter second or so
					var now = z2.time.now();
					if( now - time > 250 )
					{
						// if we have a body & pos component,
						// handle action only on collision with player
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
							if( !z2.testAabbVsAabb( aabb1, aabb2, pv ) )
								return;
						}

						time = now;

						// TODO: implement all types of actionables

						// play a sound?
//						var play = e.getComponent( z2.actionPlaySoundFactory );
//						if( play )
//						{
//							z2.playSound( play.sound );
//						}
					}
				}
			}
		});
	};

})();

