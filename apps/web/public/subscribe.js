// Progressive enhancement for the essay signup form: post via fetch and show
// the result inline. Without this file the form still works, it just does a
// full-page POST to /subscribe and the worker replies with an HTML page.
(() => {
  const form = document.querySelector("[data-subscribe]");
  if (!form) return;

  const status = form.querySelector("[data-subscribe-status]");
  const button = form.querySelector("button[type=submit]");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    button.disabled = true;
    status.classList.remove("error");
    status.textContent = "Sending...";

    try {
      const res = await fetch(form.action, {
        method: "POST",
        headers: { accept: "application/json" },
        body: new FormData(form),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        status.textContent = "Check your inbox for a confirmation link.";
        form.reset();
      } else {
        status.classList.add("error");
        status.textContent = data?.error || "Something went wrong. Try again in a bit.";
      }
    } catch {
      status.classList.add("error");
      status.textContent = "Something went wrong. Try again in a bit.";
    } finally {
      button.disabled = false;
      if (window.turnstile) window.turnstile.reset();
    }
  });
})();
