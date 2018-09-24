# Solid Components

This library extends [SolidJS](https://github.com/ryansolid/solid) by adding custom components and HOC's to manage modular behaviors and composition. It uses [Component Register](https://github.com/ryansolid/component-register) to create Web Components and its composed mixin pattern to construct modular re-usable behaviors. This allows your code to available as simple HTML elements for library interopt and to leverage Shadow DOM style isolation. Solid already supports binding to Web Components so this fills the gap allowing full modular applications to be built out of nested Web Components. Component Register makes use of the V1 Standards and on top of being compatible with the common webcomponent.js polyfills, has a solution for Polyfilling Shadow DOM CSS using the ShadyCSS Parser from Polymer in a generic framework agnostic way (unlike the ShadyCSS package).

It all starts by using the register HOC which upgrades your class or method to a WebComponent. It is always the start of the chain.

```jsx
import { register } from 'component-register';

/*
register(tag, defaultProps)
*/
register('my-component', {someProp: 'one', otherProp: 'two'})({element, props} =>
  // ....
)
```
Which exposes the component to html as:
```html
<my-component some-prop="some value" other-prop="some value"></my-component>
```
Props get assigned as element properties and hyphenated attributes. However, from there additional behavior can be mixed in by adding more methods. Component Register exposes a convenient compose method (a reduce right) that makes it easier compose multiple mixins.

## withSolid

This is the main method to inject Solid State and rendering into your web component. It also maps the element props to state to manage their change detection fine grained.

```jsx
import { register, compose } from 'component-register';
import { withSolid } from 'solid-components';

/*
withSolid(initialState, props => return selectors)
*/
compose(
  register('my-component'),
  withSolid({ someState: 123 }, ({ state }) => ({
    derivedState: => state.someState * 2
  }))
)({ element, state } =>
  // ....
)
```

## Portals

Portals are based on the React concept of Portals to allow markup outside of the root element of your component to be managed declaratively from your component. This has been historically useful for things like modals which due to Z-Index and render layers has always been awkward with nesting. With Webcomponents this has been more of a challenge because of Shadow DOM style encapsulation. Most generic Modals will use Slots to inject the content which means that parent styles should hold up. However if the Modal is inserted at the top of the Document it is no longer in the Shadow Root. In order to get styles you'd need to make non-generic components to wrap the generic one and are still left now with the manual effort of assigning the properties of those wrappers being inserted outside.

This library takes React's Portal concept and applies it in a webcomponent friendly way by linking a satelite ShadowRoot not requiring another custom component and never exposing the render tree to the Light DOM. Sure Styles do not flow through the Portal but any Style Tag defined inside will be able to style the elements you would stick in the slots of your generic element. In addition all event handlers directly bound to the Portal will be forwarded to the Shadowroot.

```jsx
import { register, compose } from 'component-register';
import { withSolid, Portal } from 'solid-components';

compose(
  register('my-component'),
  withSolid({ someState: 123 })
)({ element, state } =>
  <>
    <style></style>
    <Portal>
      <style>{(('span { color: red }'))}</style>
      <my-modal>
        My <span>Red</span> Content
      </my-modal>
    </Portal>
  </>
)
```
Portal alternatively takes a funtion as its children passing in the inserted host element.

## Context

The context API is also based on React's version. It comes with 2 methods, createContext and withContext. createContext like the name suggests creates a new Context that consists of a Provider and Consumer pair to be used as Components. withContext is another mixin function that assigns the provider value to a key on the props coming into the component.

Usually it requires creating a file to store the Context singleton, ex. ThemeContext.js

```js
import { createContext } from 'solid-components';

export default createContext();
```
Then typically at the root of the application:
```jsx
import ThemeContext from './ThemeContext'

//....
<ThemeContext.Provider value={someStore}>
  <Main />
</ThemeContext.Provider>
//....
```
And further down in some component further down the line:
```jsx
<ThemeContext.Consumer>{
  someStore =>
    <div />
}</ThemeContext.Consumer>
```
The provider payload is not special and if you wish to track change detection it I suggest passing in a State object, computation, or observable store.

Often you want to have a whole component be a consumer so you can do some mapping. This is where the withContext mixin comes into play. One might do something like this to use a Redux Store (keep in mind this out of the box does not work with react-redux and would need use the provided context library described here)
```jsx
import { register, compose } from 'component-register';
import { pipe, from } from 'solid-js';
import { withSolid, withContext } from 'solid-components';
import ReduxContext from './ReduxContext'

/*
withContext(key, context)
*/
compose(
  register('my-component'),
  withContext('reduxStore', ReduxContext)
  withSolid({ todos: [] }, ({ reduxStore }) => ({
    todos: pipe(
      from(reduxStore.toObservable()),
      map(({ todos }) => todos)
    )
  }))
)({ element, state } =>
  // .... state.todos
)
```
Of course this isn't mapping the action creators and [Component Register Extensions](https://github.com/ryansolid/component-register-extensions) provides additional mixins to do the job.

