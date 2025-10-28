'use client'

export class ExportService {
  static async exportToPDF(
    element: HTMLElement, 
    filename: string = 'meeting-documentation'
  ): Promise<boolean> {
    try {
      // Dynamically import html2pdf.js only on the client-side
      const html2pdf = (await import('html2pdf.js')).default;

      const options = {
        margin: 15,
        filename: `${filename}-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { 
          type: 'jpeg' as const, 
          quality: 0.98 
        },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          width: 800
        },
        jsPDF: { 
          unit: 'mm' as const, 
          format: 'a4' as const, 
          orientation: 'portrait' as const 
        }
      };

      await html2pdf().set(options).from(element).save();
      return true;
    } catch (error) {
      console.error('PDF export failed:', error);
      return false;
    }
  }

  static generateDocumentHTML(meeting: any, structuredSummary: any): string {
    // This function can remain as it is, as it only generates an HTML string
    const participants = Array.from(new Set(meeting.transcripts?.map((t: any) => t.name) || []));
    const meetingDate = new Date(meeting.time || new Date());

    return `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 800px; margin: auto;">
        <h1 style="color: #4A90E2; border-bottom: 2px solid #4A90E2; padding-bottom: 10px;">${meeting.name}</h1>
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <span>Date: ${meetingDate.toLocaleDateString()}</span>
          <span>Participants: ${participants.join(', ')}</span>
        </div>

        <h2 style="color: #4A90E2;">Summary</h2>
        <p>${structuredSummary.summary_text || 'Not available'}</p>

        <h2 style="color: #4A90E2;">Key Points</h2>
        <ul>
          ${(structuredSummary.key_points || []).map((point: string) => `<li>${point}</li>`).join('')}
        </ul>

        <h2 style="color: #4A90E2;">Action Items</h2>
        <ul>
          ${(structuredSummary.action_items || []).map((item: string) => `<li>${item}</li>`).join('')}
        </ul>

        <h2 style="color: #4A90E2;">Sentiment Analysis</h2>
        <p>Overall Sentiment: ${structuredSummary.emotion_analysis?.overall_sentiment || 'N/A'}</p>

      </div>
    `;
  }
}
