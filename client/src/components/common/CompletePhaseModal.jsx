import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import {
  CheckCircle2,
  FileText,
  Link2,
  AlertTriangle,
  Sparkles,
  Loader2,
  CheckSquare,
} from 'lucide-react';

const CompletePhaseModal = ({
  isOpen,
  onClose,
  phase,
  onConfirmComplete,
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (phase) {
      setNotes(phase.notes || '');
    }
  }, [phase, isOpen]);

  if (!phase) return null;

  const handleCompleteWithNotes = async (withCustomNote = true) => {
    setIsSubmitting(true);
    try {
      await onConfirmComplete(phase._id, withCustomNote ? notes : phase.notes || '');
      onClose();
    } catch (err) {
      console.error('Failed to complete phase:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertSnippet = (snippet) => {
    setNotes((prev) => (prev ? `${prev}\n${snippet}` : snippet));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🎉 Mark Deliverable as Completed"
      subtitle="Complete this milestone and optionally attach PR links or verification logs."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Phase Header Card */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            <span className="font-extrabold uppercase tracking-wider text-emerald-800 text-[10px]">
              Milestone to Complete
            </span>
          </div>
          <p className="font-bold text-slate-900 text-sm">{phase.title}</p>
          {phase.description && (
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {phase.description}
            </p>
          )}
        </div>

        {/* Quick Format Helpers */}
        <div>
          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-brand-600" />
            Quick Attach Snippets
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => insertSnippet('🔗 PR: https://github.com/...')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-soft-xs"
            >
              <Link2 className="h-3 w-3 text-brand-600" />
              PR Link
            </button>

            <button
              type="button"
              onClick={() => insertSnippet('✅ Verification: Tested & verified on staging environment.')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-soft-xs"
            >
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              Staging Passed
            </button>

            <button
              type="button"
              onClick={() => insertSnippet('🚀 Deployed & live in production.')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-soft-xs"
            >
              🚀 Deployed
            </button>
          </div>
        </div>

        {/* Notes Textarea */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Attach Work Note / Verification Log (Optional)
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Completed API integration, unit tests passing 100%, PR #12 merged..."
            className="block w-full rounded-2xl border border-slate-300/80 bg-white/80 p-3.5 text-xs text-slate-900 placeholder-slate-400 font-mono transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-soft-xs leading-relaxed"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300/80 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-soft-xs"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCompleteWithNotes(false)}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Just Mark Complete
            </button>

            <button
              type="button"
              onClick={() => handleCompleteWithNotes(true)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-soft-md shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Complete & Save Note
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CompletePhaseModal;
