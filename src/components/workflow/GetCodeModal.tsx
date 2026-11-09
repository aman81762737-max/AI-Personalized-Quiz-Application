import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Code2, FileCode, Braces } from 'lucide-react';

interface GetCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: string;
  systemInstruction: string;
  temperature: number;
  topP: number;
  maxOutputTokens: number;
  thinkingLevel?: string;
  enableGoogleSearch: boolean;
  responseMimeType: string;
  contents: Array<{ role: string; parts: Array<{ text: string }> } | string>;
}

export const GetCodeModal: React.FC<GetCodeModalProps> = ({
  isOpen,
  onClose,
  model,
  systemInstruction,
  temperature,
  topP,
  maxOutputTokens,
  thinkingLevel,
  enableGoogleSearch,
  responseMimeType,
  contents,
}) => {
  const [selectedLang, setSelectedLang] = useState<'typescript' | 'python' | 'curl' | 'json'>('typescript');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Extract last user prompt
  const lastUserText =
    contents.length > 0
      ? typeof contents[contents.length - 1] === 'string'
        ? (contents[contents.length - 1] as string)
        : (contents[contents.length - 1] as any)?.parts?.[0]?.text || 'Hello'
      : 'Hello Gemini!';

  // 1. TypeScript code snippet using @google/genai
  const tsCode = `import { GoogleGenAI } from '@google/genai';

// Initialize the Google GenAI SDK with server-side API key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
  const response = await ai.models.generateContent({
    model: '${model}',
    contents: ${JSON.stringify(
      contents.map((c) =>
        typeof c === 'string'
          ? { role: 'user', parts: [{ text: c }] }
          : { role: c.role, parts: c.parts }
      ),
      null,
      4
    )},
    config: {${systemInstruction ? `\n      systemInstruction: ${JSON.stringify(systemInstruction)},` : ''}
      temperature: ${temperature},
      topP: ${topP},
      maxOutputTokens: ${maxOutputTokens},${enableGoogleSearch ? '\n      tools: [{ googleSearch: {} }],' : ''}${
    thinkingLevel && thinkingLevel !== 'OFF' ? `\n      thinkingConfig: { thinkingLevel: '${thinkingLevel}' },` : ''
  }${responseMimeType === 'application/json' ? `\n      responseMimeType: 'application/json',` : ''}
    },
  });

  console.log(response.text);
}

main().catch(console.error);`;

  // 2. Python code snippet using google-genai
  const pyCode = `from google import genai
from google.genai import types
import os

# Initialize client using environment variable GEMINI_API_KEY
client = genai.Client()

config = types.GenerateContentConfig(${systemInstruction ? `\n    system_instruction=${JSON.stringify(systemInstruction)},` : ''}
    temperature=${temperature},
    top_p=${topP},
    max_output_tokens=${maxOutputTokens},${enableGoogleSearch ? '\n    tools=[types.Tool(google_search=types.GoogleSearch())],' : ''}${
    responseMimeType === 'application/json' ? `\n    response_mime_type="application/json",` : ''
  }
)

response = client.models.generate_content(
    model="${model}",
    contents="${lastUserText.replace(/"/g, '\\"')}",
    config=config,
)

print(response.text)`;

  // 3. cURL Command
  const curlCode = `curl "https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=\${GEMINI_API_KEY}" \\
  -H 'Content-Type: application/json' \\
  -X POST \\
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [{ "text": ${JSON.stringify(lastUserText)} }]
      }
    ],
    "generationConfig": {
      "temperature": ${temperature},
      "topP": ${topP},
      "maxOutputTokens": ${maxOutputTokens}
    }${systemInstruction ? `,\n    "systemInstruction": { "parts": [{ "text": ${JSON.stringify(systemInstruction)} }] }` : ''}
  }'`;

  // 4. REST JSON Payload
  const jsonPayload = JSON.stringify(
    {
      model,
      contents: contents.map((c) =>
        typeof c === 'string'
          ? { role: 'user', parts: [{ text: c }] }
          : { role: c.role, parts: c.parts }
      ),
      config: {
        systemInstruction: systemInstruction || undefined,
        temperature,
        topP,
        maxOutputTokens,
        thinkingLevel: thinkingLevel !== 'OFF' ? thinkingLevel : undefined,
        googleSearch: enableGoogleSearch,
        responseMimeType,
      },
    },
    null,
    2
  );

  const getCodeContent = () => {
    switch (selectedLang) {
      case 'typescript':
        return tsCode;
      case 'python':
        return pyCode;
      case 'curl':
        return curlCode;
      case 'json':
        return jsonPayload;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0B0F19] text-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono text-white">Google AI Studio · Get Code</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Production-ready code calibrated to your exact model settings
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Language Tabs */}
        <div className="px-4 pt-3 flex items-center justify-between border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'typescript', label: 'TypeScript (@google/genai)', icon: FileCode },
              { id: 'python', label: 'Python (google-genai)', icon: Code2 },
              { id: 'curl', label: 'cURL', icon: Terminal },
              { id: 'json', label: 'REST Payload', icon: Braces },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedLang === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedLang(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-medium border-b-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#00F0FF] text-[#00F0FF] bg-white/[0.04]'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content View */}
        <div className="flex-1 p-4 overflow-y-auto bg-black/60 font-mono text-xs text-slate-300 leading-relaxed select-text">
          <pre className="whitespace-pre overflow-x-auto selection:bg-[#00F0FF]/30 selection:text-white">
            {getCodeContent()}
          </pre>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Model: {model}</span>
            <span>·</span>
            <span>Temp: {temperature}</span>
            <span>·</span>
            <span>Top-P: {topP}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#00F0FF] hover:bg-[#38bdf8] text-black font-bold font-mono transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
