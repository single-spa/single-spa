function hrefWithoutHash() {
	return location.href.indexOf('#') >= 0 ? location.href.slice(0, location.href.indexOf('#')) : location.href;
}

function hrefWithoutQuery() {
	return location.href.indexOf('?') >= 0 ? location.href.slice(0, location.href.indexOf('?')) : location.href;
}

function expectPathAndHashToEqual(string) {
	expect(hrefWithoutQuery().slice(location.href.length - string.length)).toEqual(string);
}

export default function() {
	describe('navigateToUrl', function() {
		let urlBeforeTests = location.href;

		beforeEach(() => {
			location.hash = '#a/initial';
		});

		afterEach(() => {
			history.pushState(null, null, urlBeforeTests);
		});

		it('should navigate with a string', function() {
			singleSpa.navigateToUrl(hrefWithoutHash() + '#a/other');
			expect(location.hash).toBe('#a/other');
		});

		it('should navigate with an event', function() {
			const a = document.createElement("a");
			a.setAttribute("href", hrefWithoutHash() + "#a/other");
			a.addEventListener("click", singleSpa.navigateToUrl);
			// IE requires an element to be on the dom before click events will be fired.
			document.body.appendChild(a);
			a.click();
			expect(location.hash).toBe('#a/other');
			document.body.removeChild(a);
		});

		it('should navigate with an anchor tag as its context', function() {
			const a = document.createElement("a");
			a.setAttribute("href", hrefWithoutHash() + "#a/other");
			singleSpa.navigateToUrl.call(a);
			expect(location.hash).toBe('#a/other');
		});

		it('should update hash when destination starts with a hash', function() {
			singleSpa.navigateToUrl('#a/other');
			expect(location.hash).toBe('#a/other');
		});

		it(`should update hash when destination doesn't contain domain, but same path`, function() {
			window.history.pushState(null, null, "/start-path#a/other");
			singleSpa.navigateToUrl('/start-path#a/other');
			expectPathAndHashToEqual('/start-path#a/other');

			location.hash = '#not-the-start-path';
			singleSpa.navigateToUrl('/start-path#a/other');
			expectPathAndHashToEqual('/start-path#a/other');
		});

		it(`should call push state when the destination doesn't contain domain and has different path 1`, function() {
			singleSpa.navigateToUrl('somethinger#b/my-route');
			// If pushState wasn't called, karma will barf because the page will have reloaded if the href was changed directly
			expectPathAndHashToEqual('somethinger#b/my-route');
		});

		it(`should call push state when the origin's don't match, since single spa never wants to refresh the page`, function() {
			try {
				singleSpa.navigateToUrl('https://other-app.com/something#b/my-route');
				fail("The browser should have thrown an error when pushState was called for a different origin than the one you're on");
			} catch(err) {
				//expected
			}
		});

		it(`should call push state when the url has no hash`, function() {
			singleSpa.navigateToUrl(hrefWithoutHash() + '/some-other-path-without-hash');
			expectPathAndHashToEqual('/some-other-path-without-hash');
		});

		it('should error if not called with appropriate args', function() {
			const errors = [
				null,
				undefined,
				1234,
			];

			errors.forEach(arg => {
				expect(() => makeError(null, arg)).toThrow();
			});
		});

		it('should error if not called with appropriate context', function() {
			expect(makeError).toThrow();

			function makeError(err) {
				singleSpa.navigateToUrl.call({});
			}
		});
	});
}
