import { addErrorHandler, removeErrorHandler } from "single-spa";

export function catchSingleSpaErrors() {
  const errHandler = (err) => {
    console.log("Handling errror", err);
  };

  beforeAll(() => {
    addErrorHandler(errHandler);
  });

  afterAll(() => {
    removeErrorHandler(errHandler);
  });
}
