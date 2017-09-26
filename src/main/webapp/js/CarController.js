'use strict';

function CarController() {
    let CARS = {};
    let self = {};
    let callback = null;
    let simulationStarted = false;

    self.addCar = function(carName, car) {
         if (CARS[carName] != undefined){
            return
        }

        CARS[carName] = {
            model: car,
            // compatibility with old code
            // some code still need to access car position through car.mesh
            mesh: car.root,
            controls: {
                moveForward: false,
                moveBackward: false,
                moveLeft: false,
                moveRight: false,
                blinkRight: false,
                blinkLeft: false,
                backLight: false
            },
            lightController: new LightController(),
            frontLight: null,
            backLight: null,
            inLight: null,
            dataBuffer: null,
            targetStatus: {},
            distanceToDestination: Number.MAX_VALUE,
            // initial car orientation
            // update using rotation matrix provided by server
            realOrientation: new THREE.Vector3(0, 1, 0), // using server's coordinate system
        }
    }


    self.setCurrentCar = function (name) {
        if (name in CARS){
            currentCar = name;
            //console.log('cuurent car set to ', name);
        }else{
            //console.log(name, ' is not a valid car');
        }
    }


    /*
     * Car DataModel Handler.
     *
     */
    self.handleData = function(data, resolve) {
        if (data.position == undefined || data.position == null){
            //console.log(data)
        }
        if (CARS[data.id].dataBuffer == null) {
            CARS[data.id].dataBuffer = data
            self.updateDestination(data.id);
            CARS[data.id].model.root.rotation.y = CARS[data.id].targetStatus.rotationAroundYAxis;
            resolve();
        }else {
            callback = resolve;
            CARS[data.id].dataBuffer = data
        }

        //console.log('new data arrived ', data)
    }


    /*
     * Calculate the next destination of car.
     *
     */
    self.updateDestination = function (carID) {
        var car = CARS[carID];
        var data = car.dataBuffer;

        var destination = data.position;
        destination = new THREE.Vector3(destination.x, car.model.root.position.y, destination.z);

        if (data.velocity) {
            var vel = data.velocity;
            var velocityAtDestination = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
            car.model.speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
        }

        if (data.acceleration) {
            var acc = data.acceleration;
            var accAtDestination = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
            car.model.acceleration = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
        }

        var rotationAroundYAxis = 0.0;

        if (data.rotation) {
            var rotation = data.rotation.data;
            var lastOrientation = new THREE.Vector3(0, 1, 0);
            var matrixColumnElements = rotation.reduce(function(acc, val){ return acc.concat(val)}, []);

            // Manually compute matrix * vector operation, three JS just seems to support pre-multiplications (vector * matrix)
            // Everything computed in the coordinate system of the server (z is up / down)
            var xRot = matrixColumnElements[0] * lastOrientation.x + matrixColumnElements[3] * lastOrientation.y + matrixColumnElements[6] * lastOrientation.z;
            var yRot = matrixColumnElements[1] * lastOrientation.x + matrixColumnElements[4] * lastOrientation.y + matrixColumnElements[7] * lastOrientation.z;
            var zRot = matrixColumnElements[2] * lastOrientation.x + matrixColumnElements[5] * lastOrientation.y + matrixColumnElements[8] * lastOrientation.z;
            var orientationVector = new THREE.Vector3(xRot, yRot, zRot);
            var angle = orientationVector.angleTo(lastOrientation);

            //If the vector points to quadrant I or IV, ensure value range goes up to 2*pi
            if (orientationVector.x > 0) {
                angle = -angle;
                angle += 2 * Math.PI;
            }

            rotationAroundYAxis = angle;
            /*
            console.log('Rotation: matrixColumnElements ', matrixColumnElements);
            console.log('Rotation: lastOrientation ', lastOrientation);
            console.log('Rotation: orientationVector ', orientationVector);
            console.log('Rotation: rotationAroundYAxis ', rotationAroundYAxis);
            */
        }

        car.targetStatus.steeringAtDestination = data.steeringAngle;
        car.targetStatus.velocityAtDestination = velocityAtDestination;
        car.targetStatus.accAtDestination = accAtDestination;
        car.targetStatus.rotationAroundYAxis = rotationAroundYAxis;
        car.targetStatus.destination = destination;
        car.distanceToDestination = Number.MAX_VALUE;

        //self.logCarState(carID);
    }

    /*
     * Correct the car's speed, acceleration, body and wheel orientation and its position as
     * received from server.
     */
    self.correctCarAttitude = function (carID) {
        var car = CARS[carID];
        if (car.targetStatus.destination == undefined) return

        car.model.speed = car.targetStatus.velocityAtDestination;
        car.model.acceleration = car.targetStatus.accAtDestination;
        car.model.root.rotation.y = car.targetStatus.rotationAroundYAxis;
        car.model.carOrientation = car.targetStatus.rotationAroundYAxis;
        car.model.position.x = car.targetStatus.destination.x;
        car.model.position.z = car.targetStatus.destination.z;

        // front wheels steering
        car.model.frontLeftWheelRoot.rotation.y = car.targetStatus.steeringAtDestination;
        car.model.frontRightWheelRoot.rotation.y = car.targetStatus.steeringAtDestination;
        
        var steeringLightThreshold = 0.25;
        if (Math.abs(car.targetStatus.steeringAtDestination) < steeringLightThreshold){
            car.controls.moveLeft = false;
            car.controls.moveRight = false;
        } else if (car.targetStatus.steeringAtDestination < 0){
            car.controls.moveLeft = false;
            car.controls.moveRight = true;
        } else if (car.targetStatus.steeringAtDestination > 0){
            car.controls.moveLeft = false;
            car.controls.moveRight = false;
        }
        
        var wheelDelta = 0.05;
        if (car.model.loaded && car.model.speed > 2.0) {
            car.model.frontLeftWheelMesh.rotation.x += wheelDelta;
            car.model.frontRightWheelMesh.rotation.x += wheelDelta;
            car.model.backLeftWheelMesh.rotation.x += wheelDelta;
            car.model.backRightWheelMesh.rotation.x += wheelDelta;
        }
        
        // if (car.targetStatus.steeringAtDestination > 0) {
        //     car.controls.moveLeft = false;
        //     car.controls.moveRight = true;
        // } else if (car.targetStatus.steeringAtDestination < 0) {
        //     car.controls.moveLeft = true;
        //     car.controls.moveRight = false;
        // } else {
        //     car.controls.moveLeft = false;
        //     car.controls.moveRight = false;
        // }

        // console.log('correcting...')
        // self.logCarState(carID)
    }

    /*
     * Responsible for updating driving attitude of all cars. Used by render()
     *
     * @param {float} delta - time past after last frame in millisecond
     */
    self.update = function (delta) {
        var allArrivedDestination = true;
        for (var carID in CARS){
            var car = CARS[carID];
            // This avoid any animations. It sets the car's attitude as same as the in server.
            // Without animations, the car moves as smooth as possible, but also without any computation speed limits, e.g. vehicles move faster than in reality
            self.correctCarAttitude(carID); continue

            if (car.targetStatus.destination == undefined) continue

            var distanceToDestination = CARS[carID].targetStatus.destination.distanceTo(new THREE.Vector3(CARS[carID].model.root.position.x, CARS[carID].model.root.position.y, CARS[carID].model.root.position.z))
            // console.log(distanceToDestination, car.controls.moveLeft, car.controls.moveRight)
            var movingAway = distanceToDestination >= car.distanceToDestination;
            if (movingAway) {
                self.correctCarAttitude(carID);
                continue;
            }
            car.distanceToDestination = distanceToDestination;

            var isMoving = CARS[carID].model.speed != 0 || CARS[carID].model.acceleration != 0;
            // call next dataframe if the destination is within 5cm
            var reachedDestination = (distanceToDestination < 5);
            if (!reachedDestination && isMoving) {
                allArrivedDestination = false;
                // console.log(distanceToDestination)
                updateCarModel(car, delta);
                // update car attitudes
            } else {
                self.correctCarAttitude(carID);
            }

            updateLight(carID);

        }

        if (allArrivedDestination == true && callback != undefined){
            for (var carID in CARS) self.updateDestination(carID);
            callback();
            callback = undefined;
        }
    }


    /*
     * Update front, interior and back light of the car.
     *
     */
    function updateLight(carID) {
        var car = CARS[carID];

        // Note: Disabled lights for now, they add elements to fragment shader which has limited resources
        // MAX_FRAGMENT_UNIFORM_VECTORS is exceeded by adding several cars on some systems, depends on the GPU / Browser / OS
        // Each light adds about 6 - 10 vectors, each car has multiple lights, some systems only have a MAX_FRAGMENT_UNIFORM_VECTORS of ~220
        /*
        //add lights to car if not exists
        if(car.frontLight == null) {
          car.lightController.addFrontLight(car);
          car.lightController.addDayLight(car);
          car.lightController.addBackLight(car);
          car.lightController.addInLight(car);
        }
        car.lightController.updateFrontLight(car);
        car.lightController.updateDayLight(car);
        car.lightController.updateBackLight(car);
        car.lightController.updateInLight(car);

        //Based on the drive direction of the car, turn on lights
        car.lightController.checkDriveDirection(car);
        */
    }


    /*
     * Update attitudes of the car. Including speed, wheel steering angle, new position, rotation
     * of wheel mesh.
     *
     * @param {object} car - car object stored in CARS[carName]
     * @param {float} delta - time past after last frame in milliseconds
     */
     function updateCarModel(car, delta) {
        if (car.targetStatus.destination == undefined) return
        var carModel = car.model;
        var destination = car.targetStatus.destination;

        // FIXME use original time delta, with original value a lot of camera stuttering happens
        // var deltaInSeconds = delta;
        var deltaInSeconds = delta / 2;

        carModel.speed = carModel.speed + deltaInSeconds * carModel.acceleration;

        var relDestination = carModel.root.worldToLocal(new THREE.Vector3(destination.x, destination.y, destination.z));
        var angleToDestination = relDestination.angleTo(new THREE.Vector3(0,0,1000));
        if (relDestination.x < 0) {
            angleToDestination = - Math.abs(angleToDestination); // turn left
        } else if (relDestination.x > 0){
            angleToDestination = Math.abs(angleToDestination); // turn right
        } else {
            angleToDestination = 0;
        }

        /*
        var steeringLightThreshold = 0.1;
        if (Math.abs(angleToDestination) < steeringLightThreshold){
            car.controls.moveLeft = false;
            car.controls.moveRight = false;
        } else if (angleToDestination < 0){
            car.controls.moveLeft = false;
            car.controls.moveRight = true;
        } else if (angleToDestination > 0){
            car.controls.moveLeft = true;
            car.controls.moveRight = false;
        }
        */

        carModel.wheelOrientation = THREE.Math.clamp(angleToDestination, -carModel.MAX_WHEEL_ROTATION, carModel.MAX_WHEEL_ROTATION);
        // carModel.wheelOrientation = angleToDestination

        // car update
        var forwardDelta = carModel.speed * deltaInSeconds;

        carModel.carOrientation += ( forwardDelta * carModel.STEERING_RADIUS_RATIO ) * carModel.wheelOrientation;

        // displacement
        carModel.root.position.x += Math.sin(carModel.carOrientation) * forwardDelta;
        carModel.root.position.z += Math.cos(carModel.carOrientation) * forwardDelta;

        // orientation
        carModel.root.rotation.y = carModel.carOrientation;

        /*
        // wheels rolling
        var angularSpeedRatio = 1 / ( carModel.modelScale * ( carModel.wheelDiameter / 2 ) );

        var rotatingFactor = 1.3; // this factor makes the rolling seems more real
        var wheelDelta = forwardDelta * angularSpeedRatio * 1.3;

        if (carModel.loaded) {
            carModel.frontLeftWheelMesh.rotation.x += wheelDelta;
            carModel.frontRightWheelMesh.rotation.x += wheelDelta;
            carModel.backLeftWheelMesh.rotation.x += wheelDelta;
            carModel.backRightWheelMesh.rotation.x += wheelDelta;
        }

        // front wheels steering
        carModel.frontLeftWheelRoot.rotation.y = carModel.wheelOrientation;
        carModel.frontRightWheelRoot.rotation.y = carModel.wheelOrientation;
        */
    };


    /*
     * Print some simple car status.
     */
    self.logCarState = function (carID) {
        var car = CARS[carID];
        /*
        console.log('car ', carID, '--------------------------------');
        console.log('current position', car.model.position.x, car.model.position.z);
        console.log('heading towards', car.targetStatus.destination.x, car.targetStatus.destination.z);
        console.log('current orientation: ', car.model.root.rotation.y);
        console.log('steering angle: ', car.model.wheelOrientation);
        console.log('speed: ', car.model.speed, ' acceleration: ', car.model.acceleration);
        console.log('---------------------------------------');
        */
    }


    // some shortcuts
    self.getCurrentCar = function () {
        return currentCar;
    }


    self.getCurrentCarObj = function() {
        return CARS[currentCar];
    }


    return self;
}
