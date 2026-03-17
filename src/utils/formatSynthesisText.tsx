import React from 'react';

export function formatSynthesisText(text: string): React.ReactNode[] {
  // We need to parse markers:
  // ⊗ -> Contradiction/negation (Red text, strikethrough background)
  // ∅ -> Empty/null concept (Gray text, italic)
  // ~text~ -> Uncertain/speculative text (Yellow background, italic)
  // [INFERRED] -> AI-inferred content (Blue badge, small caps)
  // [SPECULATIVE] -> Speculative content (Purple badge, small caps)

  const nodes: React.ReactNode[] = [];
  let currentString = '';
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (char === '⊗') {
      if (currentString) {
        nodes.push(<span key={`text-${i}`}>{currentString}</span>);
        currentString = '';
      }
      nodes.push(
        <span key={`marker-${i}`} className="text-[#8a9099] line-through bg-[rgba(255,255,255,0.03)] px-0.5">
          ⊗
        </span>
      );
      i++;
    } else if (char === '∅') {
      if (currentString) {
        nodes.push(<span key={`text-${i}`}>{currentString}</span>);
        currentString = '';
      }
      nodes.push(
        <span key={`marker-${i}`} className="text-[#4a5158] italic">
          ∅
        </span>
      );
      i++;
    } else if (char === '~') {
      // Find the closing ~
      const nextTilde = text.indexOf('~', i + 1);
      if (nextTilde !== -1) {
        if (currentString) {
          nodes.push(<span key={`text-${i}`}>{currentString}</span>);
          currentString = '';
        }
        const innerText = text.substring(i + 1, nextTilde);
        nodes.push(
          <span key={`marker-${i}`} className="bg-[rgba(255,255,255,0.03)] text-[#b0b8c1] italic px-1 border border-[rgba(255,255,255,0.06)]">
            {formatSynthesisText(innerText)}
          </span>
        );
        i = nextTilde + 1;
      } else {
        currentString += char;
        i++;
      }
    } else if (text.startsWith('[INFERRED]', i)) {
      if (currentString) {
        nodes.push(<span key={`text-${i}`}>{currentString}</span>);
        currentString = '';
      }
      nodes.push(
        <span key={`marker-${i}`} className="inline-block px-2 py-0.5 rounded bg-[rgba(255,255,255,0.03)] text-[#8a9099] border border-[rgba(255,255,255,0.06)] text-[11px] font-semibold uppercase tracking-wider">
          [INFERRED]
        </span>
      );
      i += 10;
    } else if (text.startsWith('[SPECULATIVE]', i)) {
      if (currentString) {
        nodes.push(<span key={`text-${i}`}>{currentString}</span>);
        currentString = '';
      }
      nodes.push(
        <span key={`marker-${i}`} className="inline-block px-2 py-0.5 rounded bg-[rgba(255,255,255,0.03)] text-[#b0b8c1] border border-[rgba(255,255,255,0.06)] text-[11px] font-semibold uppercase tracking-wider">
          [SPECULATIVE]
        </span>
      );
      i += 13;
    } else {
      currentString += char;
      i++;
    }
  }

  if (currentString) {
    nodes.push(<span key={`text-end`}>{currentString}</span>);
  }

  return nodes;
}
