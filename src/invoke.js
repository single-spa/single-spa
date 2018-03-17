import { getAppByName } from 'src/applications/apps.js';
import { toLoadPromise } from 'src/applications/lifecycles/load.js';
import { isntLoaded } from 'src/applications/app.helpers.js';

export async function invoke(appName, functionName, ...args) {
    const app = getAppByName(appName);

    if (isntLoaded(app)) {
        await toLoadPromise(app);
    }

    if (app.invoke) {
        app.invoke(functionName, ...args);
    }
}