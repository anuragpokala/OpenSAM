import { NextRequest, NextResponse } from 'next/server';
import { ConversationExporter, ExportOptions } from '@/lib/conversation-export';
import { ChatSession } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session, options }: { session: ChatSession; options: ExportOptions } = body;

    if (!session) {
      return NextResponse.json({ error: 'Session data is required' }, { status: 400 });
    }

    // Validate export options
    const validFormats = ['json', 'markdown', 'txt', 'html'];
    if (!validFormats.includes(options.format)) {
      return NextResponse.json({ error: 'Invalid export format' }, { status: 400 });
    }

    // Export the session
    const result = ConversationExporter.exportSession(session, options);

    return NextResponse.json({
      success: true,
      data: {
        content: result.content,
        filename: result.filename,
        mimeType: result.mimeType,
        size: result.size
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export conversation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') as ExportOptions['format'] || 'markdown';
    
    // Return available export formats and their descriptions
    const exportFormats = [
      {
        format: 'json',
        name: 'JSON',
        description: 'Complete session data with metadata',
        mimeType: 'application/json',
        bestFor: 'Data analysis, backup'
      },
      {
        format: 'markdown',
        name: 'Markdown',
        description: 'Formatted text for easy reading',
        mimeType: 'text/markdown',
        bestFor: 'Documentation, sharing'
      },
      {
        format: 'txt',
        name: 'Plain Text',
        description: 'Simple text format',
        mimeType: 'text/plain',
        bestFor: 'Simple sharing, notes'
      },
      {
        format: 'html',
        name: 'HTML',
        description: 'Web-ready formatted document',
        mimeType: 'text/html',
        bestFor: 'Web viewing, printing'
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        formats: exportFormats,
        defaultFormat: format
      }
    });
  } catch (error) {
    console.error('Export formats error:', error);
    return NextResponse.json(
      { error: 'Failed to get export formats' },
      { status: 500 }
    );
  }
} 