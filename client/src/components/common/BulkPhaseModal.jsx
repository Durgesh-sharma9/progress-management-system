import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import {
  ClipboardPaste,
  Sparkles,
  Bookmark,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  BookmarkPlus,
  Layers,
  X,
  Star,
  Check,
} from 'lucide-react';

const BUILTIN_PRESETS = [
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
  {
    name: '🛡️ Security & Testing',
    text: `Phase 1: Rate Limiting, Helmet Headers & CORS Config\nPhase 2: End-to-End API Integration Testing\nPhase 3: Penetration Testing & SQL/NoSQL Injection Audits\nPhase 4: Production Logging & Error Alert Webhooks`,
  },
];

const BulkPhaseModal = ({ isOpen, onClose, projectId, onPhasesCreated }) => {
  const [rawText, setRawText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Developer Templates (Stored in LocalStorage)
  const [customTemplates, setCustomTemplates] = useState([]);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Load custom templates on open
  useEffect(() => {
    try {
      const saved = localStorage.getItem('devtrack_developer_custom_templates');
      if (saved) {
        setCustomTemplates(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load custom templates:', e);
    }
  }, [isOpen]);

  // Save custom templates to localStorage
  const persistCustomTemplates = (updatedList) => {
    setCustomTemplates(updatedList);
    try {
      localStorage.setItem(
        'devtrack_developer_custom_templates',
        JSON.stringify(updatedList)
      );
    } catch (e) {
      console.error('Failed to save custom templates:', e);
    }
  };

  const handleSaveCustomTemplate = (e) => {
    e.preventDefault();
    if (!newTemplateName.trim() || !rawText.trim()) return;

    const newTmpl = {
      id: Date.now().toString(),
      name: newTemplateName.trim(),
      text: rawText.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newTmpl, ...customTemplates.filter((t) => t.name !== newTmpl.name)];
    persistCustomTemplates(updated);
    setNewTemplateName('');
    setIsSavingTemplate(false);
    setSaveSuccessMsg(`Template "${newTmpl.name}" saved!`);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleDeleteCustomTemplate = (id, e) => {
    e.stopPropagation();
    const updated = customTemplates.filter((t) => t.id !== id);
    persistCustomTemplates(updated);
  };

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
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Templates Section */}
        <div className="space-y-2.5">
          {/* Built-in Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                Quick Sprint Presets (1-Click Fill)
              </label>
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              {BUILTIN_PRESETS.map((tmpl) => (
                <button
                  key={tmpl.name}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl.text)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 text-[11px] sm:text-xs font-semibold text-slate-700 transition-all shadow-soft-xs"
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* My Saved Custom Templates */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-purple-600 fill-purple-100" />
                My Saved Custom Templates ({customTemplates.length})
              </label>
              {saveSuccessMsg && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  {saveSuccessMsg}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {customTemplates.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">
                  No custom templates saved yet. Type a list below and click "Save as My Template".
                </p>
              ) : (
                customTemplates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => handleApplyTemplate(tmpl.text)}
                    className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/90 text-purple-900 text-xs font-bold transition-all cursor-pointer shadow-soft-xs"
                    title="Click to fill editor with this custom template"
                  >
                    <Bookmark className="h-3 w-3 text-purple-600 fill-purple-200" />
                    <span>{tmpl.name}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCustomTemplate(tmpl.id, e)}
                      title="Delete saved template"
                      className="text-purple-400 hover:text-rose-600 p-0.5 rounded-md hover:bg-white/80 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Textarea Input Header & Controls */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Paste Your Phase / Task List *
            </label>
            <div className="flex items-center gap-2.5">
              {rawText.trim() && !isSavingTemplate && (
                <button
                  type="button"
                  onClick={() => setIsSavingTemplate(true)}
                  className="text-[11px] font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-lg shadow-soft-xs hover:bg-purple-100 transition-all"
                >
                  <BookmarkPlus className="h-3 w-3" />
                  Save as My Template
                </button>
              )}
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
          </div>

          {/* Inline Form to Save Template Name */}
          {isSavingTemplate && (
            <div className="mb-2 p-2.5 rounded-xl bg-purple-50/90 border border-purple-200 flex items-center gap-2">
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="Enter Template Name (e.g. Next.js SaaS Workflow)"
                className="flex-1 rounded-lg border border-purple-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveCustomTemplate}
                disabled={!newTemplateName.trim()}
                className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsSavingTemplate(false)}
                className="px-2.5 py-1.5 rounded-lg border border-purple-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          <textarea
            rows={5}
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
            <div className="p-3.5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-center text-xs text-slate-400 font-medium">
              Start typing or pasting text above to see instant live preview.
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-2.5">
              {parsedPhases.map((phase, idx) => (
                <div
                  key={phase.id || idx}
                  className="flex items-start justify-between gap-3 p-2 rounded-xl bg-white border border-slate-200/80 shadow-soft-xs hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="h-4.5 w-4.5 rounded bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center text-[9px] font-bold font-mono shrink-0 mt-0.5">
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
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded hover:bg-rose-50 transition-colors shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
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
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || parsedPhases.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 px-5 py-2 text-xs font-bold text-white shadow-soft-md shadow-brand-500/25 hover:from-brand-500 hover:to-indigo-500 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <ClipboardPaste className="h-3.5 w-3.5" />
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
