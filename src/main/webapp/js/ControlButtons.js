//init direction buttons key-down handlers
(function keyDown () {
    var buttons = [];
    for(var i=0; i<4; ++i) buttons.push(document.getElementById(['Up', 'Down', 'Left', 'Right'][i]));

    var toggleClass = function toggleClass(elem, cls, remove) {
        if(remove) { //remove class
            elem.className = elem.className.replace(" " + cls, "");
        }else {
            if(elem.className.match(cls)) return; //already added
            elem.className += " " + cls;
        }
    }
    //show pressed key styles
    window.addEventListener('keydown', function (e) {
        switch (e.keyCode) {
            case 68: //d - Right
                toggleClass(buttons[3], 'active', false);
                break;
            case 83: //s - Down
                toggleClass(buttons[1], 'active', false);
                break;
            case 65: //a - Left
                toggleClass(buttons[2], 'active', false);
                break;
            case 87: //w - Up
                toggleClass(buttons[0], 'active', false);
                break;
        }
    }, false);
    //remove pressed key styles
    window.addEventListener('keyup', function (e) {
        switch (e.keyCode) {
            case 68: //d - Right
                toggleClass(buttons[3], 'active', true);
                break;
            case 83: //s - Down
                toggleClass(buttons[1], 'active', true);
                break;
            case 65: //a - Left
                toggleClass(buttons[2], 'active', true);
                break;
            case 87: //w - Up
                toggleClass(buttons[0], 'active', true);
                break;
        }
    }, false);
})();