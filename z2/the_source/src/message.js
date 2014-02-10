// message.js
// Copyright 2013 Joshua C Shepard
// (text) message objects
//
// TODO:
// - support different styles and colors
// - 'pulsating' effect on bg alpha (need tweens)
// -


zSquared.message = function( z2 )
{
	"use strict";

	z2.require( ['ecs', 'inputreceiver'] );

	// a 'messages' component, consisting of an array of strings
	z2.messagesFactory = z2.createComponentFactory( {messages:null} );

	// create an message component factory
	z2.messageFactory = z2.createComponentFactory( {text:null, bg:null} );

	// create a message displaying/hiding System
	z2.createMessageSystem = function()
	{
		return new z2.System( 40, [z2.messageFactory, z2.inputFactory],
		{
			update: function( e, dt )
			{
				var input = e.getComponent( z2.inputFactory.mask );
				// dismiss on keystroke
				if( input.action ||
					input.jump ||
					input.left ||
					input.right )
				{
					// remove from Pixi
					var msg = e.getComponent( z2.messageFactory.mask );
					game.scene.view.remove( msg.text, true );
					game.scene.view.remove( msg.bg, true );
					// remove from ECS manager
					z2.manager.get().removeEntity( e );
				}
			}
		} );
	};

	// create a message Entity
	z2.createMessage = function( text )
	{
		var border = game.scene.view.width / 20;
		var bg = new PIXI.Graphics();
		bg.beginFill( 0x000000 );
		bg.alpha = 0.85;
		bg.drawRect( border, border, game.scene.view.width - border*2, game.scene.view.height - border*2 );
		bg.endFill();
		game.scene.view.add( bg, true );

		var txt = new PIXI.BitmapText( z2.wrapText( text, 35 ), {font: 'Open_Sans', align: 'center'} );
		txt.position.x = game.scene.view.width/2 - txt.width/2;
		txt.position.y = game.scene.view.height/2 - txt.height/2;
		game.scene.view.add( txt, true );

		var msg = z2.messageFactory.create( {text: txt, bg: bg} );
		return z2.manager.get().createEntity( [game.input, msg] );
	};

};

