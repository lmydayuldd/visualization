'use strict';

function CameraController (CAMERA) {
    //private members
    let SCALE = 1.6;
    let SWITCH_CAMERA_KEY = 99; //char 'c'
    let CAMERAS = {
        forward:        { x: SCALE * 0,     y: SCALE * 92,  z: SCALE * -233 },
        forwardHigh:    { x: SCALE * 0,     y: SCALE * 117, z: SCALE * -267 },
        sideLeft:       { x: SCALE * 208,   y: SCALE * 92,  z: SCALE * 0 },
        sideRight:      { x: SCALE * -208,  y: SCALE * 92,  z: SCALE * 0 },
        backward:       { x: SCALE * 0,     y: SCALE * 92,  z: SCALE * 233 },
        birdseyeFixed:  { x: SCALE * 0,     y: SCALE * 583, z: SCALE * 0 },
        dashCam:        { x: SCALE * 0,     y: SCALE * 75,  z: SCALE * 83 }
    };

    let origin = { x: 0, y: 0, z: 0 };

    let currentCamera = "straightForward";

    let self = {};

    //private methods
    let setCameraPosition = function setCameraPosition(cameraLabel) {
        CAMERA.position.setX(CAMERAS[cameraLabel].x + origin.x);
        CAMERA.position.setY(CAMERAS[cameraLabel].y + origin.y);
        CAMERA.position.setZ(CAMERAS[cameraLabel].z + origin.z);

        currentCamera = cameraLabel;
    }

    // cameras position according to current car's local coordinate system
    let setCameraRelativePosition = function setCameraRelativePosition(cameraLabel){
        let currCarObj = CARS[currentCar].object
        let worldPos = currCarObj.localToWorld(new THREE.Vector3(
                CAMERAS[cameraLabel].x / currCarObj.scale.x, 
                CAMERAS[cameraLabel].y / currCarObj.scale.y, 
                CAMERAS[cameraLabel].z / currCarObj.scale.z));

        CAMERA.position.set(worldPos.x, worldPos.y, worldPos.z)

        if (cameraLabel == "birdseyeFixed") {
            CAMERA.rotation.set(-0.5 * Math.PI, 0.0, -Math.PI);
            currentCamera = cameraLabel;
            return;
        }

        CAMERA.lookAt(currCarObj.position)

        currentCamera = cameraLabel;
    }

    let keyListener = function keyListener(e) {
        if(SWITCH_CAMERA_KEY != (e.keyCode || e.which)) return; //ignore other keys

        let doChange = false;
        let cameraLabel = "forward"; //first camera - default

        for(let c in CAMERAS) {
            if(doChange) {
                cameraLabel = c;
                break;
            }
            if(c == currentCamera) doChange = true; //set next camera on the next iteration
            //if this is the last iteration, then the first camera must be set - which is also default
        }

        //set the new camera position
        setCameraRelativePosition(cameraLabel);
    }

    //public
    self.DEFAULT_CAMERA = "forward";

    self.enableKeyListener = function initKeyListener() {
        window.addEventListener("keypress", keyListener);
    };
    self.disableKeyListener = function disableKeyListener() {
        window.removeEventListener("keypress", keyListener);
    };

    self.setCameraPosition = setCameraPosition;

    self.updateCameraOrigin = function updateCameraOrigin(x, y, z) {
        origin.x = x;
        origin.y = y;
        origin.z = z;

        setCameraPosition(currentCamera);
    }
	
	self.getCurrentCamera = function getCurrentCamera() { return currentCamera; }

    // update cameras position according to current car's local coordinate system
    // serves as a shortcut using by render()
    self.update = function (){
        setCameraRelativePosition(currentCamera)
    }
	
	// update the additional (own) dashCam every car has
	self.updateCarCamera = function updateOwnCamera(car, camera) {
		let carObj = car.object
        let worldPos = carObj.localToWorld(new THREE.Vector3(
                0 / carObj.scale.x, 
                90 / carObj.scale.y, 
                90 / carObj.scale.z));
				
        camera.position.setX(worldPos.x);
        camera.position.setY(worldPos.y);
        camera.position.setZ(worldPos.z);

		camera.lookAt(carObj.localToWorld(new THREE.Vector3( 0, 0, 700) )  )
	}

    return self;
};