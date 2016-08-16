!function(e){function r(e,r,t){e in l||(l[e]={name:e,declarative:!0,deps:r,declare:t,normalizedDeps:r})}function t(e){return p[e]||(p[e]={name:e,dependencies:[],exports:{},importers:[]})}function n(r){if(!r.module){var o=r.module=t(r.name),a=r.module.exports,u=r.declare.call(e,function(e,r){if(o.locked=!0,"object"==typeof e)for(var t in e)a[t]=e[t];else a[e]=r;for(var n=0,u=o.importers.length;u>n;n++){var i=o.importers[n];if(!i.locked)for(var l=0;l<i.dependencies.length;++l)i.dependencies[l]===o&&i.setters[l](a)}return o.locked=!1,r},r.name);o.setters=u.setters,o.execute=u.execute;for(var s=0,d=r.normalizedDeps.length;d>s;s++){var f,c=r.normalizedDeps[s],v=l[c],m=p[c];m?f=m.exports:v&&!v.declarative?f=v.esModule:v?(n(v),m=v.module,f=m.exports):f=i(c),m&&m.importers?(m.importers.push(o),o.dependencies.push(m)):o.dependencies.push(null),o.setters[s]&&o.setters[s](f)}}}function o(r){var t={};if(("object"==typeof r||"function"==typeof r)&&r!==e)if(d)for(var n in r)"default"!==n&&a(t,r,n);else{var o=r&&r.hasOwnProperty;for(var n in r)"default"===n||o&&!r.hasOwnProperty(n)||(t[n]=r[n])}return t["default"]=r,c(t,"__useDefault",{value:!0}),t}function a(e,r,t){try{var n;(n=Object.getOwnPropertyDescriptor(r,t))&&c(e,t,n)}catch(o){return e[t]=r[t],!1}}function u(r,t){var n=l[r];if(n&&!n.evaluated&&n.declarative){t.push(r);for(var o=0,a=n.normalizedDeps.length;a>o;o++){var d=n.normalizedDeps[o];-1==s.call(t,d)&&(l[d]?u(d,t):i(d))}n.evaluated||(n.evaluated=!0,n.module.execute.call(e))}}function i(e){if(m[e])return m[e];if("@node/"==e.substr(0,6))return m[e]=o(v(e.substr(6)));var r=l[e];if(!r)throw"Module "+e+" not present.";return n(l[e]),u(e,[]),l[e]=void 0,r.declarative&&c(r.module.exports,"__esModule",{value:!0}),m[e]=r.declarative?r.module.exports:r.esModule}var l={},s=Array.prototype.indexOf||function(e){for(var r=0,t=this.length;t>r;r++)if(this[r]===e)return r;return-1},d=!0;try{Object.getOwnPropertyDescriptor({a:0},"a")}catch(f){d=!1}var c;!function(){try{Object.defineProperty({},"a",{})&&(c=Object.defineProperty)}catch(e){c=function(e,r,t){try{e[r]=t.value||t.get.call(e)}catch(n){}}}}();var p={},v="undefined"!=typeof System&&System._nodeRequire||"undefined"!=typeof require&&require.resolve&&"undefined"!=typeof process&&require,m={"@empty":{}};return function(e,t,n,a){return function(u){u(function(u){for(var l=0;l<t.length;l++)(function(e,r){r&&r.__esModule?m[e]=r:m[e]=o(r)})(t[l],arguments[l]);a({register:r});var s=i(e[0]);if(e.length>1)for(var l=1;l<e.length;l++)i(e[l]);return n?s["default"]:s})}}}("undefined"!=typeof self?self:global)

