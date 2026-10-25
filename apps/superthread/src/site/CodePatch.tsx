import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/components/superthread/lib/utils";
import { Icon } from "@/components/superthread/ui/glyphs";

// One command on the code patch: the prompt cell, the command (any `@mk/` part in the house ink of the code patch)
// and a copy button. Solid key in light, the deep ground in dark, from the code tokens. A command too long for its
// column wraps between words, never inside one, so `@mk/input-group` always reads whole.
export function CodePatch({ command, className }: { command: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={cn("st-code", className)}>
      <span className="st-code-prompt" aria-hidden="true">
        $
      </span>
      <code>{words(command)}</code>
      <button type="button" onClick={copy} aria-label={copied ? "copied" : `copy: ${command}`}>
        <Icon name={copied ? "check" : "copy"} />
        <span aria-hidden="true">{copied ? "copied" : "copy"}</span>
      </button>
      <span className="sr-only" role="status">
        {copied ? "copied to the clipboard" : ""}
      </span>
    </div>
  );
}

// each word of the command as one unbreakable token, the spaces between them as the only places a line may break
function words(command: string): ReactNode[] {
  return command
    .split(/(\s+)/)
    .filter((part) => part !== "")
    .map((part, index) => {
      if (/^\s+$/.test(part)) return part;
      return part.startsWith("@mk/") ? (
        <em key={index} className="st-code-word">
          {part}
        </em>
      ) : (
        <span key={index} className="st-code-word">
          {part}
        </span>
      );
    });
}
