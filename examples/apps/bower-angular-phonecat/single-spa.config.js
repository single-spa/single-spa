import { defaultAngular1App } from "single-spa-angular1";

export const publicRoot = '/apps/bower-angular-phonecat/app';

const angular1App = defaultAngular1App({
	publicRoot: publicRoot,
	rootAngularModule: 'phonecatApp',
	rootElementGetter: () => document.querySelector('[class="view-container"]')
})

export const pathToIndex = 'index.html';
export const lifecycles = [angular1App];
