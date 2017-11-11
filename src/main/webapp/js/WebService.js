'use strict';

/**
*   Singleton object. Provides services to
*   make HTTP calls.
*/
const WebService = (function WebService() {
    //Constants
    var MIME_JSON = 'application/json';

    /**
    *   Transform of object/map key/value pairs to query parameter pairs
    */
    var getQueryParams = function getQueryParams(params) {
        var s = '?';
        //create key=value pairs
        for(var p in params) s += p + '=' + params[p] + '&';
        s = s.slice(0, s.length-1); //cut out the last '&' symbol

        return s;
    }

    /**
    *   Parses http response
    */
    var parseResponse = function parseResponse(response) {
            var data = response.responseText;
            var cType = response.getResponseHeader('content-type');
            
            if(cType.match(MIME_JSON)) data = JSON.parse(data);

            return data;
        }

    /**
    *   Sends an HTTP request with additional settings.
    *
    *   method - 'GET' / 'POST' (PUT, DELETE and POST upload not supported yet)
    *   URL - url to a web server
    *   params - object, parameters to be send to the server
    *   contentType - MIME content type of the request
    */
    var request = function request(method, URL, params, contentType) {
        return new Promise(function (resolve, reject) {
            var req = new XMLHttpRequest();

            var data;
            if(contentType == MIME_JSON) {
                data = JSON.stringify(params);
            }else {
                data = getQueryParams(params);
            }

            req.open(method, URL, true);
            req.setRequestHeader("Content-type", contentType || MIME_JSON);

            req.onerror = function () {
                var data = parseResponse();
                reject(data);
            };
            req.onload = function () {
                 var data = parseResponse(this);
                 resolve(data);
             };

            req.send(data);
        });
    }

    //WebSocket connection
    const WS = window.montiarc.messaging.messagingClient;
    var SIM_RUNNING = false;

    return {
        //generic request
        request: request,
        //short get request
        get: function get(URL, params, contentType) {
            return request('GET', URL, params, contentType);
        },
        //short post request
        post: function post(URL, params, contentType) {
            return request('POST', URL, params, contentType);
        },
        //WebSockets commands
        WS_attachListener: function WSattachListener(listener) { WS.onMessage(listener); },

        WS_start: function (settings) { WS.start(settings); SIM_RUNNING = true; },
        WS_stop: function () { WS.stop(); SIM_RUNNING = false; },

        WS_nextFrame: function () { if(SIM_RUNNING) WS.requestNextFrame(); },
        WS_screenshot: function (ss) { if(SIM_RUNNING) WS.sendScreenshot(ss); }
    }
})();
