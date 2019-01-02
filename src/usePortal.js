import { useCleanup } from 'solid-js'
import { r } from 'solid-js/dom';
import { getCurrentElement } from 'component-register';

export default function usePortal(nodes, anchor = document.body) {
  const container =  document.createElement('div'),
    root = container.attachShadow({ mode: 'open' }),
    element = getCurrentElement();
  container.host = element;
  if (typeof nodes === 'function') nodes = nodes(container);
  r.insert(container, nodes);
  // ShadyDOM polyfill doesn't handle mutationObserver on root properly
  // This breaks document-register-element detection
  Promise.resolve().then(() => { while(container.firstChild) root.appendChild(container.firstChild); });
  anchor.appendChild(container);
  useCleanup(() => anchor.removeChild(container));
}