(["1"], [], false, function($__System) {
var require = this.require, exports = this.exports, module = this.module;
$__System.register("2", [], function (_export, _context) {
	"use strict";

	function resetSingleSpa() {
		delete window.singleSpa;
		var singleSpaScriptTag = document.getElementById("single-spa-distributable");
		if (singleSpaScriptTag) {
			singleSpaScriptTag.parentNode.removeChild(singleSpaScriptTag);
		}
		return new Promise(function (resolve, reject) {
			var scriptEl = document.createElement("script");
			scriptEl.setAttribute("id", "single-spa-distributable");
			scriptEl.setAttribute("src", "/base/dist/single-spa.js");
			scriptEl.onload = resolve;
			scriptEl.onerror = reject;
			document.head.appendChild(scriptEl);
		});
	}

	_export("resetSingleSpa", resetSingleSpa);

	return {
		setters: [],
		execute: function () {}
	};
});
$__System.register("3", [], function (_export, _context) {
	"use strict";

	var appLocation;

	_export("default", function () {
		describe("bootstrap-rejects", function () {
			var childApp = void 0;

			beforeAll(function () {
				singleSpa.declareChildApplication(appLocation, function (location) {
					return location.hash === "#bootstrap-rejects";
				});
			});

			beforeEach(function (done) {
				location.hash = "#bootstrap-rejects";

				System.import(appLocation).then(function (app) {
					return childApp = app;
				}).then(function (app) {
					return app.reset();
				}).then(done).catch(function (err) {
					throw err;
				});
			});

			it("puts the modules into SKIP_BECAUSE_BROKEN and doesn't mount it", function (done) {
				singleSpa.triggerAppChange().then(function () {
					expect(childApp.wasBootstrapped()).toEqual(true);
					expect(childApp.wasMounted()).toEqual(false);
					expect(singleSpa.getMountedApps()).toEqual([]);
					expect(singleSpa.getAppStatus(appLocation)).toEqual(singleSpa.SKIP_BECAUSE_BROKEN);
					done();
				}).catch(fail);
			});
		});
	});

	return {
		setters: [],
		execute: function () {
			appLocation = "/base/spec/child-apps/bootstrap-rejects/bootstrap-rejects.app.js";
		}
	};
});
$__System.register("4", [], function (_export, _context) {
	"use strict";

	var appLocation;

	_export("default", function () {
		describe("bootstrap-times-out", function () {
			var childApp = void 0;

			beforeAll(function () {
				singleSpa.declareChildApplication(appLocation, function (location) {
					return location.hash === "#bootstrap-times-out";
				});
			});

			beforeEach(function (done) {
				location.hash = '#bootstrap-times-out';

				System.import(appLocation).then(function (app) {
					return childApp = app;
				}).then(function (app) {
					return app.reset();
				}).then(done).catch(function (err) {
					throw err;
				});
			});

			it("is just waited for if dieOnTimeout is false", function (done) {
				singleSpa.triggerAppChange().then(function () {
					expect(childApp.wasBootstrapped()).toEqual(true);
					expect(childApp.wasMounted()).toEqual(true);
					expect(singleSpa.getMountedApps()).toEqual([appLocation]);
					expect(singleSpa.getAppStatus(appLocation)).toEqual(singleSpa.MOUNTED);
					done();
				}).catch(function (ex) {
					fail(ex);
					done();
				});
			});
		});
	});

	return {
		setters: [],
		execute: function () {
			appLocation = "/base/spec/child-apps/bootstrap-times-out/bootstrap-times-out.app.js";
		}
	};
});
$__System.register('5', [], function (_export, _context) {
	"use strict";

	var appLocation;

	_export('default', function () {
		describe('bootstrap-times-out-dies', function () {
			var childApp = void 0;

			beforeAll(function () {
				singleSpa.declareChildApplication(appLocation, function (location) {
					return location.hash === "#bootstrap-times-out-dies";
				});
			});

			beforeEach(function (done) {
				location.hash = '#bootstrap-times-out-dies';

				System.import(appLocation).then(function (app) {
					return childApp = app;
				}).then(function (app) {
					return app.reset();
				}).then(done).catch(function (err) {
					throw err;
				});
			});

			it('is put into SKIP_BECAUSE_BROKEN if dieOnTimeout is true', function (done) {
				singleSpa.triggerAppChange().then(function () {
					expect(childApp.wasBootstrapped()).toEqual(true);
					expect(childApp.wasMounted()).toEqual(false);
					expect(singleSpa.getMountedApps()).toEqual([]);
					expect(singleSpa.getAppStatus(appLocation)).toEqual('SKIP_BECAUSE_BROKEN');
					done();
				}).catch(function (ex) {
					fail(ex);
					done();
				});
			});
		});
	});

	return {
		setters: [],
		execute: function () {
			appLocation = '/base/spec/child-apps/bootstrap-times-out-dies/bootstrap-times-out-dies.app.js';
		}
	};
});
$__System.register('6', [], function (_export, _context) {
	"use strict";

	var appLocation;

	_export('default', function () {
		describe('empty-array-lifecycles', function () {
			var childApp = void 0;

			beforeAll(function () {
				singleSpa.declareChildApplication(appLocation, function (location) {
					return location.hash === "#empty-array-lifecycles";
				});
			});

			beforeEach(function (done) {
				location.hash = '#empty-array-lifecycles';

				System.import(appLocation).then(function (app) {
					return childApp = app;
				}).then(done).catch(function (err) {
					throw err;
				});
			});

			it('works just fine even though it\'s got empty arrays', function (done) {
				singleSpa.triggerAppChange().then(function () {
					expect(singleSpa.getMountedApps()).toEqual([appLocation]);

					location.hash = '#not-empty-array-lifecycles';

					singleSpa.triggerAppChange().then(function () {
						expect(singleSpa.getMountedApps()).toEqual([]);
						done();
					}).catch(function (ex) {
						fail(ex);
						done();
					});
				}).catch(function (ex) {
					fail(ex);
					done();
				});
			});
		});
	});

	return {
		setters: [],
		execute: function () {
			appLocation = '/base/spec/child-apps/empty-array-lifecycles/empty-array-lifecycles.app.js';
		}
	};
});
$__System.register('7', [], function (_export, _context) {
	"use strict";

	var appLocation;

	_export('default', function () {
		describe('happy-basic', function () {
			var childApp = void 0;

			beforeAll(function () {
				singleSpa.declareChildApplication(appLocation, function (location) {
					return location.hash === "#happy-basic";
				});
			});

			beforeEach(function (done) {
				location.hash = '#happy-basic';

				System.import(appLocation).then(function (app) {
					return childApp = app;
				}).then(function (app) {
					return app.reset();
				}).then(done).catch(function (err) {
					throw err;
				});
			});

			it('goes through the whole lifecycle successfully', function (done) {
				expect(childApp.isMounted()).toEqual(false);
				expect(singleSpa.getMountedApps()).toEqual([]);

				location.hash = 'happy-basic';

				singleSpa.triggerAppChange().then(function () {
					expect(childApp.wasBootstrapped()).toEqual(true);
					expect(childApp.isMounted()).toEqual(true);
					expect(singleSpa.getMountedApps()).toEqual([appLocation]);

					location.hash = '#not-happy-basic';

					singleSpa.triggerAppChange().then(function () {
						expect(childApp.wasBootstrapped()).toEqual(true);
						expect(childApp.isMounted()).toEqual(false);
						expect(singleSpa.getMountedApps()).toEqual([]);
						done();
					}).catch(function (ex) {
						fail(ex);
						done();
					});
				}).catch(function (ex) {
					fail(ex);
					done();
				});
			});
		});
	});

	return {
		setters: [],
		execute: function () {
			appLocation = '/base/spec/child-apps/happy-basic/happy-basic.app.js';
		}
	};
});
$__System.register('8', [], function (_export, _context) {
	"use strict";

	var appLocation, activeHash;

	_export('default', function () {
		describe('invalid-bootstrap app', function () {
			var childApp = void 0;

			beforeAll(function () {
				singleSpa.declareChildApplication(appLocation, function (location) {
					return location.hash === activeHash;
				});
			});

			beforeEach(function (done) {
				location.hash = activeHash;

				System.import(appLocation).then(function (app) {
					return childApp = app;
				}).then(function (app) {
					return app.reset();
				}).then(done).catch(function (err) {
					throw err;
				});
			});

			it('is never bootstrapped, mounted, or unmounted', function (done) {
				singleSpa.triggerAppChange().then(function () {
					expect(childApp.mountWasCalled()).toEqual(false);
					expect(childApp.unmountWasCalled()).toEqual(false);
					expect(singleSpa.getMountedApps()).toEqual([]);
					expect(singleSpa.getAppStatus(appLocation)).toEqual('SKIP_BECAUSE_BROKEN');
					done();
				}).catch(function (ex) {
					fail(ex);
					done();
				});
			});
		});
	});

	return {
		setters: [],
		execute: function () {
			appLocation = '/base/spec/child-apps/invalid-bootstrap/invalid-bootstrap.app.js';
			activeHash = '#invalid-bootstrap';
		}
	};
});
$__System.register('9', [], function (_export, _context) {
	"use strict";

	var appLocation, activeHash;

	_export('default', function () {
		describe('invalid-mount app', function () {
			var childApp = void 0;

			beforeAll(function () {
				singleSpa.declareChildApplication(appLocation, function (location) {
					return location.hash === activeHash;
				});
			});

			beforeEach(function (done) {
				location.hash = activeHash;

				System.import(appLocation).then(function (app) {
					return childApp = app;
				}).then(function (app) {
					return app.reset();
				}).then(done).catch(function (err) {
					throw err;
				});
			});

			it('is bootstrapped and mounted, but then put in a broken state and never unmounted', function (done) {
				singleSpa.triggerAppChange().then(function () {
					expect(childApp.wasBootstrapped()).toEqual(true);
					expect(childApp.wasMounted()).toEqual(true);
					expect(singleSpa.getMountedApps()).toEqual([]);
					expect(singleSpa.getAppStatus(appLocation)).toEqual('SKIP_BECAUSE_BROKEN');

					location.hash = 'not-invalid-mount';
					singleSpa.triggerAppChange().then(function () {
						// doesn't get unmounted because it's in a broken state.
						expect(childApp.wasUnmounted()).toEqual(false);
						expect(singleSpa.getMountedApps()).toEqual([]);
						expect(singleSpa.getAppStatus(appLocation)).toEqual('SKIP_BECAUSE_BROKEN');
						done();
					}).catch(function (ex) {
						fail(ex);
						done();
					});
				}).catch(function (ex) {
					fail(ex);
					done();
				});
			});
		});
	});

	return {
		setters: [],
		execute: function () {
			appLocation = '/base/spec/child-apps/invalid-mount/invalid-mount.app.js';
			activeHash = '#invalid-mount';
		}
	};
});
$__System.register('a', [], function (_export, _context) {
	"use strict";

	var appLocation, activeHash;

	_export('default', function () {
		describe('invalid-unmount app', function () {
			var childApp = void 0;

			beforeAll(function () {
				singleSpa.declareChildApplication(appLocation, function (location) {
					return location.hash === activeHash;
				});
			});

			beforeEach(function (done) {
				location.hash = activeHash;

				System.import(appLocation).then(function (app) {
					return childApp = app;
				}).then(function (app) {
					return app.reset();
				}).then(done).catch(function (err) {
					throw err;
				});
			});

			it('is bootstrapped, mounted, and unmounted, but then put in a broken state and never again mounted', function (done) {
				singleSpa.triggerAppChange().then(function () {
					expect(childApp.numBootstraps()).toEqual(1);
					expect(childApp.numMounts()).toEqual(1);
					expect(singleSpa.getMountedApps()).toEqual([appLocation]);
					expect(singleSpa.getAppStatus(appLocation)).toEqual('MOUNTED');

					// now unmount, which will be the first time it enters a broken state
					location.hash = '#not-invalid-unmount';
					singleSpa.triggerAppChange().then(function () {
						expect(childApp.numBootstraps()).toEqual(1);
						expect(childApp.numMounts()).toEqual(1);
						expect(childApp.numUnmounts()).toEqual(1);
						expect(singleSpa.getMountedApps()).toEqual([]);
						expect(singleSpa.getAppStatus(appLocation)).toEqual('SKIP_BECAUSE_BROKEN');

						// now remount and check if it tries to mount despite being in a broken state
						location.hash = activeHash;
						singleSpa.triggerAppChange().then(function () {
							expect(childApp.numBootstraps()).toEqual(1);
							expect(childApp.numMounts()).toEqual(1); // hasn't increased
							expect(childApp.numUnmounts()).toEqual(1);
							expect(singleSpa.getMountedApps()).toEqual([]);
							expect(singleSpa.getAppStatus(appLocation)).toEqual('SKIP_BECAUSE_BROKEN');
							done();
						}).catch(function (ex) {
							fail(ex);
							done();
						});
					}).catch(function (ex) {
						fail(ex);
						done();
					});
				}).catch(function (ex) {
					fail(ex);
					done();
				});
			});
		});
	});

	return {
		setters: [],
		execute: function () {
			appLocation = '/base/spec/child-apps/invalid-unmount/invalid-unmount.app.js';
			activeHash = '#invalid-unmount';
		}
	};
});
$__System.register('b', [], function (_export, _context) {
	"use strict";

	var appLocation, activeHash;

	_export('default', function () {
		describe('invalid-no-bootstrap app', function () {
			var childApp = void 0;

			beforeAll(function () {
				singleSpa.declareChildApplication(appLocation, function (location) {
					return location.hash === activeHash;
				});
			});

			beforeEach(function (done) {
				location.hash = activeHash;

				System.import(appLocation).then(function (app) {
					return childApp = app;
				}).then(function (app) {
					return app.reset();
				}).then(done).catch(function (err) {
					throw err;
				});
			});

			it('is never mounted', function (done) {
				singleSpa.triggerAppChange().then(function () {
					expect(childApp.isMounted()).toEqual(false);
					expect(singleSpa.getMountedApps()).toEqual([]);
					expect(singleSpa.getAppStatus(appLocation)).toEqual('SKIP_BECAUSE_BROKEN');
					done();
				}).catch(function (ex) {
					fail(ex);
					done();
				});
			});
		});
	});

	return {
		setters: [],
		execute: function () {
			appLocation = '/base/spec/child-apps/invalid-no-bootstrap/invalid-no-bootstrap.app.js';
			activeHash = '#invalid-no-bootstrap';
		}
	};
});
$__System.register('c', [], function (_export, _context) {
	"use strict";

	var appLocation, activeHash;

	_export('default', function () {
		describe('invalid-no-mount app', function () {
			var childApp = void 0;

			beforeAll(function () {
				singleSpa.declareChildApplication(appLocation, function (location) {
					return location.hash === activeHash;
				});
			});

			beforeEach(function (done) {
				location.hash = activeHash;

				System.import(appLocation).then(function (app) {
					return childApp = app;
				}).then(function (app) {
					return app.reset();
				}).then(done).catch(function (err) {
					throw err;
				});
			});

			it('is never bootstrapped', function (done) {
				singleSpa.triggerAppChange().then(function () {
					expect(childApp.isBootstrapped()).toEqual(false);
					expect(singleSpa.getMountedApps()).toEqual([]);
					expect(singleSpa.getAppStatus(appLocation)).toEqual('SKIP_BECAUSE_BROKEN');
					done();
				}).catch(function (ex) {
					fail(ex);
					done();
				});
			});
		});
	});

	return {
		setters: [],
		execute: function () {
			appLocation = '/base/spec/child-apps/invalid-no-mount/invalid-no-mount.app.js';
			activeHash = '#invalid-no-mount';
		}
	};
});
$__System.register('d', [], function (_export, _context) {
	"use strict";

	var appLocation, activeHash;

	_export('default', function () {
		describe('invalid-no-unmount app', function () {
			var childApp = void 0;

			beforeAll(function () {
				singleSpa.declareChildApplication(appLocation, function (location) {
					return location.hash === activeHash;
				});
			});

			beforeEach(function (done) {
				location.hash = activeHash;

				System.import(appLocation).then(function (app) {
					return childApp = app;
				}).then(function (app) {
					return app.reset();
				}).then(done).catch(function (err) {
					throw err;
				});
			});

			it('is never bootstrapped', function (done) {
				singleSpa.triggerAppChange().then(function () {
					expect(childApp.isBootstrapped()).toEqual(false);
					expect(childApp.isMounted()).toEqual(false);
					expect(singleSpa.getMountedApps()).toEqual([]);
					expect(singleSpa.getAppStatus(appLocation)).toEqual('SKIP_BECAUSE_BROKEN');
					done();
				}).catch(function (ex) {
					fail(ex);
					done();
				});
			});
		});
	});

	return {
		setters: [],
		execute: function () {
			appLocation = '/base/spec/child-apps/invalid-no-unmount/invalid-no-unmount.app.js';
			activeHash = '#invalid-no-unmount';
		}
	};
});
$__System.register('e', [], function (_export, _context) {
	"use strict";

	var appLocation, activeHash;

	_export('default', function () {
		describe('mount-rejects app', function () {
			var childApp = void 0;

			beforeAll(function () {
				singleSpa.declareChildApplication(appLocation, function (location) {
					return location.hash === activeHash;
				});
			});

			beforeEach(function (done) {
				location.hash = activeHash;

				System.import(appLocation).then(function (app) {
					return childApp = app;
				}).then(function (app) {
					return app.reset();
				}).then(done).catch(function (err) {
					throw err;
				});
			});

			it('bootstraps and mounts, but then is put into SKIP_BECAUSE_BROKEN and never unmounts', function (done) {
				singleSpa.triggerAppChange().then(function () {
					expect(childApp.wasBootstrapped()).toEqual(true);
					expect(childApp.wasMounted()).toEqual(true);
					expect(singleSpa.getMountedApps()).toEqual([]);
					expect(singleSpa.getAppStatus(appLocation)).toEqual('SKIP_BECAUSE_BROKEN');

					location.hash = '#not-mount-rejects';
					singleSpa.triggerAppChange().then(function () {
						expect(childApp.wasUnmounted()).toEqual(false);
						expect(singleSpa.getMountedApps()).toEqual([]);
						expect(singleSpa.getAppStatus(appLocation)).toEqual('SKIP_BECAUSE_BROKEN');

						done();
					}).catch(function (ex) {
						fail(ex);
						done();
					});
				}).catch(function (ex) {
					fail(ex);
					done();
				});
			});
		});
	});

	return {
		setters: [],
		execute: function () {
			appLocation = '/base/spec/child-apps/mount-rejects/mount-rejects.app.js';
			activeHash = '#mount-rejects';
		}
	};
});
$__System.register('f', [], function (_export, _context) {
	"use strict";

	var appLocation, activeHash;

	_export('default', function () {
		describe('mount-times-out app', function () {
			var childApp = void 0;

			beforeAll(function () {
				singleSpa.declareChildApplication(appLocation, function (location) {
					return location.hash === activeHash;
				});
			});

			beforeEach(function (done) {
				location.hash = activeHash;

				System.import(appLocation).then(function (app) {
					return childApp = app;
				}).then(function (app) {
					return app.reset();
				}).then(done).catch(function (err) {
					throw err;
				});
			});

			it('is just waited for if dieOnTimeout is false', function (done) {
				singleSpa.triggerAppChange().then(function () {
					expect(childApp.bootstraps()).toEqual(1);
					expect(childApp.mounts()).toEqual(1);
					expect(singleSpa.getMountedApps()).toEqual([appLocation]);
					expect(singleSpa.getAppStatus(appLocation)).toEqual('MOUNTED');
					done();
				}).catch(function (ex) {
					fail(ex);
					done();
				});
			});
		});
	});

	return {
		setters: [],
		execute: function () {
			appLocation = '/base/spec/child-apps/mount-times-out/mount-times-out.app.js';
			activeHash = '#mount-times-out';
		}
	};
});
$__System.register('10', [], function (_export, _context) {
	"use strict";

	var appLocation, activeHash;

	_export('default', function () {
		describe('mount-times-out-dies app', function () {
			var childApp = void 0;

			beforeAll(function () {
				singleSpa.declareChildApplication(appLocation, function (location) {
					return location.hash === activeHash;
				});
			});

			beforeEach(function (done) {
				location.hash = activeHash;

				System.import(appLocation).then(function (app) {
					return childApp = app;
				}).then(function (app) {
					return app.reset();
				}).then(done).catch(function (err) {
					throw err;
				});
			});

			it('is put into SKIP_BECAUSE_BROKEN if dieOnTimeout is true', function (done) {
				singleSpa.triggerAppChange().then(function () {
					expect(childApp.bootstraps()).toEqual(1);
					expect(childApp.mounts()).toEqual(1);
					expect(singleSpa.getMountedApps()).toEqual([]);
					expect(singleSpa.getAppStatus(appLocation)).toEqual('SKIP_BECAUSE_BROKEN');
					done();
				}).catch(function (ex) {
					fail(ex);
					done();
				});
			});
		});
	});

	return {
		setters: [],
		execute: function () {
			appLocation = '/base/spec/child-apps/mount-times-out-dies/mount-times-out-dies.app.js';
			activeHash = '#mount-times-out-dies';
		}
	};
});
$__System.register('11', [], function (_export, _context) {
	"use strict";

	var appLocation, activeHash;

	_export('default', function () {
		describe('multiple-lifecycle-functions app', function () {
			var childApp = void 0;

			beforeAll(function () {
				singleSpa.declareChildApplication(appLocation, function (location) {
					return location.hash === activeHash;
				});
			});

			beforeEach(function (done) {
				location.hash = activeHash;

				System.import(appLocation).then(function (app) {
					return childApp = app;
				}).then(function (app) {
					return app.reset();
				}).then(done).catch(function (err) {
					throw err;
				});
			});

			it('waits for each of the functions one by one, in order', function (done) {
				singleSpa.triggerAppChange().then(function () {
					expect(childApp.bootstrapsCalledOutOfOrder()).toEqual(undefined);
					expect(childApp.bootstrap1Called()).toEqual(true);
					expect(childApp.bootstrap2Called()).toEqual(true);
					expect(childApp.bootstrap3Called()).toEqual(true);

					expect(childApp.mountsCalledOutOfOrder()).toEqual(undefined);
					expect(childApp.mount1Called()).toEqual(true);
					expect(childApp.mount2Called()).toEqual(true);
					expect(childApp.mount3Called()).toEqual(true);

					location.hash = '#not-multiple-lifecycle-functions';
					singleSpa.triggerAppChange().then(function () {
						expect(childApp.unmountsCalledOutOfOrder()).toEqual(undefined);

						expect(childApp.unmount1Called()).toEqual(true);
						expect(childApp.unmount2Called()).toEqual(true);
						expect(childApp.unmount3Called()).toEqual(true);

						done();
					}).catch(function (ex) {
						fail(ex);
						done();
					});
				}).catch(function (ex) {
					fail(ex);
					done();
				});
			});
		});
	});

	return {
		setters: [],
		execute: function () {
			appLocation = '/base/spec/child-apps/multiple-lifecycle-functions/multiple-lifecycle-functions.app.js';
			activeHash = '#multiple-lifecycle-functions';
		}
	};
});
$__System.register('12', [], function (_export, _context) {
	"use strict";

	var appLocation, activeHash;

	_export('default', function () {
		describe('mount-rejects app', function () {
			var childApp = void 0;

			beforeAll(function () {
				singleSpa.declareChildApplication(appLocation, function (location) {
					return location.hash === activeHash;
				});
			});

			beforeEach(function (done) {
				location.hash = activeHash;

				System.import(appLocation).then(function (app) {
					return childApp = app;
				}).then(function (app) {
					return app.reset();
				}).then(done).catch(function (err) {
					throw err;
				});
			});

			it('bootstraps and mounts, but then is put into SKIP_BECAUSE_BROKEN once it unmounts', function (done) {
				singleSpa.triggerAppChange().then(function () {
					expect(childApp.numBootstraps()).toEqual(1);
					expect(childApp.numMounts()).toEqual(1);
					expect(childApp.numUnmounts()).toEqual(0);
					expect(singleSpa.getMountedApps()).toEqual([appLocation]);
					expect(singleSpa.getAppStatus(appLocation)).toEqual('MOUNTED');

					location.hash = '#not-unmount-rejects';
					singleSpa.triggerAppChange().then(function () {
						expect(childApp.numUnmounts()).toEqual(1);
						expect(singleSpa.getMountedApps()).toEqual([]);
						expect(singleSpa.getAppStatus(appLocation)).toEqual('SKIP_BECAUSE_BROKEN');

						location.hash = '#unmount-rejects';
						singleSpa.triggerAppChange().then(function () {
							// it shouldn't be mounted again
							expect(childApp.numMounts()).toEqual(1);
							expect(singleSpa.getMountedApps()).toEqual([]);
							expect(singleSpa.getAppStatus(appLocation)).toEqual('SKIP_BECAUSE_BROKEN');

							done();
						}).catch(function (ex) {
							fail(ex);
							done();
						});
					}).catch(function (ex) {
						fail(ex);
						done();
					});
				}).catch(function (ex) {
					fail(ex);
					done();
				});
			});
		});
	});

	return {
		setters: [],
		execute: function () {
			appLocation = '/base/spec/child-apps/unmount-rejects/unmount-rejects.app.js';
			activeHash = '#unmount-rejects';
		}
	};
});
$__System.register('13', [], function (_export, _context) {
	"use strict";

	var appLocation, activeHash;

	_export('default', function () {
		describe('unmount-times-out app', function () {
			var childApp = void 0;

			beforeAll(function () {
				singleSpa.declareChildApplication(appLocation, function (location) {
					return location.hash === activeHash;
				});
			});

			beforeEach(function (done) {
				location.hash = activeHash;

				System.import(appLocation).then(function (app) {
					return childApp = app;
				}).then(function (app) {
					return app.reset();
				}).then(done).catch(function (err) {
					throw err;
				});
			});

			it('is just waited for if dieOnTimeout is false', function (done) {
				singleSpa.triggerAppChange().then(function () {
					expect(childApp.numBootstraps()).toEqual(1);
					expect(childApp.numMounts()).toEqual(1);
					expect(singleSpa.getMountedApps()).toEqual([appLocation]);
					expect(singleSpa.getAppStatus(appLocation)).toEqual('MOUNTED');

					location.hash = '#not-unmount-times-out';
					singleSpa.triggerAppChange().then(function () {
						expect(childApp.numUnmounts()).toEqual(1);
						expect(singleSpa.getMountedApps()).toEqual([]);
						expect(singleSpa.getAppStatus(appLocation)).toEqual('NOT_MOUNTED');
						done();
					}).catch(function (ex) {
						fail(ex);
						done();
					});
				}).catch(function (ex) {
					fail(ex);
					done();
				});
			});
		});
	});

	return {
		setters: [],
		execute: function () {
			appLocation = '/base/spec/child-apps/unmount-times-out/unmount-times-out.app.js';
			activeHash = '#unmount-times-out';
		}
	};
});
$__System.register('14', [], function (_export, _context) {
	"use strict";

	var appLocation, activeHash;

	_export('default', function () {
		describe('unmount-times-out app', function () {
			var childApp = void 0;

			beforeAll(function () {
				singleSpa.declareChildApplication(appLocation, function (location) {
					return location.hash === activeHash;
				});
			});

			beforeEach(function (done) {
				location.hash = activeHash;

				System.import(appLocation).then(function (app) {
					return childApp = app;
				}).then(function (app) {
					return app.reset();
				}).then(done).catch(function (err) {
					throw err;
				});
			});

			it('is put into SKIP_BECAUSE_BROKEN when dieOnTimeout is true', function (done) {
				singleSpa.triggerAppChange().then(function () {
					expect(childApp.numBootstraps()).toEqual(1);
					expect(childApp.numMounts()).toEqual(1);
					expect(singleSpa.getMountedApps()).toEqual([appLocation]);
					expect(singleSpa.getAppStatus(appLocation)).toEqual('MOUNTED');

					location.hash = '#not-unmount-times-out';
					singleSpa.triggerAppChange().then(function () {
						expect(childApp.numUnmounts()).toEqual(1);
						expect(singleSpa.getMountedApps()).toEqual([]);
						expect(singleSpa.getAppStatus(appLocation)).toEqual('SKIP_BECAUSE_BROKEN');
						done();
					}).catch(function (ex) {
						fail(ex);
						done();
					});
				}).catch(function (ex) {
					fail(ex);
					done();
				});
			});
		});
	});

	return {
		setters: [],
		execute: function () {
			appLocation = '/base/spec/child-apps/unmount-times-out-dies/unmount-times-out-dies.app.js';
			activeHash = '#unmount-times-out-dies';
		}
	};
});
$__System.register('15', ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', 'a', 'b', 'c', 'd', 'e', 'f'], function (_export, _context) {
	"use strict";

	var resetSingleSpa, bootstrapRejectsApp, bootstrapTimesOutApp, bootstrapTimesOutDies, emptyArrayLifecycles, happyBasic, invalidBootstrap, invalidMount, invalidUnmount, invalidNoBootstrap, invalidNoMount, invalidNoUnmount, mountRejects, mountTimesOut, mountTimesOutDies, multipleLifecycleFunctions, unmountRejects, unmountTimesOut, unmountTimesOutDies;
	return {
		setters: [function (_) {
			resetSingleSpa = _.resetSingleSpa;
		}, function (_2) {
			bootstrapRejectsApp = _2.default;
		}, function (_3) {
			bootstrapTimesOutApp = _3.default;
		}, function (_4) {
			bootstrapTimesOutDies = _4.default;
		}, function (_5) {
			emptyArrayLifecycles = _5.default;
		}, function (_6) {
			happyBasic = _6.default;
		}, function (_7) {
			invalidBootstrap = _7.default;
		}, function (_8) {
			invalidMount = _8.default;
		}, function (_9) {
			mountTimesOutDies = _9.default;
		}, function (_10) {
			multipleLifecycleFunctions = _10.default;
		}, function (_11) {
			unmountRejects = _11.default;
		}, function (_12) {
			unmountTimesOut = _12.default;
		}, function (_13) {
			unmountTimesOutDies = _13.default;
		}, function (_a) {
			invalidUnmount = _a.default;
		}, function (_b) {
			invalidNoBootstrap = _b.default;
		}, function (_c) {
			invalidNoMount = _c.default;
		}, function (_d) {
			invalidNoUnmount = _d.default;
		}, function (_e) {
			mountRejects = _e.default;
		}, function (_f) {
			mountTimesOut = _f.default;
		}],
		execute: function () {

			describe("SystemJS loader", function () {
				beforeAll(function (done) {
					resetSingleSpa().then(function () {
						singleSpa.start({
							loader: System
						});
						done();
					}).catch(function (err) {
						throw err;
					});
				});

				bootstrapRejectsApp();
				bootstrapTimesOutApp();
				bootstrapTimesOutDies();
				emptyArrayLifecycles();
				happyBasic();
				invalidBootstrap();
				invalidMount();
				invalidNoBootstrap();
				invalidNoMount();
				invalidNoUnmount();
				invalidUnmount();
				mountRejects();
				mountTimesOut();
				mountTimesOutDies();
				multipleLifecycleFunctions();
				unmountRejects();
				unmountTimesOut();
				unmountTimesOutDies();
			});
		}
	};
});
$__System.register('1', ['15'], function (_export, _context) {
  "use strict";

  return {
    setters: [function (_) {}],
    execute: function () {

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
      window.SINGLE_SPA_TESTING = true;
    }
  };
});
})
(function(factory) {
  if (typeof define == 'function' && define.amd)
    define([], factory);
  else if (typeof module == 'object' && module.exports && typeof require == 'function')
    module.exports = factory();
  else
    singleSpaTests = factory();
});
//# sourceMappingURL=single-spa.spec.build.js.map