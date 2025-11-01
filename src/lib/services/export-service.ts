// lib/export-service.ts
"use client";

export class ExportService {
  static async exportToPDF(element: HTMLElement, filename: string = "meeting-documentation"): Promise<boolean> {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      console.warn("PDF export is only available in browser environment");
      return false;
    }

    try {
      // Dynamically import html2pdf.js only on the client-side
      const html2pdf = (await import("html2pdf.js")).default;

      const options = {
        margin: 15,
        filename: `${filename}-${new Date().toISOString().split("T")[0]}.pdf`,
        image: {
          type: "jpeg" as const,
          quality: 0.98,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          width: 800,
        },
        jsPDF: {
          unit: "mm" as const,
          format: "a4" as const,
          orientation: "portrait" as const,
        },
      };

      await html2pdf().set(options).from(element).save();
      return true;
    } catch (error) {
      console.error("PDF export failed:", error);
      return false;
    }
  }

  static async generatePDFBase64(element: HTMLElement): Promise<string | null> {
    try {
      // Dynamically import required libraries
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF("p", "mm", "a4");
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is too long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Return base64 string directly
      return pdf.output("datauristring");
    } catch (error) {
      console.error("PDF generation failed:", error);
      return null;
    }
  }

  static generateDocumentHTML(meeting: any, structuredSummary: any) {
    const participants = structuredSummary.participants || [];
    const keyPoints = structuredSummary.key_points || [];
    const insights = structuredSummary.insights_decisions || [];
    const actionItems = structuredSummary.action_items || [];
    const summaryInsights = structuredSummary.summary_insights || [];
    const emotionAnalysis = structuredSummary.emotion_analysis;
    const healthScore = structuredSummary.meeting_health_score;
    const nextMeeting = structuredSummary.next_meeting;
    const transcripts = meeting.transcripts || [];

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Meeting Documentation - ${structuredSummary.title || meeting.name}</title>
          <style>
            /* Reset and base styles */
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #1f2937; 
              background: #ffffff;
              padding: 20px;
            }
            
            /* Header */
            .document-header {
              text-align: center;
              border-bottom: 4px solid #3b82f6;
              padding-bottom: 25px;
              margin-bottom: 30px;
            }
            .document-title {
              font-size: 28px;
              font-weight: 700;
              color: #1e40af;
              margin-bottom: 8px;
            }
            .document-subtitle {
              font-size: 16px;
              color: #6b7280;
              font-weight: 500;
            }
            
            /* Sections */
            .section {
              margin-bottom: 35px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 20px;
              font-weight: 700;
              color: #1e40af;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            
            /* Meeting Overview */
            .overview-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 15px;
            }
            .overview-item {
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
            }
            .overview-label {
              font-weight: 600;
              color: #374151;
              font-size: 14px;
              margin-bottom: 5px;
            }
            .overview-value {
              color: #111827;
              font-size: 15px;
            }
            
            /* Participants */
            .participant-list {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }
            .participant-tag {
              background: #eff6ff;
              color: #1e40af;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 500;
              border: 1px solid #dbeafe;
            }
            
            /* Key Points */
            .key-points {
              list-style: none;
              counter-reset: point-counter;
            }
            .key-point {
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 12px;
              border-left: 4px solid #8b5cf6;
              display: flex;
              align-items: flex-start;
              gap: 12px;
            }
            .key-point::before {
              counter-increment: point-counter;
              content: counter(point-counter);
              background: #8b5cf6;
              color: white;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: 700;
              flex-shrink: 0;
            }
            
            /* Insights & Decisions */
            .insight-item {
              background: #f0fdf4;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 12px;
              border-left: 4px solid #10b981;
              display: flex;
              align-items: flex-start;
              gap: 12px;
            }
            .insight-icon {
              color: #10b981;
              font-size: 18px;
              flex-shrink: 0;
              margin-top: 2px;
            }
            
            /* Action Items */
            .action-item {
              background: #fff7ed;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 12px;
              border-left: 4px solid #f59e0b;
            }
            .action-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 8px;
            }
            .action-task {
              font-weight: 600;
              color: #1f2937;
              flex: 1;
            }
            .action-meta {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 8px;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .status-completed { background: #dcfce7; color: #166534; }
            .status-in-progress { background: #dbeafe; color: #1e40af; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-not-started { background: #f3f4f6; color: #374151; }
            
            /* Sentiment Analysis */
            .sentiment-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
            }
            .sentiment-card {
              background: #fafafa;
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            .sentiment-overall {
              text-align: center;
              padding: 25px;
            }
            .sentiment-score {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            .sentiment-positive { color: #059669; }
            .sentiment-negative { color: #dc2626; }
            .sentiment-neutral { color: #6b7280; }
            .sentiment-label {
              font-size: 14px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            /* Meeting Health Score */
            .health-score {
              text-align: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 12px;
              margin-bottom: 20px;
            }
            .health-score-value {
              font-size: 48px;
              font-weight: 800;
              margin-bottom: 8px;
            }
            .health-score-label {
              font-size: 16px;
              opacity: 0.9;
            }
            .health-metrics {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
            }
            .health-metric {
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
            }
            .metric-value {
              font-size: 24px;
              font-weight: 700;
              color: #1e40af;
              margin-bottom: 4px;
            }
            .metric-label {
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            /* Transcripts */
            .transcript-item {
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 12px;
              border-left: 4px solid #6b7280;
            }
            .transcript-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
            }
            .transcript-speaker {
              font-weight: 600;
              color: #1e40af;
            }
            .transcript-time {
              font-size: 12px;
              color: #6b7280;
              background: #e5e7eb;
              padding: 2px 8px;
              border-radius: 12px;
            }
            .transcript-content {
              color: #374151;
              line-height: 1.5;
            }
            
            /* Footer */
            .document-footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 12px;
            }
            
            /* Print styles */
            @media print {
              body { padding: 0; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <!-- Document Header -->
          <div class="document-header">
            <h1 class="document-title">${structuredSummary.title || meeting.name}</h1>
            <div class="document-subtitle">
              Meeting Documentation • ${structuredSummary.date} • ${structuredSummary.time}
            </div>
          </div>

          <!-- Meeting Overview -->
          <div class="section">
            <h2 class="section-title">Meeting Overview</h2>
            <div class="overview-grid">
              <div class="overview-item">
                <div class="overview-label">Meeting Title</div>
                <div class="overview-value">${structuredSummary.title || meeting.name}</div>
              </div>
              <div class="overview-item">
                <div class="overview-label">Date & Time</div>
                <div class="overview-value">${structuredSummary.date} at ${structuredSummary.time}</div>
              </div>
            </div>
            <div class="overview-item">
              <div class="overview-label">Participants (${participants.length})</div>
              <div class="participant-list">
                ${participants.map((p: string) => `<span class="participant-tag">${p}</span>`).join("")}
              </div>
            </div>
          </div>

          <!-- Key Discussion Points -->
          ${
            keyPoints.length > 0
              ? `
          <div class="section">
            <h2 class="section-title">Key Discussion Points</h2>
            <ol class="key-points">
              ${keyPoints
                .map(
                  (point: string) => `
                <li class="key-point">${point}</li>
              `
                )
                .join("")}
            </ol>
          </div>
          `
              : ""
          }

          <!-- Insights & Decisions -->
          ${
            insights.length > 0
              ? `
          <div class="section">
            <h2 class="section-title">Insights & Decisions</h2>
            <div>
              ${insights
                .map(
                  (insight: string) => `
                <div class="insight-item">
                  <span class="insight-icon">💡</span>
                  <div>${insight}</div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
          `
              : ""
          }

          <!-- Summary Insights -->
          ${
            summaryInsights.length > 0
              ? `
          <div class="section">
            <h2 class="section-title">Summary Insights</h2>
            <div>
              ${summaryInsights
                .map(
                  (insight: string) => `
                <div class="insight-item">
                  <span class="insight-icon">📊</span>
                  <div>${insight}</div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
          `
              : ""
          }

          <!-- Action Items -->
          ${
            actionItems.length > 0
              ? `
          <div class="section">
            <h2 class="section-title">Action Items</h2>
            <div>
              ${actionItems
                .map(
                  (item: any) => `
                <div class="action-item">
                  <div class="action-header">
                    <div class="action-task">${item.task}</div>
                    <span class="status-badge status-${item.status ? item.status.toLowerCase().replace(" ", "-") : "not-started"}">
                      ${item.status || "Not Started"}
                    </span>
                  </div>
                  <div class="action-meta">
                    👤 Assigned to: ${item.assigned_to || "Not assigned"} • 📅 Deadline: ${item.deadline || "Not set"}
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
          `
              : ""
          }

          <!-- Sentiment Analysis -->
          ${
            emotionAnalysis
              ? `
          <div class="section">
            <h2 class="section-title">Sentiment Analysis</h2>
            <div class="sentiment-grid">
              <div class="sentiment-card sentiment-overall">
                <div class="sentiment-score sentiment-${emotionAnalysis.overall_sentiment}">
                  ${emotionAnalysis.overall_sentiment.toUpperCase()}
                </div>
                <div class="sentiment-label">
                  Overall Sentiment • ${Math.round((emotionAnalysis.overall_confidence || 0) * 100)}% Confidence
                </div>
              </div>
              ${
                emotionAnalysis.participant_emotions && emotionAnalysis.participant_emotions.length > 0
                  ? `
              <div class="sentiment-card">
                <h3 style="margin-bottom: 15px; color: #374151;">Participant Emotions</h3>
                ${emotionAnalysis.participant_emotions
                  .map(
                    (participant: any) => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="font-weight: 500;">${participant.participant}</span>
                    <span style="font-size: 12px; color: #6b7280;">
                      ${participant.sentiment} (${Math.round((participant.confidence || 0) * 100)}%)
                    </span>
                  </div>
                `
                  )
                  .join("")}
              </div>
              `
                  : ""
              }
            </div>
          </div>
          `
              : ""
          }

          <!-- Meeting Health Score -->
          ${
            healthScore
              ? `
          <div class="section">
            <h2 class="section-title">Meeting Health Score</h2>
            <div class="health-score">
              <div class="health-score-value">${healthScore.overall_score}/100</div>
              <div class="health-score-label">Overall Meeting Health</div>
            </div>
            <div class="health-metrics">
              <div class="health-metric">
                <div class="metric-value">${healthScore.engagement_score}</div>
                <div class="metric-label">Engagement</div>
              </div>
              <div class="health-metric">
                <div class="metric-value">${healthScore.productivity_score}</div>
                <div class="metric-label">Productivity</div>
              </div>
              <div class="health-metric">
                <div class="metric-value">${healthScore.collaboration_score}</div>
                <div class="metric-label">Collaboration</div>
              </div>
              <div class="health-metric">
                <div class="metric-value">${healthScore.clarity_score}</div>
                <div class="metric-label">Clarity</div>
              </div>
            </div>
          </div>
          `
              : ""
          }

          <!-- Next Meeting -->
          ${
            nextMeeting
              ? `
          <div class="section">
            <h2 class="section-title">Next Meeting</h2>
            <div class="overview-item">
              <div class="overview-label">Scheduled Date</div>
              <div class="overview-value">${nextMeeting.date}</div>
            </div>
            ${
              nextMeeting.agenda && nextMeeting.agenda.length > 0
                ? `
            <div class="overview-item">
              <div class="overview-label">Agenda Items</div>
              <div>
                ${nextMeeting.agenda
                  .map(
                    (item: string, index: number) => `
                  <div style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    ${index + 1}. ${item}
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
            `
                : ""
            }
          </div>
          `
              : ""
          }

          <!-- Full Transcript -->
          ${
            transcripts.length > 0
              ? `
          <div class="section">
            <h2 class="section-title">Meeting Transcript</h2>
            <div style="font-size: 14px;">
              ${transcripts
                .map(
                  (transcript: any) => `
                <div class="transcript-item">
                  <div class="transcript-header">
                    <span class="transcript-speaker">${transcript.name}</span>
                    <span class="transcript-time">
                      ${transcript.createdAt ? new Date(transcript.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Unknown time"}
                    </span>
                  </div>
                  <div class="transcript-content">${transcript.transcript}</div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
          `
              : ""
          }

          <!-- Document Footer -->
          <div class="document-footer">
            Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} • 
            Meeting AI Documentation System
          </div>
        </body>
      </html>
    `;
  }
}
