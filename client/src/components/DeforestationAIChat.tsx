import { useState, useRef, useEffect } from "react";
import { Send, AlertCircle } from "lucide-react";
import type { Incident } from "../lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface DeforestationAIChatProps {
  incidents: Incident[];
  totalLossHa: number;
  incidentCount: number;
  bbox: [number, number, number, number] | null;
  dateStart: string;
  dateEnd: string;
  threshold: number;
}

export function DeforestationAIChat({
  incidents,
  totalLossHa,
  incidentCount,
  bbox,
  dateStart,
  dateEnd,
  threshold,
}: DeforestationAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0 && !isLoading && !error) {
      generateInitialReport();
    }
  }, []);

  const generateInitialReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setError("Gemini API key not configured. Please set VITE_GEMINI_API_KEY in .env");
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: getSystemPrompt() },
                  { text: "\n\nPlease provide the full initial deforestation analysis report including severity, patterns, causes, recommendations, and implications." }
                ],
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to get response");
      }

      const data = await response.json();
      const assistantMessage =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received";

      setMessages([{ role: "assistant", content: assistantMessage }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getSystemPrompt = () => {
    const severityBreakdown = {
      critical: incidents.filter((i) => i.severity === "critical").length,
      high: incidents.filter((i) => i.severity === "high").length,
      medium: incidents.filter((i) => i.severity === "medium").length,
      low: incidents.filter((i) => i.severity === "low").length,
    };

    const severityArea = {
      critical: incidents
        .filter((i) => i.severity === "critical")
        .reduce((sum, i) => sum + (i.area_ha || 0), 0),
      high: incidents
        .filter((i) => i.severity === "high")
        .reduce((sum, i) => sum + (i.area_ha || 0), 0),
      medium: incidents
        .filter((i) => i.severity === "medium")
        .reduce((sum, i) => sum + (i.area_ha || 0), 0),
      low: incidents
        .filter((i) => i.severity === "low")
        .reduce((sum, i) => sum + (i.area_ha || 0), 0),
    };

    return `You are an expert environmental analyst specializing in deforestation monitoring and forest loss analysis using satellite imagery. 

ANALYSIS DATA FOR THE SELECTED REGION:
- Location Coordinates (bbox): ${bbox ? `[${bbox.join(", ")}]` : "Not specified"}
- Analysis Period: ${dateStart} to ${dateEnd}
- Detection Threshold: ${threshold}
- Total Forest Loss: ${totalLossHa.toFixed(2)} hectares

DETECTED INCIDENTS:
- Total Incidents: ${incidentCount}
- Critical Severity (>20 ha): ${severityBreakdown.critical} incidents (${severityArea.critical.toFixed(2)} ha)
- High Severity (10-20 ha): ${severityBreakdown.high} incidents (${severityArea.high.toFixed(2)} ha)
- Medium Severity (2-10 ha): ${severityBreakdown.medium} incidents (${severityArea.medium.toFixed(2)} ha)
- Low Severity (<2 ha): ${severityBreakdown.low} incidents (${severityArea.low.toFixed(2)} ha)

Based on this deforestation data, provide insightful analysis about:
1. The severity and scale of forest loss in this region
2. Patterns and distribution of deforestation incidents
3. Potential causes and risk factors
4. Recommendations for monitoring and intervention
5. Environmental and climate implications

Answer user questions about this specific deforestation analysis with expert perspective.`;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);

    // Add user message to chat
    const newMessages = [
      ...messages,
      { role: "user" as const, content: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setError(
          "Gemini API key not configured. Please set VITE_GEMINI_API_KEY in .env",
        );
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: getSystemPrompt() }]
              },
              {
                role: "model",
                parts: [{ text: "Understood. I will act as the expert environmental analyst for the rest of this conversation." }]
              },
              ...newMessages.map((msg) => ({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content }],
              }))
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || "Failed to get response from Gemini API",
        );
      }

      const data = await response.json();
      const assistantMessage =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response received";

      setMessages([
        ...newMessages,
        { role: "assistant", content: assistantMessage },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setMessages(newMessages);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full border-l border-primary/30">
      {/* Chat Header */}
      <div className="border-b border-primary/30 bg-primary/5 p-3 sticky top-0">
        <h3 className="text-xs font-mono tracking-widest text-primary uppercase">
          🤖 AI DEFORESTATION ANALYST
        </h3>
        <p className="text-[10px] text-muted-foreground mt-1">
          Ask questions about this region's forest loss data
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && !isLoading && !error && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-primary/50 text-xs font-mono mb-3">
              AWAITING QUERY
            </div>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              Ask me about the deforestation pattern, severity levels, or
              environmental implications for this area.
            </p>
          </div>
        )}

        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded text-[11px] leading-relaxed ${
                message.role === "user"
                  ? "bg-primary/20 border border-primary/50 text-primary"
                  : "bg-emerald-950/40 border border-emerald-500/30 text-emerald-200"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 justify-start">
            <div className="bg-muted/20 border border-muted/50 rounded px-3 py-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="inline-block w-1 h-1 bg-muted-foreground rounded-full animate-pulse" />
                Analyzing deforestation data...
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-950/40 border border-red-500/30 rounded px-3 py-2 text-[11px] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-red-200">{error}</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-primary/30 bg-primary/5 p-3 space-y-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Ask about deforestation patterns..."
          className="w-full bg-black/50 border border-primary/30 rounded px-3 py-2 text-[11px] text-white placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          className="w-full bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-black disabled:opacity-50 disabled:cursor-not-allowed font-mono text-[10px] tracking-widest py-2 rounded transition-all flex items-center justify-center gap-2"
        >
          <Send className="w-3 h-3" />
          SEND QUERY
        </button>
      </div>
    </div>
  );
}
