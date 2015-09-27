describe('templateFactory', function () {
  
  beforeEach(module('ui.router.util'));

  it('exists', inject(function ($templateFactory) {
    expect($templateFactory).toBeDefined();
  }));
});
