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
		return new z2.System( 55, [z2.messageFactory, z2.inputFactory],
		{
			update: function( e, dt )
			{
				var input = e.getComponent( z2.inputFactory );
				// dismiss on keystroke
				if( input.action ||
					input.jump ||
					input.left ||
					input.right )
				{
					_msgVisible = false;

					// remove from Pixi
					var msg = e.getComponent( z2.messageFactory );
					game.view.remove( msg.text, true );
					game.view.remove( msg.bg, true );
					// remove from ECS manager
					z2.manager.get().removeEntity( e );
				}
			}
		} );
	};

	var _msgVisible = false;
	// is there already a message being displayed?
	z2.isMessageVisible = function()
	{
		return _msgVisible;
	};

	// create a message Entity
	z2.createMessage = function( text )
	{
		_msgVisible = true;

		var border = game.view.width / 20;
		var bg = new PIXI.Graphics();
		bg.beginFill( 0x000000 );
		bg.alpha = 0.85;
		bg.drawRect( border, border, game.view.width - border*2, game.view.height - border*2 );
		bg.endFill();
		game.view.add( bg, true );

		var txt = new PIXI.BitmapText( z2.wrapText( text, 35 ), {font: 'Open_Sans', align: 'center'} );
		txt.position.x = game.view.width/2 - txt.textWidth/2;
		txt.position.y = game.view.height/2 - txt.textHeight/2;
		game.view.add( txt, true );

		var msg = z2.messageFactory.create( {text: txt, bg: bg} );
		return z2.manager.get().createEntity( [game.input, msg] );
	};

};

