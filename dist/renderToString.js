import * as React from 'react';
var ReactInternals = React
    .__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
var minimalDispatcher = {
    readContext: function (ctx) { return ctx._currentValue; },
    useContext: function (ctx) { return ctx._currentValue; },
    useMemo: function (factory) { return factory(); },
    useCallback: function (cb) { return cb; },
    useRef: function (init) { return ({ current: init }); },
    useState: function (init) { return [
        typeof init === 'function' ? init() : init,
        function () { },
    ]; },
    useReducer: function (_, init) { return [init, function () { }]; },
    useEffect: function () { },
    useLayoutEffect: function () { },
    useInsertionEffect: function () { },
    useImperativeHandle: function () { },
    useDebugValue: function () { },
    useDeferredValue: function (v) { return v; },
    useTransition: function () { return [false, function () { }]; },
    useId: function () { return 'rnav-id'; },
    useSyncExternalStore: function (_, getSnapshot) {
        return getSnapshot();
    },
};
var SVG_CAMELCASE = new Set([
    'viewBox',
    'preserveAspectRatio',
    'gradientUnits',
    'gradientTransform',
    'clipPathUnits',
    'patternContentUnits',
    'patternTransform',
    'patternUnits',
    'filterUnits',
    'primitiveUnits',
    'markerUnits',
    'markerWidth',
    'markerHeight',
    'spreadMethod',
    'tableValues',
    'baseFrequency',
    'numOctaves',
    'startOffset',
    'textLength',
    'lengthAdjust',
    'stdDeviation',
    'stitchTiles',
    'xChannelSelector',
    'yChannelSelector',
    'limitingConeAngle',
    'pointsAtX',
    'pointsAtY',
    'pointsAtZ',
    'specularExponent',
    'diffuseConstant',
    'specularConstant',
    'surfaceScale',
    'edgeMode',
    'kernelMatrix',
    'kernelUnitLength',
]);
var PROP_MAP = {
    className: 'class',
    htmlFor: 'for',
    xlinkHref: 'xlink:href',
    xlinkTitle: 'xlink:title',
    xlinkShow: 'xlink:show',
    xlinkActuate: 'xlink:actuate',
    xmlLang: 'xml:lang',
    xmlSpace: 'xml:space',
    xmlnsXlink: 'xmlns:xlink',
};
function toAttrName(key) {
    if (PROP_MAP[key])
        return PROP_MAP[key];
    if (SVG_CAMELCASE.has(key))
        return key;
    if (/[A-Z]/.test(key)) {
        return key.replace(/([A-Z])/g, function (ch) { return "-".concat(ch.toLowerCase()); });
    }
    return key;
}
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
function renderStyle(style) {
    return Object.entries(style)
        .map(function (_a) {
        var k = _a[0], v = _a[1];
        var prop = k.replace(/([A-Z])/g, function (ch) { return "-".concat(ch.toLowerCase()); });
        return "".concat(prop, ":").concat(v);
    })
        .join(';');
}
function attrsString(props) {
    var result = '';
    for (var _i = 0, _a = Object.entries(props); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (key === 'children' || value == null || value === false)
            continue;
        if (key === 'dangerouslySetInnerHTML')
            continue;
        if (key === 'style' && typeof value === 'object') {
            result += " style=\"".concat(escapeHtml(renderStyle(value)), "\"");
            continue;
        }
        if (value === true) {
            result += " ".concat(toAttrName(key));
            continue;
        }
        result += " ".concat(toAttrName(key), "=\"").concat(escapeHtml(String(value)), "\"");
    }
    return result;
}
var REACT_FRAGMENT = Symbol.for('react.fragment');
var REACT_PROVIDER = Symbol.for('react.provider');
var REACT_CONTEXT = Symbol.for('react.context');
var REACT_FORWARD_REF = Symbol.for('react.forward_ref');
var REACT_MEMO = Symbol.for('react.memo');
function renderChildren(children) {
    if (children == null)
        return '';
    if (Array.isArray(children))
        return children.map(renderNode).join('');
    return renderNode(children);
}
function callComponent(fn, props, ref) {
    if (!(ReactInternals === null || ReactInternals === void 0 ? void 0 : ReactInternals.ReactCurrentDispatcher)) {
        return renderNode(fn(props, ref));
    }
    var prev = ReactInternals.ReactCurrentDispatcher.current;
    ReactInternals.ReactCurrentDispatcher.current = minimalDispatcher;
    try {
        return renderNode(fn(props, ref));
    }
    finally {
        ReactInternals.ReactCurrentDispatcher.current = prev;
    }
}
function renderNode(node) {
    var _a;
    if (node == null || node === false)
        return '';
    if (typeof node === 'string')
        return escapeHtml(node);
    if (typeof node === 'number')
        return String(node);
    if (Array.isArray(node))
        return node.map(renderNode).join('');
    if (!React.isValidElement(node))
        return '';
    var _b = node, type = _b.type, props = _b.props;
    var typeAny = type;
    if (type === React.Fragment || (typeAny === null || typeAny === void 0 ? void 0 : typeAny.$$typeof) === REACT_FRAGMENT) {
        return renderChildren(props.children);
    }
    if ((typeAny === null || typeAny === void 0 ? void 0 : typeAny._context) || (typeAny === null || typeAny === void 0 ? void 0 : typeAny.$$typeof) === REACT_PROVIDER) {
        var ctx = (_a = typeAny._context) !== null && _a !== void 0 ? _a : typeAny;
        var prev = ctx._currentValue;
        ctx._currentValue = props.value;
        try {
            return renderChildren(props.children);
        }
        finally {
            ctx._currentValue = prev;
        }
    }
    if ((typeAny === null || typeAny === void 0 ? void 0 : typeAny.$$typeof) === REACT_CONTEXT) {
        var prev = typeAny._currentValue;
        typeAny._currentValue = props.value;
        try {
            return renderChildren(props.children);
        }
        finally {
            typeAny._currentValue = prev;
        }
    }
    if ((typeAny === null || typeAny === void 0 ? void 0 : typeAny.$$typeof) === REACT_MEMO) {
        return callComponent(typeAny.type, props, null);
    }
    if ((typeAny === null || typeAny === void 0 ? void 0 : typeAny.$$typeof) === REACT_FORWARD_REF) {
        return callComponent(typeAny.render, props, null);
    }
    if (typeof type === 'function' &&
        typeAny.prototype &&
        typeof typeAny.prototype.render === 'function') {
        var instance = new typeAny(props);
        return renderNode(instance.render());
    }
    if (typeof type === 'function') {
        return callComponent(type, props, null);
    }
    if (typeof type === 'string') {
        var attrs = attrsString(props);
        var inner = props.dangerouslySetInnerHTML
            ? props.dangerouslySetInnerHTML.__html
            : renderChildren(props.children);
        if (!inner)
            return "<".concat(type).concat(attrs, "/>");
        return "<".concat(type).concat(attrs, ">").concat(inner, "</").concat(type, ">");
    }
    return '';
}
export function renderToString(element) {
    return renderNode(element);
}
