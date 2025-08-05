export interface ServerRenderedApp {
  httpHeaders: Promise<Record<string, string>>;
  htmlAssets: ReadableStream;
  htmlContent: ReadableStream;
}

export async function toServerRenderPromise(
  app: LoadedApp,
): Promise<ServerRenderedApp> {
  return reasonableTime(app, "serverRender");
}
