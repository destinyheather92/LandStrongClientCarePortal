export function SiteFooter() {
  return (
    <footer className="border-t border-navy/10 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-navy/50">
        <p className="max-w-3xl">
          LandStrong Client Care Portal is a demo MVP for illustration purposes
          only. It is not HIPAA-ready or connected to real Google Calendar or
          payment systems, and no real client information should be entered.
          AI-generated notes are always drafts and require therapist review and
          approval before becoming part of a client record.
        </p>
        <p className="mt-4">
          &copy; {new Date().getFullYear()} LandStrong Counseling. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
