import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split content into blocks: code blocks vs text blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className={`space-y-3 leading-relaxed ${className}`}>
      {parts.map((part, pIdx) => {
        if (!part) return null;

        // Code block / ASCII block
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          let lang = '';
          let codeBody = part.slice(3, -3);

          if (lines.length > 0 && /^[a-zA-Z0-9_-]+$/.test(lines[0].trim())) {
            lang = lines[0].trim();
            codeBody = lines.slice(1).join('\n');
          }

          return (
            <div key={pIdx} className="my-3 rounded-2xl overflow-hidden border border-white/15 bg-[#070A10] shadow-md">
              {lang && (
                <div className="px-4 py-1.5 bg-white/5 border-b border-white/10 text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>{lang}</span>
                  <span className="text-[9px] text-[#00F0FF]">ASCII / Code Artifact</span>
                </div>
              )}
              <pre className="p-4 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed whitespace-pre selection:bg-emerald-500/30">
                <code>{codeBody}</code>
              </pre>
            </div>
          );
        }

        // Standard text lines
        const lines = part.split('\n');
        const elements: React.ReactNode[] = [];
        let inTable = false;
        let tableRows: string[][] = [];

        const flushTable = (key: string) => {
          if (tableRows.length === 0) return;
          const [header, ...bodyRows] = tableRows;
          const cleanBody = bodyRows.filter((r) => !r.every((c) => /^:?-+:?$/.test(c.trim())));

          elements.push(
            <div key={key} className="my-3 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
              <table className="min-w-full divide-y divide-white/10 text-xs font-mono">
                {header && (
                  <thead className="bg-white/5 text-slate-200">
                    <tr>
                      {header.map((col, cIdx) => (
                        <th key={cIdx} className="px-3.5 py-2 text-left font-bold tracking-wider">
                          {renderInline(col.trim())}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {cleanBody.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white/[0.03]">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2 text-left">
                          {renderInline(cell.trim())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          tableRows = [];
          inTable = false;
        };

        lines.forEach((line, lineIdx) => {
          const trimmed = line.trim();

          // Table detection
          if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            inTable = true;
            const cells = trimmed
              .slice(1, -1)
              .split('|')
              .map((c) => c.trim());
            tableRows.push(cells);
            return;
          } else if (inTable) {
            flushTable(`tbl-${pIdx}-${lineIdx}`);
          }

          if (!trimmed) {
            elements.push(<div key={`empty-${pIdx}-${lineIdx}`} className="h-2" />);
            return;
          }

          // Headers
          if (trimmed.startsWith('### ')) {
            elements.push(
              <h3 key={`h3-${pIdx}-${lineIdx}`} className="text-sm font-bold text-white pt-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
                <span>{renderInline(trimmed.slice(4))}</span>
              </h3>
            );
            return;
          }
          if (trimmed.startsWith('## ')) {
            elements.push(
              <h2 key={`h2-${pIdx}-${lineIdx}`} className="text-base font-extrabold text-white pt-2.5 border-b border-white/10 pb-1">
                {renderInline(trimmed.slice(3))}
              </h2>
            );
            return;
          }
          if (trimmed.startsWith('# ')) {
            elements.push(
              <h1 key={`h1-${pIdx}-${lineIdx}`} className="text-lg font-black text-white pt-3 border-b border-white/15 pb-1.5">
                {renderInline(trimmed.slice(2))}
              </h1>
            );
            return;
          }

          // Bullet points
          if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const bulletContent = trimmed.slice(2);
            elements.push(
              <div key={`bullet-${pIdx}-${lineIdx}`} className="flex items-start gap-2.5 text-xs text-slate-300 ml-1">
                <span className="text-[#00F0FF] mt-1 shrink-0 text-sm leading-none">•</span>
                <span className="flex-1">{renderInline(bulletContent)}</span>
              </div>
            );
            return;
          }

          // Numbered lists
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
          if (numMatch) {
            elements.push(
              <div key={`num-${pIdx}-${lineIdx}`} className="flex items-start gap-2.5 text-xs text-slate-300 ml-1">
                <span className="font-mono font-bold text-[#00F0FF] shrink-0 text-xs">{numMatch[1]}.</span>
                <span className="flex-1">{renderInline(numMatch[2])}</span>
              </div>
            );
            return;
          }

          // Blockquote
          if (trimmed.startsWith('> ')) {
            elements.push(
              <div key={`quote-${pIdx}-${lineIdx}`} className="pl-3.5 py-1 border-l-2 border-[#00F0FF] bg-white/[0.02] text-xs text-slate-300 italic rounded-r-lg my-1">
                {renderInline(trimmed.slice(2))}
              </div>
            );
            return;
          }

          // Standard paragraph
          elements.push(
            <p key={`p-${pIdx}-${lineIdx}`} className="text-xs text-slate-300 leading-relaxed">
              {renderInline(trimmed)}
            </p>
          );
        });

        if (inTable) {
          flushTable(`tbl-${pIdx}-end`);
        }

        return <div key={pIdx} className="space-y-1.5">{elements}</div>;
      })}
    </div>
  );
};

// Inline Parser: **bold**, *italic*, `code`, URLs
function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  // Split tokens by code first, then bold, then italic
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return tokens.map((token, idx) => {
    if (!token) return null;

    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-white/10 font-mono text-[11px] text-[#00F0FF] border border-white/10"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={idx} className="font-bold text-white font-sans">
          {token.slice(2, -2)}
        </strong>
      );
    }

    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      return (
        <em key={idx} className="italic text-slate-200">
          {token.slice(1, -1)}
        </em>
      );
    }

    return token;
  });
}
