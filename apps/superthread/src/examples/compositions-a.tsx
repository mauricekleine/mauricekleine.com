import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { catalog } from "@/components/superthread/catalog";

export function Serves({ name }: { name: string }) {
  const apps = catalog.find((item) => item.name === name)?.serves;
  if (!apps?.length) throw new Error(`no apps listed for ${name}`);
  return (
    <p className="st-ca-serves">
      serves{" "}
      {new Intl.ListFormat("en", { type: "conjunction" }).format(
        apps.map((app) => (app === "www" ? "the public site" : app)),
      )}
      .
    </p>
  );
}

// A real viewport keeps the installed block's media queries intact. The document takes the site's stylesheet,
// while the frame scales to fit its column. No item class or breakpoint is changed for the gallery.
export function ViewportFrame({
  children,
  mode,
  title,
  width = 390,
  height = 300,
}: {
  children: ReactNode;
  mode: "light" | "dark";
  title: string;
  width?: number;
  height?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const wrapper = host.current;
    const doc = frame.current?.contentDocument;
    if (!wrapper || !doc) return;
    doc.documentElement.className = mode;
    doc.documentElement.lang = "en";
    doc.title = title;
    const base = doc.createElement("base");
    base.target = "_top";
    doc.head.append(base);
    const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')].map((node) => node.cloneNode(true));
    doc.head.append(...styles);
    setBody(doc.body);
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, entry!.contentRect.width / width)));
    observer.observe(wrapper);
    return () => {
      observer.disconnect();
      base.remove();
      styles.forEach((node) => node.parentNode?.removeChild(node));
    };
  }, [mode, title, width]);
  return (
    <div ref={host} className="st-ca-viewport" style={{ maxWidth: width, height: height * scale }}>
      <iframe
        ref={frame}
        title={title}
        width={width}
        height={height}
        className="st-ca-frame"
        style={{ transform: `scale(${scale})` }}
      />
      {body && createPortal(children, body)}
    </div>
  );
}
