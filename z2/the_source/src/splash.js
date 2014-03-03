// splash.js
// Copyright 2013 Joshua C Shepard
// splash screen Scene for 'the source'
//
// TODO:
// - BUG: clicking into the window during splash screen (w/ devtools open) can
// cause hang - _start is set to some ludicrously large number somehow...
// -

(function()
{
	"use strict";

	var image, splash_image;
	var src_txt, start_txt;

	// touch handler
	var _touched = false;
	function _touchHandler( e )
	{
		var touches = e.touches ? e.touches : [e];

		if( !touches )
			return;

		if( touches.length > 0 )
			_touched = true;

		e.preventDefault();
	}
	
	var _lastEt = 0;
	var _start = 0;
	var _timer = 0;
	var _xfadeComplete = false;

	z2.splash = function( width, height )
	{
		// return the Scene object
		var splash = new z2.Scene( width, height, 
			{
				load : function()
				{
					// load assets - 
					// splash screen sound effects
					if( z2.device.firefox )
						z2.loader.queueAsset( 'logo-fx', 'logo.ogg' );
					else
						z2.loader.queueAsset( 'logo-fx', 'logo.mp3' );
					// studio logo
					z2.loader.queueAsset( 'logo', 'logo.png' );
					// splash screen logo
					z2.loader.queueAsset( 'splash', 'splash.png' );

					// font
					z2.loader.queueAsset( 'font', 'open_sans_italic_20.fnt' );

					// 'loading' graphic
					z2.loader.queueAsset( 'loading', 'loading.png' );
				},
				init : function()
				{
					// input
					z2.kbd.start();
					z2.kbd.addKey( z2.kbd.ENTER );
					game.canvas.addEventListener( 'touchstart', _touchHandler, false );
					game.canvas.addEventListener( 'touchend', _touchHandler, false );
					game.canvas.addEventListener( 'touchmove', _touchHandler, false );
					game.canvas.addEventListener( 'touchcancel', _touchHandler, false );
				},
				create : function()
				{
					// add logo to view
					var img = z2.loader.getAsset( 'logo' );
					var basetexture = new PIXI.BaseTexture( img );
					var texture = new PIXI.Texture( basetexture );
					image = new PIXI.Sprite( texture );
					image.alpha = 1;
					game.view.add( image, true );

					// create a Pixi group for splash & text
					this.splash_doc = new PIXI.DisplayObjectContainer();
					this.splash_doc.alpha = 0;

					// add splash to view
					var spl = z2.loader.getAsset( 'splash' );
					basetexture = new PIXI.BaseTexture( spl );
					texture = new PIXI.Texture( basetexture );
					splash_image = new PIXI.Sprite( texture );
					this.splash_doc.addChild( splash_image );

					// add text
					var src_s = 'The Source';
					var start_s;
					if( z2.device.mobile )
						start_s = 'touch to start';
					else
						start_s = 'press <enter> to start';

					src_txt = new PIXI.BitmapText( src_s, {font: 'Open_Sans', align: 'center'} );
					src_txt.alpha = 0.6;
					src_txt.position.x = this.width/2 - src_txt.textWidth/2;
					src_txt.position.y = 2.9*this.height/4 - src_txt.textHeight/2;
					this.splash_doc.addChild( src_txt );

					start_txt = new PIXI.BitmapText( start_s, {font: 'Open_Sans', align: 'center'} );
					start_txt.alpha = 0.4;
					start_txt.position.x = this.width/2 - start_txt.textWidth/2;
					start_txt.position.y = 3.3*this.height/4 - start_txt.textHeight/2;
					this.splash_doc.addChild( start_txt );

					game.view.add( this.splash_doc, true );

					// play the startup sound
					z2.playSound( 'logo-fx' );

				},
				update : function()
				{
					// cross-fade from logo to splash, ignore input until
					// x-fade is complete

					var now = z2.time.now();
					if( !_start )
						_start = now;
					if( !_lastEt )
						_lastEt = now;

					var dt = now - _lastEt;
					_timer = now - _start;

					// update the cross-fade
					if( !_xfadeComplete )
					{
						if( image.alpha <= 0 )
						{
							if( _timer > 1000 )
								_xfadeComplete = true;
						}
						else if( _timer > 1000 )
						{
							image.alpha -= 0.01;
							this.splash_doc.alpha += 0.01;
							if( image.alpha <= 0 )
								_start = now;
						}
						// render Pixi
						game.renderer.render( game.stage );
					}
					// otherwise check for input
					else if( z2.kbd.isDown( z2.kbd.ENTER ) || _touched )
					{
						// TODO: get saved state from local storage & start at appropriate
						// level

						// level (asset) json is loaded, load the Tiled map
						var level = z2.loader.getAsset( 'level-1' );
						var level_one = z2.level( level );
						var scene = new z2.TiledScene( 'assets/maps/level-1.json', level_one );
						var loading = z2.loader.getAsset( 'loading' );
						scene.loadProgressImage = loading;
						game.startScene( scene );
					}

					_lastEt = now;
				},
				destroy : function()
				{
					// stop the main loop
					z2.stopMain();

					// clean up input
					z2.kbd.stop();
					game.canvas.removeEventListener( 'touchstart', _touchHandler );
					game.canvas.removeEventListener( 'touchend', _touchHandler );
					game.canvas.removeEventListener( 'touchmove', _touchHandler );
					game.canvas.removeEventListener( 'touchcancel', _touchHandler );

					// clean up assets
					z2.loader.deleteAsset( 'logo-fx' );
					z2.loader.deleteAsset( 'logo' );
					z2.loader.deleteAsset( 'splash' );

					// remove the logo & splash from Pixi
					game.view.remove( image, true );

					// remove the splash doc from Pixi
					game.view.remove( this.splash_doc, true );

					// unload assets - 
					// splash screen sound effects
					if( z2.device.firefox )
						z2.loader.deleteAsset( 'logo-fx' );
					else
						z2.loader.deleteAsset( 'logo-fx' );
					// studio logo
					z2.loader.deleteAsset( 'logo' );
					// splash screen logo
					z2.loader.deleteAsset( 'splash' );

					// (NOTE: don't unload font or loading graphic, we'll keep using
					// them)

					// TODO: any more clean up ?
				}
			} );
		return splash;
	};

})();

