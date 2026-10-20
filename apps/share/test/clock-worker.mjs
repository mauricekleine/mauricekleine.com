// Test entrypoint only: the deployed bundle has no clock-control or alarm route.
import worker, { ShareStore as Store } from "../dist/worker.js";
let offset = 0;
const realNow = Date.now;
Date.now = () => realNow() + offset;
// Alarms follow the real clock, so tests run the shifted-clock alarm on demand.
export class ShareStore extends Store {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/_test/alarm") {
      if (url.searchParams.has("run")) await this.alarm();
      return Response.json({ alarm: await this.ctx.storage.getAlarm() });
    }
    // Recreates a share as the previous deployment stored it: no expiresAt and no
    // alarm. With `restart`, the next request runs the object's constructor.
    if (url.pathname === "/_test/legacy") {
      const key = `share:${url.searchParams.get("id")}`;
      const { expiresAt, ...share } = await this.ctx.storage.get(key);
      await this.ctx.storage.put(key, share);
      await this.ctx.storage.deleteAlarm();
      await this.ctx.storage.sync();
      if (url.searchParams.has("restart")) this.ctx.abort("test restart");
      return new Response(null, { status: 204 });
    }
    return super.fetch(request);
  }
}
export default {
  fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/_test/advance-clock") {
      offset += Number(url.searchParams.get("ms"));
      return new Response(null, { status: 204 });
    }
    if (url.pathname === "/_test/alarm" || url.pathname === "/_test/legacy")
      return env.STORE.get(env.STORE.idFromName("catalog-v1")).fetch(request);
    return worker.fetch(request, env, ctx);
  },
};
