'use strict';

/**
*   RainController is used to control the rain in the scene
*		Interface functions:
*		-	startRaining(scene, carPosition) - Adds the rain to the scene and changes the position of the rain to the position of the car
*   - stopRaining(scene) - Deletes the rain in the scene
*		- isItRaining() - Checkes if its now raining
*		- simulateRain(carPosition) - Simulates the rain
*/

function RainController() {
  let particleCount = 1300;
  let particleSize = 6;
  let rainTexture = "img/blue_raindrop.png";
  let particleSystem;
  let particles;
  let isRaining = false;

  this.init = function() {
    console.log("INITIALIZE RAIN");

    var material = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: particleSize,
      map: new THREE.TextureLoader().load(rainTexture),
       blending: THREE.AdditiveBlending,
       depthTest: false,
       transparent: true
    });

    particles = new THREE.Geometry();

    for (var i = 0; i < particleCount; i++) {
        //Raindrops above the car in 1000 x 1000 range
        var pX = Math.random()*2000 - 1000,
        pY = Math.random()*750,
        pZ = Math.random()*2000 - 1000;
        var particle = new THREE.Vector3(pX, pY, pZ);
        particle.velocity = {};
        particle.velocity.y = 0;
        particles.vertices.push(particle);
    }

    particleSystem = new THREE.Points(particles, material);
  }

  /**
	*   Adds the rain to the scene and changes the position of the rain to the position of the car
	*
	*   @params:
	*   scene - current scene
  *   carPosition - current car position
	*/
  this.startRaining = function(scene, carPosition) {
    console.log("START RAIN");
    if(!isRaining) {
      isRaining = true;
      scene.add(particleSystem);
      particleSystem.position.set(carPosition.x, carPosition.y ,carPosition.z);
    } else {
      particleSystem.position.set(carPosition.x, carPosition.y ,carPosition.z);
    }
  }

  /**
  *   Deletes the rain in the scene
  *
  *   @params:
  *   scene - current scene
  */
  this.stopRaining = function(scene) {
    console.log("STOP RAIN");
    if(isRaining) {
      isRaining = false;
      scene.remove(particleSystem);
    }
  }


    /**
    *   Checkes if its now raining
    */
  this.isItRaining = function() {
    return isRaining;
  }


  /**
  *   Simulates the rain
  *
  */
  this.simulateRain = function(){
    var count = particleCount;
    while (count--) {
      var particle = particles.vertices[count];
      if (particle.y < 0) {
        particle.y = 750;
        particle.velocity.y = 0;
      }
      particle.velocity.y -= Math.random() * .20;
      particle.y += particle.velocity.y;
    }
    particles.verticesNeedUpdate = true;
  }
}
