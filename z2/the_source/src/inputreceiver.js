// inputreceiver.js
// Copyright 2013 Joshua C Shepard
// input receiver system
//
// TODO:
// -


zSquared.inputreceiver = function( z2 )
{
	"use strict";

	// require z2 modules
	z2.require( ["input"] );

	// an "input handler" component factory - only to be used by ONE entity,
	// (usually the "player" sprite) which will handle getting the input for 
	// the frame!
	z2.inputHandlerFactory = z2.createComponentFactory();

	// create a "input receiver" component factory
	z2.inputFactory = z2.createComponentFactory( 
		{jump: false, action: false, left: false, right: false}
	);

	z2.createInputSystem = function()
	{
		return new z2.System( 10, [z2.inputHandlerFactory, z2.inputFactory],
		{
			init: function()
			{
				// initialize keyboard
				z2.kbd.start();
				z2.kbd.addKey( z2.kbd.X );
				z2.kbd.addKey( z2.kbd.Z );
				z2.kbd.addKey( z2.kbd.UP );
				z2.kbd.addKey( z2.kbd.LEFT );
				z2.kbd.addKey( z2.kbd.RIGHT );
				z2.kbd.addKey( z2.kbd.SPACEBAR );
			},
			update: function( e, dt )
			{
				// get the input component
				var input = e.getComponent( z2.inputFactory.mask );
				input.jump = false;
				input.action = false;
				input.left = false;
				input.right = false;

				// check keys
				if( z2.kbd.keyUp( z2.kbd.Z ) || z2.kbd.keyUp( z2.kbd.SPACEBAR ) )
					input.action = true;

				if( z2.kbd.isDown( z2.kbd.UP ) || z2.kbd.isDown( z2.kbd.X ) )
					input.jump = true;

				if( z2.kbd.isDown( z2.kbd.LEFT ) )
					input.left = true;
				else if( z2.kbd.isDown( z2.kbd.RIGHT ) )
					input.right = true;

				// refresh the kbd
				z2.kbd.refresh();
			}
		} );
	};

};

