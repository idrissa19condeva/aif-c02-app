import Papa from 'papaparse';

// Import all CSVs as raw strings at build time (Vite)
const csvModules = import.meta.glob('./data/*.csv', { query: '?raw', import: 'default', eager: true });

const LETTERS = ['A', 'B', 'C', 'D'];

const DIFF_MAP = { easy: 'e', medium: 'm', hard: 'h' };

function parseCSV(raw) {
  const res = Papa.parse(raw, { header: true, skipEmptyLines: true });
  return res.data
    .filter(row => row.id && row.question && row.option_a && row.correct_answer)
    .map(row => ({
      i: row.id.trim(),
      d: parseInt(row.domain, 10),
      df: DIFF_MAP[(row.difficulty || '').trim().toLowerCase()] || 'm',
      q: row.question,
      o: [row.option_a, row.option_b, row.option_c, row.option_d],
      a: LETTERS.indexOf((row.correct_answer || '').trim().toUpperCase()),
      e: row.explanation || '',
      s: (row.service || '-').trim() || '-'
    }))
    .filter(q => q.a >= 0 && q.d >= 1 && q.d <= 5);
}

export const DEFAULT_QUESTIONS = Object.entries(csvModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .flatMap(([, raw]) => parseCSV(raw));
