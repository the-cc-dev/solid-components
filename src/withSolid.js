import S from 's-js'
import { State } from 'solid-js'
import { isConstructor } from 'component-register'

function render(element, payload) {
  if ('render' in payload) payload = payload.render();
  if (Array.isArray(payload)) {
    payload.forEach(child => element.renderRoot().appendChild(child))
  } else element.renderRoot().appendChild(payload);
}

export default function withSolid(mapState, mapSelectors) {
  return ComponentType =>
    options => {
      const { element, props } = options;
      S.root(dispose => {
        const state = new State(props || {}),
          defaultProps = Object.keys(props);

        options = {...options, state};
        delete options.props;

        if (mapState) state.set(typeof mapState === 'function' ? mapState(options) : mapState);
        if (mapSelectors) state.select(mapSelectors(options));

        defaultProps.forEach(key =>
          S.makeComputationNode(() => element.setProperty(key, state[key]))
        );

        element.addPropertyChangedCallback((name, val) => state.set({[name]: val}));
        element.addReleaseCallback(() => dispose());

        let comp;
        if (isConstructor(ComponentType)) {
          comp = new ComponentType(options);
        } else comp = ComponentType(options);
        render(element, comp);
        return comp;
      });
    }
}
