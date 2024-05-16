import { logger, setLogger } from '../../src/utils/logging';

describe('logger module', () => {
    beforeEach(() => {
        setLogger(true);
    });
    const defaultConsoleTests = [
        {
            method: "debug",
            fn: (msg) => logger.debug(msg)
        },
        {
            method: "info",
            fn: (msg) => logger.info(msg)
        },
        {
            method: "warn",
            fn: (msg) => logger.warn(msg)
        },
        {
            method: "error",
            fn: (msg) => logger.error(msg)
        },
    ];
    defaultConsoleTests.forEach(tc => {
        it(`Should, by default, log all ${tc.method} messages to the console.`, () => {
            // Arrange.
            const spy = jest.spyOn(console, tc.method);

            // Act.
            tc.fn("Testing.");

            // Assert.
            expect(spy).toHaveBeenCalledTimes(1);
            spy.mockReset();
        });
    });
    describe('setLogger', () => {
        defaultConsoleTests.forEach(tc => {
            it(`Should silence all logging coming from the "${tc.method}" method after calling setLogger with "false" as argument.`, () => {
                // Arrange.
                const spy = jest.spyOn(console, tc.method);
                tc.fn("Testing.");
                expect(spy).toHaveBeenCalledTimes(1);
                
                // Act.
                setLogger(false);

                // Assert.
                tc.fn("Testing 2.");
                expect(spy).toHaveBeenCalledTimes(1);
                spy.mockReset();
            });
        });
        const customLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };
        defaultConsoleTests.forEach(tc => {
            it(`Should call the provided custom logger's "${tc.method}" method instead of logging directly to the console when setLogger is called with a custom logger object as argument.`, () => {
                // Arrange.
                const spy = jest.spyOn(console, tc.method);

                // Act.
                setLogger(customLogger);

                // Assert.
                tc.fn("Testing.");
                expect(customLogger[tc.method]).toHaveBeenCalledTimes(1);
                expect(spy).not.toHaveBeenCalled();
                spy.mockReset();
            });
        });
    });
});