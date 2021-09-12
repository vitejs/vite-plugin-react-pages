import { useContext, useCallback, useMemo } from 'react';
import { SECRET_INTERNAL_getStoreContext, useAtom, atom } from './jotai';

function useUpdateAtom(anAtom) {
  const StoreContext = SECRET_INTERNAL_getStoreContext(anAtom.scope);
  const [, updateAtom] = useContext(StoreContext);
  const setAtom = useCallback(update => updateAtom(anAtom, update), [updateAtom, anAtom]);
  return setAtom;
}

function useAtomValue(anAtom) {
  return useAtom(anAtom)[0];
}

const RESET = Symbol();
function atomWithReset(initialValue) {
  const anAtom = atom(initialValue, (get, set, update) => {
    if (update === RESET) {
      set(anAtom, initialValue);
    } else {
      set(anAtom, typeof update === 'function' ? update(get(anAtom)) : update);
    }
  });
  return anAtom;
}

function useResetAtom(anAtom) {
  const StoreContext = SECRET_INTERNAL_getStoreContext(anAtom.scope);
  const [, updateAtom] = useContext(StoreContext);
  const setAtom = useCallback(() => updateAtom(anAtom, RESET), [updateAtom, anAtom]);
  return setAtom;
}

function useReducerAtom(anAtom, reducer) {
  const [state, setState] = useAtom(anAtom);
  const dispatch = useCallback(action => {
    setState(prev => reducer(prev, action));
  }, [setState, reducer]);
  return [state, dispatch];
}

function atomWithReducer(initialValue, reducer) {
  const anAtom = atom(initialValue, (get, set, action) => set(anAtom, reducer(get(anAtom), action)));
  return anAtom;
}

function atomFamily(initializeRead, initializeWrite, areEqual) {
  let shouldRemove = null;
  const atoms = new Map();

  const createAtom = param => {
    let item;

    if (areEqual === undefined) {
      item = atoms.get(param);
    } else {
      // Custom comparator, iterate over all elements
      for (let [key, value] of atoms) {
        if (areEqual(key, param)) {
          item = value;
          break;
        }
      }
    }

    if (item !== undefined) {
      if (shouldRemove != null && shouldRemove(item[1], param)) {
        atoms.delete(param);
      } else {
        return item[0];
      }
    }

    const newAtom = atom(initializeRead(param), initializeWrite && initializeWrite(param));
    atoms.set(param, [newAtom, Date.now()]);
    return newAtom;
  };

  createAtom.remove = param => {
    if (areEqual === undefined) {
      atoms.delete(param);
    } else {
      for (let [key] of atoms) {
        if (areEqual(key, param)) {
          atoms.delete(key);
          break;
        }
      }
    }
  };

  createAtom.setShouldRemove = fn => {
    shouldRemove = fn;
    if (!shouldRemove) return;

    for (let [key, value] of atoms) {
      if (shouldRemove(value[1], key)) {
        atoms.delete(key);
      }
    }
  };

  return createAtom;
}

const getWeakCacheItem = (cache, deps) => {
  const [dep, ...rest] = deps;
  const entry = cache.get(dep);

  if (!entry) {
    return;
  }

  if (!rest.length) {
    return entry[1];
  }

  return getWeakCacheItem(entry[0], rest);
};
const setWeakCacheItem = (cache, deps, item) => {
  const [dep, ...rest] = deps;
  let entry = cache.get(dep);

  if (!entry) {
    entry = [new WeakMap()];
    cache.set(dep, entry);
  }

  if (!rest.length) {
    entry[1] = item;
    return;
  }

  setWeakCacheItem(entry[0], rest, item);
};

const selectAtomCache = new WeakMap();
function selectAtom(anAtom, selector, equalityFn = Object.is) {
  const deps = [anAtom, selector, equalityFn];
  const cachedAtom = getWeakCacheItem(selectAtomCache, deps);

  if (cachedAtom) {
    return cachedAtom;
  }

  let initialized = false;
  let prevSlice;
  const derivedAtom = atom(get => {
    const slice = selector(get(anAtom));

    if (initialized && equalityFn(prevSlice, slice)) {
      return prevSlice;
    }

    initialized = true;
    prevSlice = slice;
    return slice;
  });
  derivedAtom.scope = anAtom.scope;
  setWeakCacheItem(selectAtomCache, deps, derivedAtom);
  return derivedAtom;
}

function useAtomCallback(callback, scope) {
  const anAtom = useMemo(() => atom(null, (get, set, [arg, resolve, reject]) => {
    try {
      resolve(callback(get, set, arg));
    } catch (e) {
      reject(e);
    }
  }), [callback]);
  anAtom.scope = scope;
  const [, invoke] = useAtom(anAtom);
  return useCallback(arg => new Promise((resolve, reject) => {
    invoke([arg, resolve, reject]);
  }), [invoke]);
}

