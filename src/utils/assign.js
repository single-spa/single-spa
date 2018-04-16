export function assign(target, ...sources) {
  for (let i = 0; i < sources.length; i++) {
    const propertyNames = Object.keys(sources[i]);
    for (let j = 0; j < propertyNames.length; j++) {
      const propertyName = propertyNames[j];
      target[propertyName] = sources[i][propertyName];
    }
  }

  return target;
}
