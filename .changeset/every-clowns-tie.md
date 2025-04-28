---
"single-spa": major
---

Application timeouts.bootstrap has been renamed to timeouts.init

```ts
// New single-spa@7 syntax
export const timeouts = {
  init: {
    millis: 4000,
    dieOnTimeout: false,
    warningMillis: 1000,
  },
};

// Old single-spa@6 syntax
export const timeouts = {
  bootstrap: {
    millis: 4000,
    dieOnTimeout: false,
    warningMillis: 1000,
  },
};
```
