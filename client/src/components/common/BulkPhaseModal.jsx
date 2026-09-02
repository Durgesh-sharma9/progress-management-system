import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import {
  ClipboardPaste,
  Sparkles,
  ListPlus,
  Trash2,
  CheckCircle2,
  Loader2,
  FileText,
  Layers,
  ArrowRight,
} from 'lucide-react';

const PRESET_TEMPLATES = [
  {
    name: '🌐 Full-Stack Web App',
    text: `Phase 1: Setup Authentication, JWT & Protected Routes\nPhase 2: Database Schema & Entity Relationships\nPhase 3: REST API Endpoints with Input Validation\nPhase 4: Responsive UI Layout & Interactive Components\nPhase 5: Automated Testing, Deployment & Optimization`,
  },
  {
    name: '📱 Mobile App Sprint',
    text: `Phase 1: Splash Screen & Onboarding User Flow\nPhase 2: State Management & Offline Caching\nPhase 3: Camera & Device Hardware Permissions\nPhase 4: Push Notifications & Release Packaging`,
  },
  {
    name: '💳 Payment & E-Commerce',
    text: `Phase 1: Product Catalog & Dynamic Filtering\nPhase 2: Shopping Cart & Session Persistence\nPhase 3: Stripe / Razorpay Checkout & Webhook Ingestion\nPhase 4: PDF Order Invoices & Email Receipts`,
  },
];

const BulkPhaseModal = ({ isOpen, onClose, projectId, onPhasesCreated }) => {
  const [rawText, setRawText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse raw text into structured phase objects
  const parsedPhases = useMemo(() => {
    if (!rawText.trim()) return [];

    const lines = rawText.split('\n');
    const result = [];

    lines.forEach((line) => {
      let cleaned = line.trim();
      if (!cleaned) return;

      // Clean common list prefixes:
      // Numbering: "1. ", "1) ", "[1] ", "Phase 1: ", "Phase 1 - ", "Step 1: "
      cleaned = cleaned.replace(/^(?:phase|step|\d+|\[\d+\])\s*[\d.:)\-\]]*\s*(?::|-)?\s*/i, '');

      // Markdown / bullet points: "- [ ] ", "- [x] ", "- ", "* ", "• ", "+ "
      cleaned = cleaned.replace(/^[-*•+]\s*(?:\[[ x]\]\s*)?/i, '');

      cleaned = cleaned.trim();
      if (!cleaned) return;

      // Check if line contains a separator for description (" | " or " -- ")
      let title = cleaned;
      let description = '';

      if (cleaned.includes(' | ')) {
        const parts = cleaned.split(' | ');
        title = parts[0].trim();
        description = parts.slice(1).join(' | ').trim();
      } else if (cleaned.includes(' -- ')) {
        const parts = cleaned.split(' -- ');
        title = parts[0].trim();
        description = parts.slice(1).join(' -- ').trim();
      }

      if (title.length > 0) {
        result.push({
          id: Math.random().toString(36).substring(7),
          title,
          description,
        });
      }
    });

    return result;
  }, [rawText]);

  const handleApplyTemplate = (text) => {
    setRawText(text);
  };

  const handleRemoveSingleParsed = (indexToRemove) => {
    const lines = rawText.split('\n').filter((l) => l.trim().length > 0);
    lines.splice(indexToRemove, 1);
    setRawText(lines.join('\n'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parsedPhases.length === 0) return;

    setIsSubmitting(true);
    try {
      await onPhasesCreated(parsedPhases);
      setRawText('');
      onClose();
    } catch (err) {
      console.error('Bulk phase creation failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚡ Quick Phase Paster & Bulk Importer"
      subtitle="Paste your whole deliverable list at once. DevTrack will automatically parse and create all phases."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Quick Templates Bar */}
        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" />
            Quick Sprint Presets (1-Click Fill)
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.name}
                type="button"
                onClick={() => handleApplyTemplate(tmpl.text)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 text-xs font-semibold text-slate-700 transition-all shadow-soft-xs"
              >
                {tmpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Paste Your Phase / Task List *
            </label>
            {rawText && (
              <button
                type="button"
                onClick={() => setRawText('')}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700"
              >
                Clear text
              </button>
            )}
          </div>
          <textarea
            rows={6}
            required
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`Paste your list here (one per line, numbered or markdown):\n\n1. Setup JWT Authentication & RBAC Guard\n2. Design Student Dashboard UI Wireframes\n3. Integrate Cloud Storage for Documents\n4. Setup Webhooks for Payment Gateway`}
            className="block w-full rounded-2xl border border-slate-300/80 bg-white/80 p-3.5 font-mono text-xs text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-soft-xs leading-relaxed"
          />
        </div>

        {/* Live Parsed Preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-brand-600" />
              Live Preview & Identified Phases ({parsedPhases.length})
            </span>
            {parsedPhases.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Ready to Import
              </span>
            )}
          </div>

          {parsedPhases.length === 0 ? (
            <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-center text-xs text-slate-400 font-medium">
              Start typing or pasting text above to see instant live preview.
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-2.5">
              {parsedPhases.map((phase, idx) => (
                <div
                  key={phase.id || idx}
                  className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-soft-xs hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="h-5 w-5 rounded-md bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center text-[10px] font-bold font-mono shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {phase.title}
                      </p>
                      {phase.description && (
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {phase.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSingleParsed(idx)}
                    title="Remove from import"
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300/80 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-soft-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || parsedPhases.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 px-5 py-2.5 text-sm font-bold text-white shadow-soft-md shadow-brand-500/25 hover:from-brand-500 hover:to-indigo-500 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <ClipboardPaste className="h-4 w-4" />
                Import & Create {parsedPhases.length} Phases
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BulkPhaseModal;
