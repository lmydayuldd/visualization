'use strict';

/**
*   EnvBuilder takes care of the creation of meshes(trees, signs), but NOT the car.
*
*   jsonLoader - THREE.JSONLoader used to load models exported from Blender (.json files)
*	tgaLoader - THREE.TGALoader used to load textures (.tga files)
*   scene - THREE.Scene in which we put the meshes
*	meshArr - saves all meshes for later accessing/debugging
*/
function MeshBuilder(jsonLoader, tgaLoader, scene, meshArr) {

	var MESHES_DIR = "img/textures/Blender/";
	var SC_MULT = 2.75;
	
	// position and target for spotlights
	var lightOffset = {
		streetLamp: {x:80, y:195, z:0, xt:80, yt:0, zt:0},
		trafficLight: {x:0, y:189, z:25, xt:0, yt:189, zt:0}
	};
	
	/**
	*	add mesh to scene.
	*
	*	@params:
	*	type - string containing the type of mesh
	*	mapType - int indicating the type of UVMapping used (0:no mapping, 1:partial mapping, 2:sole mapping)
	*	position - position to be placed at {x,y,z}
	*	scale - scaling of the mesh {x,y,z}
	*	rotation - rotation of the mesh in rad {x,y,z}
	*	randRange - int containing range to randomize textures for specific meshes, -1 indicates that specific materials will be randomized
	*
	*/
	var add = function add(id, type, mapType, position, scale, rotation, randRange) {
		jsonLoader.load(MESHES_DIR + type + ".json", function(geometry, materials) {
			var texture;
			
			// random number for textures; only use when appropriate textures are available
			if(randRange > 1) {
				var rand = Math.floor(Math.random() * randRange + 1);
				texture = tgaLoader.load(MESHES_DIR + type + rand + ".png");
				
			} else if(mapType == 1 || mapType == 2) texture = tgaLoader.load(MESHES_DIR + type + ".png");

			// if only UVMapping is used, materials are not colored; otherwise color the materials with no mapping according to the .json
			if(mapType == 2) {
				var materialT = {};
				materialT.map = texture;

				var material = new THREE.MeshPhongMaterial(materialT);
				
			} else { 
				// materials in Blender have to be named precisely
				for(var m = 0; m<materials.length; m++){
					if(materials[m].name.includes('Map') || materials[m].name.includes('map')) materials[m].map = texture;						
					if(randRange == -1 && materials[m].name.includes('cloth1')) materials[m].color = [Math.random().toFixed(4), Math.random().toFixed(4), Math.random().toFixed(4)];
				}			
				var material = new THREE.MeshFaceMaterial(materials);
			}
			
			// create mesh
			var mesh = new THREE.Mesh(geometry, material);
			
			// set position
			mesh.position.x = position.x;
			mesh.position.y = position.y;
			mesh.position.z = position.z;
			
			// set scale
			if(scale) {
				mesh.scale.x = scale.x;
				mesh.scale.y = scale.y;
				mesh.scale.z = scale.z;
			}
			
			// set rotation
			if(rotation) {
				mesh.rotation.x = rotation.x;
				mesh.rotation.y = rotation.y;
				mesh.rotation.z = rotation.z;
			}
			
			// add mesh to scene and array
			scene.add(mesh);
			mesh.name = type;
			// THREE JS distributes its own id's all over the place, so we need other straight forward ones
			mesh.projectID = id;
			switch(type) {
				case "trafficLight":
					meshArr.trafficLights.push(mesh);
					break;
				case "ana":
				case "arnold":
					meshArr.pedestrians.push(mesh);
					break;					
				default:
					meshArr.push(mesh);
			}
			
			
			scene.updateMatrixWorld();
			/*
			// add lights to specific meshes(see lightOffset)
			if(type in lightOffset) {
				mesh.lights = [];
				
				let relativePos = mesh.localToWorld(new THREE.Vector3(
				lightOffset[type].x / mesh.scale.x, 
				lightOffset[type].y / mesh.scale.y, 
				lightOffset[type].z / mesh.scale.z ));
				
				let relativeTargetPos = mesh.localToWorld(new THREE.Vector3( 
				lightOffset[type].xt / mesh.scale.x, 
				lightOffset[type].yt / mesh.scale.y, 
				lightOffset[type].zt / mesh.scale.z ));
				
				switch(type) {
					case "streetLamp":
						var spotLight = new THREE.SpotLight(0xffffff, 5, 300, Math.PI/3, 0.5, 1);
						
						spotLight.position.set(relativePos.x, relativePos.y, relativePos.z);
						spotLight.target.position.set(relativeTargetPos.x, relativeTargetPos.y, relativeTargetPos.z);
						mesh.lights.push(spotLight);
						
						scene.add(spotLight.target);
						scene.add(spotLight);
						scene.updateMatrixWorld();
						
						mesh.setLight = function(state) {
							switch(state) {
								case 0:
									mesh.lights[0].visible = false;
									break;
								case 1:
									mesh.lights[0].visible = true;
									break;
							}
						}
						//default on
						mesh.setLight(1);
					break;
					
					case "trafficLight":
						var stackOffsetY = 85/ mesh.scale.y;
						
						var spotLightG = new THREE.SpotLight(0x00ff00, 70, 22, 0.46, 0.1, 1);
						var spotLightY = new THREE.SpotLight(0xff6600, 70, 22, 0.46, 0.1, 1);
						var spotLightR = new THREE.SpotLight(0xff0000, 70, 22, 0.46, 0.1, 1);
						
						spotLightG.position.set(relativePos.x, relativePos.y, relativePos.z);
						spotLightG.target.position.set(relativeTargetPos.x, relativeTargetPos.y, relativeTargetPos.z);
						mesh.lights.push(spotLightG);
						spotLightY.position.set(relativePos.x, relativePos.y+stackOffsetY, relativePos.z);
						spotLightY.target.position.set(relativeTargetPos.x, relativeTargetPos.y+stackOffsetY, relativeTargetPos.z);
						mesh.lights.push(spotLightY);
						spotLightR.position.set(relativePos.x, relativePos.y+2*stackOffsetY, relativePos.z);
						spotLightR.target.position.set(relativeTargetPos.x, relativeTargetPos.y+2*stackOffsetY, relativeTargetPos.z);
						mesh.lights.push(spotLightR);
						
						scene.add(spotLightG.target);
						scene.add(spotLightG);
						scene.add(spotLightY.target);
						scene.add(spotLightY);
						scene.add(spotLightR.target);
						scene.add(spotLightR);						
						scene.updateMatrixWorld();
						
						mesh.setLight = function(state) {
							switch(state) {
								case 0:
									// none
									mesh.lights[0].visible = false;
									mesh.lights[1].visible = false;
									mesh.lights[2].visible = false;
									break;
								case 1:
									// green
									mesh.lights[0].visible = true;
									mesh.lights[1].visible = false;
									mesh.lights[2].visible = false;
									break;
								case 2:
									// yellow
									mesh.lights[0].visible = false;
									mesh.lights[1].visible = true;
									mesh.lights[2].visible = false;
									break;	
								case 3:
									// red
									mesh.lights[0].visible = false;
									mesh.lights[1].visible = false;
									mesh.lights[2].visible = true;
									break;
								case 4:
									// all
									mesh.lights[0].visible = true;
									mesh.lights[1].visible = true;
									mesh.lights[2].visible = true;
									break;	
							}
						}
						//default green on
						mesh.setLight(1);
					break;
				}
			}
			*/
		});
	
	}
	
	var self = {
		/**
        *   toggle or set visibility for all meshes.
		*
        *   @param bol boolean the visibility is set to; toogle if none is given
        */
		toggleVisibility: function toggleVisibility(bol) {
			for(var i = 0; i<meshArr.length; i++) {
				if(bol === true || bol === false) meshArr[i].visible = bol;
				else meshArr[i].visible = !(meshArr[i].visible);
			}
			for(var i = 0; i<meshArr["trafficLights"].length; i++) {
				if(bol === true || bol === false) meshArr["trafficLights"][i].visible = bol;
				else meshArr["trafficLights"][i].visible = !(meshArr["trafficLights"][i].visible);
			}
			for(var i = 0; i<meshArr["pedestrians"].length; i++) {
				if(bol === true || bol === false) meshArr["pedestrians"][i].visible = bol;
				else meshArr["pedestrians"][i].visible = !(meshArr["pedestrians"][i].visible);
			}
            return self;
		},
		
		// Meshes
		addDummy: function addDummy(id, position, rotation) {
			let scale = {x:1.1*SC_MULT, y:1.1*SC_MULT, z:1.1*SC_MULT};
			let mapType = 0;
			add(id, "dummy", mapType, position, scale, rotation);
            return self;
		},
		
				addHouse: function addHouse(id, position, rotation){
		    let scale = {x:100*SC_MULT, y:100*SC_MULT, z:100*SC_MULT};
		    //console.log(scale.x);
		    //console.log(scale.y);
            let mapType = 0;
            add(id, "house", mapType, position, scale, rotation);
            return self;
		},

		addPatrol: function addPatrol(id, position, rotation){
            let scale = {x:1*SC_MULT, y:1*SC_MULT, z:1*SC_MULT};
        	//console.log(scale.x);
        	//console.log(scale.y);
            let mapType = 0;
            add(id, "patrol", mapType, position, scale, rotation);
            return self;
       	},

       	addCons: function addCons(id, position, rotation){
            let scale = {x:10*SC_MULT, y:10*SC_MULT, z:10*SC_MULT};
            //console.log(scale.x);
            //console.log(scale.y);
            let mapType = 0;
            add(id, "cons", mapType, position, scale, rotation);
            return self;
        },
		
        addTreePine: function addTreePine(id, position, rotation) {
			let scale = {x:24*SC_MULT, y:24*SC_MULT, z:24*SC_MULT};
			let mapType = 0;
			add(id, "treePine", mapType, position, scale, rotation);
            return self;
		},
		addTreeStd: function addTreeStd(id, position, rotation) {
			let scale = {x:32*SC_MULT, y:32*SC_MULT, z:32*SC_MULT};
			let mapType = 0;
			add(id, "treeStd", mapType, position, scale, rotation);
            return self;
		},
		 addArnold: function addArnold(id, position, rotation) {
			let scale = {x:5.13*SC_MULT, y:5.13*SC_MULT, z:5.13*SC_MULT};
			let mapType = 0;
			add(id, "arnold", mapType, position, scale, rotation, -1);
            return self;
		}, 
		addAna: function addAna(id, position, rotation) {
			let scale = {x:5.67*SC_MULT, y:5.67*SC_MULT, z:5.67*SC_MULT};
			let mapType = 0;
			add(id, "ana", mapType, position, scale, rotation, -1);
            return self;
		}, 
		
		addStopSign: function addStopSign(id, position, rotation) {
			let scale = {x:1.38*SC_MULT, y:1.38*SC_MULT, z:1.38*SC_MULT};
			let mapType = 1;
			add(id, "stopSign", mapType, position, scale, rotation);
            return self;
		},
		addPrioritySign: function addPrioritySign(id, position, rotation) {
			let scale = {x:1.24*SC_MULT, y:1.24*SC_MULT, z:1.24*SC_MULT};
			let mapType = 1;
			add(id, "prioritySign", mapType, position, scale, rotation);
            return self;
		},
		addNoEntrySign: function addNoEntrySign(id, position, rotation) {
			let scale = {x:1.17*SC_MULT, y:1.17*SC_MULT, z:1.17*SC_MULT};
			let mapType = 1;
			add(id, "noEntrySign", mapType, position, scale, rotation);
            return self;
		},
		add50Sign: function add50Sign(id, position, rotation) {
			let scale = {x:1.17*SC_MULT, y:1.17*SC_MULT, z:1.17*SC_MULT};
			let mapType = 1;
			add(id, "50Sign", mapType, position, scale, rotation);
            return self;
		},
		add70Sign: function add70Sign(id, position, rotation) {
			let scale = {x:1.17*SC_MULT, y:1.17*SC_MULT, z:1.17*SC_MULT};
			let mapType = 1;
			add(id, "70Sign", mapType, position, scale, rotation);
            return self;
		},
		add30Zone: function add30Zone(id, position, rotation) {
			let scale = {x:1.*SC_MULT, y:1.*SC_MULT, z:1.*SC_MULT};
			let mapType = 1;
			add(id, "30Zone", mapType, position, scale, rotation);
            return self;
		},
		add30ZoneEnd: function add30ZoneEnd(id, position, rotation) {
			let scale = {x:1.*SC_MULT, y:1.*SC_MULT, z:1.*SC_MULT};
			let mapType = 1;
			add(id, "30ZoneEnd", mapType, position, scale, rotation);
            return self;
		},		
		addParkSign: function addParkSign(id, position, rotation) {
			let scale = {x:1.*SC_MULT, y:1.*SC_MULT, z:1.*SC_MULT};
			let mapType = 1;
			add(id, "parkSign", mapType, position, scale, rotation);
            return self;
		},		
		addEggSign: function addEggSign(id, position, rotation) {
			let scale = {x:1.03*SC_MULT, y:1.03*SC_MULT, z:1.03*SC_MULT};
			let mapType = 1;
			add(id, "eggSign", mapType, position, scale, rotation);
            return self;
		},
		addNoWaitingSign: function addNoWaitingSign(id, position, rotation) {
			let scale = {x:1.17*SC_MULT, y:1.17*SC_MULT, z:1.17*SC_MULT};
			let mapType = 1;
			add(id, "noWaitingSign", mapType, position, scale, rotation);
            return self;
		},
		addNoParkingSign: function addNoParkingSign(id, position, rotation) {
			let scale = {x:1.17*SC_MULT, y:1.17*SC_MULT, z:1.17*SC_MULT};
			let mapType = 1;
			add(id, "noParkingSign", mapType, position, scale, rotation);
            return self;
		},
		addAttentionSign: function addAttentionSign(id, position, rotation) {
			let scale = {x:1.15*SC_MULT, y:1.15*SC_MULT, z:1.15*SC_MULT};
			let mapType = 1;
			add(id, "attentionSign", mapType, position, scale, rotation);
            return self;
		},
		addBusStopSign: function addBusStopSign(id, position, rotation) {
			let scale = {x:1.*SC_MULT, y:1.*SC_MULT, z:1.*SC_MULT};
			let mapType = 1;
			add(id, "busStopSign", mapType, position, scale, rotation);
            return self;
		},
		addDeadEndSign: function addDeadEndSign(id, position, rotation) {
			let scale = {x:1.*SC_MULT, y:1.*SC_MULT, z:1.*SC_MULT};
			let mapType = 1;
			add(id, "deadEndSign", mapType, position, scale, rotation);
            return self;
		},
		addIntersectionSign: function addIntersectionSign(id, position, rotation) {
			let scale = {x:1.15*SC_MULT, y:1.15*SC_MULT, z:1.15*SC_MULT};
			let mapType = 1;
			add(id, "intersectionSign", mapType, position, scale, rotation);
            return self;
		},
		addPriorityGivenSign: function addPriorityGivenSign(id, position, rotation) {
			let scale = {x:1.15*SC_MULT, y:1.15*SC_MULT, z:1.15*SC_MULT};
			let mapType = 1;
			add(id, "priorityGivenSign", mapType, position, scale, rotation);
            return self;
		},
		addCrosswalkSign: function addCrosswalkSign(id, position, rotation) {
			let scale = {x:1.15*SC_MULT, y:1.15*SC_MULT, z:1.15*SC_MULT};
			let mapType = 1;
			add(id, "crosswalkSign", mapType, position, scale, rotation);
            return self;
		},
		addRoadworkSign: function addRoadworkSign(id, position, rotation) {
			let scale = {x:1.15*SC_MULT, y:1.15*SC_MULT, z:1.15*SC_MULT};
			let mapType = 1;
			add(id, "roadworkSign", mapType, position, scale, rotation);
            return self;
		},
		addEndAllProhibSign: function addEndAllProhibSign(id, position, rotation) {
			let scale = {x:1.17*SC_MULT, y:1.17*SC_MULT, z:1.17*SC_MULT};
			let mapType = 1;
			add(id, "endAllProhibSign", mapType, position, scale, rotation);
            return self;
		},		
		addBumpyRoadSign: function addBumpyRoadSign(id, position, rotation) {
			let scale = {x:1.15*SC_MULT, y:1.15*SC_MULT, z:1.15*SC_MULT};
			let mapType = 1;
			add(id, "bumpyRoadSign", mapType, position, scale, rotation);
            return self;
		},		
		
		addTrafficLight: function addTrafficLight(id, position, rotation) {
			let scale = {x:1.4*SC_MULT, y:1.4*SC_MULT, z:1.4*SC_MULT};
			let mapType = 0;
			add(id, "trafficLight", mapType, position, scale, rotation);
            return self;
		},
		addStreetLamp: function addStreetLamp(id, position, rotation) {
			let scale = {x:8*SC_MULT, y:8*SC_MULT, z:8*SC_MULT};
			let mapType = 0;
			add(id, "streetLamp", mapType, position, scale, rotation);
            return self;
		},
		addGarbagecan: function addGarbagecan(id, position, rotation) {
			let scale = {x:2.6*SC_MULT, y:2.6*SC_MULT, z:2.6*SC_MULT};
			let mapType = 0;
			add(id, "garbagecan", mapType, position, scale, rotation);
            return self;
		}
    };

    return self;
}
