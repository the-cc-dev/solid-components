import { register } from 'component-register';
import { root, useState } from 'solid-js';
import { r } from 'solid-js/dom';

export function withSolid(ComponentType) {
  return (rawProps, options) => {
    const { element } = options;
    root(dispose => {
      const [props, setProps] = useState(rawProps || {});

      element.addPropertyChangedCallback((key, val) => setProps(key, val));
      element.addReleaseCallback(() => dispose());

      return r.insert(element.renderRoot(), ComponentType(props, options));
    });
  }
}

export function Component(tagLabel, props, ComponentType) {
  if (arguments.length === 2) {
    ComponentType = props;
    props = {};
  }
  return register(tagLabel, props)(withSolid(ComponentType));
}
