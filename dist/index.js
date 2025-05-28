var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import * as React from 'react';
import { SvgXml } from 'react-native-svg';
import './globals.js';
import { PixelRatio } from 'react-native';
import { renderToString } from 'react-dom/server';
import { Avatar as AvatarReact } from 'avataaars';
export var Avatar = React.memo(function (props) {
    var size = props.size;
    var size_ = PixelRatio.getPixelSizeForLayoutSize(size);
    var avatar = React.useMemo(function () { return (React.createElement(AvatarReact, __assign({}, props))); }, [props]);
    var svgString = renderToString(avatar);
    return (React.createElement(SvgXml, { xml: svgString, width: "100%", height: "100%" }));
});
