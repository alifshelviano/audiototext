// lib/email-service.ts
import nodemailer from "nodemailer";

interface EmailOptions {
  to: string | string[];
  subject: string;
  meeting: any;
  summary: any;
  pdfAttachment?: {
    content: string;
    filename: string;
  };
}

// Function to optimize meeting data for email
function optimizeMeetingData(meeting: any, summary: any) {
  const structuredSummary = summary?.meeting_summary || summary;
  
  return {
    // Basic meeting info
    name: meeting.name,
    time: meeting.time,
    
    // Optimized summary data
    summary: {
      title: structuredSummary?.title || meeting.name,
      date: structuredSummary?.date || new Date(meeting.time).toISOString().split('T')[0],
      time: structuredSummary?.time || new Date(meeting.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      
      // Limit arrays to prevent large emails
      participants: (structuredSummary?.participants || []).slice(0, 8),
      key_points: (structuredSummary?.key_points || []).slice(0, 6),
      insights_decisions: (structuredSummary?.insights_decisions || []).slice(0, 4),
      action_items: (structuredSummary?.action_items || []).slice(0, 5),
      summary_insights: (structuredSummary?.summary_insights || []).slice(0, 2),
      
      // Include only essential sentiment data
      emotion_analysis: structuredSummary?.emotion_analysis ? {
        overall_sentiment: structuredSummary.emotion_analysis.overall_sentiment,
        overall_confidence: structuredSummary.emotion_analysis.overall_confidence
      } : null,
      
      // Include health score if available
      meeting_health_score: structuredSummary?.meeting_health_score || null,
      
      // Include next meeting if available
      next_meeting: structuredSummary?.next_meeting || null
    }
  };
}

// Create transporter once and reuse it
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      throw new Error("SMTP configuration is missing. Please check your environment variables.");
    }

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      // Add timeout settings
      connectionTimeout: 10000,
      socketTimeout: 10000,
      greetingTimeout: 10000
    });
  }
  return transporter;
}

// Verify SMTP connection
async function verifySMTPConnection() {
  const transporter = getTransporter();
  try {
    await transporter.verify();
    console.log("SMTP connection verified successfully");
    return true;
  } catch (error) {
    console.error("SMTP connection failed:", error);
    throw new Error("Failed to connect to email server. Please check your SMTP configuration.");
  }
}

// Estimate email size in bytes
function estimateEmailSize(htmlContent: string, pdfContent?: string): number {
  let size = Buffer.byteLength(htmlContent, 'utf8');
  
  if (pdfContent) {
    // PDF content is base64, so actual size is about 75% of base64 string
    size += Math.floor(pdfContent.length * 0.75);
  }
  
  return size;
}

// Convert bytes to MB
function bytesToMB(bytes: number): number {
  return bytes / (1024 * 1024);
}

export async function sendEmailWithAttachment(options: EmailOptions) {
  await verifySMTPConnection();
  const transporter = getTransporter();

  // Optimize data for email to reduce size
  const optimizedData = optimizeMeetingData(options.meeting, options.summary);
  const emailHtml = generateEmailHTML(optimizedData);

  const mailOptions: any = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
    subject: options.subject,
    html: emailHtml,
  };

  // Only add attachment if provided and not too large
  if (options.pdfAttachment) {
    const estimatedSize = estimateEmailSize(emailHtml, options.pdfAttachment.content);
    const sizeMB = bytesToMB(estimatedSize);
    
    console.log(`Estimated email size: ${sizeMB.toFixed(2)} MB`);
    
    // Gmail limit is 25MB, but let's be conservative with 20MB
    if (sizeMB < 20) {
      mailOptions.attachments = [
        {
          filename: options.pdfAttachment.filename,
          content: options.pdfAttachment.content,
          encoding: "base64",
          contentType: "application/pdf",
        },
      ];
    } else {
      console.warn(`Email too large (${sizeMB.toFixed(2)} MB), sending without PDF attachment`);
      // Add note to email about attachment being too large
      mailOptions.html = mailOptions.html.replace(
        '</body>',
        `<p style="color: #d32f2f; font-weight: bold;">Note: PDF attachment was too large to send. Please access the full report in the LISN system.</p></body>`
      );
    }
  }

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Email sending failed:", error);
    
    // If failed with attachment, try without
    if (options.pdfAttachment && mailOptions.attachments) {
      console.log("Retrying without PDF attachment...");
      delete mailOptions.attachments;
      mailOptions.html = mailOptions.html.replace(
        '</body>',
        `<p style="color: #d32f2f; font-weight: bold;">Note: PDF attachment was too large to send. Please access the full report in the LISN system.</p></body>`
      );
      
      try {
        const result = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully without attachment:", result.messageId);
        return { success: true, messageId: result.messageId, attachmentSkipped: true };
      } catch (retryError) {
        console.error("Email sending failed even without attachment:", retryError);
        throw retryError;
      }
    }
    
    throw error;
  }
}

