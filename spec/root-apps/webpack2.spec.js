import { resetSingleSpa } from './root-app.helpers.js';
import bootstrapRejects from '../child-apps/bootstrap-rejects/bootstrap-rejects.spec.js';
import bootstrapTimesOutDies from '../child-apps/bootstrap-times-out-dies/bootstrap-times-out-dies.spec.js';
import bootstrapTimesOut from '../child-apps/bootstrap-times-out/bootstrap-times-out.spec.js';
import emptyArrayLifecycles from '../child-apps/empty-array-lifecycles/empty-array-lifecycles.spec.js';
import happyBasic from '../child-apps/happy-basic/happy-basic.spec.js';
import invalidBootstrap from '../child-apps/invalid-bootstrap/invalid-bootstrap.spec.js';
import invalidMount from '../child-apps/invalid-mount/invalid-mount.spec.js';
import invalidNoBootstrap from '../child-apps/invalid-no-bootstrap/invalid-no-bootstrap.spec.js';
import invalidNoMount from '../child-apps/invalid-no-mount/invalid-no-mount.spec.js';
import invalidNoUnmount from '../child-apps/invalid-no-unmount/invalid-no-unmount.spec.js';
import invalidUnmount from '../child-apps/invalid-unmount/invalid-unmount.spec.js';
import mountRejects from '../child-apps/mount-rejects/mount-rejects.spec.js';
import mountTimesOutDies from '../child-apps/mount-times-out-dies/mount-times-out-dies.spec.js';
import mountTimesOut from '../child-apps/mount-times-out/mount-times-out.spec.js';
import multipleLifecycleFunctions from '../child-apps/multiple-lifecycle-functions/multiple-lifecycle-functions.spec.js';
import unmountRejects from '../child-apps/unmount-rejects/unmount-rejects.spec.js';
import unmountTimesOutDies from '../child-apps/unmount-times-out-dies/unmount-times-out-dies.spec.js';
import unmountTimesOut from '../child-apps/unmount-times-out/unmount-times-out.spec.js';
import returnsNonNativePromise from '../child-apps/returns-non-native-promise/returns-non-native-promise.spec.js';
import invalidLoadFunction from '../child-apps/invalid-load-function/invalid-load-function.spec.js';
import happyUnload from '../child-apps/happy-unload/happy-unload.spec.js';
import invalidUnload from '../child-apps/invalid-unload/invalid-unload.spec.js';

describe('webpack2 loader', () => {
	beforeAll(done => {
		resetSingleSpa()
		.then(() => {
			singleSpa.start();
			done();
		})
		.catch(err => {
			fail(err);
			done();
		});
	});

	describe('child apps :', () => {
		bootstrapRejects();
		bootstrapTimesOutDies();
		bootstrapTimesOut();
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
		multipleLifecycleFunctions();
		unmountRejects();
		unmountTimesOutDies();
		unmountTimesOut();
		returnsNonNativePromise();
		invalidLoadFunction();
		happyUnload();
		invalidUnload();
	});
});

