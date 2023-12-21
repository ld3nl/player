import { useState } from "react";

// eslint-disable-next-line no-unused-vars
type ValueSetter<T> = T | ((value: T) => T);

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  useLocalStorage = true,
  // eslint-disable-next-line no-unused-vars
): [T, (value: ValueSetter<T>) => void] {
  if (typeof key !== "string") {
    throw new Error("The 'key' parameter must be a string.");
  }

  const storageValue = useLocalStorage
    ? window?.localStorage?.getItem(key)
    : null;
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      return storageValue ? JSON.parse(storageValue) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: ValueSetter<T>) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (useLocalStorage) {
        window?.localStorage?.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
