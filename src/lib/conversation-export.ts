import { ChatSession, ChatMessage } from '@/types';

export interface ExportOptions {
  format: 'json' | 'markdown' | 'txt' | 'html';
  includeMetadata?: boolean;
  includeTimestamps?: boolean;
  includeRAGContext?: boolean;
  filename?: string;
}

export interface ExportResult {
  content: string;
  filename: string;
  mimeType: string;
  size: number;
}

/**
 * Conversation export utilities
 */
export class ConversationExporter {
  
  /**
   * Export a chat session in the specified format
   */
  static exportSession(
    session: ChatSession,
    options: ExportOptions
  ): ExportResult {
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFilename = `chat-${session.title || 'session'}-${timestamp}`;
    const filename = options.filename || defaultFilename;
    
    switch (options.format) {
      case 'json':
        return this.exportAsJSON(session, options, filename);
      case 'markdown':
        return this.exportAsMarkdown(session, options, filename);
      case 'txt':
        return this.exportAsText(session, options, filename);
      case 'html':
        return this.exportAsHTML(session, options, filename);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export as JSON with full metadata
   */
  private static exportAsJSON(
    session: ChatSession,
    options: ExportOptions,
    filename: string
  ): ExportResult {
    const exportData = {
      metadata: {
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messageCount: session.messages.length,
        exportDate: new Date().toISOString(),
        exportOptions: options
      },
      session: session
    };

    const content = JSON.stringify(exportData, null, 2);
    
    return {
      content,
      filename: `${filename}.json`,
      mimeType: 'application/json',
      size: new Blob([content]).size
    };
  }

  /**
   * Export as Markdown for easy reading
   */
  private static exportAsMarkdown(
    session: ChatSession,
    options: ExportOptions,
    filename: string
  ): ExportResult {
    let content = `# ${session.title || 'Chat Session'}\n\n`;
    
    if (options.includeMetadata) {
      content += `**Session Details:**\n`;
      content += `- Created: ${new Date(session.createdAt).toLocaleString()}\n`;
      content += `- Updated: ${new Date(session.updatedAt).toLocaleString()}\n`;
      content += `- Messages: ${session.messages.length}\n\n`;
      content += `---\n\n`;
    }

    session.messages.forEach((message, index) => {
      const timestamp = options.includeTimestamps 
        ? ` *(${new Date(message.timestamp).toLocaleTimeString()})*` 
        : '';
      
      const role = message.role === 'user' ? '👤 **User**' : '🤖 **AI Assistant**';
      
      content += `### ${role}${timestamp}\n\n`;
      content += `${message.content}\n\n`;
      
      // Include RAG context if available
      if (options.includeRAGContext && (message as any).ragContext) {
        const ragContext = (message as any).ragContext;
        content += `**Related Opportunities:**\n`;
        if (ragContext.opportunities && ragContext.opportunities.length > 0) {
          ragContext.opportunities.slice(0, 3).forEach((opp: any, oppIndex: number) => {
            content += `${oppIndex + 1}. **${opp.opportunity.title}** (${Math.round(opp.score)}% match)\n`;
            content += `   - NAICS: ${opp.opportunity.naicsCode || 'N/A'}\n`;
            content += `   - Synopsis: ${opp.opportunity.synopsis || 'No description'}\n\n`;
          });
        }
      }
      
      content += `---\n\n`;
    });

    return {
      content,
      filename: `${filename}.md`,
      mimeType: 'text/markdown',
      size: new Blob([content]).size
    };
  }

  /**
   * Export as plain text
   */
  private static exportAsText(
    session: ChatSession,
    options: ExportOptions,
    filename: string
  ): ExportResult {
    let content = `${session.title || 'Chat Session'}\n`;
    content += `${'='.repeat((session.title || 'Chat Session').length)}\n\n`;
    
    if (options.includeMetadata) {
      content += `Session Details:\n`;
      content += `Created: ${new Date(session.createdAt).toLocaleString()}\n`;
      content += `Updated: ${new Date(session.updatedAt).toLocaleString()}\n`;
      content += `Messages: ${session.messages.length}\n\n`;
      content += `${'-'.repeat(50)}\n\n`;
    }

    session.messages.forEach((message, index) => {
      const timestamp = options.includeTimestamps 
        ? ` (${new Date(message.timestamp).toLocaleTimeString()})` 
        : '';
      
      const role = message.role === 'user' ? 'USER' : 'AI ASSISTANT';
      
      content += `${role}${timestamp}:\n`;
      content += `${message.content}\n\n`;
      
      // Include RAG context if available
      if (options.includeRAGContext && (message as any).ragContext) {
        const ragContext = (message as any).ragContext;
        content += `Related Opportunities:\n`;
        if (ragContext.opportunities && ragContext.opportunities.length > 0) {
          ragContext.opportunities.slice(0, 3).forEach((opp: any, oppIndex: number) => {
            content += `${oppIndex + 1}. ${opp.opportunity.title} (${Math.round(opp.score)}% match)\n`;
            content += `   NAICS: ${opp.opportunity.naicsCode || 'N/A'}\n`;
            content += `   Synopsis: ${opp.opportunity.synopsis || 'No description'}\n\n`;
          });
        }
      }
      
      content += `${'-'.repeat(50)}\n\n`;
    });

    return {
      content,
      filename: `${filename}.txt`,
      mimeType: 'text/plain',
      size: new Blob([content]).size
    };
  }

  /**
   * Export as HTML for web viewing
   */
  private static exportAsHTML(
    session: ChatSession,
    options: ExportOptions,
    filename: string
  ): ExportResult {
    let content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${session.title || 'Chat Session'}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
        .message { margin-bottom: 30px; padding: 20px; border-radius: 8px; }
        .user { background-color: #dbeafe; border-left: 4px solid #3b82f6; }
        .assistant { background-color: #f3f4f6; border-left: 4px solid #6b7280; }
        .role { font-weight: bold; margin-bottom: 10px; }
        .timestamp { color: #6b7280; font-size: 0.875rem; }
        .content { white-space: pre-wrap; }
        .rag-context { background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin-top: 15px; }
        .opportunity { background-color: white; border: 1px solid #e5e7eb; border-radius: 4px; padding: 10px; margin: 5px 0; }
        .opportunity-title { font-weight: bold; color: #1f2937; }
        .opportunity-meta { color: #6b7280; font-size: 0.875rem; }
        .metadata { background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${session.title || 'Chat Session'}</h1>`;

    if (options.includeMetadata) {
      content += `
        <div class="metadata">
            <p><strong>Created:</strong> ${new Date(session.createdAt).toLocaleString()}</p>
            <p><strong>Updated:</strong> ${new Date(session.updatedAt).toLocaleString()}</p>
            <p><strong>Messages:</strong> ${session.messages.length}</p>
        </div>`;
    }

    content += `
    </div>`;

    session.messages.forEach((message, index) => {
      const timestamp = options.includeTimestamps 
        ? `<div class="timestamp">${new Date(message.timestamp).toLocaleString()}</div>` 
        : '';
      
      const role = message.role === 'user' ? '👤 User' : '🤖 AI Assistant';
      const messageClass = message.role === 'user' ? 'user' : 'assistant';
      
      content += `
    <div class="message ${messageClass}">
        <div class="role">${role}</div>
        ${timestamp}
        <div class="content">${this.escapeHTML(message.content)}</div>`;
      
      // Include RAG context if available
      if (options.includeRAGContext && (message as any).ragContext) {
        const ragContext = (message as any).ragContext;
        content += `
        <div class="rag-context">
            <h4>Related Opportunities:</h4>`;
        
        if (ragContext.opportunities && ragContext.opportunities.length > 0) {
          ragContext.opportunities.slice(0, 3).forEach((opp: any, oppIndex: number) => {
            content += `
            <div class="opportunity">
                <div class="opportunity-title">${oppIndex + 1}. ${opp.opportunity.title} (${Math.round(opp.score)}% match)</div>
                <div class="opportunity-meta">NAICS: ${opp.opportunity.naicsCode || 'N/A'}</div>
                <div class="opportunity-meta">${opp.opportunity.synopsis || 'No description'}</div>
            </div>`;
          });
        }
        
        content += `
        </div>`;
      }
      
      content += `
    </div>`;
    });

    content += `
</body>
</html>`;

    return {
      content,
      filename: `${filename}.html`,
      mimeType: 'text/html',
      size: new Blob([content]).size
    };
  }

  /**
   * Escape HTML special characters
   */
  private static escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Download the exported content
   */
  static downloadExport(result: ExportResult): void {
    const blob = new Blob([result.content], { type: result.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Export multiple sessions as a batch
   */
  static exportMultipleSessions(
    sessions: ChatSession[],
    options: ExportOptions
  ): ExportResult[] {
    return sessions.map(session => this.exportSession(session, options));
  }

  /**
   * Create a summary export of all sessions
   */
  static exportSessionsSummary(
    sessions: ChatSession[],
    options: ExportOptions
  ): ExportResult {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = options.filename || `chat-summary-${timestamp}`;
    
    let content = `# Chat Sessions Summary\n\n`;
    content += `**Export Date:** ${new Date().toLocaleString()}\n`;
    content += `**Total Sessions:** ${sessions.length}\n\n`;
    
    sessions.forEach((session, index) => {
      content += `## ${index + 1}. ${session.title || 'Untitled Session'}\n\n`;
      content += `- **Created:** ${new Date(session.createdAt).toLocaleString()}\n`;
      content += `- **Updated:** ${new Date(session.updatedAt).toLocaleString()}\n`;
      content += `- **Messages:** ${session.messages.length}\n\n`;
      
      if (session.messages.length > 0) {
        content += `**First Message:** ${session.messages[0].content.substring(0, 100)}${session.messages[0].content.length > 100 ? '...' : ''}\n\n`;
      }
      
      content += `---\n\n`;
    });

    return {
      content,
      filename: `${filename}.md`,
      mimeType: 'text/markdown',
      size: new Blob([content]).size
    };
  }
} 