// Test entrypoint only: the deployed bundle has no clock-control or alarm route.
import worker, { ShareStore as Store } from "../dist/worker.js";
let offset = 0;
const realNow = Date.now;
Date.now = () => realNow() + offset;
// Alarms follow the real clock, so tests run the shifted-clock alarm on demand.
export class ShareStore extends Store {
  async fetch(request) {
    if (new URL(request.url).pathname !== "/_test/alarm") return super.fetch(request);
    await this.alarm();
    return Response.json({ alarm: await this.ctx.storage.getAlarm() });
  }
}
export default {
  fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/_test/advance-clock") {
      offset += Number(url.searchParams.get("ms"));
      return new Response(null, { status: 204 });
    }
    if (url.pathname === "/_test/alarm") return env.STORE.get(env.STORE.idFromName("catalog-v1")).fetch(request);
    return worker.fetch(request, env, ctx);
  },
};
