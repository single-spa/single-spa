export let bootstrapsCalledOutOfOrder = undefined;
export let mountsCalledOutOfOrder = undefined;
export let unmountsCalledOutOfOrder = undefined;

export let bootstrap1Called = false;
export let bootstrap2Called = false;
export let bootstrap3Called = false;
export let mount1Called = false;
export let mount2Called = false;
export let mount3Called = false;
export let unmount1Called = false;
export let unmount2Called = false;
export let unmount3Called = false;

export const bootstrap = [
	function bootstrap1() {
		return new Promise(resolve => {
			setTimeout(() => {
				if (bootstrap2Called)
					bootstrapsCalledOutOfOrder = `bootstrap 2 called before bootstrap 1`;
				if (bootstrap3Called)
					bootstrapsCalledOutOfOrder = `bootstrap 3 called before bootstrap 1`;
				bootstrap1Called = true;
				resolve();
			}, 10)
		});
	},

	function bootstrap2() {
		return new Promise(resolve => {
			if (bootstrap3Called)
				bootstrapsCalledOutOfOrder = `bootstrap 2 called before bootstrap 3`;
			bootstrap2Called = true;
			resolve();
		});
	},

	function bootstrap3() {
		return new Promise(resolve => {
			bootstrap3Called = true;
			resolve();
		});
	},
]

export const mount = [
	function mount1() {
		return new Promise(resolve => {
			setTimeout(() => {
				if (mount2Called)
					mountsCalledOutOfOrder = `mount 2 called before mount 1`;
				if (mount3Called)
					mountsCalledOutOfOrder = `mount 3 called before mount 1`;
				mount1Called = true;
				resolve();
			}, 10)
		});
	},

	function mount2() {
		return new Promise(resolve => {
			if (mount3Called)
				mountsCalledOutOfOrder = `mount 2 called before mount 3`;
			mount2Called = true;
			resolve();
		});
	},

	function mount3() {
		return new Promise(resolve => {
			mount3Called = true;
			resolve();
		});
	},
]

export const unmount = [
	function unmount1() {
		return new Promise(resolve => {
			setTimeout(() => {
				if (unmount2Called)
					unmountsCalledOutOfOrder = `unmount 2 called before unmount 1`;
				if (unmount3Called)
					unmountsCalledOutOfOrder = `unmount 3 called before unmount 1`;
				unmount1Called = true;
				resolve();
			}, 10)
		});
	},

	function unmount2() {
		return new Promise(resolve => {
			if (unmount3Called)
				unmountsCalledOutOfOrder = `unmount 2 called before unmount 3`;
			unmount2Called = true;
			resolve();
		});
	},

	function unmount3() {
		return new Promise(resolve => {
			unmount3Called = true;
			resolve();
		});
	},
]
