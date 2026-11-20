import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, ShieldCheck, Zap, FileText, ArrowRight } from 'lucide-react';
import { WaveMesh } from '@/components/ui/wave-mesh';
import { MotionBlurText } from '@/components/ui/motion-blur-text';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wordmark } from '@/components/ui/wordmark';
import { PeakChart } from '@/components/ui/peak-chart';
import GlassFolder from '@/components/ui/glass-folder-cards';

const FEATURES = [
  { icon: Brain, title: 'Agentic retrieval', desc: 'Your question is rewritten, searched with vector + keyword (hybrid), then reranked so only the passages that truly answer it reach the model.' },
  { icon: ShieldCheck, title: 'No hallucination', desc: "Answers come only from your documents. If the answer isn't there, it says so instead of making one up." },
  { icon: Zap, title: 'CAG fast-path', desc: 'Small documents skip retrieval entirely and are loaded whole — sharper answers, no chunk-boundary misses.' },
  { icon: FileText, title: 'Cited answers', desc: 'Every answer points back to the exact source passage it used, so you can always verify.' },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-chat">
      {/* ── Hero (wave-mesh backdrop) ────────────────────── */}
      <WaveMesh className="flex min-h-[92vh] flex-col">
        <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <Wordmark size="md" />
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost">Sign in</Button></Link>
            <Link to="/register"><Button>Get started</Button></Link>
          </div>
        </nav>

        <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-6 pb-20 pt-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-[rgba(20,23,30,0.6)] px-3.5 py-1.5 text-xs font-medium text-muted backdrop-blur-md">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              Powered by Gemini 2.5 Flash · Agentic RAG
            </div>

            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
              <MotionBlurText>Talk to your</MotionBlurText><br />
              <MotionBlurText delay={0.18} className="bg-accent-gradient bg-clip-text text-transparent">documents.</MotionBlurText>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Upload a PDF and ask anything. DocQA retrieves the right passages, reasons over them,
              and gives cited answers from your own content — never the open internet, never made up.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register">
                <Button size="lg" variant="smoky">Get started free <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="secondary">Sign in</Button>
              </Link>
            </div>
          </motion.div>

          {/* Animated stat cards */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6">
            <PeakChart
              width={300}
              value={96}
              valueSuffix="%"
              title="Retrieval relevance"
              caption="hybrid search + reranking"
              updatedText="Benchmarked"
            />
            <PeakChart
              width={300}
              accent="#2ec99a"
              value={100}
              valueSuffix="%"
              title="Grounded answers"
              caption="cited, or it says it doesn't know"
              updatedText="Live"
            />
          </div>
        </section>
      </WaveMesh>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Not another ChatGPT wrapper</h2>
          <p className="mt-3 text-muted">An agentic pipeline that decides how to answer — and refuses when it shouldn't.</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <GlassCard key={title} className="p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-gradient shadow-btn-glow">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ── Documents showcase ───────────────────────────── */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Every document, instantly searchable
          </h2>
          <p className="mt-4 max-w-md text-muted leading-relaxed">
            Drop in PDFs or text files. DocQA parses, chunks, embeds and indexes them in seconds —
            then you ask questions across one document or many, and get answers with sources.
          </p>
          <div className="mt-8">
            <Link to="/register"><Button size="lg">Upload your first doc <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
        </div>
        <div className="flex justify-center">
          <GlassFolder
            tone="dark"
            art="glacier"
            width={320}
            label="Your documents"
            meta="ask anything"
            action="none"
            files={[
              { name: 'Q4_Report.pdf', meta: 'PDF', art: 'glacier' },
              { name: 'Research.pdf', meta: 'PDF', art: 'aurora' },
              { name: 'Contract.pdf', meta: 'PDF' },
            ]}
          />
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Start asking your documents</h2>
        <p className="mt-3 text-muted">Free to try. No setup. Your data stays private.</p>
        <div className="mt-8">
          <Link to="/register"><Button size="lg" variant="smoky">Get started free <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
        <div className="mt-16 flex items-center justify-center gap-2 border-t border-line pt-8">
          <Wordmark size="sm" />
          <span className="ml-2 text-xs text-faint">· Gemini · Pinecone · FastAPI · React</span>
        </div>
      </section>
    </div>
  );
}
