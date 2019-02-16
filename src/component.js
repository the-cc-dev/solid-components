import { register } from 'component-register';
import { createRoot, createState } from 'solid-js';
import { r } from 'solid-js/dom';

export function withSolid(ComponentType) {
  return (rawProps, options) => {
    const { element } = options;
    createRoot(dispose => {
      const [props, setProps] = createState(rawProps || {});

      element.addPropertyChangedCallback((key, val) => setProps(key, val));
      element.addReleaseCallback(() => dispose());

      return r.insert(element.renderRoot(), ComponentType(props, options));
    });
  }
}

export function Component(tag, props, ComponentType) {
  if (arguments.length === 2) {
    ComponentType = props;
    props = {};
  }
  return register(tag, props)(withSolid(ComponentType));
}
