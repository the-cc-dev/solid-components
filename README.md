# Solid Components

This library extends [Solid](https://github.com/ryansolid/solid) by adding Custom Web Components and extensions to manage modular behaviors and composition. It uses [Component Register](https://github.com/ryansolid/component-register) to create Web Components and its composed mixin pattern to construct modular re-usable behaviors. This allows your code to available as simple HTML elements for library interopt and to leverage Shadow DOM style isolation. Solid already supports binding to Web Components so this fills the gap allowing full modular applications to be built out of nested Web Components. Component Register makes use of the V1 Standards and on top of being compatible with the common webcomponent.js polyfills, has a solution for Polyfilling Shadow DOM CSS using the ShadyCSS Parser from Polymer in a generic framework agnostic way (unlike the ShadyCSS package).

## Component

The simplest way to create a Component is to use the Component method. The first argument is the Custom element tag, the 2nd is optional is the props, and the 3rd is the Solid template function. Solid template is provided State wrapped props as the first argument, and the underlying element as the 2nd.
```jsx
import { Component } from 'solid-components';

Component('my-component', {someProp: 'one', otherProp: 'two'}, props => {
  // ... Solid code
})
```
Props get assigned as element properties and hyphenated attributes. This exposes the component that can be used in HTML/JSX as:
```html
<my-component some-prop="some value" other-prop="some value"></my-component>
```

This is all you need to get stated with Solid Components.

## withSolid

Under the hood the Component method is using Component Register's mixins to create our Custom Element. So this library also provides the way to do so directly if you wish to mixin your own functionality. It all starts by using the register HOC which upgrades your class or method to a WebComponent. It is always the start of the chain.

```jsx
import { register } from 'component-register';

/*
register(tag, defaultProps)
*/
register('my-component', {someProp: 'one', otherProp: 'two'})((props, options) =>
  // ....
)
```

Component Register exposes a convenient compose method (a reduce right) that makes it easier compose multiple mixins. From there we can use withSolid mixin to basically produce the Component method above. However, now you are able to add more HOC mixins in the middle to add additional behavior in your components.

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

This library takes React's Portal concept and applies it in a webcomponent friendly way by linking a satelite ShadowRoot not requiring another custom component and never exposing the render tree to the Light DOM. Sure Styles do not flow through the Portal but any Style Tag defined inside will be able to style the elements you would stick in the slots of your generic element.

```jsx
import { Component, usePortal } from 'solid-components';

Component('my-component', () => {
  usePortal(<>
    <style>{'span { color: red }'}</style>
    <my-modal>
      My <span>Red</span> Content
    </my-modal>
  </>);
  // .. rest of my rendering
})
```
Portal alternatively takes a funtion as its children passing in the inserted host element.

## Context

Solid Components also expose Component Register Context API for dependency detection which provides createContext, useProvider and useContext. createContext lets you define the initialization of any sort of state container. Both useProvider and useContext take context as the first argument. The second argument for provider is passed as argument to the context initializer, or if no initializer is the value of the context.

Example below using Solid's own state mechanism although context can house just about anything.

```jsx
// counter.js
import { createContext } from 'solid-components';
import { useState } from 'solid-js';

export createContext((count = 0) => {
  const [state, setState] = useState({ count });
  return [state, {
    increment() { setState('count', c => c + 1); }
    decrement() { setState('count', c => c - 1); }
  }];
});

// app.js
import { Component, useProvider } from 'solid-components';
import CounterContext from './counter';

const AppComponent = () => {
  // start counter at 2
  useProvider(CounterContext, 2);
  // ...
}

Component('app-component', AppComponent);

// nested.js
import { Component, useContext } from 'solid-components';
import CounterContext from './counter';

const NestedComponent = () => {
  const [counter, { increment, decrement }] = useContext(CounterContext);
  return <div>
    <div>{( counter.count )}</div>
    <button onclick={ increment }>+</button>
    <button onclick={ decrement }>-</button>
  </div>;
}

Component('nested-component', NestedComponent);
```
