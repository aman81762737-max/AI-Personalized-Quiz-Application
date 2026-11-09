import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  Sliders,
  Globe,
  Braces,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  Zap,
  Terminal,
  ExternalLink,
  Plus,
  Trash2,
  Clock,
  Gauge,
  HelpCircle,
  Copy,
  BookOpen,
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { useToast } from '../common/Toast';

interface Turn {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface StudioPlaygroundProps {
  onOpenGetCode: (config: any) => void;
}

export const StudioPlayground: React.FC<StudioPlaygroundProps> = ({ onOpenGetCode }) => {
  const { showToast } = useToast();

  // Model & Core Hyperparameters
  const [model, setModel] = useState<'gemini-3.8-flash' | 'gemini-flash-latest'>('gemini-3.8-flash');
  const [systemInstruction, setSystemInstruction] = useState(
    `You are a world-class AI Mentor and Systems Engineer.
When explaining mathematics, algorithms, or computer science concepts:
1. NEVER output raw, unreadable code or cryptic symbols.
2. Format explanations like a master teacher writing cleanly on an interactive whiteboard.
3. Break concepts down into intuitive, numbered steps: "Step 1: The Intuition", "Step 2: Core Transformation", "Step 3: Final Solution".
4. Focus on deep understanding, clear mental models, and practical application.`
  );
  const [showSystemPrompt, setShowSystemPrompt] = useState(true);

  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.95);
  const [maxOutputTokens, setMaxOutputTokens] = useState(2048);
  const [thinkingLevel, setThinkingLevel] = useState<'OFF' | 'LOW' | 'MEDIUM' | 'HIGH'>('OFF');
  const [enableGoogleSearch, setEnableGoogleSearch] = useState(false);
  const [responseMimeType, setResponseMimeType] = useState<'text/plain' | 'application/json'>('text/plain');
  const [jsonSchemaText, setJsonSchemaText] = useState(
    JSON.stringify(
      {
        type: 'OBJECT',
        properties: {
          concept: { type: 'STRING' },
          whiteboardSteps: {
            type: 'ARRAY',
            items: { type: 'STRING' },
          },
          summary: { type: 'STRING' },
        },
        required: ['concept', 'whiteboardSteps', 'summary'],
      },
      null,
      2
    )
  );

