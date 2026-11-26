import { useState } from "react";
import {
  InlineAnswer,
  InlineAnswers,
  InlineAnswersAsk,
  InlineAnswersLine,
  InlineAnswersList,
  InlineAnswersTrigger,
} from "@/components/superthread/ui/inline-answers";

// The line a job sheet prints under its title, with the three answers every job takes. A ship's answers write back; the
// example only says which one came in.
export function WrongLine({
  open,
  asked,
  onAnswer,
}: {
  open?: boolean;
  asked?: boolean;
  onAnswer?: (answer: string) => void;
}) {
  return (
    <InlineAnswers defaultOpen={open}>
      <InlineAnswersLine>The next draft waits on your answer, and it leads today&rsquo;s brief.</InlineAnswersLine>
      <InlineAnswersTrigger />
      <InlineAnswersList>
        <InlineAnswer onClick={() => onAnswer?.("already done")}>Already done</InlineAnswer>
        <InlineAnswer onClick={() => onAnswer?.("not mine")}>Not mine</InlineAnswer>
        <InlineAnswersAsk question="Wrong day" defaultOpen={asked}>
          <InlineAnswer onClick={() => onAnswer?.("tomorrow")}>Tomorrow</InlineAnswer>
          <InlineAnswer onClick={() => onAnswer?.("next week")}>Next week</InlineAnswer>
        </InlineAnswersAsk>
      </InlineAnswersList>
    </InlineAnswers>
  );
}

// Live: the slot is held, so the words below it stay put while the answers come and go.
export function InlineAnswersExample() {
  const [answer, setAnswer] = useState<string>();
  return (
    <div className="st-answers">
      <div className="st-answers-slot type-lede text-foreground">
        <WrongLine onAnswer={setAnswer} />
      </div>
      <p role="status" className="st-ca-note">
        {answer ? `The ship heard: ${answer}.` : "The words under the slot stay put."}
      </p>
    </div>
  );
}

export function InlineAnswersOpen() {
  return (
    <div className="st-answers">
      <div className="st-answers-slot type-lede text-foreground">
        <WrongLine open />
      </div>
      <div className="st-answers-slot type-lede text-foreground">
        <WrongLine open asked />
      </div>
    </div>
  );
}
