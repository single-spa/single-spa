import { resetSingleSpa } from './root-app.helpers.js';
import bootstrapRejectsApp from 'spec/apps/bootstrap-rejects/bootstrap-rejects.spec.js'
import bootstrapTimesOutApp from 'spec/apps/bootstrap-times-out/bootstrap-times-out.spec.js';
import bootstrapTimesOutDies from 'spec/apps/bootstrap-times-out-dies/bootstrap-times-out-dies.spec.js';
import emptyArrayLifecycles from 'spec/apps/empty-array-lifecycles/empty-array-lifecycles.spec.js';
import happyBasic from 'spec/apps/happy-basic/happy-basic.spec.js';
import invalidBootstrap from 'spec/apps/invalid-bootstrap/invalid-bootstrap.spec.js';
import invalidMount from 'spec/apps/invalid-mount/invalid-mount.spec.js';
import invalidUnmount from 'spec/apps/invalid-unmount/invalid-unmount.spec.js';
import invalidNoBootstrap from 'spec/apps/invalid-no-bootstrap/invalid-no-bootstrap.spec.js';
import invalidNoMount from 'spec/apps/invalid-no-mount/invalid-no-mount.spec.js';
import invalidNoUnmount from 'spec/apps/invalid-no-unmount/invalid-no-unmount.spec.js';
import mountRejects from 'spec/apps/mount-rejects/mount-rejects.spec.js';
import mountTimesOut from 'spec/apps/mount-times-out/mount-times-out.spec.js';
import mountTimesOutDies from 'spec/apps/mount-times-out-dies/mount-times-out-dies.spec.js';
import multipleLifecycleFunctions from 'spec/apps/multiple-lifecycle-functions/multiple-lifecycle-functions.spec.js';
import unmountRejects from 'spec/apps/unmount-rejects/unmount-rejects.spec.js';
import unmountTimesOut from 'spec/apps/unmount-times-out/unmount-times-out.spec.js';
import unmountTimesOutDies from 'spec/apps/unmount-times-out-dies/unmount-times-out-dies.spec.js';
import usesLoader from 'spec/apps/uses-loader/uses-loader.spec.js';
import navigateToUrlTests from 'spec/apis/navigate-to-url.spec.js';
import returnsNonNativePromise from 'spec/apps/returns-non-native-promise/returns-non-native-promise.spec.js';
import registerWithObject from 'spec/apps/register-with-object/register-with-object.spec.js'
import invalidLoadFunction from 'spec/apps/invalid-load-function/invalid-load-function.spec.js';
import happyUnload from 'spec/apps/happy-unload/happy-unload.spec.js';
import invalidUnload from 'spec/apps/invalid-unload/invalid-unload.spec.js';
import lifecyleProps from 'spec/apps/lifecycle-props/lifecycle-props.spec.js';
import { notStartedEventListeners, yesStartedEventListeners } from 'spec/apis/event-listeners.spec.js';
import eventsApi from 'spec/apis/single-spa-events-api.spec.js';
import checkActivityFunctionsApi from 'spec/apis/check-activity-functions.spec.js';
import parcelTests from '../parcels/parcels.spec.js';

describe("SystemJS loader :", () => {
  beforeAll(() => {
    const ogSystemNormalize = System.normalize;

    System.normalize = function(name, ...rest) {
      if (typeof name === 'string' && name.indexOf('./') === 0 && name.lastIndexOf('.app.js') === name.length - '.app.js'.length) {
        /* This is a bit of hackery to get the System.imports in the specs to resolve properly
         * even though they have weird paths so that they're compatible with webpack
         */
        name = `/base/spec/apps/${name.slice(2, name.length - '.app.js'.length)}/${name.slice(2)}`;
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

    describe('apps :', () => {
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
      registerWithObject();
    });

    parcelTests();

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
      checkActivityFunctionsApi();
      navigateToUrlTests();
      notStartedEventListeners();
    });
  });
});
