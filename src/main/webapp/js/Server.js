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
        onLogin: null,
        onLoginError: null,
        onLogout: null
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
    };
    let onRoomJoined = function onRoomJoined(e) { m_room = e.room; };
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
                res.push({ id: sfsScen.getInt('id'), name: sfsScen.getUtfString('name'), tracks: sfsScen.getInt('tracks') });
            }
            //execute registered callback for current command with response parameters
            if(m_extensionListeners[cmd]) m_extensionListeners[cmd](res);
        }
        /**
        * Scenario simulation is prepared on the server.
        */
        else if(e.cmd = 'load_scenario') {
            //execute callback if registered
            if(m_extensionListeners[cmd]) m_extensionListeners[cmd]();
        }
        /**
        * Return next frame data.
        */
        else if(e.cmd = 'next_frame') {
            //TODO return next frame data
            let data = null;
            if(m_extensionListeners[cmd]) m_extensionListeners[cmd](data);
        }
        //start and stop commands do not need callbacks
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
        loadScenario: function loadScenario(scenarioId, callback) {
            if(!m_isConnected) return console.log("Not connected to the server!");
            if(!scenarioId) return console.log("Missing parameter: scenario");
            var params = new SFS2X.SFSObject();
            params.putInt("id", scenarioId);
            
            sendRequest('load_scenario', params, callback);
        },
        //extension requests - Sector
        start: function start() {
            if(!m_isConnected || !m_room) return console.log("Not connected to server/sector!");
            sendRequest('start'); //start scenario simulation(s)
        },
        stop: function stop() {
            if(!m_isConnected || !m_room) return console.log("Not connected to server/sector!");
            sendRequest('stop'); //stop scenario simulation(s)
        },
        nextFrame: function nextFrame(callback) {
            if(!m_isConnected || !m_room) return console.log("Not connected to server/sector!");
            sendRequest('next_frame', null, callback); //stop scenario simulation(s)
        },
        //main API methods
        login: function login(user, pass, successCb, errorCb) {
            if(!m_isConnected) return console.log("Not connected to the server!");
            if(typeof successCb == 'function') m_listeners.onLogin = successCb;
            if(typeof errorCb == 'function') m_listeners.onLoginError = errorCb;
            sfs.send(new SFS2X.LoginRequest(user, pass));
        },
        logout: function logout(callback) {
            if(!m_isConnected) return console.log("Not connected to the server!");
            if(typeof callback == 'function') m_listeners.onLogout = callback;
            sfs.send(new SFS2X.LogoutRequest());
        }
    };
    
    // Add event listeners
    sfs.addEventListener(SFS2X.SFSEvent.CONNECTION, onConnection, this);
    sfs.addEventListener(SFS2X.SFSEvent.CONNECTION_LOST, onConnectionLost, this);

    sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN, onRoomJoined, this);
    sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN_ERROR, onRoomJoinError, this);

    sfs.addEventListener(SFS2X.SFSEvent.LOGIN, m_listeners.onLogin, this);
    sfs.addEventListener(SFS2X.SFSEvent.LOGIN_ERROR, m_listeners.onLoginError, this);
    sfs.addEventListener(SFS2X.SFSEvent.LOGOUT, m_listeners.onLogout, this);
    
    sfs.addEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, onExtensionResponse, this);

    // Attempt connection
    sfs.connect();
    
    return self;
})();