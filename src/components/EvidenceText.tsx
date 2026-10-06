const AI_KEYWORDS = /\b(AI|artificial intelligence|machine learning|deep learning|ChatGPT|OpenAI|GPT-\d+(?:\.\d+)?|Claude|Gemini|generative AI|large language models?|LLMs?|neural networks?)\b/gi;

export function HighlightedEvidence({ text }: { text: string }) {
  return <>{text.split(AI_KEYWORDS).map((part, index) => index % 2 ? <mark key={index}>{part}</mark> : part)}</>;
}

export default function EvidenceText({ text, limit = 500 }: { text: string; limit?: number }) {
  if (text.length <= limit) return <p className="aq-evidence"><HighlightedEvidence text={text}/></p>;
  return <div className="aq-evidence-block">
    <p className="aq-evidence"><HighlightedEvidence text={`${text.slice(0, limit).trimEnd()}…`}/></p>
    <details><summary>Read full collected text</summary><p className="aq-evidence"><HighlightedEvidence text={text}/></p></details>
  </div>;
}
