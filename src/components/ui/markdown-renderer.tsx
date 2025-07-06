import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className={cn(
        'chat-markdown',
        className
      )}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        // Custom code block styling
        code({ node, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match;
          return !isInline ? (
            <pre className="bg-opensam-gray-100 border border-opensam-gray-200 rounded-lg p-3 overflow-x-auto">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          ) : (
            <code className="bg-opensam-gray-100 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          );
        },
        // Custom table styling
        table({ children }) {
          return (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-opensam-gray-200">
                {children}
              </table>
            </div>
          );
        },
        // Custom blockquote styling
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-opensam-black bg-opensam-gray-50 pl-3 py-1 italic">
              {children}
            </blockquote>
          );
        },
        // Custom list styling
        ul({ children }) {
          return (
            <ul className="list-disc list-inside space-y-1">
              {children}
            </ul>
          );
        },
        ol({ children }) {
          return (
            <ol className="list-decimal list-inside space-y-1">
              {children}
            </ol>
          );
        },
        // Custom heading styling
        h1({ children }) {
          return <h1 className="text-lg font-semibold text-opensam-black mb-2">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-base font-semibold text-opensam-black mb-2">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-sm font-semibold text-opensam-black mb-2">{children}</h3>;
        },
        h4({ children }) {
          return <h4 className="text-sm font-semibold text-opensam-black mb-2">{children}</h4>;
        },
        // Custom link styling
        a({ href, children }) {
          return (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-opensam-black underline hover:text-opensam-gray-600 transition-colors"
            >
              {children}
            </a>
          );
        },
        // Custom paragraph styling
        p({ children }) {
          return <p className="text-opensam-black leading-relaxed mb-2 last:mb-0">{children}</p>;
        },
        // Custom strong styling
        strong({ children }) {
          return <strong className="font-semibold text-opensam-black">{children}</strong>;
        },
        // Custom emphasis styling
        em({ children }) {
          return <em className="italic text-opensam-black">{children}</em>;
        },
        // Custom horizontal rule styling
        hr() {
          return <hr className="border-opensam-gray-200 my-3" />;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
} 