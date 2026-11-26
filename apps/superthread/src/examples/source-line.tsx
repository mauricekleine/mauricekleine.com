import { SourceLine, SourceLineItem } from "@/components/superthread/ui/source-line";

// The sources a brief read, and when it was written.
export function SourceLineExample() {
  return (
    <SourceLine end="Written 07:00">
      <SourceLineItem href="#example">22 Sep call recap</SourceLineItem>
      <SourceLineItem href="#example">Sam&rsquo;s mail, Mon 2 Nov</SourceLineItem>
    </SourceLine>
  );
}

// A call with no recap has a name and no address, so it stays a plain name in the line.
export function SourceLinePlain() {
  return (
    <SourceLine label="Read for this">
      <SourceLineItem href="#plain">The outline</SourceLineItem>
      <SourceLineItem>A call nobody recorded</SourceLineItem>
    </SourceLine>
  );
}

// More sources than fit one line, and a long one that wraps inside it.
export function SourceLineLong() {
  return (
    <SourceLine end="Written 07:00">
      <SourceLineItem href="#wrap">22 Sep call recap</SourceLineItem>
      <SourceLineItem href="#wrap">Sam&rsquo;s mail, Mon 2 Nov</SourceLineItem>
      <SourceLineItem href="#wrap">
        Mina&rsquo;s reply about the chapter order, and the two figures she sent with it
      </SourceLineItem>
      <SourceLineItem href="#wrap">The outline</SourceLineItem>
    </SourceLine>
  );
}
