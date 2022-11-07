import { ComponentType } from "react";

export function LogoLink({
  href,
  logo,
}: {
  href: string;
  logo: ComponentType<{ className: string }>;
}) {
  const Logo = logo;

  return (
    <a className="group" href={href} rel="noopener noreferrer" target="_blank">
      <Logo className="max-h-8 w-full fill-slate-200 transition-colors group-hover:fill-slate-200/75" />
    </a>
  );
}