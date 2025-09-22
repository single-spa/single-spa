import { checkActivityFunctions } from "../applications/apps";
import { toLoadPromise } from "../lifecycles/load";
import { toName } from "../applications/app.helpers";

export interface ServerRenderResult {
  appNameToResult: Record<string, Promise<ServerRenderedApp>>;
}

export function serverRender(urlPath: string): Promise<ServerRenderResult> {
  const url = new URL(urlPath, "https://localhost/");
  const activeApps = checkActivityFunctions(url);
  const serverRenderResults = await Promise.all(
    activeApps.map(toLoadPromise).map(toServerRenderPromise),
  );

  const finalResult: ServerRenderResult = { appNameToResult: {} };
  for (let i = 0; i < serverRenderResults.length; i++) {
    finalResult.appNameToResult[toName(activeApps[i])] = serverRenderResults[i];
  }

  return finalResult;
}
