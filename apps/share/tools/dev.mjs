import "./build.mjs";
import { localWorker } from "./local.mjs";
const worker = localWorker({ host: "127.0.0.1", port: Number(process.env.PORT || 4399) });
console.log(`local sharing Worker: ${await worker.ready}`);
for (const signal of ["SIGINT", "SIGTERM"])
  process.once(signal, async () => {
    await worker.dispose();
    process.exit(0);
  });
