import { useState } from "react";

type ValueSetter<T> = T | ((value: T) => T);

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  useLocalStorage = true
): [T, (value: ValueSetter<T>) => void] {
  if (typeof key !== "string") {
    throw new Error("The 'key' parameter must be a string.");
  }

  const [storedValue, setStoredValue] = useLocalStorage
    ? useState<T>(() => {
        try {
          if (typeof window !== "undefined") {
            const item = window?.localStorage?.getItem(key);
            return item ? JSON.parse(item) : initialValue;
          }
          return null;
        } catch (error) {
          console.error(error);
          return initialValue;
        }
      })
    : useState<T>(initialValue);

  const setValue = (value: ValueSetter<T>) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (useLocalStorage) {
        if (typeof window !== "undefined") {
          window?.localStorage?.setItem(key, JSON.stringify(valueToStore));
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

export function useSessionStorage<T>(
  key: string,
  initialValue: T,
  useSessionStorage = true
): [T, (value: ValueSetter<T>) => void] {
  if (typeof key !== "string") {
    throw new Error("The 'key' parameter must be a string.");
  }

  const [storedValue, setStoredValue] = useSessionStorage
    ? useState<T>(() => {
        try {
          if (typeof window !== "undefined") {
            const item = window?.sessionStorage?.getItem(key);
            return item ? JSON.parse(item) : initialValue;
          }
          return null;
        } catch (error) {
          console.error(error);
          return initialValue;
        }
      })
    : useState<T>(initialValue);

  const setValue = (value: ValueSetter<T>) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (useSessionStorage) {
        if (typeof window !== "undefined") {
          window?.sessionStorage?.setItem(key, JSON.stringify(valueToStore));
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

export function clearStorageByKeys(keys: string[]): void {
  keys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}
