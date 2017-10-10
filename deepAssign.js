'use strict';

if (!Object.prototype.deepAssign) {
  Object.prototype.deepAssign = (target, ...sources) => {
    let result = Object(target);

    sources.forEach(source => {
      if (isObject(source)) {
        deepAssignWithOneSource(result, source, []);
      }
    });

    return result;
  };
}

const deepAssignWithOneSource = (target, source, assignedObjects) => {
  if (source === null) {
    throw new Error('The source is null');
  }

  if (assignedObjects.includes(target) || assignedObjects.includes(source)) {
    throw new Error('The source object includes a circular reference');
  }

  assignedObjects.push(target, source);
  let keyIterator = getIterator(source);
  let current = keyIterator.next();

  while (!current.done) {
    let key = current.value;
    const value = getValue(source, key);

    if (isObject(value)) {
      setValue(target, key, Reflect.construct(value.constructor, value));
      deepAssignWithOneSource(getValue(target, key), value, assignedObjects);
    } else {
      setValue(target, key, value);
    }
    current = keyIterator.next();
  }
};

const isObject = value => value === Object(value);

const getIterator = object => {
  if (isMap(object) || isSet(object)) {
    return object.keys();
  } else {
    return Object.keys(object)[Symbol.iterator]();
  }
};

const getValue = (source, key) => {
  if (isMap(source) || isSet(source)) {
    return source.get(key);
  } else {
    return source[key];
  }
};

const setValue = (target, key, value) => {
  if (isMap(target) || isSet(target)) {
    target.set(key, value);
  } else {
    target[key] = value;
  }
};

const isMap = object => {
  try {
    Map.prototype.has.call(object);
    return true;
  } catch (e) {
    return false;
  }
};

const isSet = object => {
  try {
    Set.prototype.has.call(object);
    return true;
  } catch (e) {
    return false;
  }
};
