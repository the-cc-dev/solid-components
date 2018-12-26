# Solid Components

This library extends [SolidJS](https://github.com/ryansolid/solid) by adding custom components and HOC's to manage modular behaviors and composition. It uses [Component Register](https://github.com/ryansolid/component-register) to create Web Components and its composed mixin pattern to construct modular re-usable behaviors. This allows your code to available as simple HTML elements for library interopt and to leverage Shadow DOM style isolation. Solid already supports binding to Web Components so this fills the gap allowing full modular applications to be built out of nested Web Components. Component Register makes use of the V1 Standards and on top of being compatible with the common webcomponent.js polyfills, has a solution for Polyfilling Shadow DOM CSS using the ShadyCSS Parser from Polymer in a generic framework agnostic way (unlike the ShadyCSS package).

It all starts by using the register HOC which upgrades your class or method to a WebComponent. It is always the start of the chain.

```jsx
import { register } from 'component-register';

/*
register(tag, defaultProps)
*/
register('my-component', {someProp: 'one', otherProp: 'two'})(({element, props}) =>
  // ....
)
```
Which exposes the component to html as:
```html
<my-component some-prop="some value" other-prop="some value"></my-component>
```
Props get assigned as element properties and hyphenated attributes. However, from there additional behavior can be mixed in by adding more methods. Component Register exposes a convenient compose method (a reduce right) that makes it easier compose multiple mixins.

## withSolid

This is the main method to use Solid rendering into your web component. It also maps the element props to reactive props as the first argument to manage their change detection fine grained.

```jsx
import { register, compose } from 'component-register';
import { withSolid } from 'solid-components';

/*
withSolid
*/
compose(
  register('my-component'),
  withSolid
)((props, options) =>
  // ....
)
```

## Portals

Portals are based on the React concept of Portals to allow markup outside of the root element of your component to be managed declaratively from your component. This has been historically useful for things like modals which due to Z-Index and render layers has always been awkward with nesting. With Webcomponents this has been more of a challenge because of Shadow DOM style encapsulation. Most generic Modals will use Slots to inject the content which means that parent styles should hold up. However if the Modal is inserted at the top of the Document it is no longer in the Shadow Root. In order to get styles you'd need to make non-generic components to wrap the generic one and are still left now with the manual effort of assigning the properties of those wrappers being inserted outside.

This library takes React's Portal concept and applies it in a webcomponent friendly way by linking a satelite ShadowRoot not requiring another custom component and never exposing the render tree to the Light DOM. Sure Styles do not flow through the Portal but any Style Tag defined inside will be able to style the elements you would stick in the slots of your generic element. In addition all event handlers directly bound to the Portal will be forwarded to the Shadowroot.

```jsx
import { register, compose } from 'component-register';
import { withSolid, usePortal } from 'solid-components';

compose(
  register('my-component'),
  withSolid
)((props, { element }) => {
  usePortal(element, <>
    <style>{'span { color: red }'}</style>
    <my-modal>
      My <span>Red</span> Content
    </my-modal>
  </>);
})
```
Portal alternatively takes a funtion as its children passing in the inserted host element.

## Context

Solid Components also offer a Context API for dependency detection which proves createContext, and use_ and with_ provider and context pairs depending on if you want to use HOC's or in component methods. createContext lets you define the initialization of any sort of state container. Example below using Solid's own state mechanism.

```jsx
// counter.js
import { useState } from 'solid-js';
import { createContext } from 'solid-components';

export createContext((count = 0) => {
  const [state, setState] = useState({ count });
  return [state, {
    increment() { setState('count', c => c + 1); }
    decrement() { setState('count', c => c - 1); }
  }];
});

// app.js

import { useProvider } from './solid-components';
import CounterContext from './counter';

const AppComponent = (props, { element }) => {
  // start counter at 2
  useProvider(element, CounterContext, 2);
  // ...
}

compose(
  register('app-component'),
  withSolid
)(AppComponent);

// nested.js
import { useContext } from './solid-components';
import CounterContext from './counter';

const NestedComponent = (props, { element }) => {
  const [counter, { increment, decrement }] = useContext(element, CounterContext);
  return <div>
    <div>{( counter.count )}</div>
    <button onclick={ increment }>+</button>
    <button onclick={ decrement }>-</button>
  </div>;
}

compose(
  register('nested-component'),
  withSolid
)(NestedComponent);
```

