// emitter.js
// Copyright 2013 Joshua C Shepard
// Emitter game objects for 'the source'
//
// TODO:
// -

(function()
{
	"use strict";

	z2.require( ['ecs', 'emitter'] );

	var emitterSys;

	function createEmitterSystem()
	{
		if( emitterSys )
			return;

		// create an emitter system
		emitterSys = z2.createEmitterSystem( game.scene.view, 'firefly', 8 );
		z2.manager.get().addSystem( emitterSys );
	}

	// factory function to create Emitter
	z2.Emitter = function( obj )
	{
		var props = obj.properties;
		if( !props )
			return;

		// create an emitter
		var em = z2.manager.get().createEntity( 
		[
			z2.emitterFactory.create(
			{
				// is the emitter on?
				on: props.on !== 'false',
				// is this a 'burst' emitter? (fires all particles, then turns off)
				burst: props.burst === 'true',
				// how many particles are released at a time?
				quantity: +props.quantity,
				// how often (in ms) are particles released?
				period: +props.period,
				// how long to wait before the first release of particles?
				delay: +props.delay,
				// width of the emitter (in pixels)
				width: obj.width,
				// height of the emitter (in pixels)
				height: obj.height,
				// min/max particle speeds (chosen at random in this range)
				minParticleSpeedX: +props.minParticleSpeedX, 
				maxParticleSpeedX: +props.maxParticleSpeedX,
				minParticleSpeedY: +props.minParticleSpeedY,
				maxParticleSpeedY: +props.maxParticleSpeedY,
				// min/max particle rotation (chosen at random in this range)
				minRotation: +props.minRotation,
				maxRotation: +props.maxRotation,
				// min/max particle alpha transparency
				minAlpha: props.minAlpha === undefined ? 1 : +props.minAlpha,
				maxAlpha: props.maxAlpha === undefined ? 1 : +props.maxAlpha,
				// min/max particle lifespan (in ms)
				minLifespan: props.minLifespan === undefined ? props.period : +props.minLifespan,
				maxLifespan: props.maxLifespan === undefined ? props.period : +props.maxLifespan
			} ),
			z2.positionFactory.create( {x: obj.x, y: obj.y} )
		] );

		createEmitterSystem();

		return em;
	};

})();