const deepFreeze = obj => {
  if (typeof obj !== 'object' || obj === null) return;
  Object.freeze(obj);
  const propNames = Object.getOwnPropertyNames(obj);

  for (const name of propNames) {
    const value = obj[name];
    deepFreeze(value);
  }

  return obj;
};

function freezeAtom(anAtom) {
  const frozenAtom = atom(get => deepFreeze(get(anAtom)), (_get, set, arg) => set(anAtom, arg));
  frozenAtom.scope = anAtom.scope;
  return frozenAtom;
}

const atomFrozen = (read, write) => {
  const anAtom = atom(read, write);
  const origRead = anAtom.read;

  anAtom.read = get => deepFreeze(origRead(get));

  return anAtom;
};

const atomFrozenInDev = typeof process === 'object' && process.env.NODE_ENV === 'development' ? atomFrozen : atom;

const splitAtomCache = new WeakMap();

const isWritable = atom => !!atom.write;

const isFunction = x => typeof x === 'function';

function splitAtom(arrAtom, keyExtractor) {
  const deps = keyExtractor ? [arrAtom, keyExtractor] : [arrAtom];
  const cachedAtom = getWeakCacheItem(splitAtomCache, deps);

  if (cachedAtom) {
    return cachedAtom;
  }

  let currentAtomList;
  let currentKeyList;

  const keyToAtom = key => {
    var _currentKeyList, _currentAtomList;

    const index = (_currentKeyList = currentKeyList) == null ? void 0 : _currentKeyList.indexOf(key);

    if (index === undefined || index === -1) {
      return undefined;
    }

    return (_currentAtomList = currentAtomList) == null ? void 0 : _currentAtomList[index];
  };

  const read = get => {
    let nextAtomList = [];
    let nextKeyList = [];
    get(arrAtom).forEach((item, index) => {
      const key = keyExtractor ? keyExtractor(item) : index;
      nextKeyList[index] = key;
      const cachedAtom = keyToAtom(key);

      if (cachedAtom) {
        nextAtomList[index] = cachedAtom;
        return;
      }

      const read = get => {
        var _currentKeyList2;

        const index = (_currentKeyList2 = currentKeyList) == null ? void 0 : _currentKeyList2.indexOf(key);

        if (index === undefined || index === -1) {
          throw new Error('index not found');
        }

        return get(arrAtom)[index];
      };

      const write = (get, set, update) => {
        var _currentKeyList3;

        const index = (_currentKeyList3 = currentKeyList) == null ? void 0 : _currentKeyList3.indexOf(key);

        if (index === undefined || index === -1) {
          throw new Error('index not found');
        }

        const prev = get(arrAtom);
        const nextItem = isFunction(update) ? update(prev[index]) : update;
        set(arrAtom, [...prev.slice(0, index), nextItem, ...prev.slice(index + 1)]);
      };

      const itemAtom = isWritable(arrAtom) ? atom(read, write) : atom(read);
      nextAtomList[index] = itemAtom;
    });
    currentKeyList = nextKeyList;

    if (currentAtomList && currentAtomList.length === nextAtomList.length && currentAtomList.every((x, i) => x === nextAtomList[i])) {
      return currentAtomList;
    }

    return currentAtomList = nextAtomList;
  };

  const write = (get, set, atomToRemove) => {
    const index = get(splittedAtom).indexOf(atomToRemove);

    if (index >= 0) {
      const prev = get(arrAtom);
      set(arrAtom, [...prev.slice(0, index), ...prev.slice(index + 1)]);
    }
  };

  const splittedAtom = isWritable(arrAtom) ? atom(read, write) : atom(read);
  setWeakCacheItem(splitAtomCache, deps, splittedAtom);
  return splittedAtom;
}

function atomWithDefault(getDefault) {
  const EMPTY = Symbol();
  const overwrittenAtom = atom(EMPTY);
  const anAtom = atom(get => {
    const overwritten = get(overwrittenAtom);

    if (overwritten !== EMPTY) {
      return overwritten;
    }

    return getDefault(get);
  }, (get, set, update) => set(overwrittenAtom, typeof update === 'function' ? update(get(anAtom)) : update));
  return anAtom;
}

export { RESET, atomFamily, atomFrozenInDev, atomWithDefault, atomWithReducer, atomWithReset, freezeAtom, selectAtom, splitAtom, useAtomCallback, useAtomValue, useReducerAtom, useResetAtom, useUpdateAtom };