import * as singleSpa from 'single-spa';

describe('registerApplication', function() {
  let app
  beforeEach(() => {
    app = {
      mount(){
        return Promise.resolve()
      },
      unmount() {
        return Promise.resolve()
      },
      bootstrap() {
        return Promise.resolve()
      }
    }
  })

  it('should throw when I register the same app twice', () => {
    singleSpa.registerApplication('duplicateApp', app, () => true)
    expect(
      () => {
        singleSpa.registerApplication('duplicateApp', app, () => true)
      }
    ).toThrow()
  })
})
