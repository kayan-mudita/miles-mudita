import { getResend, EMAIL_FROM, APP_URL } from "./config";
import { prisma } from "@/lib/db";

export async function sendReportReadyEmail(reportId: string): Promise<void> {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: { user: { select: { email: true, name: true } } },
  });

  if (!report || !report.user.email) return;
  if (report.emailSent) return;

  const reportUrl = `${APP_URL}/report/${report.id}`;
  const userName = report.user.name || "there";
  const recBadge =
    report.recommendation === "GO"
      ? '<span style="background:#22c55e20;color:#4ade80;padding:2px 8px;border-radius:4px;font-size:12px">GO</span>'
      : report.recommendation === "NO-GO"
      ? '<span style="background:#ef444420;color:#f87171;padding:2px 8px;border-radius:4px;font-size:12px">NO-GO</span>'
      : report.recommendation === "CONDITIONAL"
      ? '<span style="background:#eab30820;color:#facc15;padding:2px 8px;border-radius:4px;font-size:12px">CONDITIONAL</span>'
      : "";

  const scoreSection = report.overallScore != null
    ? `
      <div style="background:#1a1a2e;border:1px solid #c9a84c26;border-radius:8px;padding:24px;margin:16px 0;text-align:center">
        <p style="color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px 0">Overall Score</p>
        <p style="color:#c9a84c;font-size:48px;font-weight:bold;margin:0">${report.overallScore.toFixed(1)}<span style="color:#6b7280;font-size:20px">/10</span></p>
        <p style="margin:8px 0 0 0">${recBadge}</p>
        ${report.marketScore != null ? `
        <div style="display:flex;justify-content:space-between;margin-top:16px;padding-top:16px;border-top:1px solid #c9a84c15">
          <div style="text-align:center;flex:1"><p style="color:#6b7280;font-size:10px;margin:0">Market</p><p style="color:#e5e5e5;font-size:16px;margin:4px 0 0 0">${report.marketScore.toFixed(1)}</p></div>
          <div style="text-align:center;flex:1"><p style="color:#6b7280;font-size:10px;margin:0">Competition</p><p style="color:#e5e5e5;font-size:16px;margin:4px 0 0 0">${(report.competitionScore ?? 0).toFixed(1)}</p></div>
          <div style="text-align:center;flex:1"><p style="color:#6b7280;font-size:10px;margin:0">Cost</p><p style="color:#e5e5e5;font-size:16px;margin:4px 0 0 0">${(report.costScore ?? 0).toFixed(1)}</p></div>
          <div style="text-align:center;flex:1"><p style="color:#6b7280;font-size:10px;margin:0">Need</p><p style="color:#e5e5e5;font-size:16px;margin:4px 0 0 0">${(report.productScore ?? 0).toFixed(1)}</p></div>
          <div style="text-align:center;flex:1"><p style="color:#6b7280;font-size:10px;margin:0">Financial</p><p style="color:#e5e5e5;font-size:16px;margin:4px 0 0 0">${(report.financialScore ?? 0).toFixed(1)}</p></div>
        </div>
        ` : ""}
      </div>
    `
    : "";

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#0f0f23;color:#e5e5e5;padding:32px">
      <div style="text-align:center;margin-bottom:24px">
        <h1 style="color:#c9a84c;font-size:24px;margin:0">Miles by Mudita</h1>
      </div>

      <p style="color:#e5e5e5;font-size:16px">Hi ${userName},</p>

      <p style="color:#9ca3af;font-size:14px">Your research report for <strong style="color:#e5e5e5">${report.reportName}</strong> is ready!</p>

      ${scoreSection}

      <div style="text-align:center;margin:24px 0">
        <a href="${reportUrl}" style="display:inline-block;background:#c9a84c;color:#0f0f23;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px">View Full Report</a>
      </div>

      <hr style="border:none;border-top:1px solid #c9a84c15;margin:24px 0" />

      <p style="color:#6b7280;font-size:12px;text-align:center">
        This email was sent by Miles by Mudita. You received this because you requested a research report.
      </p>
    </div>
  `;

  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email for report", reportId);
    return;
  }

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: report.user.email,
      subject: `Your report "${report.reportName}" is ready${report.overallScore != null ? ` — Score: ${report.overallScore.toFixed(1)}/10` : ""}`,
      html,
    });

    await prisma.report.update({
      where: { id: reportId },
      data: { emailSent: true, emailSentAt: new Date() },
    });
  } catch (err) {
    console.error("Failed to send report email:", err);
  }
}
