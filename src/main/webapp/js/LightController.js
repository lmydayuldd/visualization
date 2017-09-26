'use strict';

/**
*   LightController is used to control the Light of a car
*		Interface functions:
*		-	checkDriveDirection(car) - Checks the current car driving direction and lets the car blink when it turns right or left, backlight on when it drives back
*		- addInLight(car) - Creates the inlight of the car
*		- addBackLight(car) - Creates the backlight for the car
*		- addFrontLight(car) - Creates the frontlight for the car
*		- updateFrontLight(car) - Updates the position of the frontlight of the car
*		- updateBackLight(car) - Updates the position of the backlight of the car
*		- updateInLight(car) - Updates the position of the inlight of the car
*		- turnLightsOn(car) - Turns all the lights of the car on when its dark
*		- turnLightsOff(car) - Turns all the lights of the car off when its brighter
*/

function LightController() {

	//offsets for the frontLight, backLight and inLight + intensities relativ to the car position - just optimized for veyron car type
	let SCALE = 1.6;
	let frontLight = {
		  intensity_side: 80,
			intensity_cone: 20,
			cone:   { offset_x: SCALE * 0, offset_y: SCALE * 25,  offset_z: SCALE * 58,
			target: { offset_x: SCALE * 0, offset_y: SCALE * -8,  offset_z: SCALE * 125 }
						},
			side: { left:  { offset_x: SCALE * -42, offset_y : SCALE * 38, offset_z : SCALE * 117 },
					right: { offset_x: SCALE * 42,  offset_y : SCALE * 38, offset_z : SCALE * 117 }
						}
	};

	let dayLight = {
		  intensity_side: 80,
			intensity_cone: 20,
			cone:   { offset_x: SCALE * 0, offset_y: SCALE * 25,  offset_z: SCALE * 58,
			target: { offset_x: SCALE * 0, offset_y: SCALE * -8,  offset_z: SCALE * 125 }
						},
			side: { left:  { offset_x: SCALE * -42, offset_y : SCALE * 38, offset_z : SCALE * 117 },
					right: { offset_x: SCALE * 42,  offset_y : SCALE * 38, offset_z : SCALE * 117 }
						}
	};

	let backLight = {
			intensity: 80,
			right: { left: { offset_x: SCALE * -23, offset_y: SCALE * 49, offset_z: SCALE * -123 },
		 			right: { offset_x: SCALE * -33, offset_y: SCALE * 49, offset_z: SCALE * -123 } },
			left: { right: { offset_x: SCALE * 23,  offset_y: SCALE * 49, offset_z: SCALE * -123 },
		 			left:  { offset_x: SCALE * 33,  offset_y: SCALE * 49, offset_z: SCALE * -123 } }
	}

	let inLight = { intensity: 90, offset_x: 0, offset_y: SCALE * 54, offset_z: SCALE * 4}


	/**
	*   Checks the current car driving direction and lets the car blink when it turns right or left, backlight on when it drives back
	*
	*   @params:
	*   car - car object
	*/
	this.checkDriveDirection = function (car) {
		if(car.controls.moveLeft) {
			if(!car.controls.blinkLeft) {
				//left
				car.controls.blinkLeft = true;
				car.controls.blinkRight = false;
				blink(car, "left");
				disableBlink(car, "right");
				}
		} else if(car.controls.moveRight) {
				if(!car.controls.blinkRight) {
					//right
					car.controls.blinkLeft = false;
					car.controls.blinkRight = true;
					blink(car, "right");
					disableBlink(car, "left");
				}
		} else if(car.controls.moveBackward){
				if(!car.controls.backLight) {
					//back
					car.controls.backLight = true;
					enableBackLight(car);
				}
		} else {
				disableBlink(car, "right");
				disableBlink(car, "left");
				car.controls.blinkLeft = false;
				car.controls.blinkRight = false;
		}
	}

	/**
	*   Creates the inlight of the car
	*
	*   @params:
	*   car - car object
	*/
	this.addInLight = function(car) {
		var position_x = car.mesh.position.x;
		var position_y = car.mesh.position.y;
		var position_z = car.mesh.position.z;

		var inLight = new THREE.PointLight( 0x8a2be2, 0, 30, 2 );
		inLight.position.set( position_x + inLight.offset_x, position_y + inLight.offset_y, position_z + inLight.offset_z );
		scene.add( inLight );

		car.inLight = inLight;
		
	}

	/**
	*   Creates the backlight for the car
	*
	*   @params:
	*   car - car object
	*/
	this.addBackLight = function(car) {
		var position_x = car.mesh.position.x;
		var position_y = car.mesh.position.y;
		var position_z = car.mesh.position.z;

        var textureLoader = new THREE.TextureLoader();
        var textureFlare = textureLoader.load("img/textures/lensflare.png");
        var flareColor = new THREE.Color(0xff0000);

		//add left and right backlight with invisibility
		var backright_right = new THREE.LensFlare(textureFlare, 150, 0.0, THREE.AdditiveBlending, flareColor);
		backright_right.position.set( position_x + backLight.right.right.offset_x, position_y + backLight.right.right.offset_y, position_z + backLight.right.right.offset_z );
        backright_right.visible = false;
		scene.add( backright_right );

		var backright_left = new THREE.LensFlare(textureFlare, 150, 0.0, THREE.AdditiveBlending, flareColor);
		backright_left.position.set( position_x + backLight.right.left.offset_x, position_y + backLight.right.left.offset_y, position_z + backLight.right.left.offset_z );
        backright_left.visible = false;
		scene.add( backright_left );

		var backleft_left = new THREE.LensFlare(textureFlare, 150, 0.0, THREE.AdditiveBlending, flareColor);
		backleft_left.position.set( position_x + backLight.left.left.offset_x, position_y + backLight.left.left.offset_y, position_z + backLight.left.left.offset_z );
        backleft_left.visible = false;
		scene.add( backleft_left );

		var backleft_right = new THREE.LensFlare(textureFlare, 150, 0.0, THREE.AdditiveBlending, flareColor);
		backleft_right.position.set( position_x + backLight.left.right.offset_x, position_y + backLight.left.right.offset_y, position_z + backLight.left.right.offset_z );
        backleft_right.visible = false;
		scene.add( backleft_right );

		car.backLight = { left: { left: backleft_left, right: backleft_right} , right: { right: backright_right, left: backright_left}};

	}

	/**
	*   Creates the frontlight for the car
	*
	*   @params:
	*   car - car object
	*/
	this.addFrontLight = function(car) {
		var position_x = car.mesh.position.x;
		var position_y = car.mesh.position.y;
		var position_z = car.mesh.position.z;

		//add cone for the frontlight
		var cone = new THREE.SpotLight(0xffffff, 0, 700, 7*Math.PI/24, 0.5, 0.8);
		cone.position.set(position_x, position_y + frontLight.cone.offset_y, position_z + frontLight.cone.offset_z);
		cone.target.position.set(position_x, position_y + frontLight.cone.target_offset_y, position_z + frontLight.cone.target_offset_z);
		scene.add(cone.target);
		scene.add(cone);

		//add two side frontlights for the car
		var leftlight = new THREE.PointLight( 0xffffff, 0, 10, 2 );
		leftlight.position.set( position_x + frontLight.side.left.offset_x , position_y - frontLight.side.left.offset_y, position_z + frontLight.side.left.offset_z );
		scene.add( leftlight );
		var rightlight = new THREE.PointLight( 0xffffff, 0, 10, 2 );
		rightlight.position.set( position_x + frontLight.side.right.offset_x, position_y - frontLight.side.right.offset_y, position_z + frontLight.side.right.offset_z );
		scene.add( rightlight );

		car.frontLight = { cone: cone, left: leftlight, right: rightlight};

	}

	this.addDayLight = function(car) {
		var position_x = car.mesh.position.x;
		var position_y = car.mesh.position.y;
		var position_z = car.mesh.position.z;

		//add cone for the frontlight
		var cone = new THREE.SpotLight(0xffffff, 0, 400, 7*Math.PI/24, 0.5, 2);
		cone.position.set(position_x, position_y + dayLight.cone.offset_y, position_z + dayLight.cone.offset_z);
		cone.target.position.set(position_x, position_y + dayLight.cone.target_offset_y, position_z + dayLight.cone.target_offset_z);
		scene.add(cone.target);
		scene.add(cone);

		//add two side frontlights for the car
		var leftlight = new THREE.PointLight( 0xffffff, 0, 5, 2 );
		leftlight.position.set( position_x + dayLight.side.left.offset_x , position_y - dayLight.side.left.offset_y, position_z + dayLight.side.left.offset_z );
		scene.add( leftlight );
		var rightlight = new THREE.PointLight( 0xffffff, 0, 5, 2 );
		rightlight.position.set( position_x + dayLight.side.right.offset_x, position_y - dayLight.side.right.offset_y, position_z + dayLight.side.right.offset_z );
		scene.add( rightlight );

		car.dayLight = { cone: cone, left: leftlight, right: rightlight};
	}

	/**
	*   Updates the position of the frontlight of the car
	*
	*   @params:
	*   car - car object
	*/
	this.updateFrontLight = function(car) {
		var rotation = car.mesh.rotation.y;

		/* UPDATE CONE LIGHT */
		var lightStandard = calcStandardPosition(car, frontLight.cone);
		var targetStandard = calcStandardPosition(car, frontLight.cone.target);

		var new_light = calcRotatedPosition(car, rotation, lightStandard);
		var new_target = calcRotatedPosition(car, rotation, targetStandard);

		car.frontLight.cone.position.set(new_light.x , new_light.y, new_light.z);
		car.frontLight.cone.target.position.set(new_target.x, new_target.y, new_target.z);

		/* UPDATE LEFT AND RIGHT LIGHT */
		var leftLightStandard = calcStandardPosition(car, frontLight.side.left);
		var rightLightStandard = calcStandardPosition(car, frontLight.side.right);

		var new_leftLight = calcRotatedPosition(car, rotation, leftLightStandard);
		var new_rightLight = calcRotatedPosition(car, rotation, rightLightStandard);

		car.frontLight.left.position.set(new_leftLight.x , new_leftLight.y, new_leftLight.z);
		car.frontLight.right.position.set(new_rightLight.x , new_rightLight.y, new_rightLight.z);

	}

	this.updateDayLight = function(car) {
		var rotation = car.mesh.rotation.y;

		/* UPDATE CONE LIGHT */
		var lightStandard = calcStandardPosition(car, dayLight.cone);
		var targetStandard = calcStandardPosition(car, dayLight.cone.target);

		var new_light = calcRotatedPosition(car, rotation, lightStandard);
		var new_target = calcRotatedPosition(car, rotation, targetStandard);

		car.dayLight.cone.position.set(new_light.x , new_light.y, new_light.z);
		car.dayLight.cone.target.position.set(new_target.x, new_target.y, new_target.z);

		/* UPDATE LEFT AND RIGHT LIGHT */
		var leftLightStandard = calcStandardPosition(car, dayLight.side.left);
		var rightLightStandard = calcStandardPosition(car, dayLight.side.right);

		var new_leftLight = calcRotatedPosition(car, rotation, leftLightStandard);
		var new_rightLight = calcRotatedPosition(car, rotation, rightLightStandard);

		car.dayLight.left.position.set(new_leftLight.x , new_leftLight.y, new_leftLight.z);
		car.dayLight.right.position.set(new_rightLight.x , new_rightLight.y, new_rightLight.z);
	}

	/**
	*   Updates the position of the backlight of the car
	*
	*   @params:
	*   car - car object
	*/
	this.updateBackLight = function(car) {
		var rotation = car.mesh.rotation.y;

		/* UPDATE LEFT AND RIGHT BACK LIGHT */
		var backLeftLeftStandard = calcStandardPosition(car, backLight.left.left);
		var backRightRightStandard = calcStandardPosition(car, backLight.right.right);
		var backLeftRightStandard = calcStandardPosition(car, backLight.left.right);
		var backRightLeftStandard = calcStandardPosition(car, backLight.right.left);

		var new_backLeftLeft = calcRotatedPosition(car, rotation, backLeftLeftStandard);
		var new_backRightLeft = calcRotatedPosition(car, rotation, backRightLeftStandard);
		var new_backLeftRight = calcRotatedPosition(car, rotation, backLeftRightStandard);
		var new_backRightRight = calcRotatedPosition(car, rotation, backRightRightStandard);

		car.backLight.left.left.position.set(new_backLeftLeft.x , new_backLeftLeft.y, new_backLeftLeft.z);
		car.backLight.right.right.position.set(new_backRightRight.x, new_backRightRight.y, new_backRightRight.z);
		car.backLight.left.right.position.set(new_backLeftRight.x , new_backLeftRight.y, new_backLeftRight.z);
		car.backLight.right.left.position.set(new_backRightLeft.x, new_backRightLeft.y, new_backRightLeft.z);

	}

	/**
	*   Updates the position of the inlight of the car
	*
	*   @params:
	*   car - car object
	*/
	this.updateInLight = function(car) {
		var rotation = car.mesh.rotation.y;

		/* UPDATE IN LIGHT */
		var inLightStandard = calcStandardPosition(car, inLight);
		var new_inLight = calcRotatedPosition(car, rotation, inLightStandard);
		car.inLight.position.set(new_inLight.x , new_inLight.y, new_inLight.z);
	}

	/**
	*   Turns all the lights of the car on when its dark
	*
	*   @params:
	*   car - car object
	*/
	this.turnLightsOn = function(car) {
			enableBackLight(car);
			enableFrontLight(car);
			enableInLight(car);
	}

	/**
	*   Turns all the lights of the car off when its bright
	*
	*   @params:
	*   car - car object
	*/
	this.turnLightsOff = function(car) {
			disableBackLight(car);
			disableFrontLight(car);
			disableInLight(car);
	}

	/* PRIVATE FUNCTIONS */

	/**
	*   Enables the backlight of the car
	*
	*   @params:
	*   car - car object
	*/
	function enableBackLight(car) {
		car.backLight.left.right.visible = true;
		car.backLight.right.left.visible = true;
	}

	/**
	*   Enables the frontlight of the car
	*
	*   @params:
	*   car - car object
	*/
	function enableFrontLight(car) {
		car.frontLight.left.intensity = frontLight.intensity_side;
		car.frontLight.right.intensity = frontLight.intensity_side;
		car.frontLight.cone.intensity = frontLight.intensity_cone;

		car.dayLight.left.intensity = 0;
		car.dayLight.right.intensity = 0;
		car.dayLight.cone.intensity = 0;
	}

	/**
	*   Enables the inlight of the car
	*
	*   @params:
	*   car - car object
	*/
	function enableInLight(car) {
		car.inLight.intensity = inLight.intensity;
	}

	/**
	*   Disables the frontlight of the car
	*
	*   @params:
	*   car - car object
	*/
	function disableFrontLight(car) {
		car.frontLight.left.intensity = 0;
		car.frontLight.right.intensity = 0;
		car.frontLight.cone.intensity = 0;

		car.dayLight.left.intensity = dayLight.intensity_side;
		car.dayLight.right.intensity = dayLight.intensity_side;
		car.dayLight.cone.intensity = dayLight.intensity_cone;
	}

	/**
	*   Disables the inlight of the car
	*
	*   @params:
	*   car - car object
	*/
	function disableInLight(car) {
		car.inLight.intensity = 0;
	}

	/**
	*   Disables the backlight of the car
	*
	*   @params:
	*   car - car object
	*/
	function disableBackLight(car) {
		car.backLight.right.left.visible = false;
		car.backLight.left.right.visible = false;
	}

	/**
	*   Creates a blinking effect
	*
	*   @params:
	*   car - car object
	*   direction - "left" | "right" - left or right blinking
	*/
	function blink(car, direction) {
		if(direction == "right") {
			if(car.controls.blinkRight) {
				if(!car.backLight.right.right.visible) {
					enableBlinkLightRight(car);
				} else {
					disableBlinkLightRight(car);
				}
				setTimeout(function() { blink(car, direction) }, 400);
			}
		} else if (direction == "left") {
			if(car.controls.blinkLeft) {
				if(!car.backLight.left.left.visible) {
					enableBlinkLightLeft(car);
				} else {
					disableBlinkLightLeft(car);
				}
				setTimeout(function() { blink(car, direction) }, 400);
			}
		}
	}

	/**
	*   Disables the blinking effect
	*
	*   @params:
	*   car - car object
	*   direction - "left" | "right" - left or right blinking
	*/
	function disableBlink(car, direction) {
		if(direction == "right") {
			disableBlinkLightRight(car);
		} else if (direction == "left") {
			disableBlinkLightLeft(car);
		}
	}

	/**
	*   Enables the left blinking light
	*
	*   @params:
	*   car - car object
	*/
	function enableBlinkLightLeft(car) {
		car.backLight.left.left.visible = true;
	}

	/**
	*   Disables the left blinking light
	*
	*   @params:
	*   car - car object
	*/
	function disableBlinkLightLeft(car) {
		car.backLight.left.left.visible = false;
	}

	/**
	*   Enables the right blinking light
	*
	*   @params:
	*   car - car object
	*/
	function enableBlinkLightRight(car) {
		car.backLight.right.right.visible = true;
	}

	/**
	*   Disables the right blinking light
	*
	*   @params:
	*   car - car object
	*/
	function disableBlinkLightRight(car) {
		car.backLight.right.right.visible = false;
	}

	/**
	*   Calculates the standard position of one light when the car is not rotated
	*
	*   @params:
	*   car - car object
	*		type - light object e.g. backLight.left.left
	*/
	function calcStandardPosition(car, type) {
		var car_x = car.mesh.position.x;
		var car_y = car.mesh.position.y;
		var car_z = car.mesh.position.z;
		return {x: car_x + type.offset_x, y: car_y + type.offset_y, z: car_z + type.offset_z};
	}

	/**
	*   Calculates the rotated position around the car
	*
	*   @params:
	*   car - car object
	*		rotation - current y rotation of the car
	*		old_pos - standard position of the light
	*/
	function calcRotatedPosition(car, rotation, old_pos) {
		var car_x = car.mesh.position.x;
		var car_y = car.mesh.position.y;
		var car_z = car.mesh.position.z;

		var new_pos_x = car_x + ((old_pos.x - car_x) * Math.cos(-rotation).toFixed(15) - (old_pos.z - car_z) * Math.sin(-rotation).toFixed(15));
		var new_pos_z = car_z + ((old_pos.x - car_x) * Math.sin(-rotation).toFixed(15) + (old_pos.z - car_z) * Math.cos(-rotation).toFixed(15));
		return {x: new_pos_x, y: old_pos.y, z: new_pos_z};
	}

};
