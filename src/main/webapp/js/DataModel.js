'use strict';


/**
*   Singleton object. Handles the data received from server calls.
*   Contains listeners, which parse the data and execute business logic
*   in order to build environment or control the vehicles.
*/
const DataModel = (function DataModel() {

    var self = {};

    var DEF_BLOCK_SIZE = 100;

    // Timing values
    self.simulationTimePrevMs = 0;
    self.simulationTimeCurrMs = 0;
    self.simulationTimeDeltaMs = 0;
    
    //match the data keys from the server
    self.STREETS_HANDLER = "streets";
    self.BUILDINGS_HANDLER = "buildings";
    self.CARS_HANDLER = "cars";
    self.PEDESTRIANS_HANDLER = "pedestrians";
    self.BOUNDS_HANDLER = "bounds";
    self.RAIN_HANDLER = "raining";
    self.STATIC_BOX_OBJECT_HANDLER = "staticBoxObjects";

    self.onDataProcessed; //to be attached
    self.afterEachFrame; //to be attached

    var DATA_HANDLERS = {};

    //custom parsers - parse the server data to the structured data we need
    var PARSERS = {};

    //simulation control
    var cachedPrevFrame;

    //config
    var parseCoordinates = (point, fn) => {
        if(typeof fn !== "function") fn = (a) => { return a; };
        return { x: fn(point.x), y: 0 /*fn(point.z)*/, z: fn(point.y) };
    };
    var getMeters = (a) => { return a * DEF_BLOCK_SIZE; };

    PARSERS[self.STREETS_HANDLER] = function (streets) {
        for(var i=0; i<streets.length; ++i) {
            var nodes = streets[i].nodes;
            for(var n=0; n<nodes.length; ++n) {
                var pt = parseCoordinates(nodes[n], getMeters);
                nodes[n].x = pt.x;
                nodes[n].y = pt.y;
                nodes[n].z = pt.z;
				if(nodes[n].streetSign.one) {
					nodes[n].streetSign.x1 = getMeters(nodes[n].streetSign.x1);
					nodes[n].streetSign.z1 = getMeters(nodes[n].streetSign.y1);
					nodes[n].streetSign.y1 = 0;				
				}
				if(nodes[n].streetSign.two) {
					nodes[n].streetSign.x2 = getMeters(nodes[n].streetSign.x2);
					nodes[n].streetSign.z2 = getMeters(nodes[n].streetSign.y2);
					nodes[n].streetSign.y2 = 0;					
				} 				
            }
            streets[i].streetWidth = getMeters(streets[i].streetWidth);
        }

        return streets;
    }

    PARSERS[self.BOUNDS_HANDLER] = function (bounds) {
        for(var k in bounds) bounds[k] = getMeters(bounds[k]);
        return bounds;
    }

    PARSERS[self.CARS_HANDLER] = function (cars) {
        for(var i=0; i<cars.length; ++i){
            cars[i].position = parseCoordinates(cars[i].position, getMeters);
            cars[i].velocity = parseCoordinates(cars[i].velocity, getMeters);
            cars[i].acceleration = parseCoordinates(cars[i].acceleration, getMeters);
        }

        return cars;
    }

	PARSERS[self.PEDESTRIANS_HANDLER] = function (pedestrians) {
        for(var i=0; i<pedestrians.length; ++i) {
			if(typeof pedestrians[i] != 'undefined') pedestrians[i].position = parseCoordinates(pedestrians[i].position, getMeters);
        }
        return pedestrians;
    }

    PARSERS[self.RAIN_HANDLER] = function (bool) { //FIXME remove
        return bool;
    }

    PARSERS[self.STATIC_BOX_OBJECT_HANDLER] = function (staticBoxObjects) {
        for(var i = 0; i < staticBoxObjects.length; ++i){
            var x = staticBoxObjects[i].position.x * 100;
            var y = staticBoxObjects[i].position.z * 100;
            var z = staticBoxObjects[i].position.y * 100;
            staticBoxObjects[i].position.x = x
            staticBoxObjects[i].position.y = y;
            staticBoxObjects[i].position.z = z;
        }

        return staticBoxObjects;
    }

    //initialize simulation after getting the required data
    var initialize = function initialize() {
        console.log('INITIALIZE SIMULATION ANIMATION');
        if(self.onDataProcessed) self.onDataProcessed();
        self.onDataProcessed = null; //executed only once
    }

    var onHandlersDone = function onHandlersDone() {
        if(typeof self.afterEachFrame == "function") self.afterEachFrame(); //e.g. send a screenshot
        WebService.WS_nextFrame();
    }

    var handleData = function handleData(data, initialized) {
        // Timing values
        self.simulationTimePrevMs = self.simulationTimeCurrMs;
        self.simulationTimeCurrMs = data.simulationTime;
        self.simulationTimeDeltaMs = self.simulationTimeCurrMs - self.simulationTimePrevMs;

        //execute specific handler with specific data
        var promises = [];
        for(var h in DATA_HANDLERS) {
            if(DATA_HANDLERS[h] && (data[h] != null)) {
                promises.push( DATA_HANDLERS[h](PARSERS[h] ? PARSERS[h](data[h]) : data[h]) );
            }
        }

        //initialize the simulation (e.g. run 'animate' if we have received the environment data)
        //otherwise ask for the next frame, when all the handlers has called resolve, i.e. they have performed not only calculations, but also executing animations
        Promise.all(promises).then(initialized ? onHandlersDone : initialize);
    }

    var cacheData = function cacheData(data) {
        cachedPrevFrame = Object.assign({}, data);
    }


    self.addHandler = function addHandler(type, handler) {
        //Only the handlers registered here will be executed, when server data is available !
        var handlers = [self.STREETS_HANDLER, self.BUILDINGS_HANDLER, self.CARS_HANDLER, self.BOUNDS_HANDLER, self.RAIN_HANDLER, self.PEDESTRIANS_HANDLER, self.STATIC_BOX_OBJECT_HANDLER];

        if( (handlers.findIndex( (el) => { return el == type; }) > -1) && typeof handler == "function") {
                DATA_HANDLERS[type] = function (data) {
                    return new Promise(function (resolve, reject) {
                        handler(data, resolve, reject);
                    });
                }
        }
    }

    self.onData = function onData(data) {
        if(!data) return; //stop simulation

        if(typeof self.onDataProcessed == "function") {
            console.log('init environment');
            handleData(data, false); //init data load, run initialize() at the end
        }else if(!cachedPrevFrame) {
            console.log('init cache');
            cacheData(data); //no cached data, cache current and ask for next frame
            WebService.WS_nextFrame();
        }else {
            console.log('play prev and cache current');
            handleData(cachedPrevFrame, true); //initialized and prev frame is cached, execute prev frame
            cacheData(data); //cache current frame data
        }
    }

    return self;
})();
