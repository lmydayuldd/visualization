'use strict';

(() => {
    const client = window.montiarc.messaging.messagingClient;

    client.onMessage(DataModel.onData);

    client.onCommand(msg => {
        console.log(msg);
        // TODO: add more commands if necessary
        const cmdType = msg.type;
        const cmdPayload = msg.payload || Object.create(null);
        switch (cmdType) {
            case 'SCREENSHOT':
                doScreenshot(cmdPayload);
                break;
            default:
                console.error('unknown command: ' + cmdType);
        }
    });

    function doScreenshot(cmd) {
        const carId = cmd.carId;
        console.log('SS cam: ' + cameraH);
        const screenshot = getScreenshotAsImg(cameraH || cmd.camera);
        client.sendScreenshot({
            carId,
            screenshot
        });
    }
})();
