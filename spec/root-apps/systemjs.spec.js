import { resetSingleSpa } from './root-app.helpers.js';
import bootstrapRejectsApp from 'spec/child-apps/bootstrap-rejects/bootstrap-rejects.spec.js'
import bootstrapTimesOutApp from 'spec/child-apps/bootstrap-times-out/bootstrap-times-out.spec.js';
import bootstrapTimesOutDies from 'spec/child-apps/bootstrap-times-out-dies/bootstrap-times-out-dies.spec.js';
import emptyArrayLifecycles from 'spec/child-apps/empty-array-lifecycles/empty-array-lifecycles.spec.js';
import happyBasic from 'spec/child-apps/happy-basic/happy-basic.spec.js';
import invalidBootstrap from 'spec/child-apps/invalid-bootstrap/invalid-bootstrap.spec.js';
import invalidMount from 'spec/child-apps/invalid-mount/invalid-mount.spec.js';
import invalidUnmount from 'spec/child-apps/invalid-unmount/invalid-unmount.spec.js';
import invalidNoBootstrap from 'spec/child-apps/invalid-no-bootstrap/invalid-no-bootstrap.spec.js';
import invalidNoMount from 'spec/child-apps/invalid-no-mount/invalid-no-mount.spec.js';
import invalidNoUnmount from 'spec/child-apps/invalid-no-unmount/invalid-no-unmount.spec.js';
import mountRejects from 'spec/child-apps/mount-rejects/mount-rejects.spec.js';
import mountTimesOut from 'spec/child-apps/mount-times-out/mount-times-out.spec.js';
import mountTimesOutDies from 'spec/child-apps/mount-times-out-dies/mount-times-out-dies.spec.js';
import multipleLifecycleFunctions from 'spec/child-apps/multiple-lifecycle-functions/multiple-lifecycle-functions.spec.js';
import unmountRejects from 'spec/child-apps/unmount-rejects/unmount-rejects.spec.js';
import unmountTimesOut from 'spec/child-apps/unmount-times-out/unmount-times-out.spec.js';
import unmountTimesOutDies from 'spec/child-apps/unmount-times-out-dies/unmount-times-out-dies.spec.js';
import usesLoader from 'spec/child-apps/uses-loader/uses-loader.spec.js';
import navigateToUrlTests from 'spec/apis/navigate-to-url.spec.js';
import returnsNonNativePromise from 'spec/child-apps/returns-non-native-promise/returns-non-native-promise.spec.js';
import invalidLoadFunction from 'spec/child-apps/invalid-load-function/invalid-load-function.spec.js';
import happyUnload from 'spec/child-apps/happy-unload/happy-unload.spec.js';
import invalidUnload from 'spec/child-apps/invalid-unload/invalid-unload.spec.js';
import lifecyleProps from 'spec/child-apps/lifecycle-props/lifecycle-props.spec.js';
import { notStartedEventListeners, yesStartedEventListeners } from 'spec/apis/event-listeners.spec.js';
import eventsApi from 'spec/apis/single-spa-events-api.spec.js';

describe("SystemJS loader :", () => {
	beforeAll(() => {
		const ogSystemNormalize = System.normalize;

		System.normalize = function(name, ...rest) {
			if (typeof name === 'string' && name.indexOf('./') === 0 && name.lastIndexOf('.app.js') === name.length - '.app.js'.length) {
				/* This is a bit of hackery to get the System.imports in the specs to resolve properly
				 * even though they have weird paths so that they're compatible with webpack
				 */
				name = `/base/spec/child-apps/${name.slice(2, name.length - '.app.js'.length)}/${name.slice(2)}`;
			}

			return ogSystemNormalize.call(this, name, ...rest);
		}
	});

	describe(`single-spa started :`, () => {
		beforeAll(done => {
			resetSingleSpa()
			.then(() => {
				singleSpa.setLoader(SystemJS)
				singleSpa.start();
				done();
			})
			.catch(err => {throw err})
		})

		describe('child apps :', () => {
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
			usesLoader();
			returnsNonNativePromise();
			invalidLoadFunction();
			happyUnload();
			invalidUnload();
			lifecyleProps();
		});

		describe(`apis :`, () => {
			yesStartedEventListeners();
			eventsApi();
		});
	});

	describe(`single-spa not started`, () => {
		beforeAll(done => {

			resetSingleSpa()
			.then(done)
			.catch(err => {throw err})
		})

		describe('apis :', () => {
			navigateToUrlTests();
			notStartedEventListeners();
		});
	});
});
