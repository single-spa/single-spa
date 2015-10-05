import { defaultAngular1App } from "single-spa-angular1";
import { defaultJspmApp } from "single-spa-jspm";

export const publicRoot = '/apps/jspm-with-angular-1.3.0';

const angular1App = defaultAngular1App({
	publicRoot: publicRoot,
	rootAngularModule: 'root-angular-module',
	rootElementGetter: () => document.querySelector('#app-root')
});

export const pathToIndex = 'index.html';
export const lifecycles = [angular1App, defaultJspmApp()];
