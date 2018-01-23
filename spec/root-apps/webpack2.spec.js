import { resetSingleSpa } from './root-app.helpers.js';
import bootstrapRejects from '../apps/bootstrap-rejects/bootstrap-rejects.spec.js';
import bootstrapTimesOutDies from '../apps/bootstrap-times-out-dies/bootstrap-times-out-dies.spec.js';
import bootstrapTimesOut from '../apps/bootstrap-times-out/bootstrap-times-out.spec.js';
import emptyArrayLifecycles from '../apps/empty-array-lifecycles/empty-array-lifecycles.spec.js';
import happyBasic from '../apps/happy-basic/happy-basic.spec.js';
import invalidBootstrap from '../apps/invalid-bootstrap/invalid-bootstrap.spec.js';
import invalidMount from '../apps/invalid-mount/invalid-mount.spec.js';
import invalidNoBootstrap from '../apps/invalid-no-bootstrap/invalid-no-bootstrap.spec.js';
import invalidNoMount from '../apps/invalid-no-mount/invalid-no-mount.spec.js';
import invalidNoUnmount from '../apps/invalid-no-unmount/invalid-no-unmount.spec.js';
import invalidUnmount from '../apps/invalid-unmount/invalid-unmount.spec.js';
import mountRejects from '../apps/mount-rejects/mount-rejects.spec.js';
import mountTimesOutDies from '../apps/mount-times-out-dies/mount-times-out-dies.spec.js';
import mountTimesOut from '../apps/mount-times-out/mount-times-out.spec.js';
import multipleLifecycleFunctions from '../apps/multiple-lifecycle-functions/multiple-lifecycle-functions.spec.js';
import unmountRejects from '../apps/unmount-rejects/unmount-rejects.spec.js';
import unmountTimesOutDies from '../apps/unmount-times-out-dies/unmount-times-out-dies.spec.js';
import unmountTimesOut from '../apps/unmount-times-out/unmount-times-out.spec.js';
import returnsNonNativePromise from '../apps/returns-non-native-promise/returns-non-native-promise.spec.js';
import invalidLoadFunction from '../apps/invalid-load-function/invalid-load-function.spec.js';
import happyUnload from '../apps/happy-unload/happy-unload.spec.js';
import invalidUnload from '../apps/invalid-unload/invalid-unload.spec.js';
import lifecyleProps from '../apps/lifecycle-props/lifecycle-props.spec.js';
import parcelTests from '../parcels/parcels.spec.js';

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

  describe('apps :', () => {
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
    lifecyleProps();
  });

  parcelTests();
});

