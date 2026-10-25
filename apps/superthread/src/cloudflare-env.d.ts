declare module "cloudflare:workers" {
  export const env: import("./server-behavior").WorkerEnv;
}

// workerd's streaming HTML rewriter, as much of it as server.ts uses
declare class HTMLRewriter {
  on(
    selector: string,
    handlers: { element?(element: { prepend(content: string, options?: { html?: boolean }): void }): void },
  ): HTMLRewriter;
  transform(response: Response): Response;
}
