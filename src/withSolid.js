import { root, useState } from 'solid-js';
import { r } from 'solid-js/dom';

export default function withSolid(ComponentType) {
  return options => {
    const { element, props: rawProps } = options;
    delete options.props;
    root(dispose => {
      const [props, setProps] = useState(rawProps || {});

      element.addPropertyChangedCallback((key, val) => setProps(key, val));
      element.addReleaseCallback(() => dispose());

      return r.insert(element.renderRoot(), ComponentType(props, options));
    });
  }
}
