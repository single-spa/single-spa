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
import navigateToUrlTests from 'spec/apis/navigate-to-url.spec.js';

describe("SystemJS loader :", () => {
	beforeAll(done => {
		resetSingleSpa()
		.then(() => {
			singleSpa.start({
				loader: System
			});
			done();
		})
		.catch(err => {throw err})
	})

	describe('apis :', () => {
		navigateToUrlTests();
	});

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
	});
});
