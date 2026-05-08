global.TextEncoder = require('text-encoding').TextEncoder;

// react-dom/server.browser requires MessageChannel which Hermes doesn't provide
if (typeof MessageChannel === 'undefined') {
  global.MessageChannel = class MessageChannel {
    constructor() {
      let p1Listener = null;
      let p2Listener = null;
      this.port1 = {
        set onmessage(fn) { p1Listener = fn; },
        get onmessage() { return p1Listener; },
        postMessage(data) {
          if (p2Listener) setTimeout(() => p2Listener({data}), 0);
        },
        close() {},
      };
      this.port2 = {
        set onmessage(fn) { p2Listener = fn; },
        get onmessage() { return p2Listener; },
        postMessage(data) {
          if (p1Listener) setTimeout(() => p1Listener({data}), 0);
        },
        close() {},
      };
    }
  };
}