export async function sendEmailWithoutAttachment(options: Omit<EmailOptions, 'pdfAttachment'>) {
  await verifySMTPConnection();
  const transporter = getTransporter();

  // Optimize data for email to reduce size
  const optimizedData = optimizeMeetingData(options.meeting, options.summary);
  const emailHtml = generateEmailHTML(optimizedData);

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
    subject: options.subject,
    html: emailHtml,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully without attachment:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
}

function generateEmailHTML(data: any): string {
  const meeting = data;
  const summary = data.summary;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.4; 
      color: #000000; 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px;
      background: #ffffff;
    }
    .section { 
      margin-bottom: 20px; 
    }
    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #000000;
      margin-bottom: 10px;
      border-bottom: 1px solid #000000;
      padding-bottom: 5px;
    }
    ul { 
      padding-left: 20px; 
      margin: 0; 
    }
    li { 
      margin-bottom: 5px; 
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      background: #000000;
      color: #ffffff;
      border-radius: 3px;
      font-size: 10px;
      margin-left: 5px;
    }
    .footer { 
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #cccccc;
      font-size: 11px;
      color: #666666;
      text-align: center;
    }
    .health-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-top: 10px;
    }
    .health-item {
      text-align: center;
      padding: 8px;
      border: 1px solid #cccccc;
      border-radius: 4px;
    }
    .health-value {
      font-size: 16px;
      font-weight: bold;
      color: #000000;
    }
    .health-label {
      font-size: 11px;
      color: #666666;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 25px;">
    <h1 style="margin: 0 0 8px 0; font-size: 20px; color: #000000;">📋 ${summary.title}</h1>
    <p style="margin: 0; color: #000000;">${summary.date} • ${summary.time}</p>
  </div>
  
  <!-- Participants -->
  ${summary.participants.length > 0 ? `
  <div class="section">
    <h2 class="section-title">👥 Participants</h2>
    <div>
      ${summary.participants.map((p: string) => `<span style="display: inline-block; margin: 0 8px 5px 0; color: #000000;">${p}</span>`).join("")}
    </div>
  </div>
  ` : ''}

  <!-- Key Points -->
  ${summary.key_points.length > 0 ? `
  <div class="section">
    <h2 class="section-title">🎯 Key Points</h2>
    <ul>
      ${summary.key_points.map((point: string) => `<li>${point}</li>`).join("")}
    </ul>
  </div>
  ` : ''}

  <!-- Action Items -->
  ${summary.action_items.length > 0 ? `
  <div class="section">
    <h2 class="section-title">✅ Action Items</h2>
    <ul>
      ${summary.action_items.map((item: any) => {
        const task = typeof item === 'string' ? item : item.task;
        const assignedTo = item.assigned_to || 'Not assigned';
        const deadline = item.deadline || 'Not set';
        const status = item.status || 'pending';
        
        return `<li><strong>${task}</strong> - 👤 ${assignedTo}${deadline !== 'Not set' ? ` - 📅 ${deadline}` : ''} <span class="badge">${status}</span></li>`;
      }).join("")}
    </ul>
  </div>
  ` : ''}

  <!-- Insights & Decisions -->
  ${summary.insights_decisions.length > 0 ? `
  <div class="section">
    <h2 class="section-title">💡 Insights & Decisions</h2>
    <ul>
      ${summary.insights_decisions.map((insight: string) => `<li>${insight}</li>`).join("")}
    </ul>
  </div>
  ` : ''}

  <!-- Summary Insights -->
  ${summary.summary_insights.length > 0 ? `
  <div class="section">
    <h2 class="section-title">📊 Summary Insights</h2>
    <ul>
      ${summary.summary_insights.map((insight: string) => `<li>${insight}</li>`).join("")}
    </ul>
  </div>
  ` : ''}

  <!-- Sentiment Analysis -->
  ${summary.emotion_analysis ? `
  <div class="section">
    <h2 class="section-title">😊 Sentiment Analysis</h2>
    <div>
      <div style="font-weight: bold; margin-bottom: 5px; color: #000000;">${summary.emotion_analysis.overall_sentiment.toUpperCase()}</div>
      <div style="font-size: 12px; color: #666666;">Confidence: ${Math.round((summary.emotion_analysis.overall_confidence || 0) * 100)}%</div>
    </div>
  </div>
  ` : ''}

  <!-- Meeting Health Score -->
  ${summary.meeting_health_score ? `
  <div class="section">
    <h2 class="section-title">📈 Meeting Health</h2>
    <div style="margin-bottom: 10px;">
      <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px; color: #000000;">${summary.meeting_health_score.overall_score}/100</div>
      <div style="font-size: 12px; color: #666666;">Overall Score</div>
    </div>
    <div class="health-grid">
      <div class="health-item">
        <div class="health-value">${summary.meeting_health_score.engagement_score}</div>
        <div class="health-label">Engagement</div>
      </div>
      <div class="health-item">
        <div class="health-value">${summary.meeting_health_score.productivity_score}</div>
        <div class="health-label">Productivity</div>
      </div>
      <div class="health-item">
        <div class="health-value">${summary.meeting_health_score.collaboration_score}</div>
        <div class="health-label">Collaboration</div>
      </div>
      <div class="health-item">
        <div class="health-value">${summary.meeting_health_score.clarity_score}</div>
        <div class="health-label">Clarity</div>
      </div>
    </div>
  </div>
  ` : ''}

  <!-- Next Meeting -->
  ${summary.next_meeting ? `
  <div class="section">
    <h2 class="section-title">📅 Next Meeting</h2>
    <div>
      <div style="margin-bottom: 8px;"><strong>Date:</strong> ${summary.next_meeting.date}</div>
      ${summary.next_meeting.agenda && summary.next_meeting.agenda.length > 0 ? `
      <div style="margin-top: 8px;">
        <strong>Agenda:</strong>
        <ul style="margin-top: 4px;">
          ${summary.next_meeting.agenda.slice(0, 3).map((item: string) => `<li>${item}</li>`).join("")}
        </ul>
      </div>
      ` : ''}
    </div>
  </div>
  ` : ''}

  <!-- Footer -->
  <div class="footer">
    <p>📎 <strong>Complete meeting documentation is available in the LISN system.</strong></p>
    <p>This summary was generated automatically by LISN Documentation System.</p>
    <p>© ${new Date().getFullYear()} LISN. All rights reserved.</p>
  </div>
</body>
</html>`;
}

// Utility function to check if we should include PDF
export function shouldIncludePDF(meeting: any): boolean {
  // Don't include PDF if there are too many transcripts
  const transcriptCount = meeting.transcripts?.length || 0;
  return transcriptCount < 50; // Only include PDF for smaller meetings
}

// Utility function to get PDF size estimate
export function estimatePDFSize(meeting: any): number {
  const transcriptCount = meeting.transcripts?.length || 0;
  // Rough estimate: 2KB per transcript + 10KB base
  return (transcriptCount * 2 + 10) * 1024;
}