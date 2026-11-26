(() => {
  const root = document.documentElement;
  const preference = matchMedia("(prefers-color-scheme: dark)");
  const selector = "[data-doc-mode]";

  function setMode(dark) {
    root.classList.toggle("dark", dark);
    const next = dark ? "light" : "dark";
    const label = dark ? "Light" : "Dark";
    for (const button of document.querySelectorAll(selector)) {
      button.textContent = label;
      button.setAttribute("aria-label", `Switch to ${next} mode`);
    }
  }

  setMode(preference.matches);
  document.addEventListener("DOMContentLoaded", () => setMode(root.classList.contains("dark")), { once: true });
  preference.addEventListener("change", (event) => setMode(event.matches));
  document.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest(selector)) {
      setMode(!root.classList.contains("dark"));
    }
  });
})();
