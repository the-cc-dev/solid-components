import { root, useState } from 'solid-js';
import { r } from 'solid-js/dom';

export default function withSolid(ComponentType) {
  return options => {
    const { element, props: rawProps, ...otherOptions } = options;
    root(dispose => {
      const [props, setProps] = useState(rawProps || {});

      element.addPropertyChangedCallback((key, val) => setProps(key, val));
      element.addReleaseCallback(() => dispose());

      return r.insert(element.renderRoot(), ComponentType(props, element, otherOptions));
    });
  }
}
