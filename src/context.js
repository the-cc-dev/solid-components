import S from 's-js';
import { isConstructor } from 'component-register'

export function createContext() {
  const initialized = S.value(false);
  let storedValue;
  return {
    Provider({ value, children }) {
      storedValue = value;
      initialized(true)
      return children;
    },
    Consumer({ children }) {
      return () => initialized() && children[0] && children[0](storedValue)
    }
  }
}

export function withContext(key, context) {
  return ComponentType =>
    options =>
      S(context.Consumer({children: [
        props => {
          options[key] = props;
          if (isConstructor(ComponentType)) return new ComponentType(options);
          return ComponentType(options);
        }
      ]}))
}