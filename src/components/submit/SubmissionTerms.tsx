export default function SubmissionTerms({ condensed = false }: { condensed?: boolean }) {
  if (condensed) {
    return (
      <p className="text-cream-300/50 text-xs font-body">
        By submitting, you agree to our{" "}
        <a href="/#faq" className="text-gold-500 hover:underline">
          submission terms
        </a>
        .
      </p>
    );
  }

  return (
    <div className="border border-gold-500/10 rounded-lg p-4 space-y-3">
      <p className="text-cream-300 text-xs font-body leading-relaxed">
        <span className="text-cream-200 font-semibold">Confidentiality:</span>{" "}
        Your idea is processed securely and never shared with third parties.
      </p>
      <p className="text-cream-300 text-xs font-body leading-relaxed">
        <span className="text-cream-200 font-semibold">Equity Consideration:</span>{" "}
        In the rare event that Mudita Studios decides to pursue a venture based
        on or inspired by your submitted idea, you may be entitled to an equity
        stake at Mudita Studios&apos; discretion.
      </p>
    </div>
  );
}
