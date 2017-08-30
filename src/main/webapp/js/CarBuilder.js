'use strict';

function CarBuilder(textureCube) {
    
    var LAB_MATERIALS = new Materials(textureCube);
    
    var DEF_CARS = {
        "veyron": {
            name:	"Bugatti Veyron",
            body_url: 	"examples/obj/veyron/parts/veyron_body_bin.js",
            wheel_url: "examples/obj/veyron/parts/veyron_wheel_bin.js",
            author: '<a href="http://artist-3d.com/free_3d_models/dnm/model_disp.php?uid=1129" target="_blank">Troyano</a>',
            init_rotation: [ 0, 0, 0 ],
            scale: 1.6,
            init_material: 4,
            body_materials: [ 2 ],
            height_offset: -2,

            object: null,
            buttons: null,
            materials: {
                body: [
                     LAB_MATERIALS[ "Black metal" ],      // top, front center, back sides
                     LAB_MATERIALS[ "Chrome" ],           // front sides
                     LAB_MATERIALS[ "Chrome" ],           // engine
                     LAB_MATERIALS[ "Chrome" ],      // small chrome things
                     LAB_MATERIALS[ "Red glass 50" ],     // backlights
 
                     LAB_MATERIALS[ "Orange glass 50" ],  // back signals
                     LAB_MATERIALS[ "Black rough" ],      // bottom, interior
                     LAB_MATERIALS[ "Dark glass" ]        // windshield
                ],
                wheel: [
                    LAB_MATERIALS[ "Chrome" ],            // insides
                    LAB_MATERIALS[ "Black rough" ]        // tire
                ]
            }
        },
        "gallardo": {
            name: 	"Lamborghini Gallardo",
            body_url:   "examples/obj/gallardo/parts/gallardo_body_bin.js",
            wheel_url: "examples/obj/gallardo/parts/gallardo_wheel_bin.js",
            author: '<a href="http://artist-3d.com/free_3d_models/dnm/model_disp.php?uid=1711" target="_blank">machman_3d</a>',
            init_rotation: [ 0, 0, 0 ],
            scale: 1,
            init_material: 9,
            body_materials: [ 3 ],
            height_offset: 48,

            object:	null,
            buttons: null,
            materials: {
                body: [
                    LAB_MATERIALS[ "Chrome" ],            // body
                    LAB_MATERIALS[ "Black rough" ],       // aerodynamic parts and rare window
                    LAB_MATERIALS[ "Black rough" ],       // windshield wiper
                    LAB_MATERIALS[ "Black rough" ],       // back licence plate
 
                    LAB_MATERIALS[ "Black rough" ],       // windshield
                    LAB_MATERIALS[ "Pure chrome" ],       // front light
                    LAB_MATERIALS[ "Red glass 50" ]       // back light
                ],
                wheel: [
                    LAB_MATERIALS[ "Chrome" ],            // insides
                    LAB_MATERIALS[ "Black rough" ]        // tire
                ]
            }
        },
//        "f50": {
//            name: 	"Ferrari F50",
//            url:	"examples/obj/f50/F50NoUv_bin.js",
//            author: '<a href="http://artist-3d.com/free_3d_models/dnm/model_disp.php?uid=1687" target="_blank">daniel sathya</a>',
//            init_rotation: [ 0, 0, 0 ],
//            scale: 0.0350,
//            init_material: 2,
//            body_materials: [ 3, 6, 7, 8, 9, 10, 23, 24 ],
//            height_offset: 0,
//
//            object:	null,
//            buttons: null,
//            materials: {
//                body: [
//                    LAB_MATERIALS[ "Orange" ],
//                    LAB_MATERIALS[ "Blue" ],
//                    LAB_MATERIALS[ "Red" ],
//                    LAB_MATERIALS[ "Black" ],
//                    LAB_MATERIALS[ "White" ],
//
//                    LAB_MATERIALS[ "Orange metal" ],
//                    LAB_MATERIALS[ "Blue metal" ],
//                    LAB_MATERIALS[ "Black metal" ],
//
//                    LAB_MATERIALS[ "Carmine" ],
//                    LAB_MATERIALS[ "Gold" ],
//                    LAB_MATERIALS[ "Bronze" ],
//                    LAB_MATERIALS[ "Chrome" ]
//                ],
//            }
//        }
    }
    
    
    return {
        /*
         * Build a threejs car object.
         *
         * @param {string} carType - veyron or gallardo
         * @param {int} initMaterial - a number indicates which body material the car uses
         * @param {object} position - an object that contains x, y and z position of the car
         * @param {THREE.Scene} - scene instance
         */
        build: function (id, carType, initMaterial, position, scene){

            if(!carType) {
                var cTypes = [];
                for(var c in DEF_CARS) cTypes.push(c);
                carType = cTypes[Math.floor(Math.random() * cTypes.length)]; //random car
            }
            if(initMaterial == null || initMaterial == undefined) {
                initMaterial = Math.floor(Math.random() * Object.keys(LAB_MATERIALS).length);
            }

            var carConfig = DEF_CARS[carType];
            var car = Object.assign(new THREE.Car(), carConfig);
            car.modelScale = carConfig.scale;

            //we need the carType and carId to distinguish the requested cars from the server
            car.type = carType;
            car.id = id;
            
            // configure the car
            if (carType == 'veyron') {
                this.configVeyron(car);
            }else if (carType == 'gallardo') {
                this.configGallardo(car);
            }

            // load meshes and materials
            car.callback = function (object) {
                object.root.position.set( position.x, position.y + car.height_offset, position.z );
                scene.add( object.root );

                // body materials
                for (var i = 0; i < object.bodyMaterials.length; i++) {
                    object.bodyMaterials[i] = car.materials.body[i];
                    object.bodyMaterials[i].side = THREE.DoubleSide;
                }

                // customize body material
                // by retrieving a material from LAB_MATERIALS
                var keys = Object.keys(LAB_MATERIALS);
                var materials = keys.map(function(material) { return LAB_MATERIALS[material]; });
                object.bodyMaterials[0] = materials[initMaterial];
                object.bodyMaterials[0].side = THREE.DoubleSide;

                // wheel materials
                for (var i = 0; i < object.wheelMaterials.length; i++) {
                    object.wheelMaterials[i] = car.materials.wheel[i];
                    object.wheelMaterials[i].side = THREE.DoubleSide;
                }
            }
            car.loadPartsBinary(carConfig.body_url, carConfig.wheel_url);

            // for downward compatibility
            // some other code are still using object and position to access data
            car.object = car.root;
            car.position = car.root.position;

            return car;
        },


        /*
         * Configuration of veyron
         */
        configVeyron: function (veyron) {
            veyron.MAX_SPEED = 400;
            veyron.MAX_REVERSE_SPEED = -600;

            veyron.MAX_WHEEL_ROTATION = 0.4;

            veyron.FRONT_ACCELERATION = 300;
            veyron.BACK_ACCELERATION = 500;

            veyron.WHEEL_ANGULAR_ACCELERATION = 1.6;

            veyron.FRONT_DECCELERATION = 200;
            veyron.WHEEL_ANGULAR_DECCELERATION = 1.0;

            veyron.STEERING_RADIUS_RATIO = 0.0083;
        },


        /*
         * Configuration of gallardo
         */
        configGallardo: function (gallardo) {
            gallardo.backWheelOffset = 6.5

            gallardo.MAX_SPEED = 350;
            gallardo.MAX_REVERSE_SPEED = -550;

            gallardo.MAX_WHEEL_ROTATION = 0.4;

            gallardo.FRONT_ACCELERATION = 300;
            gallardo.BACK_ACCELERATION = 500;

            gallardo.WHEEL_ANGULAR_ACCELERATION = 1.6;

            gallardo.FRONT_DECCELERATION = 200;
            gallardo.WHEEL_ANGULAR_DECCELERATION = 1.0;

            gallardo.STEERING_RADIUS_RATIO = 0.0083;
        }
    };
}