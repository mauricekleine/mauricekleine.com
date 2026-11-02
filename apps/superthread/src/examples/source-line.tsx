import { SourceLine, SourceLineItem } from "@/components/superthread/ui/source-line";

// The sources a brief read, and when it was written.
export function SourceLineExample() {
  return (
    <SourceLine end="written 07:00">
      <SourceLineItem href="#example">22 sep call recap</SourceLineItem>
      <SourceLineItem href="#example">sam&rsquo;s mail, mon 2 nov</SourceLineItem>
    </SourceLine>
  );
}

// A call with no recap has a name and no address, so it stays a plain name in the line.
export function SourceLinePlain() {
  return (
    <SourceLine label="read for this">
      <SourceLineItem href="#plain">the outline</SourceLineItem>
      <SourceLineItem>a call nobody recorded</SourceLineItem>
    </SourceLine>
  );
}

// More sources than fit one line, and a long one that wraps inside it.
export function SourceLineLong() {
  return (
    <SourceLine end="written 07:00">
      <SourceLineItem href="#wrap">22 sep call recap</SourceLineItem>
      <SourceLineItem href="#wrap">sam&rsquo;s mail, mon 2 nov</SourceLineItem>
      <SourceLineItem href="#wrap">
        mina&rsquo;s reply about the chapter order, and the two figures she sent with it
      </SourceLineItem>
      <SourceLineItem href="#wrap">the outline</SourceLineItem>
    </SourceLine>
  );
}
