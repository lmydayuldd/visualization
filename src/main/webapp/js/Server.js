'use strict';

const Server = (function Server() {
    
    // Create configuration object
	let config = {
        host: 'localhost', //FIXME change when deploy
        port: 8080,
        debug: true, //FIXME change when deploy
        useSSL: false,
        zone: 'World'
    };

	// Create SmartFox client instance
	let sfs = new SFS2X.SmartFox(config);

	// Set logging
	sfs.logger.level = SFS2X.LogLevel.DEBUG;  //FIXME remove when deploy
	sfs.logger.enableConsoleOutput = true;
    
    //private members
    let m_isConnected = false;
    let m_room = null;
    
    //callback references
    let m_listeners = {
        onLogin: function () {},
        onLoginError: function () {},
        onLogout: function () {},
        onUserExitRoom: function () {}
    };
    let m_extensionListeners = {};
    
    
    //main listeners
    let onConnection = function onConnection() { m_isConnected = true; };
    let onConnectionLost = function onConnectionLost() {
        //clean up
        sfs.removeEventListener(SFS2X.SFSEvent.CONNECTION, onConnection);
        sfs.removeEventListener(SFS2X.SFSEvent.CONNECTION_LOST, onConnectionLost);
        
        sfs.removeEventListener(SFS2X.SFSEvent.ROOM_JOIN, onRoomJoined, this);
        sfs.removeEventListener(SFS2X.SFSEvent.ROOM_JOIN_ERROR, onRoomJoinError, this);
        
        sfs.removeEventListener(SFS2X.SFSEvent.LOGIN, m_listeners.onLogin, this);
        sfs.removeEventListener(SFS2X.SFSEvent.LOGIN_ERROR, m_listeners.onLoginError, this);
        sfs.removeEventListener(SFS2X.SFSEvent.LOGOUT, m_listeners.onLogout, this);
        
        sfs.removeEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, onExtensionResponse, this);
        
        //clean up callback references
        m_listeners = null;
        m_extensionListeners = null;
        m_isConnected = false;
        m_room = null;
        
        console.log('Disconnected from the server!');
    };
    let onRoomJoined = function onRoomJoined(e) { m_room = e.room; console.log("Joined room: " + m_room); };
    let onRoomJoinError = function onRoomJoinError(e) { m_room = null; };
    
    let onExtensionResponse = function onExtensionResponse(e) {
        /**
        * Return scenarios as JS array of JS object.
        * containing id, name and number of tracks/cars
        */
        if(e.cmd == 'get_scenarios') {
            let sfsParams = e.params;
            let sfsScenarios = sfsParams.getSFSArray('scenarios');

            let res = [];
            for(let i=0; i<sfsScenarios.size(); ++i) {
                let sfsScen = sfsScenarios.getSFSObject(i);
                //fetch tracks data
                let sfsTracks = sfsScen.getSFSArray("tracks");
                let tracks = [];
                for(let t=0; t<sfsTracks.size(); ++t) {
                    let sfsTrack = sfsTracks.getSFSObject(t);
                    tracks.push({ id: sfsTrack.getInt("id"), name: sfsTrack.getUtfString("name") });
                }
                
                res.push({ id: sfsScen.getInt('id'), name: sfsScen.getUtfString('name'), tracks: tracks });
            }
            //execute registered callback for current command with response parameters
            if(m_extensionListeners[e.cmd]) m_extensionListeners[e.cmd](res);
        }
        /**
        * Scenario simulation is prepared on the server.
        */
        else if(e.cmd == 'load_scenario') {
            //Parse world data to JS object
            let sfsParams = e.params;

            let sfsBounds = sfsParams.getSFSObject("bounds");
            let sfsStreets = sfsParams.getSFSArray("streets");
            let sfsBuildings = sfsParams.getSFSArray("buildings");
            //JS world representation
            let world = {};
            //parse bounds
            world.bounds = {
                maxX: sfsBounds.getDouble('maxX'),
                maxY: sfsBounds.getDouble('maxY'),
                maxZ: sfsBounds.getDouble('maxZ'),
                minX: sfsBounds.getDouble('minX'),
                minY: sfsBounds.getDouble('minY'),
                minZ: sfsBounds.getDouble('minZ')
            };
            //reusable node-parsing
            let getNodes = function getNodes(sfsNodes) {
                let nodes = [];
                for(let i=0; i<sfsNodes.size(); ++i) {
                    let sfsNode = sfsNodes.getSFSObject(i);
                    //parse node
                    let node = {
                        id: sfsNode.getLong('id'),
                        x: sfsNode.getDouble('x'),
                        y: sfsNode.getDouble('y'),
                        z: sfsNode.getDouble('z')
                    };
                    //parse streetSign
                    if(sfsNode.containsKey('streetSign')) {
                        let sign = sfsNode.getSFSObject('streetSign');
                        node.streetSign = {
                            id: sign.getLong('id'),
                            type: sign.getUtfString('type'),
                            one: sign.getBool('one'),
                            two: sign.getBool('two'),
                            x1: sign.getDouble('x1'),
                            x2: sign.getDouble('x2'),
                            y1: sign.getDouble('y1'),
                            y2: sign.getDouble('y2'),
                            z1: sign.getDouble('z1'),
                            z2: sign.getDouble('z2'),
                        }
                    }
                    //add node
                    nodes.push(node);
                }
                return nodes;
            }
            
            //parse streets
            world.streets = [];
            for(let i=0; i<sfsStreets.size(); ++i) {
                let sfsStr = sfsStreets.getSFSObject(i);
                world.streets.push({
                    streetWidth: sfsStr.getDouble('streetWidth'),
                    nodes: getNodes(sfsStr.getSFSArray('nodes'))
                });
            }
            //parse buildings
            world.buildings = [];
            for(let i=0; i<sfsBuildings.size(); ++i) {
                let sfsB = sfsBuildings.getSFSObject(i);
                world.streets.push({ nodes: getNodes(sfsB.getSFSArray('nodes')) });
            }
            console.log('World data parsed');
            console.log(world);
            //execute callback if registered
            if(m_extensionListeners[e.cmd]) m_extensionListeners[e.cmd](world);
        }
        /**
        * Return next frame data.
        */
        else if(e.cmd == 'next_frame') {
            //Parse frame data to JS object
            let sfsParams = e.params;
            
            let sfsCars = sfsParams.getSFSArray("cars");
            let sfsPedestrians = sfsParams.getSFSArray("pedestrians");
            let sfsObjects = sfsParams.getSFSArray("staticBoxObjects");
            
            //3D point parser function
            let getPoint = function getPoint(sfsPoint) {
                return {
                    x: sfsPoint.getDouble('x'),
                    y: sfsPoint.getDouble('y'),
                    z: sfsPoint.getDouble('z')
                }
            };
            
            //JS frame data representation
            let data = {
                raining: sfsParams.getBool('raining'),
                cars: [],
                pedestrians: [],
                staticBoxObjects: []
            };
            
            //parse cars
            for(let i=0; i<sfsCars.size(); ++i) {
                let sfsC = sfsCars.getSFSObject(i);
                data.cars.push({
                    id: sfsC.getLong('id'),
                    position: getPoint(sfsC.getSFSObject('position')),
                    velocity: getPoint(sfsC.getSFSObject('velocity')),
                    acceleration: getPoint(sfsC.getSFSObject('acceleration'))
                });
            }
            //parse pedestrians
            for(let i=0; i<sfsPedestrians.size(); ++i) {
                let sfsP = sfsPedestrians.getSFSObject(i);
                data.pedestrians.push({
                    id: sfsP.getLong('id'),
                    position: getPoint(sfsP.getSFSObject('position')),
                    iscrossing: sfsP.getBool('iscrossing'),
                    direction: sfsP.getBool('direction'),
                    isleftpavement: sfsP.getBool('isleftpavement')
                });
            }
            //parse static objects
            for(let i=0; i<sfsObjects.size(); ++i) {
                let sfsObj = sfsObjects.getSFSObject(i);
                data.staticBoxObjects.push({
                    id: sfsObj.getLong('id'),
                    position: getPoint(sfsObj.getSFSObject('position')),
                    length: sfsObj.getDouble('length'),
                    width: sfsObj.getDouble('width'),
                    height: sfsObj.getDouble('height'),
                    objectType: sfsObj.getInt('objectType')
                });
            }
            
            console.log("New frame data");
            console.log(data);
            
            if(m_extensionListeners[e.cmd]) m_extensionListeners[e.cmd](data);
        }
    };
    
    //private methods
    let sendRequest = function sendRequest(cmd, params, callback) {
        if(typeof callback == 'function') m_extensionListeners[cmd] = callback;
        sfs.send(new SFS2X.ExtensionRequest(cmd, params, m_room));
    };
    
    
    
    self = {
        //extension requests - Zone
        getScenarios: function getScenarios(callback) {
            if(!m_isConnected) return console.log("Not connected to the server!");
            sendRequest('get_scenarios', null, callback);
        },
        loadScenario: function loadScenario(scenarioId, trackId, callback) {
            if(!m_isConnected) return console.log("Not connected to the server!");
            if(!scenarioId || !trackId) return console.log("Missing parameter: scenarioId/trackId");
            var params = new SFS2X.SFSObject();
            params.putInt("scenarioId", scenarioId);
            params.putInt("trackId", trackId);
            
            sendRequest('load_scenario', params, callback);
        },
        //extension requests - Sector
        leaveRoom: function leaveRoom(callback) {
            if(!m_isConnected || !m_room) return console.log("Not connected to server/sector!");
            //remove old listener
            sfs.removeEventListener(SFS2X.SFSEvent.USER_EXIT_ROOM, m_listeners.onUserExitRoom, this);
            //redefine listener
            m_listeners.onUserExitRoom = function onUserExitRoom(e) {
                m_room = null; //clean up room details
                if(typeof callback == 'function') callback();
            };
            //re-register listener
            sfs.addEventListener(SFS2X.SFSEvent.USER_EXIT_ROOM, m_listeners.onUserExitRoom, this);
            
            sfs.send(new SFS2X.LeaveRoomRequest(m_room));
        },
        nextFrame: function nextFrame(callback) {
            if(!m_isConnected || !m_room) return console.log("Not connected to server/sector!");
            sendRequest('next_frame', null, callback); //stop scenario simulation(s)
        },
        //main API methods
        login: function login(user, pass, successCb, errorCb) {
            if(!m_isConnected) return console.log("Not connected to the server!");
            //drop old listeners
            sfs.removeEventListener(SFS2X.SFSEvent.LOGIN, m_listeners.onLogin, this);
            sfs.removeEventListener(SFS2X.SFSEvent.LOGIN_ERROR, m_listeners.onLoginError, this);
            
            m_listeners.onLogin = typeof successCb == 'function' ? successCb : function () {};
            m_listeners.onLoginError = typeof errorCb == 'function' ? errorCb : function () {};
            //register new listeners
            sfs.addEventListener(SFS2X.SFSEvent.LOGIN, m_listeners.onLogin , this);
            sfs.addEventListener(SFS2X.SFSEvent.LOGIN_ERROR, m_listeners.onLoginError, this);
            
            sfs.send(new SFS2X.LoginRequest(user, pass));
        },
        logout: function logout(callback) {
            if(!m_isConnected) return console.log("Not connected to the server!");
            
            sfs.removeEventListener(SFS2X.SFSEvent.LOGOUT, m_listeners.onLogout, this);
            
            m_listeners.onLogout = typeof callback == 'function' ? callback : function () {};
            
            sfs.addEventListener(SFS2X.SFSEvent.LOGOUT, m_listeners.onLogout, this);
            sfs.send(new SFS2X.LogoutRequest());
        }
    };
    
    // Add event listeners
    sfs.addEventListener(SFS2X.SFSEvent.CONNECTION, onConnection, this);
    sfs.addEventListener(SFS2X.SFSEvent.CONNECTION_LOST, onConnectionLost, this);

    sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN, onRoomJoined, this);
    sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN_ERROR, onRoomJoinError, this);
    
    sfs.addEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, onExtensionResponse, this);

    // Attempt connection
    sfs.connect();
    
    return self;
})();