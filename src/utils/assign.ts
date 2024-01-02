// Object.assign() is not available in IE11. And the babel compiled output for object spread
// syntax checks a bunch of Symbol stuff and is almost a kb. So this function is the smaller replacement.
export function assign(...args: object[]): object {
  for (let i = args.length - 1; i > 0; i--) {
    for (let key in args[i]) {
      if (key === "__proto__") {
        continue;
      }
      args[i - 1][key] = args[i][key];
    }
  }

  return args[0];
}
