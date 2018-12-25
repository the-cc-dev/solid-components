const EC = Symbol('element-context');

function lookupContext(element, context) {
  return (element[EC] && element[EC][context.id]) || ((element.host || element.parentNode) && lookupContext(element.host || element.parentNode, context));
}

export function createContext(initFn) {
  return { id: Symbol('context'), initFn };
}

// Hooks
export function useProvider(element, context, value) {
  element[EC] || (element[EC] = {});
  element[EC][context.id] = context.initFn ? context.initFn(value): value;
}

export function useContext(element, context) {
  return lookupContext(element, context);
}

// HOCs
export function withProvider(context, value) {
  return ComponentType =>
    function(props, { element }) {
      useProvider(element, context, value);
      return ComponentType.apply(this, arguments);
    }
}

export function withContext(key, context) {
  return ComponentType =>
    function(props, options) {
      const { element } = options;
      options = {...options, [key]: lookupContext(element, context)};
      return ComponentType(props, options);
    }
}