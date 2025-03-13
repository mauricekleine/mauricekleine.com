import { Button } from "./ui/button";
import {
  GithubLogo,
  LinkedinLogo,
  PaperPlaneTilt,
  TwitterLogo,
} from "./ui/icons";
import { MailtoLink } from "./ui/mailto-link";

export function ContactButtons() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
      <Button
        as="a"
        href="https://www.linkedin.com/in/mauricekleine/"
        leadingIcon={
          <LinkedinLogo
            className="size-5 transition-transform duration-200"
            weight="bold"
          />
        }
        target="_blank"
      >
        LinkedIn
      </Button>

      <Button
        as="a"
        href="https://github.com/mauricekleine/"
        leadingIcon={
          <GithubLogo
            className="size-5 transition-transform duration-200"
            weight="bold"
          />
        }
        target="_blank"
      >
        Github
      </Button>

      <Button
        as="a"
        href="https://x.com/maurice_kleine"
        leadingIcon={
          <TwitterLogo
            className="size-5 transition-transform duration-200"
            weight="bold"
          />
        }
      >
        Twitter
      </Button>

      <MailtoLink
        leadingIcon={
          <PaperPlaneTilt
            className="size-5 transition-transform duration-200"
            weight="bold"
          />
        }
      >
        Email
      </MailtoLink>
    </div>
  );
}
