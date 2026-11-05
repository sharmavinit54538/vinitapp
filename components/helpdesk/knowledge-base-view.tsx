'use client';

import React, { useState } from 'react';
import { KbArticle, MainCategory } from '@/lib/helpdesk-types';
import {
  BookOpen,
  Search,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Edit,
  Trash2,
  Tag,
  CheckCircle,
  X,
} from 'lucide-react';

interface KnowledgeBaseViewProps {
  articles: KbArticle[];
  canEdit: boolean;
  onSaveArticle: (article: Partial<KbArticle>) => Promise<void>;
  onSubmitFeedback: (articleId: string, type: 'helpful' | 'notHelpful') => Promise<void>;
  onSuccessToast: (msg: string) => void;
}

export function KnowledgeBaseView({
  articles: initialArticles,
  canEdit,
  onSaveArticle,
  onSubmitFeedback,
  onSuccessToast,
}: KnowledgeBaseViewProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeArticle, setActiveArticle] = useState<KbArticle | null>(null);
  const [newModalOpen, setNewModalOpen] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<MainCategory>('Payroll Support');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState('Guide, HR');

  const filteredArticles = articles.filter((a) => {
    if (selectedCategory !== 'All' && a.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleFeedback = async (articleId: string, type: 'helpful' | 'notHelpful') => {
    await onSubmitFeedback(articleId, type);
    setArticles((prev) =>
      prev.map((a) => {
        if (a.id === articleId) {
          return {
            ...a,
            helpfulCount: type === 'helpful' ? a.helpfulCount + 1 : a.helpfulCount,
            notHelpfulCount: type === 'notHelpful' ? a.notHelpfulCount + 1 : a.notHelpfulCount,
          };
        }
        return a;
      })
    );
    onSuccessToast('Thank you for rating this support guide!');
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const newObj: Partial<KbArticle> = {
      title: formTitle.trim(),
      category: formCategory,
      summary: formSummary.trim(),
      content: formContent.trim(),
      tags: formTags.split(',').map((t) => t.trim()).filter(Boolean),
      status: 'Published',
    };

    await onSaveArticle(newObj);
    onSuccessToast(`Knowledge Base article "${formTitle}" published.`);
    setNewModalOpen(false);
    setFormTitle('');
    setFormSummary('');
    setFormContent('');
  };

  return (
    <div className="space-y-4" data-testid="knowledge-base-view">
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Employee Support Knowledge Base &amp; SOP Library
          </h2>
          <p className="text-xs text-slate-500">
            Self-service resolutions, compliance procedures &amp; documentation
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => setNewModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Article</span>
          </button>
        )}
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search solutions before filing a ticket (e.g. 80C, VPN, biometric)..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          <option value="All">All Categories</option>
          <option value="Payroll Support">Payroll Support</option>
          <option value="Attendance Support">Attendance Support</option>
          <option value="Leave Support">Leave Support</option>
          <option value="IT Support">IT Support</option>
          <option value="HR Support">HR Support</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {article.category}
                </span>
                <span className="text-[11px] font-mono text-slate-400 inline-flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> {article.viewCount} Views
                </span>
              </div>

              <h3
                onClick={() => setActiveArticle(article)}
                className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 cursor-pointer transition-colors"
              >
                {article.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2">{article.summary}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex flex-wrap gap-1">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Feedback CTA */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleFeedback(article.id, 'helpful')}
                  className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 text-slate-600 dark:text-slate-300 inline-flex items-center gap-1 cursor-pointer"
                  title="Helpful"
                >
                  <ThumbsUp className="w-3 h-3 text-emerald-600" />
                  <span className="text-[10px]">{article.helpfulCount}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFeedback(article.id, 'notHelpful')}
                  className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-rose-50 text-slate-600 dark:text-slate-300 inline-flex items-center gap-1 cursor-pointer"
                  title="Not Helpful"
                >
                  <ThumbsDown className="w-3 h-3 text-rose-500" />
                  <span className="text-[10px]">{article.notHelpfulCount}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  {activeArticle.category}
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {activeArticle.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-3 leading-relaxed">
              <p className="font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                {activeArticle.summary}
              </p>
              <div className="whitespace-pre-wrap">{activeArticle.content}</div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Author: {activeArticle.author} · Updated: {activeArticle.lastUpdated}</span>
              <button
                type="button"
                onClick={() => handleFeedback(activeArticle.id, 'helpful')}
                className="h-8 px-3 rounded-xl bg-indigo-600 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Mark Helpful</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Article Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Create Knowledge Base Article
              </h3>
              <button
                type="button"
                onClick={() => setNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Article Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. How to Submit Medical Reimbursements..."
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as MainCategory)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Payroll Support">Payroll Support</option>
                  <option value="Attendance Support">Attendance Support</option>
                  <option value="Leave Support">Leave Support</option>
                  <option value="IT Support">IT Support</option>
                  <option value="HR Support">HR Support</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Summary Teaser
                </label>
                <input
                  type="text"
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Short description shown in search results..."
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Policy / Guide Content
                </label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Step-by-step instructions, SLAs, required attachments..."
                  rows={4}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
