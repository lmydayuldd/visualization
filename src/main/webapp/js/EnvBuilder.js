'use strict';

/**
*   EnvBuilder is used to create an environment by demand.
*
*   loader - THREE.TGALoader used to load textures (.tga files)
*   scene - THREE.Scene in which we put our textures
*/
function EnvBuilder(loader, scene) {

    //start point for building environment
    var DEF_WIDTH = 300;
    var HIGHT_OFFSET = 2;

    //texture sources
    var TEXTURES_DIR = "img/textures/";
    var TEXTURES = {
        asphalt: TEXTURES_DIR + "Street/asphalt.jpg",
        terrain: TEXTURES_DIR + "Grass/texture_grass.jpg",
    }
    
    let OBJECTS = [];


    /**
    *   Add plain block texture. (obsolete)
    *
    *   @params:
    *   type - string key of TEXTURES object(map)
    *   position - position of the texture to be placed at
    *   rotation - rotation of the texture
    *   geometry - custom geometry to be applied
    *   materialProps - custom material properties to be applied
    *   repeat - should the texture be repeated. Repeat object of the form { u: Number, v: Number }
    *   shadow - true/false, should the texture receive shadow
    */
    var add = function add(type, position, rotation, geometry, materialProps, repeat, shadow) {
        var texture = loader.load( TEXTURES[type] );

        //create default material if non is defined
        if(!materialProps) materialProps = {};
        materialProps.map = texture;
        if(!materialProps.color)  materialProps.color = 0xffffff;

        var material = new THREE.MeshPhongMaterial( materialProps );

        //create box geometry if non is defined
        if(!geometry) geometry = new THREE.BoxGeometry( 300, 1, 300 );

        if(repeat) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set( repeat.u, repeat.v );
            texture.anisotropy = 16; //filter to make the texture look smoother/cleaner
        }

        var mesh = new THREE.Mesh( geometry, material );

        mesh.position.x = position.x;
        mesh.position.y = position.y;
        mesh.position.z = position.z;

        if(rotation) {
            mesh.rotation.x = rotation.x;
            mesh.rotation.y = rotation.y;
            mesh.rotation.z = rotation.z;
        }

        if(shadow) mesh.receiveShadow = true;

        scene.add( mesh );
        OBJECTS.push(mesh);
    }

    //detect direction between 2 nodes - direction on X or Z (left/right or forward/backward)
    var getDirection = function getDirection(n1, n2) {
        var diffX = n2.x - n1.x;
        var diffZ = n2.z - n1.z;

        var dir = '';
        if(Math.abs(diffZ) == Math.abs(diffX)) {
            dir = (diffX > 0 ? 'x' : '-x') + (diffZ > 0 ? 'z' : '-z');
        }else {
            dir = Math.abs(diffZ) >= Math.abs(diffX) ? (diffZ > 0 ? 'z' : '-z') : (diffX > 0 ? 'x' : '-x');
        }

        return dir;
    }

    var self = {
        /**
        * Removes all objects, added to the scene until this moment
        */
        clear: function clear() {
            for(let i=0; i<OBJECTS.length; ++i) scene.remove(OBJECTS[i]);
        },
        //generic add
        add: add,

        /**
        *   Builds terrain.
        *
        *   @param data - server data. Coordination system is the one used on the server side !
        */
        addTerrain: function addIntersection(data) {
            if(!data) return;

            var groundTexture = loader.load(TEXTURES.terrain);
            groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
            groundTexture.repeat.set(25, 25);
            groundTexture.anisotropy = 16;

            var width = Math.abs(data.maxX) + Math.abs(data.minX);
            var height = Math.abs(data.maxY) + Math.abs(data.minY);


            var groundMaterial = new THREE.MeshPhongMaterial({ color: 0x666666, specular: 0x010101, map: groundTexture, side: THREE.DoubleSide });
            var geometry = new THREE.PlaneBufferGeometry(width, height);

            //TODO add bumpy terrain handlers when we have a terrain matrix data from the server
//            for (var i = 0, l = geometry.vertices.length; i < l; i++) {
//                geometry.vertices[i].y = data[i];
//            }

            var mesh = new THREE.Mesh(geometry, groundMaterial);


            //centralize the mesh position
            mesh.position.x = width/2;
            mesh.position.z = height/2;
            mesh.position.y = data.minZ - 2*HIGHT_OFFSET; //keep the ground under the streets

            mesh.rotation.x = -Math.PI/2;
            mesh.receiveShadow = false;
            scene.add(mesh);
            OBJECTS.push(mesh);

            return self;
        },

        /**
        *   Generic draw of custom shape.
        *
        *   @params:
        *   vectors - vectors of the curve to be drawn
        *   texType - texture type, either string key of TEXTURES or hex colour
        *   width - width (size) of the shape
        *   shadow - should the curve receive shadow
        */
        drawShape: function drawShape(vectors, texType, width, shadow, shapeCube) {
            if(!vectors || !texType) return self;

            if(!width) width = DEF_WIDTH;

            //if a cube shape is required, the spline will be a cube, otherwise a line with height 1
            var h = shapeCube ? width : 1;
            //default cube
            var shape = new THREE.Shape([
                new THREE.Vector2(0, -width/2),
                new THREE.Vector2(0, width/2),
                new THREE.Vector2(h, width/2),
                new THREE.Vector2(h, -width/2),
            ]);
            //settings
            var extrudeSettings = {
                steps: 5*vectors.length, //smoothness
                amount: 16,
                bevelEnabled: true,
                bevelThickness: 1,
                bevelSize: 1,
                bevelSegments: 1,
                extrudePath: new THREE.CatmullRomCurve3(vectors),
                material: 0,
                extrudeMaterial: 1,
            };

            var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

            var material;

            if(isNaN(texType)) {
                var texture = loader.load(TEXTURES[texType]);
                texture.repeat.set(1/width, 1/width);
                texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
                texture.anisotropy = 16;

                material = new THREE.MeshPhongMaterial( {
                    map: texture,
                    side: THREE.DoubleSide,
					specular: 0x010101
                });
            }else {
                material = new THREE.MeshPhongMaterial( {
                    color: texType,
                    side: THREE.DoubleSide
                });
            }

            var mesh = new THREE.Mesh(geometry, material);
            mesh.receiveShadow = !!shadow;

            // Fix streets that do not face in the correct way, might be caused by ExtrudeGeometry and automatic detection of normals via Frenet Frame computations
            // y values of street vertices are currently usually around -3 with offset, check against absolute value 3 to be sure
            if (texType === 'asphalt') {
                if (mesh.geometry.vertices.length > 0 && Math.abs(mesh.geometry.vertices[0].y) > 3) {
                    // Note: This is a general problem, for simplicity this code here fixes the only 2 known occurences with specific values
                    // For these two streets rotation around x axis with 0.5 * Pi is the solution
                    mesh.geometry.computeBoundingSphere();
                    var centerErrorStreet1 = new THREE.Vector3(105092.45627604164, -2, 110893.05886001972);
                    var centerErrorStreet2 = new THREE.Vector3(105080.06437489255, -2, 97406.3480800192);
                    var center = mesh.geometry.boundingSphere.center;

                    // Check for distance to known wrong streets
                    if (center.distanceTo(centerErrorStreet1) < 6.0 || center.distanceTo(centerErrorStreet2) < 6.0) {
                        mesh.position.set(center.x, center.y, center.z);
                        mesh.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z));
                        mesh.rotation.x += (0.5 * Math.PI);
                    }
                }
                
                mesh.geometry.scale(1, -1, 1);
            }
            
            scene.add(mesh);
            OBJECTS.push(mesh);

            return self;
        },
        /**
        *   Draws a middle line. (deprecated - overload)
        *
        *   @params:
        *   nodes - vectors of the line
        *   offset - offset on X or Z, i.e. a step added to the x (z) axis of each vector (node)
        *   splitted - if true draws splitted middle line, otherwise draws one non-splitted middle line
        *   width - width (size) of the line
        *   color - line colour
        *   shadow - should the texture receive shadow
        */
        drawLine: function drawLine(nodes, offset, splitted, width, color, shadow) {
            if(!width) width = 5; //default width
            if(isNaN(color)) color = 0xffffff; //white

            var arr = [];
            var direction;

            for(var i=0; i<nodes.length; ++i) {
                arr.push(new THREE.Vector3(nodes[i].x, nodes[i].y+1, nodes[i].z));

                if(i < nodes.length - 1)
                {
                    direction = getDirection(nodes[i], nodes[i+1]);

                    if(direction.match('-z')) arr[i].x -= offset;
                    else if(direction.match('z')) arr[i].x += offset;

                    if(direction.match('-x')) arr[i].z += offset;
                    else if(direction.match('x')) arr[i].z -= offset;
                }
            }

            if(splitted) {
                for(var i=0; i<arr.length-1; ++i) {
                    var n1 = arr[i];
                    var n2 = arr[i+1];

                    var middle = {
                        x: (n1.x + n2.x)/2,
                        y: Math.max(n1.y, n2.y), //line MUST be above other textures
                        z: (n1.z + n2.z)/2
                    }
                    var qDist = { //quarter distance between 2 nodes
                        x: (n2.x - n1.x)/4,
                        y: (n2.y - n1.y)/4,
                        z: (n2.z - n1.z)/4
                    }

                    //create new vectors
                    var v1 = new THREE.Vector3(middle.x - qDist.x, middle.y, middle.z - qDist.z);
                    var v2 = new THREE.Vector3(middle.x + qDist.x, middle.y, middle.z + qDist.z);

                    self.drawShape([v1, v2], color, width, shadow, true);
                }
            }else {
                self.drawShape(arr, color, width, shadow, true);
            }

            return self;
        },
        /**
        *   Draws road with outline and if requested a middle line.
        *
        *   @params:
        *   nodes - vectors of the road
        *   width - width (size) of the road
        *   isSplitted - if true draws splitted middle line, if false draws one non-splitted middle line, otherwise draws no line
        *   lineColor - middle line and outline colour
        *   shadow - should the textures receive shadow
        */
        drawRoad: function drawRoad(nodes, width, isSplitted, lineColor, shadow) {
            var outline = 10;
            if(!width) width = DEF_WIDTH;
            if(isNaN(lineColor)) lineColor = 0xffffff;

            var underPlainNodes = [];
            var direction;

            //change vectors properly to display proper outlines
            for(var i=0; i<nodes.length; ++i) {
                //reduce the height of the road and the underlying plane in one step
                underPlainNodes.push(new THREE.Vector3(nodes[i].x, (nodes[i].y-=HIGHT_OFFSET) - 1, nodes[i].z));

                // Counter effect for flipping roads later on to get normals right, increase their height here
                nodes[i].y += 2.85 * HIGHT_OFFSET;

                if (i < nodes.length - 1)
                {
                    direction = getDirection(nodes[i], nodes[i+1]);

                    if(direction.match('-z')) underPlainNodes[i].x += outline/2;
                    else if(direction.match('z')) underPlainNodes[i].x -= outline/2;

                    if(direction.match('-x')) underPlainNodes[i].z -= outline/2;
                    else if(direction.match('x')) underPlainNodes[i].z += outline/2;
                }
            }

            self.drawShape(underPlainNodes, lineColor, (width + 2*outline), shadow)
                .drawShape(nodes, 'asphalt', width, shadow);

            //if isSplitted is null or undefined, no line will be drawn, otherwise a non- or splitted line will be drawn
            if(isSplitted === true || isSplitted === false) self.drawLine(nodes, width/2, isSplitted, outline, lineColor, shadow);

            return self;
        }
    };

    return self;
}
