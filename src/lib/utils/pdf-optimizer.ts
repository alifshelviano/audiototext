// lib/pdf-optimizer.ts
import { jsPDF } from 'jspdf';

export class PDFOptimizer {
  static async generateLightweightPDF(meeting: any, structuredSummary: any): Promise<string | null> {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // Set document properties
      pdf.setProperties({
        title: `Meeting Summary: ${meeting.name}`,
        subject: 'Meeting Documentation',
        creator: 'LISN Documentation System'
      });

      let yPosition = 15;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;

      // Add header
      yPosition = this.addHeader(pdf, meeting, structuredSummary, pageWidth, margin, yPosition);
      
      // Add essential sections only (no transcripts)
      yPosition = this.addParticipants(pdf, structuredSummary, pageWidth, margin, yPosition);
      yPosition = this.addKeyPoints(pdf, structuredSummary, pageWidth, margin, yPosition);
      yPosition = this.addActionItems(pdf, structuredSummary, pageWidth, margin, yPosition);
      yPosition = this.addInsights(pdf, structuredSummary, pageWidth, margin, yPosition);
      
      if (yPosition < 250) {
        yPosition = this.addSentimentAnalysis(pdf, structuredSummary, pageWidth, margin, yPosition);
      }
      
      if (yPosition < 250) {
        yPosition = this.addMeetingHealth(pdf, structuredSummary, pageWidth, margin, yPosition);
      }

      // Add note about transcripts
      this.addTranscriptNote(pdf, meeting, pageWidth, margin, yPosition);

      const pdfOutput = pdf.output('datauristring');
      return pdfOutput;
    } catch (error) {
      console.error('Lightweight PDF generation failed:', error);
      return null;
    }
  }

  private static addHeader(pdf: jsPDF, meeting: any, summary: any, pageWidth: number, margin: number, yPosition: number): number {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Meeting Summary: ${meeting.name}`, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const meetingDate = meeting.time ? new Date(meeting.time) : new Date();
    const dateStr = meetingDate.toLocaleDateString();
    const timeStr = meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    pdf.text(`Date: ${dateStr} | Time: ${timeStr}`, pageWidth / 2, yPosition, { align: 'center' });
    
    return yPosition + 15;
  }

  private static addParticipants(pdf: jsPDF, summary: any, pageWidth: number, margin: number, yPosition: number): number {
    const participants = (summary.participants || []).slice(0, 6);
    
    if (participants.length === 0) return yPosition;

    this.addSectionHeader(pdf, 'Participants', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');

    const participantsText = participants.join(', ');
    const lines = pdf.splitTextToSize(participantsText, pageWidth - (margin * 2));
    
    lines.forEach((line: string) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 4;
    });

    return yPosition + 8;
  }

  private static addKeyPoints(pdf: jsPDF, summary: any, pageWidth: number, margin: number, yPosition: number): number {
    const keyPoints = (summary.key_points || []).slice(0, 5);
    
    if (keyPoints.length === 0) return yPosition;

    this.addSectionHeader(pdf, 'Key Points', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');

    keyPoints.forEach((point: string, index: number) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = margin;
      }

      const bulletPoint = `${index + 1}. ${point}`;
      const lines = pdf.splitTextToSize(bulletPoint, pageWidth - (margin * 2) - 5);
      
      lines.forEach((line: string) => {
        pdf.text(line, margin + 5, yPosition);
        yPosition += 4;
      });
      
      yPosition += 2;
    });

    return yPosition + 5;
  }

  private static addActionItems(pdf: jsPDF, summary: any, pageWidth: number, margin: number, yPosition: number): number {
    const actionItems = (summary.action_items || []).slice(0, 4);
    
    if (actionItems.length === 0) return yPosition;

    this.addSectionHeader(pdf, 'Action Items', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');

    actionItems.forEach((item: any, index: number) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = margin;
      }

      const task = typeof item === 'string' ? item : item.task;
      const assignedTo = item.assigned_to || 'Not assigned';
      const status = item.status || 'Pending';

      const actionText = `${index + 1}. ${task} (${assignedTo}) - ${status}`;
      const lines = pdf.splitTextToSize(actionText, pageWidth - (margin * 2) - 5);
      
      lines.forEach((line: string) => {
        pdf.text(line, margin + 5, yPosition);
        yPosition += 4;
      });
      
      yPosition += 3;
    });

    return yPosition + 5;
  }

  private static addInsights(pdf: jsPDF, summary: any, pageWidth: number, margin: number, yPosition: number): number {
    const insights = [
      ...(summary.insights_decisions || []).slice(0, 3),
      ...(summary.summary_insights || []).slice(0, 2)
    ].slice(0, 4);

    if (insights.length === 0) return yPosition;

    this.addSectionHeader(pdf, 'Insights & Decisions', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');

    insights.forEach((insight: string, index: number) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = margin;
      }

      const insightText = `• ${insight}`;
      const lines = pdf.splitTextToSize(insightText, pageWidth - (margin * 2) - 5);
      
      lines.forEach((line: string) => {
        pdf.text(line, margin + 5, yPosition);
        yPosition += 4;
      });
      
      yPosition += 2;
    });

    return yPosition + 5;
  }

  private static addSentimentAnalysis(pdf: jsPDF, summary: any, pageWidth: number, margin: number, yPosition: number): number {
    if (!summary.emotion_analysis) return yPosition;

    this.addSectionHeader(pdf, 'Sentiment Analysis', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    
    const sentiment = summary.emotion_analysis.overall_sentiment.toUpperCase();
    const confidence = Math.round((summary.emotion_analysis.overall_confidence || 0) * 100);
    
    pdf.text(`Overall: ${sentiment} (${confidence}% confidence)`, margin, yPosition);
    
    return yPosition + 12;
  }

  private static addMeetingHealth(pdf: jsPDF, summary: any, pageWidth: number, margin: number, yPosition: number): number {
    if (!summary.meeting_health_score) return yPosition;

    this.addSectionHeader(pdf, 'Meeting Health', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    
    const overallScore = summary.meeting_health_score.overall_score;
    pdf.text(`Overall Score: ${overallScore}/100`, margin, yPosition);
    yPosition += 6;

    pdf.setFont('helvetica', 'normal');
    const scores = [
      { label: 'Engagement', value: summary.meeting_health_score.engagement_score },
      { label: 'Productivity', value: summary.meeting_health_score.productivity_score },
      { label: 'Collaboration', value: summary.meeting_health_score.collaboration_score },
      { label: 'Clarity', value: summary.meeting_health_score.clarity_score }
    ];

    let xPos = margin;
    scores.forEach((score, index) => {
      if (index === 2) {
        xPos = margin;
        yPosition += 5;
      }
      pdf.text(`${score.label}: ${score.value}`, xPos, yPosition);
      xPos += 50;
    });

    return yPosition + 15;
  }

  private static addTranscriptNote(pdf: jsPDF, meeting: any, pageWidth: number, margin: number, yPosition: number) {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = margin;
    }

    this.addSectionHeader(pdf, 'Full Transcripts', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    
    const transcriptCount = meeting.transcripts?.length || 0;
    const noteText = `This meeting contained ${transcriptCount} transcript entries. Full transcripts are available in the meeting system. For access, please visit the meeting details page.`;
    
    const lines = pdf.splitTextToSize(noteText, pageWidth - (margin * 2));
    lines.forEach((line: string) => {
      pdf.text(line, margin, yPosition);
      yPosition += 3.5;
    });
  }

  private static addSectionHeader(pdf: jsPDF, title: string, margin: number, yPosition: number) {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, yPosition);
    pdf.line(margin, yPosition + 1, margin + 50, yPosition + 1);
  }

  // Estimate PDF size in KB
  static estimatePDFSize(pdfDataUri: string): number {
    try {
      const base64 = pdfDataUri.split(',')[1];
      const binaryString = atob(base64);
      return Math.round(binaryString.length / 1024);
    } catch {
      return 0;
    }
  }
}