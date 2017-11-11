'use strict';

window.montiarc = window.montiarc || Object.create(null);
window.montiarc.messaging = window.montiarc.messaging || Object.create(null);

((ns) => {

    const endpoint = '/web-app/messaging';

    const BROKER_DEST_PREF = '/event';
    const APP_DEST_PREF = '/app';

    const incomingChannels = {
        message: BROKER_DEST_PREF + '/message',

//        nextSimulationTimeFrame: '/event/nextSimulationTimeFrame',
//        endOfSimulation: '/event/endOfSimulation',
        command: BROKER_DEST_PREF + '/command'
    };
    const outgoingChannels = {
        screenshot: APP_DEST_PREF + '/screenshot',
        getnextframe: APP_DEST_PREF + '/getnextframe',

        start: APP_DEST_PREF + '/start',
        stop: APP_DEST_PREF + '/stop'
    };



    class MessagingClient {

        constructor() {
            this._isConnected = false;
            this._socket = new SockJS(endpoint);
            this._stompClient = Stomp.over(this._socket);
            this._handlers = Object.create(null);
            this._handlers.connect = [];
            // must match the props of incomingChannels except for 'connect'
            for (const inCh of Object.getOwnPropertyNames(incomingChannels)) {
                this._handlers[inCh] = [];
            }
            this._deferredOperations = [];
            // connecting to the server
            this._stompClient.connect({}, frame => {
                this._isConnected = true;
                for (const inCh of Object.getOwnPropertyNames(incomingChannels)) {
                    const channelName = incomingChannels[inCh];
                    this._stompClient.subscribe(channelName, msg => {
                        const msgBody = JSON.parse(msg.body);
                        this._fireHandlers(inCh, msgBody);
                    });
                }
                this._fireHandlers('connect', this);
                for (var defOp of this._deferredOperations) {
                    defOp();
                }
                this._deferredOperations = [];
            });
        }

        // private API

        _getHandlers(type) {
            const handlers = this._handlers[type];
            if (!handlers) {
                console.error('cannot find handlers of type ' + type);
                return [];
            }
            return handlers;
        }

        _addHandler(type, handler) {
            const handlers = this._getHandlers(type);
            handlers.push(handler);
        }

        _fireHandlers(type, ...args) {
            const handlers = this._getHandlers(type);
            for (var h of handlers) {
                h(...args);
            }
        }

        _send(channel, msg, headers = {}) {
            const frameBody = JSON.stringify(msg);
            const operation = () => this._stompClient.send(channel, headers, frameBody);
            if (!this._isConnected) {
                console.warn('the connection is not yet estalished, deferring a send operation');
                this._deferredOperations.push(operation);
                return;
            }
            operation();
        }

        // public API

        isConnected() {
            return this._isConnected;
        }
        //incoming
        onConnect(handler) {
            this._addHandler('connect', handler);
        }
        onMessage(handler) {
            this._addHandler('message', handler);
        }
        onCommand(handler) {
            this._addHandler('command', handler);
        }
        //outgoing
        sendScreenshot(screenshot) {
            this._send(outgoingChannels.screenshot, screenshot);
        }
        requestNextFrame() {
            this._send(outgoingChannels.getnextframe);
        }

        start(settings) {
            this._send(outgoingChannels.start, settings);
        }
        stop() {
            this._send(outgoingChannels.stop);
        }
    }



    ns.messagingClient = new MessagingClient();

})(window.montiarc.messaging);
