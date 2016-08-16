window.SINGLE_SPA_TESTING = true;

import './root-apps/systemjs-all-apps.spec.js';

// let Loader;
//
// function easyDeclareChild(name) {
// 	const pathToApp = getPathToApp(name);
//
// 	singleSpa.declareChildApplication(pathToApp, require(`./apps/${name}/${name}.active-when.js`).activeWhen);
//
// 	return require(pathToApp);
// }
//
// function getPathToApp(name) {
// 	return `../spec/apps/${name}/${name}.app.js`;
// }
//
// describe(`single-spa`, () => {
// 	const originalGetMountedApps = singleSpa.getMountedApps;
// 	const originalGetAppStatus = singleSpa.getAppStatus;
//
// 	beforeEach(() => {
// 		Loader = {
// 			import: function(filename) {
// 				return new Promise((resolve, reject) => {
// 					try {
// 						resolve(require(filename));
// 					} catch (ex) {
// 						reject(ex);
// 					}
// 				});
// 			},
// 		};
//
// 		singleSpa.reset();
// 		singleSpa.setLoader(Loader);
//
// 		singleSpa.getMountedApps = function() {
// 			return originalGetMountedApps()
// 			.map(appName => appName.substring(appName.lastIndexOf('/') + 1, appName.length - '.app.js'.length));
// 		};
//
// 		singleSpa.getAppStatus = function(name) {
// 			return originalGetAppStatus(getPathToApp(name));
// 		};
// 	});
//
// 	afterEach(() => {
// 		singleSpa.getMountedApps = originalGetMountedApps;
// 		singleSpa.getAppStatus = originalGetAppStatus;
// 	});
//
// 	describe('url navigation', function() {
// 		let oldLocation;
// 		let location;
//
// 		beforeEach(function() {
// 			oldLocation = global.location;
// 			global.location = {
// 				href: 'https://app.com/something#a/hash',
// 				hash: '#a/hash',
// 			};
// 			global.history.pushState = jasmine.createSpy();
// 		});
//
// 		afterEach(function() {
// 			global.history.pushState = () => {};
// 			global.location.href = '';
// 			global.location.hash = '';
// 		});
//
// 		it('should navigate with a string', function() {
// 			singleSpa.navigateToUrl('https://app.com/something#a/other');
// 			expect(global.location.hash).toBe('#a/other');
// 		});
//
// 		it('should navigate with an event', function() {
// 			const event = {
// 				currentTarget: {href: 'https://app.com/something#a/other'},
// 				preventDefault: jasmine.createSpy(),
// 			};
//
// 			singleSpa.navigateToUrl(event);
// 			expect(global.location.hash).toBe('#a/other');
// 			expect(event.preventDefault).toHaveBeenCalled();
// 		});
//
// 		it('should navigate with a defined context', function() {
// 			singleSpa.navigateToUrl.call({href: 'https://app.com/something#a/other'});
// 			expect(global.location.hash).toBe('#a/other');
// 		});
//
// 		it('should update hash when destination starts with a hash', function() {
// 			singleSpa.navigateToUrl.call({href: '#a/other'});
// 			expect(global.location.hash).toBe('#a/other');
// 		});
//
// 		it(`should update hash when destination doesn't contain domain, but same path`, function() {
// 			singleSpa.navigateToUrl.call({href: '/something#a/other'});
// 			expect(global.location.hash).toBe('#a/other');
// 			global.location.hash = '';
//
// 			singleSpa.navigateToUrl.call({href: 'something#a/other'});
// 			expect(global.location.hash).toBe('#a/other');
// 		});
//
// 		it(`should call push state when the destination doesn't contain domain and has different path 1`, function() {
// 			singleSpa.navigateToUrl('somethinger#b/my-route');
// 			expect(global.location.hash).toBe('#a/hash');
// 			expect(global.history.pushState).toHaveBeenCalled();
// 			expect(global.history.pushState).toHaveBeenCalledWith(null, null, 'somethinger#b/my-route');
// 		});
//
// 		it(`should call push state when the destination doesn't contain domain and has different path 2`, function() {
// 			singleSpa.navigateToUrl('/somethinger#b/my-route');
// 			expect(global.location.hash).toBe('#a/hash');
// 			expect(global.history.pushState).toHaveBeenCalled();
// 			expect(global.history.pushState).toHaveBeenCalledWith(null, null, '/somethinger#b/my-route');
// 		});
//
// 		it(`should call push state when the destination doesn't contain domain and has different path`, function() {
// 			singleSpa.navigateToUrl('some#b/my-route');
// 			expect(global.location.hash).toBe('#a/hash');
// 			expect(global.history.pushState).toHaveBeenCalled();
// 			expect(global.history.pushState).toHaveBeenCalledWith(null, null, 'some#b/my-route');
// 		});
//
// 		it(`should call push state when the origin's don't match`, function() {
// 			singleSpa.navigateToUrl('https://other-app.com/something#b/my-route');
// 			expect(global.location.hash).toBe('#a/hash');
// 			expect(global.history.pushState).toHaveBeenCalled();
// 			expect(global.history.pushState).toHaveBeenCalledWith(null, null, 'https://other-app.com/something#b/my-route');
// 		});
//
// 		it(`should call push state when the url has no hash`, function() {
// 			singleSpa.navigateToUrl('https://app.com/something/b/hash');
// 			expect(global.location.hash).toBe('#a/hash');
// 			expect(global.history.pushState).toHaveBeenCalled();
// 			expect(global.history.pushState).toHaveBeenCalledWith(null, null, 'https://app.com/something/b/hash');
// 		});
//
// 		it(`should call push state when the path before the hash don't match`, function() {
// 			singleSpa.navigateToUrl('https://app.com/something-b/#a/hash');
// 			expect(global.location.hash).toBe('#a/hash');
// 			expect(global.history.pushState).toHaveBeenCalled();
// 			expect(global.history.pushState).toHaveBeenCalledWith(null, null, 'https://app.com/something-b/#a/hash');
// 		});
//
// 		it('should error if not called with appropriate args', function() {
// 			const errors = [
// 				null,
// 				undefined,
// 				1234,
// 			];
//
// 			errors.forEach(arg => {
// 				expect(makeError.bind(null, arg)).toThrow();
// 			});
//
// 			function makeError(err) {
// 				singleSpa.navigateToUrl(err);
// 			}
// 		});
//
// 		it('should error if not called with appropriate context', function() {
// 			expect(makeError).toThrow();
//
// 			function makeError(err) {
// 				singleSpa.navigateToUrl.call({});
// 			}
// 		});
// 	});
// });
