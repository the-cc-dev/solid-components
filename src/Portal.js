import S from 's-js'
import { r } from 'solid-js/dom';

export default props => {
  const {anchor = document.body, children, ...otherProps} = props;
  let root = null,
    container = document.createElement('div');
  root = container.attachShadow({ mode: 'open' });
  r.spread(root, () => otherProps)
  let nodes = children;
  if (typeof children[0] === 'function') nodes = children[0](container);
  if (!Array.isArray(nodes)) container.appendChild(nodes)
  else nodes.forEach(el => container.appendChild(el))
  // ShadyDOM polyfill doesn't handle mutationObserver on root properly
  // This breaks document-register-element detection
  Promise.resolve().then(() => { while(container.firstChild) root.appendChild(container.firstChild); });
  anchor.appendChild(container);
  S.cleanup(() => anchor.removeChild(container));
}