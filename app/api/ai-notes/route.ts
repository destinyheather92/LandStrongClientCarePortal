import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { draftTherapyNote } from "@/lib/groq";
import { saveDraftNote } from "@/lib/store";

interface AiNoteRequestBody {
  clientId?: string;
  appointmentId?: string;
  sourceText?: string;
}

export async function POST(request: Request) {
  const body: AiNoteRequestBody = await request.json().catch(() => ({}));

  const clientId = (body.clientId ?? "").trim();
  const appointmentId = (body.appointmentId ?? "").trim();
  const sourceText = (body.sourceText ?? "").trim();

  if (!clientId) {
    return NextResponse.json({ error: "Missing clientId." }, { status: 400 });
  }

  if (sourceText.length < 10) {
    return NextResponse.json(
      { error: "Paste a transcript or notes with a bit more detail first." },
      { status: 400 }
    );
  }

  try {
    const { draft } = await draftTherapyNote(sourceText);
    saveDraftNote(clientId, appointmentId, sourceText, draft);
    revalidatePath(`/therapist-dashboard/${clientId}`);
    return NextResponse.json({ draft });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Something went wrong generating the draft. Please try again.",
      },
      { status: 502 }
    );
  }
}
