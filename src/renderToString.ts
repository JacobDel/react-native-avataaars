/**
 * Lightweight synchronous React-to-SVG-string renderer for Hermes/React Native.
 *
 * react-dom/server cannot be used in Hermes because:
 *   - server.browser uses MessageChannel (not available at module init time)
 *   - server.node requires Node built-ins (crypto, util, async_hooks)
 *
 * This renderer works by temporarily installing a minimal hook dispatcher
 * (the same mechanism react-dom/server uses internally) so that hooks like
 * useContext — which avataaars relies on for its context system — work correctly.
 */

import * as React from 'react';

// ---------------------------------------------------------------------------
// React internals: access the active hook dispatcher so we can install our own
// during sub-tree rendering. This is the same mechanism react-dom/server uses.
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactInternals: any = (React as any)
  .__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

// ---------------------------------------------------------------------------
// Minimal synchronous dispatcher — covers every hook that pure SVG-rendering
// components (like avataaars) could realistically call during render.
// ---------------------------------------------------------------------------
const minimalDispatcher: Record<string, unknown> = {
  readContext: (ctx: any) => ctx._currentValue,
  useContext: (ctx: any) => ctx._currentValue,
  useMemo: (factory: () => unknown) => factory(),
  useCallback: (cb: unknown) => cb,
  useRef: (init: unknown) => ({current: init}),
  useState: (init: unknown) => [
    typeof init === 'function' ? (init as () => unknown)() : init,
    () => {},
  ],
  useReducer: (_: unknown, init: unknown) => [init, () => {}],
  useEffect: () => {},
  useLayoutEffect: () => {},
  useInsertionEffect: () => {},
  useImperativeHandle: () => {},
  useDebugValue: () => {},
  useDeferredValue: (v: unknown) => v,
  useTransition: () => [false, () => {}],
  useId: () => 'rnav-id',
  useSyncExternalStore: (_: unknown, getSnapshot: () => unknown) =>
    getSnapshot(),
};

// ---------------------------------------------------------------------------
// Attribute name mapping: React camelCase → SVG/HTML attribute names
// ---------------------------------------------------------------------------

/** SVG camelCase attributes that must NOT be hyphenated (they are case-sensitive in the spec). */
const SVG_CAMELCASE = new Set([
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

/** Explicit overrides: React prop name → attribute name. */
const PROP_MAP: Record<string, string> = {
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

function toAttrName(key: string): string {
  if (PROP_MAP[key]) return PROP_MAP[key];
  if (SVG_CAMELCASE.has(key)) return key;
  // Convert remaining camelCase props to hyphen-case (fill-opacity, stroke-width…)
  if (/[A-Z]/.test(key)) {
    return key.replace(/([A-Z])/g, ch => `-${ch.toLowerCase()}`);
  }
  return key;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderStyle(style: Record<string, unknown>): string {
  return Object.entries(style)
    .map(([k, v]) => {
      const prop = k.replace(/([A-Z])/g, ch => `-${ch.toLowerCase()}`);
      return `${prop}:${v}`;
    })
    .join(';');
}

function attrsString(props: Record<string, unknown>): string {
  let result = '';
  for (const [key, value] of Object.entries(props)) {
    if (key === 'children' || value == null || value === false) continue;
    if (key === 'dangerouslySetInnerHTML') continue;
    if (key === 'style' && typeof value === 'object') {
      result += ` style="${escapeHtml(renderStyle(value as Record<string, unknown>))}"`;
      continue;
    }
    if (value === true) {
      result += ` ${toAttrName(key)}`;
      continue;
    }
    result += ` ${toAttrName(key)}="${escapeHtml(String(value))}"`;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Symbols used to identify special React element types
// ---------------------------------------------------------------------------
const REACT_FRAGMENT = Symbol.for('react.fragment');
const REACT_PROVIDER = Symbol.for('react.provider');
const REACT_CONTEXT = Symbol.for('react.context');
const REACT_FORWARD_REF = Symbol.for('react.forward_ref');
const REACT_MEMO = Symbol.for('react.memo');

// ---------------------------------------------------------------------------
// Core recursive renderer
// ---------------------------------------------------------------------------

function renderChildren(children: React.ReactNode): string {
  if (children == null) return '';
  if (Array.isArray(children)) return children.map(renderNode).join('');
  return renderNode(children);
}

function callComponent(fn: Function, props: unknown, ref: unknown): string {
  if (!ReactInternals?.ReactCurrentDispatcher) {
    // No internals available — call directly (hooks that need context won't
    // work, but this path should be unreachable in practice).
    return renderNode(fn(props, ref) as React.ReactNode);
  }
  const prev = ReactInternals.ReactCurrentDispatcher.current;
  ReactInternals.ReactCurrentDispatcher.current = minimalDispatcher;
  try {
    return renderNode(fn(props, ref) as React.ReactNode);
  } finally {
    ReactInternals.ReactCurrentDispatcher.current = prev;
  }
}

function renderNode(node: React.ReactNode): string {
  if (node == null || node === false) return '';
  if (typeof node === 'string') return escapeHtml(node);
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(renderNode).join('');
  if (!React.isValidElement(node)) return '';

  const {type, props} = node as React.ReactElement<Record<string, unknown>>;
  const typeAny = type as any;

  // Fragment
  if (type === React.Fragment || typeAny?.$$typeof === REACT_FRAGMENT) {
    return renderChildren(props.children as React.ReactNode);
  }

  // Context.Provider  (<Context.Provider value={v}> or React 19 <Context value={v}>)
  if (typeAny?._context || typeAny?.$$typeof === REACT_PROVIDER) {
    const ctx = typeAny._context ?? typeAny;
    const prev = ctx._currentValue;
    ctx._currentValue = props.value;
    try {
      return renderChildren(props.children as React.ReactNode);
    } finally {
      ctx._currentValue = prev;
    }
  }

  // Context used directly as provider — React 19 style
  if (typeAny?.$$typeof === REACT_CONTEXT) {
    const prev = typeAny._currentValue;
    typeAny._currentValue = props.value;
    try {
      return renderChildren(props.children as React.ReactNode);
    } finally {
      typeAny._currentValue = prev;
    }
  }

  // React.memo
  if (typeAny?.$$typeof === REACT_MEMO) {
    return callComponent(typeAny.type, props, null);
  }

  // React.forwardRef
  if (typeAny?.$$typeof === REACT_FORWARD_REF) {
    return callComponent(typeAny.render, props, null);
  }

  // Class component
  if (
    typeof type === 'function' &&
    typeAny.prototype &&
    typeof typeAny.prototype.render === 'function'
  ) {
    const instance = new typeAny(props);
    return renderNode(instance.render() as React.ReactNode);
  }

  // Function component
  if (typeof type === 'function') {
    return callComponent(type, props, null);
  }

  // Host element (svg, g, path, circle, rect, defs, mask, use, …)
  if (typeof type === 'string') {
    const attrs = attrsString(props);
    const inner = props.dangerouslySetInnerHTML
      ? (props.dangerouslySetInnerHTML as any).__html
      : renderChildren(props.children as React.ReactNode);
    if (!inner) return `<${type}${attrs}/>`;
    return `<${type}${attrs}>${inner}</${type}>`;
  }

  return '';
}

export function renderToString(element: React.ReactElement): string {
  return renderNode(element);
}