  // Multi-Turn Prompt Canvas
  const [turns, setTurns] = useState<Turn[]>([
    {
      id: 'turn-1',
      role: 'user',
      text: 'Explain the limit of sin(5x) / 2x as x approaches 0 in simple whiteboard steps that anyone can understand without confusing notation.',
    },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [telemetry, setTelemetry] = useState<{
    promptTokens: number;
    candidateTokens: number;
    totalTokens: number;
    latencyMs: number;
    tokensPerSecond: number;
    finishReason?: string;
  } | null>(null);

  const [groundingData, setGroundingData] = useState<{
    webSearchQueries?: string[];
    searchChunks?: any[];
  } | null>(null);

  const turnsEndRef = useRef<HTMLDivElement>(null);

  // System Prompt Presets
  const systemPresets = [
    {
      name: 'Whiteboard Teacher',
      instruction:
        'You are an inspiring academic teacher. Explain math and science step-by-step like a clean whiteboard demonstration. Use friendly language, no raw code-like syntax.',
    },
    {
      name: 'Full-Stack Architect',
      instruction:
        'You are a senior TypeScript and React architect. Provide clean, production-grade solutions, architectural rationale, and verified invariants.',
    },
    {
      name: 'Exam Psychometrician',
      instruction:
        'You design high-validity diagnostic assessments, Bloom taxonomy calibrated questions, and targeted misconception remedies.',
    },
    {
      name: 'Strict JSON Agent',
      instruction:
        'You are a high-throughput JSON data extraction agent. Strictly conform all output to the declared schema without any Markdown backticks.',
    },
  ];

  // Quick Starter Prompts
  const starterPrompts = [
    'Explain the limit of sin(5x)/2x as x -> 0 in simple whiteboard steps',
    'Design an interactive Pomodoro timer with 25-minute intervals and streak tracking',
    'Explain Dijkstra algorithm with a subway map analogy and step-by-step intuition',
    'Synthesize a 5-step curriculum to master Linear Algebra for Machine Learning',
  ];

  // Add Turn
  const handleAddTurn = (role: 'user' | 'model') => {
    setTurns((prev) => [
      ...prev,
      {
        id: `turn-${Date.now()}`,
        role,
        text: '',
      },
    ]);
  };

  // Update Turn Text
  const handleUpdateTurn = (id: string, text: string) => {
    setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
  };

  // Remove Turn
  const handleRemoveTurn = (id: string) => {
    if (turns.length <= 1) return;
    setTurns((prev) => prev.filter((t) => t.id !== id));
  };

  // Run Prompt Execution
  const handleRunPrompt = async () => {
    const validTurns = turns.filter((t) => t.text.trim().length > 0);
    if (validTurns.length === 0 || isRunning) return;

    setIsRunning(true);
    setTelemetry(null);
    setGroundingData(null);

    // If last turn is user, append a placeholder model turn for live answer
    let targetTurns = [...turns];
    if (targetTurns[targetTurns.length - 1].role === 'user') {
      const modelTurnId = `model-${Date.now()}`;
      targetTurns.push({ id: modelTurnId, role: 'model', text: 'Thinking...' });
      setTurns(targetTurns);
    }

    try {
      let parsedSchema = undefined;
      if (responseMimeType === 'application/json' && jsonSchemaText.trim()) {
        try {
          parsedSchema = JSON.parse(jsonSchemaText);
        } catch {
          showToast('JSON schema has invalid syntax, proceeding with standard JSON.', 'warning');
        }
      }

      const response = await aiService.executeStudioPrompt({
        model,
        systemInstruction,
        contents: validTurns.map((t) => ({
          role: t.role,
          parts: [{ text: t.text }],
        })),
        temperature,
        topP,
        maxOutputTokens,
        thinkingLevel: thinkingLevel !== 'OFF' ? thinkingLevel : undefined,
        enableGoogleSearch,
        responseMimeType,
        responseSchema: parsedSchema,
      });

      // Update the last model turn with real text
      setTurns((prev) => {
        const next = [...prev];
        const lastIdx = next.length - 1;
        if (lastIdx >= 0 && next[lastIdx].role === 'model') {
          next[lastIdx] = { ...next[lastIdx], text: response.text };
        } else {
          next.push({ id: `model-${Date.now()}`, role: 'model', text: response.text });
        }
        return next;
      });

      setTelemetry(response.telemetry);
      if (response.groundingMetadata) {
        setGroundingData(response.groundingMetadata);
      }

      showToast(`Prompt executed in ${response.telemetry.latencyMs}ms (${response.telemetry.tokensPerSecond} t/s)`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Execution error in AI Studio.', 'error');
      setTurns((prev) => {
        const next = [...prev];
        const lastIdx = next.length - 1;
        if (lastIdx >= 0 && next[lastIdx].role === 'model') {
          next[lastIdx] = { ...next[lastIdx], text: `Error: ${err.message || 'Execution failed.'}` };
        }
        return next;
      });
    } finally {
      setIsRunning(false);
      turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Telemetry Bar (Token Counts & Latency) */}
      <div className="p-3 rounded-2xl border border-white/10 bg-[#0B0F19]/90 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-purple-400 font-bold">
            <Cpu className="w-4 h-4" />
            <span>Google AI Studio Core</span>
          </div>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-slate-500">Model:</span>
            <span className="text-[#00F0FF] font-bold">{model}</span>
          </div>
        </div>

        {/* Real-time Telemetry metrics */}
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          {telemetry ? (
            <>
              <div className="flex items-center gap-1 text-emerald-400">
                <Gauge className="w-3.5 h-3.5" />
                <span>{telemetry.latencyMs} ms</span>
              </div>
              <div>
                <span className="text-slate-500">Speed:</span>{' '}
                <span className="text-white font-bold">{telemetry.tokensPerSecond} t/s</span>
              </div>
              <div>
                <span className="text-slate-500">Tokens:</span>{' '}
                <span className="text-purple-300">{telemetry.promptTokens} in</span> +{' '}
                <span className="text-cyan-300">{telemetry.candidateTokens} out</span> ={' '}
                <span className="text-white font-bold">{telemetry.totalTokens} total</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>Ready for prompt execution</span>
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              onOpenGetCode({
                model,
                systemInstruction,
                temperature,
                topP,
                maxOutputTokens,
                thinkingLevel,
                enableGoogleSearch,
                responseMimeType,
                contents: turns,
              })
            }
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-all cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Get Code</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ========================================================= */}
        {/* CENTER / LEFT: Prompt Workbench & Multi-turn Chat (8 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 space-y-4">
          {/* System Instructions Section */}
          <div className="rounded-3xl border border-white/10 bg-[#0B0F19]/90 overflow-hidden shadow-xl">
            <button
              type="button"
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
              className="w-full p-3.5 flex items-center justify-between text-left bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer border-b border-white/10"
            >
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <BookOpen className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold font-mono text-white">System Instructions</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                  Guides tone, whiteboard formatting, and model persona
                </span>
              </div>
              {showSystemPrompt ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showSystemPrompt && (
              <div className="p-4 space-y-3">
                {/* System Prompt Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400 mr-1">Presets:</span>
                  {systemPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSystemInstruction(preset.instruction)}
                      className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>

                <textarea
                  value={systemInstruction}
                  onChange={(e) => setSystemInstruction(e.target.value)}
                  rows={4}
                  placeholder="Declare system instruction (e.g. You are an expert tutor...)"
                  className="w-full p-3 rounded-2xl bg-black/60 border border-white/10 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00F0FF] transition-all resize-y"
                />
              </div>
            )}
          </div>

          {/* Quick Starter Prompts Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400">Try prompt:</span>
            {starterPrompts.map((starter, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={() => {
                  setTurns([
                    {
                      id: `starter-${Date.now()}`,
                      role: 'user',
                      text: starter,
                    },
                  ]);
                }}
                className="text-[10px] font-mono px-2.5 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 transition-all cursor-pointer truncate max-w-[280px]"
                title={starter}
              >
                ✦ {starter}
              </button>
            ))}
          </div>

          {/* Turns Canvas */}
          <div className="space-y-3">
            {turns.map((turn, index) => {
              const isUser = turn.role === 'user';
              return (
                <div
                  key={turn.id}
                  className={`rounded-3xl border overflow-hidden transition-all shadow-lg ${
                    isUser
                      ? 'border-[#00F0FF]/30 bg-cyan-950/15'
                      : 'border-white/10 bg-[#0B0F19]/95'
                  }`}
                >
                  {/* Turn Header */}
                  <div className="px-4 py-2 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                          isUser
                            ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30'
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}
                      >
                        {isUser ? 'User Turn' : 'Model Output'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">#{index + 1}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(turn.text);
                          showToast('Turn content copied!', 'info');
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                        title="Copy text"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {turns.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTurn(turn.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                          title="Remove turn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Turn Textarea / Display */}
                  <div className="p-3.5">
                    {isUser ? (
                      <textarea
                        value={turn.text}
                        onChange={(e) => handleUpdateTurn(turn.id, e.target.value)}
                        onKeyDown={(e) => {
                          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                            e.preventDefault();
                            handleRunPrompt();
                          }
                        }}
                        rows={3}
                        placeholder="Type your prompt here... (Press Ctrl+Enter to execute)"
                        className="w-full bg-transparent border-0 text-xs font-sans text-white placeholder-slate-500 focus:outline-none resize-y leading-relaxed"
                      />
                    ) : (
                      <div className="whitespace-pre-line text-xs font-sans text-slate-200 leading-relaxed max-h-[500px] overflow-y-auto selection:bg-[#00F0FF]/30">
                        {turn.text}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={turnsEndRef} />
          </div>

          {/* Canvas Action Bar */}
          <div className="p-3 rounded-2xl border border-white/10 bg-[#0B0F19]/90 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddTurn('user')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>+ User Turn</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddTurn('model')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-purple-400" />
                <span>+ Model Turn</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTurns([
                    {
                      id: `turn-${Date.now()}`,
                      role: 'user',
                      text: '',
                    },
                  ]);
                  setTelemetry(null);
                }}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleRunPrompt}
              disabled={isRunning}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#00F0FF] to-purple-600 hover:from-[#38bdf8] hover:to-purple-500 text-black font-bold font-mono text-xs shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-black text-black" />
              <span>{isRunning ? 'Synthesizing...' : 'Run Prompt (Ctrl+Enter)'}</span>
            </button>
          </div>

          {/* Grounding Sources View if Available */}
          {groundingData && (
            <div className="p-4 rounded-3xl border border-blue-500/30 bg-blue-950/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400">
                <Globe className="w-4 h-4" />
                <span>Google Search Grounding Results</span>
              </div>
              {groundingData.webSearchQueries && groundingData.webSearchQueries.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400">Search Queries:</span>
                  {groundingData.webSearchQueries.map((q, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {q}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANEL: Google AI Studio Hyperparameters (4 Cols)    */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 rounded-3xl border border-white/10 bg-[#0B0F19]/95 p-5 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Sliders className="w-4 h-4" />
              </span>
              <h3 className="text-xs font-bold font-mono text-white">Model Parameters</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Google GenAI</span>
          </div>

          {/* Model Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-slate-300 font-bold block">
              Model
            </label>
            <div className="space-y-1.5">
              {[
                {
                  id: 'gemini-3.8-flash',
                  name: 'gemini-3.8-flash',
                  badge: 'Recommended',
                  desc: 'Multimodal reasoning, coding, whiteboard math & high speed',
                },
                {
                  id: 'gemini-flash-latest',
                  name: 'gemini-flash-latest',
                  badge: 'Ultra Fast',
                  desc: 'High throughput, low-latency multimodal reasoning',
                },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setModel(m.id as any)}
                  className={`w-full p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    model === m.id
                      ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-white'
                      : 'border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold">{m.name}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-tight font-sans">
                    {m.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Temperature</span>
              <span className="text-[#00F0FF] font-bold">{temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-[#00F0FF] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Precise (0.0)</span>
              <span>Balanced (0.7)</span>
              <span>Creative (2.0)</span>
            </div>
          </div>

          {/* Top-P Slider */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Top-P (Nucleus Sampling)</span>
              <span className="text-[#00F0FF] font-bold">{topP.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={topP}
              onChange={(e) => setTopP(parseFloat(e.target.value))}
              className="w-full accent-[#00F0FF] cursor-pointer"
            />
          </div>

          {/* Max Output Tokens */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Max Output Tokens</span>
              <span className="text-purple-400 font-bold">{maxOutputTokens}</span>
            </div>
            <input
              type="range"
              min="256"
              max="8192"
              step="256"
              value={maxOutputTokens}
              onChange={(e) => setMaxOutputTokens(parseInt(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Thinking Level */}
          <div className="space-y-1.5 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Thinking Level</span>
              <span className="text-[10px] text-slate-500 font-mono">Gemini 3.8</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {(['OFF', 'LOW', 'MEDIUM', 'HIGH'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setThinkingLevel(lvl)}
                  className={`py-1.5 rounded-xl border text-[10px] font-mono font-bold transition-all cursor-pointer text-center ${
                    thinkingLevel === lvl
                      ? 'border-[#00F0FF] bg-[#00F0FF]/20 text-[#00F0FF]'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Tools & Grounding */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <span className="text-[11px] font-mono text-slate-300 font-bold block">
              Tools & Grounding
            </span>

            {/* Google Search Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="text-xs font-mono text-white block">Google Search Grounding</span>
                  <span className="text-[10px] text-slate-400 font-mono">Ground answers with real-time web search</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEnableGoogleSearch(!enableGoogleSearch)}
                className={`w-10 h-6 rounded-full transition-all flex items-center px-1 cursor-pointer ${
                  enableGoogleSearch ? 'bg-blue-600 justify-end' : 'bg-white/20 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow" />
              </button>
            </div>

            {/* Structured Output Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Braces className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="text-xs font-mono text-white block">Structured JSON Output</span>
                  <span className="text-[10px] text-slate-400 font-mono">Enforce strict schema output</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResponseMimeType(responseMimeType === 'application/json' ? 'text/plain' : 'application/json')}
                className={`w-10 h-6 rounded-full transition-all flex items-center px-1 cursor-pointer ${
                  responseMimeType === 'application/json' ? 'bg-purple-600 justify-end' : 'bg-white/20 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow" />
              </button>
            </div>

            {/* JSON Schema Definition Box if active */}
            {responseMimeType === 'application/json' && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono text-purple-400 font-bold block">
                  JSON Schema Definition
                </span>
                <textarea
                  value={jsonSchemaText}
                  onChange={(e) => setJsonSchemaText(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 rounded-xl bg-black/60 border border-purple-500/30 text-[10px] font-mono text-purple-200 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
