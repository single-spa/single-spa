import angular from "angular";
import "angular-ui-router";

angular.module('root-angular-module', [
	'ui.router'
])
.config(function($stateProvider, $locationProvider) {
	$locationProvider.html5Mode(true);

	$stateProvider
		.state('root', {
			url: '/legacy',
			template: '<h1>ANGULAR 1.3.0</h1><div><a ui-sref="root.view1">View 1</a></div><div><a ui-sref="root.view2">View 2</a></div><ui-view></ui-view>'
		})
		.state('root.view1', {
			url: '/view1',
			template: '<h4>I am view 1</h4>'
		})
		.state('root.view2', {
			url: '/view2',
			template: '<h4>I am view 2</h4>'
		})
});
