/* Dev-only shallow freeze that ignores Animated values */
export function safeFreeze<T>(obj: T): T {
  if (process.env.NODE_ENV !== 'development') return obj;
  try {
    // Avoid freezing Animated or class instances
    if (typeof obj === 'object' && obj !== null) {
      const blocked = ['_animation', 'addListener', 'removeListener'];
      for (const k in obj as any) {
        const v: any = (obj as any)[k];
        if (v && typeof v === 'object') {
          if (blocked.some(b => b in v)) return obj; // skip
        }
      }
      return Object.freeze(obj);
    }
  } catch {
    // ignore freeze errors
  }
  return obj;
}
