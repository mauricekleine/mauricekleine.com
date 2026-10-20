// Test entrypoint only: the deployed bundle has no clock-control route.
import worker, { ShareStore } from "../dist/worker.js";
export { ShareStore };
let offset = 0;
const realNow = Date.now;
Date.now = () => realNow() + offset;
export default {
  fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/_test/advance-clock") {
      offset += Number(url.searchParams.get("ms"));
      return new Response(null, { status: 204 });
    }
    return worker.fetch(request, env, ctx);
  },
};
