import React, { useState } from 'react';
import { BookOpen, GraduationCap, Send, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { askSeaRho7, type AssistantSource } from '../../services/assistantGateway';

type Answer = { question: string; reply: string; source: AssistantSource };
const subjects = ['Mathematics', 'Science', 'English', 'Social Science'];

export const Academy: React.FC = () => {
  const [schoolClass, setSchoolClass] = useState('10');
  const [board, setBoard] = useState('TBSE');
  const [subject, setSubject] = useState('Mathematics');
  const [language, setLanguage] = useState('English');
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const askQuestion = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!question.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      const prompt = question.trim();
      const result = await askSeaRho7({
        question: prompt,
        mode: 'student-homework',
        roomId: 'academy-private',
        context: 'School board: ' + board + '; class: ' + schoolClass +
          '; subject: ' + subject + '; preferred language: ' + language +
          '. Answer with a clear explanation, one worked example and one practice question.'
      });
      setAnswers(previous => [{
        question: prompt, reply: result.text, source: result.source
      }, ...previous]);
      setQuestion('');
    } catch {
      setError('The tutor could not answer right now. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto space-y-7 text-slate-100">
      <header className="rounded-3xl bg-slate-900/70 p-6 md:p-10 border border-slate-800">
        <div className="flex items-center gap-3 text-saffron-400 mb-5">
          <GraduationCap className="w-8 h-8" />
          <span className="text-xs font-bold tracking-widest uppercase">Sea.rho7 Student Pilot</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-4">A private study space</h1>
        <p className="text-sm md:text-base text-slate-300">
          Ask homework questions and learn step by step. Community chat,
          student directories, tutor listings and public projects are disabled
          until we can provide safe, consent-based sharing.
        </p>
        <p className="flex gap-2 items-center text-xs text-slate-400 mt-5">
          <ShieldCheck className="w-4 h-4" /> Your questions are not posted to the public community.
        </p>
      </header>

      <form onSubmit={askQuestion}
        className="rounded-3xl bg-slate-950 border border-slate-800 p-6 md:p-8 space-y-5">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <label className="text-sm">Class
            <select value={schoolClass} onChange={e => setSchoolClass(e.target.value)}
              className="mt-2 w-full p-3 rounded-xl bg-slate-900 border border-slate-700">
              {['6','7','8','9','10','11','12'].map(value =>
                <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="text-sm">Board
            <select value={board} onChange={e => setBoard(e.target.value)}
              className="mt-2 w-full p-3 rounded-xl bg-slate-900 border border-slate-700">
              {['TBSE','CBSE'].map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="text-sm">Subject
            <select value={subject} onChange={e => setSubject(e.target.value)}
              className="mt-2 w-full p-3 rounded-xl bg-slate-900 border border-slate-700">
              {subjects.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="text-sm">Language
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="mt-2 w-full p-3 rounded-xl bg-slate-900 border border-slate-700">
              {['English','Bengali','Hindi'].map(value =>
                <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4"/> Homework question</span>
          <textarea value={question} maxLength={5000} rows={4}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Example: Solve 2x + 3 = 7, showing every step."
            className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700" />
        </label>
        {error && <p role="alert" className="text-rose-300 text-sm">{error}</p>}
        <button type="submit" disabled={busy || !question.trim()}
          className="flex gap-2 items-center py-3 px-5 bg-saffron-600 text-white font-bold rounded-xl disabled:opacity-50">
          <Send className="w-4 h-4"/> {busy ? 'Explaining…' : 'Explain my question'}
        </button>
      </form>

      <div className="space-y-4" aria-live="polite">
        {answers.map((entry, index) => (
          <article key={index} className="p-5 md:p-7 rounded-2xl bg-slate-900 border border-slate-800">
            <h2 className="font-bold mb-3">{entry.question}</h2>
            <p className="text-xs text-saffron-300 mb-4 uppercase tracking-wide">
              {entry.source === 'local'
                ? 'Local helper — not a live AI answer'
                : 'AI-generated answer (' + entry.source + ') — check important work'}
            </p>
            <div className="prose prose-invert max-w-none text-sm"><ReactMarkdown>{entry.reply}</ReactMarkdown></div>
          </article>
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Answers shown here are saved in this browser session only, not to a shared database.
        They disappear on reload. Private saved lesson history needs a later release.
      </p>
    </section>
  );
};
