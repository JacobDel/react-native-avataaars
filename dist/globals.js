"use strict";
global.TextEncoder = require('text-encoding').TextEncoder;
if (typeof MessageChannel === 'undefined') {
    global.MessageChannel = (function () {
        function MessageChannel() {
            var p1Listener = null;
            var p2Listener = null;
            this.port1 = {
                set onmessage(fn) { p1Listener = fn; },
                get onmessage() { return p1Listener; },
                postMessage: function (data) {
                    if (p2Listener)
                        setTimeout(function () { return p2Listener({ data: data }); }, 0);
                },
                close: function () { },
            };
            this.port2 = {
                set onmessage(fn) { p2Listener = fn; },
                get onmessage() { return p2Listener; },
                postMessage: function (data) {
                    if (p1Listener)
                        setTimeout(function () { return p1Listener({ data: data }); }, 0);
                },
                close: function () { },
            };
        }
        return MessageChannel;
    }());
}
