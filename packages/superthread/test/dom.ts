// The package suite's one DOM, preloaded by bunfig.toml before any test file loads. Base UI picks its layout effect
// when it is first imported, by whether a document exists, and Bun shares that module across test files, so happy-dom
// registers here, before any test imports Base UI, React's client renderer or an item. Tests that mount clean up
// their own renders; this file owns the globals.
import { afterAll } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterAll(async () => {
  delete (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT;
  await GlobalRegistrator.unregister();
});
