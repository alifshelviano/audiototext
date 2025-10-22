import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';

interface SummaryDisplayProps {
  summary: string;
  transcribedText: string;
}

export function SummaryDisplay({
  summary,
  transcribedText,
}: SummaryDisplayProps) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="grid gap-4">
        <h2 className="font-headline">Summary</h2>
        <div className="p-4 border rounded-md">
          <p>{summary}</p>
        </div>
      </div>
      <div className="grid gap-4">
        <Label className="font-headline" htmlFor="transcript">
          Transcript
        </Label>
        <Textarea className="h-full" id="transcript" readOnly value={transcribedText} />
      </div>
    </div>
  );
}
