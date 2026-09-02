import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import {
  FileText,
  Save,
  Loader2,
  Sparkles,
  Link2,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const PhaseNotesModal = ({
  isOpen,
  onClose,
  phase,
  isOwner = false,
  onSaveNotes,
}) => {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (phase) {
      setNotes(phase.notes || '');
    }
  }, [phase, isOpen]);

  if (!phase) return null;

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!isOwner) return;

    setIsSaving(true);
    try {
      await onSaveNotes(phase._id, notes);
      onClose();
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const insertSnippet = (prefix) => {
    setNotes((prev) => (prev ? `${prev}\n${prefix}` : prefix));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📝 Developer Work Notes & Logs"
      subtitle={`Phase: ${phase.title}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Phase Info summary bar */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                phase.completed ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-amber-400 ring-2 ring-amber-200'
              }`}
            />
            <span className="font-bold text-slate-800">
              {phase.completed ? 'Completed Milestone' : 'Pending Milestone'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Assigned: {phase.developerId?.name || 'Developer'}
          </span>
        </div>

        {/* Quick Insert Helpers (if owner) */}
        {isOwner && (
          <div>
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-brand-600" />
              Quick Insert Formatting
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => insertSnippet('🔗 PR: https://github.com/...')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-soft-xs"
              >
                <Link2 className="h-3 w-3 text-brand-600" />
                PR / Commit Link
              </button>

              <button
                type="button"
                onClick={() => insertSnippet('⚠️ Blocker / Dependency: ')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-soft-xs"
              >
                <AlertTriangle className="h-3 w-3 text-amber-600" />
                Blocker
              </button>

              <button
                type="button"
                onClick={() => insertSnippet('✅ Test verification passed on staging.')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-soft-xs"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                Test Log
              </button>
            </div>
          </div>
        )}

        {/* Notes Textarea */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Work Notes & Implementation Details
          </label>
          {isOwner ? (
            <textarea
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write implementation remarks, GitHub PR links, API response schemas, or blocker updates..."
              className="block w-full rounded-2xl border border-slate-300/80 bg-white/80 p-3.5 text-xs text-slate-900 placeholder-slate-400 font-mono transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-soft-xs leading-relaxed"
            />
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 min-h-[120px] text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed">
              {notes || <span className="text-slate-400 italic">No notes recorded for this phase yet.</span>}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300/80 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-soft-xs"
          >
            Close
          </button>
          {isOwner && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-soft-md shadow-brand-500/25 hover:from-brand-500 hover:to-indigo-500 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save Notes
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PhaseNotesModal;
