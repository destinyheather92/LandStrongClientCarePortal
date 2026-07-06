"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Sparkles } from "lucide-react";
import {
  approveDraftNoteAction,
  discardDraftNoteAction,
} from "@/app/therapist-dashboard/[clientId]/actions";
import { SessionNote } from "@/lib/types";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldGroup, Label, Textarea } from "@/components/ui/field";
import { formatDateTime } from "@/lib/utils";

export function AINoteGenerator({
  clientId,
  appointmentId,
  note,
}: {
  clientId: string;
  appointmentId?: string;
  note: SessionNote | null;
}) {
  const router = useRouter();
  const [sourceText, setSourceText] = useState(note?.sourceText ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApproved = note?.status === "approved";

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, appointmentId, sourceText }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong generating the draft.");
        return;
      }

      router.refresh();
    } catch {
      setError("Couldn't reach the AI note service. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardBody className="space-y-5">
        <div className="flex items-center justify-between">
          <CardTitle>AI Session Note Draft</CardTitle>
          {isApproved ? (
            <Badge tone="success">Approved</Badge>
          ) : note?.status === "draft" ? (
            <Badge tone="warning">Pending review</Badge>
          ) : (
            <Badge tone="neutral">Not started</Badge>
          )}
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-mist/60 p-4 text-xs text-navy/60">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-blue" />
          <p>
            AI drafts are never shared with the client automatically. A
            therapist must review, edit if needed, and approve a note before
            it becomes part of the record.
          </p>
        </div>

        {isApproved && note.approvedAt && (
          <p className="text-xs text-navy/50">
            Approved by {note.approvedBy} on {formatDateTime(note.approvedAt)}
          </p>
        )}

        {!isApproved && (
          <form onSubmit={handleGenerate} className="space-y-3">
            <FieldGroup>
              <Label htmlFor="sourceText">
                Paste session transcript or shorthand notes
              </Label>
              <Textarea
                id="sourceText"
                name="sourceText"
                rows={6}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="e.g. Client discussed... practiced... plans to..."
                required
              />
            </FieldGroup>

            {error && (
              <p className="rounded-xl bg-danger-bg px-4 py-2.5 text-sm text-danger">
                {error}
              </p>
            )}

            <Button type="submit" disabled={pending}>
              <Sparkles className="h-4 w-4" />
              {pending
                ? "Drafting with AI…"
                : note
                  ? "Regenerate Draft"
                  : "Generate Draft with AI"}
            </Button>
          </form>
        )}

        {note && !isApproved && (
          <form
            key={note.generatedAt ?? "draft"}
            className="space-y-3 border-t border-navy/10 pt-5"
          >
            <input type="hidden" name="clientId" value={clientId} />
            <FieldGroup>
              <Label htmlFor="aiDraft">Draft note (edit before approving)</Label>
              <Textarea
                id="aiDraft"
                name="aiDraft"
                rows={12}
                defaultValue={note.aiDraft}
              />
            </FieldGroup>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" formAction={approveDraftNoteAction}>
                Approve &amp; Save to Record
              </Button>
              <Button
                type="submit"
                variant="outline"
                formAction={discardDraftNoteAction}
              >
                Discard Draft
              </Button>
            </div>
          </form>
        )}

        {isApproved && (
          <div className="rounded-xl border border-navy/10 bg-mist/40 p-4">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-navy/80">
              {note.aiDraft}
            </pre>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
