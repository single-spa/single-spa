---
"single-spa": major
---

app/parcel statuses are now exported under the AppOrParcelStatus object

```ts
// New single-spa@7 imports
import { getAppStatus, AppOrParcelStatus } from "single-spa";

getAppStatus("navbar") === AppOrParcelStatus.LOADING;

// Old single-spa@6 imports that need to be migrated
import { getAppStatus, LOADING } from "single-spa";

getAppStatus("navbar") === LOADING;
```
