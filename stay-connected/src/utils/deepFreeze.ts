/**
 * Deeply freeze an object tree. Avoid using on theme or any object that may
 * contain React Native Animated values.
 * Do not deep-freeze theme or any object tree that may contain Animated.* instances.
 */
export function deepFreeze<T>(obj: T): T {
  const skipKeys = ['_animation', 'addListener', 'setValue', 'stopAnimation'];
  if (typeof obj !== 'object' || obj === null) return obj;
  const shouldSkip = Object.keys(obj as any).some(k => {
    const v: any = (obj as any)[k];
    if (v && typeof v === 'object') {
      return skipKeys.some(sk => sk in v);
    }
    return false;
  });
  if (shouldSkip) return obj;
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach(prop => {
    const value: any = (obj as any)[prop];
    if (
      value &&
      typeof value === 'object' &&
      !Object.isFrozen(value)
    ) {
      deepFreeze(value);
    }
  });
  return obj;
}
