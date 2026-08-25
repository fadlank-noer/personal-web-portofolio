import type { QuestionTemplate } from '@/lib/types/chat';
import { normalize, tokenize } from '@/lib/utils/string';

export interface MatchResult {
  template: QuestionTemplate;
  score: number;
}

export function calculateMatchScore(input: string, templateQuestion: string): number {
  const nInput = normalize(input);
  const nTemplate = normalize(templateQuestion);
  if (!nInput || !nTemplate) return 0;
  if (nInput === nTemplate) return 1;
  if (nInput.includes(nTemplate) || nTemplate.includes(nInput)) {
    const minLen = Math.min(nInput.length, nTemplate.length);
    const maxLen = Math.max(nInput.length, nTemplate.length);
    return 0.8 + 0.19 * (minLen / maxLen);
  }
  const setInput = new Set(tokenize(nInput));
  const setTpl = new Set(tokenize(nTemplate));
  if (setInput.size === 0 || setTpl.size === 0) return 0;
  let inter = 0;
  setInput.forEach((t) => {
    if (setTpl.has(t)) inter++;
  });
  const union = setInput.size + setTpl.size - inter;
  const jaccard = union === 0 ? 0 : inter / union;
  return jaccard >= 0.5 ? 0.5 + jaccard * 0.3 : jaccard * 0.6;
}

export function findBestMatch(
  input: string,
  templates: QuestionTemplate[],
  threshold = 0.3
): MatchResult | null {
  if (!input.trim() || !templates.length) return null;
  let best: MatchResult | null = null;
  for (const tmpl of templates) {
    const score = calculateMatchScore(input, tmpl.question);
    if (!best || score > best.score) best = { template: tmpl, score };
  }
  return best && best.score >= threshold ? best : null;
}

export function filterQuestions(
  questions: QuestionTemplate[],
  query: string,
  limit = 6
): QuestionTemplate[] {
  if (!query || query.trim().length < 1) return [];
  const q = query.toLowerCase().trim();
  const scored = questions
    .map((qt) => {
      const lq = qt.question.toLowerCase();
      let score = 0;
      if (lq === q) score = 100;
      else if (lq.startsWith(q)) score = 80;
      else if (lq.includes(q)) score = 60;
      else {
        const words = q.split(/\s+/).filter(Boolean);
        const matches = words.filter((w) => lq.includes(w)).length;
        if (matches > 0) score = (matches / words.length) * 50;
      }
      return { qt, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ qt }) => qt);
  return scored;
}

export function findExactQuestion(
  questions: QuestionTemplate[],
  query: string
): QuestionTemplate | null {
  const q = (query || '').toLowerCase().trim();
  if (!q) return null;
  const exact = questions.find((i) => i.question.toLowerCase().trim() === q);
  if (exact) return exact;
  const loose = questions.find((i) => {
    const lq = i.question.toLowerCase();
    return lq.includes(q) || q.includes(lq);
  });
  return loose ?? null;
}
