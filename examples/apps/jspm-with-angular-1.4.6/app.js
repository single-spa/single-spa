import { defaultAngular1App } from "single-spa-angular1";
import { defaultJspmApp } from "single-spa-jspm";

const jspmApp = defaultJspmApp({
	configJsURI: '/apps/jspm-with-angular-1.4.6/config.js',
	systemJsURI: '/apps/jspm-with-angular-1.4.6/jspm_packages/system.src.js'
})

const angular1App = defaultAngular1App({
	angularPromise: () => {
		return new Promise((resolve) => {
			System.import('angular')
			.then((angular) => resolve(angular));
		})
	},
	angularModulesToBootstrap: ['root-angular-module']
});

export const entryURI = '/apps/jspm-with-angular-1.4.6/entry.js';
export const lifecycles = [angular1App, jspmApp];
