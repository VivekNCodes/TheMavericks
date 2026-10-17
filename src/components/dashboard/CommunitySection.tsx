"use client";

import React, { useState } from "react";
import {
  Users,
  MessageSquare,
  PlusCircle,
  ThumbsUp,
  Tag,
  CheckCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/context/LanguageContext";

export const CommunitySection: React.FC = () => {
  const { t } = useLanguage();
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: t("post1Author"),
      title: t("post1Title"),
      tag: t("post1Tag"),
      replies: 18,
      likes: 34,
      initials: "BS",
      time: "3 hrs ago",
    },
    {
      id: 2,
      author: t("post2Author"),
      title: t("post2Title"),
      tag: t("post2Tag"),
      replies: 27,
      likes: 51,
      initials: "GP",
      time: "5 hrs ago",
    },
    {
      id: 3,
      author: t("post3Author"),
      title: t("post3Title"),
      tag: t("post3Tag"),
      replies: 12,
      likes: 29,
      initials: "SY",
      time: "8 hrs ago",
    },
  ]);

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setPosts((prev) => [
      {
        id: Date.now(),
        author: "You (Farmer)",
        title: newQuestion,
        tag: "General Farming",
        replies: 0,
        likes: 1,
        initials: "YOU",
        time: "Just now",
      },
      ...prev,
    ]);
    setNewQuestion("");
    setIsQuestionModalOpen(false);
  };

  return (
    <Card className="p-5 sm:p-6 border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <Users className="h-4 w-4" />
            </span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {t("communityTitle")}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t("communitySubtitle")}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsQuestionModalOpen(true)}
          leftIcon={<PlusCircle className="h-3.5 w-3.5" />}
        >
          {t("communityAskBtn")}
        </Button>
      </div>

      {/* Discussions Feed */}
      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/80 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-krishi-800 font-bold text-xs">
                {post.initials}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-800">
                    {post.author}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    • {post.time}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {post.tag}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-semibold text-slate-800 mt-1 hover:text-krishi-700 cursor-pointer">
                  {post.title}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 self-end sm:self-auto shrink-0 pl-12 sm:pl-0">
              <div className="flex items-center gap-1 hover:text-krishi-700 cursor-pointer">
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center gap-1 text-krishi-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>
                  {post.replies} {t("communityReplies")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ask Question Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in-50">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h4 className="text-base font-bold text-slate-900 mb-1">
              Ask the Farmer Community
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Get answers and practical advice from experienced farmers and agronomists across India.
            </p>

            <form onSubmit={handlePostQuestion} className="space-y-4">
              <textarea
                rows={4}
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ask about crop disease treatment, mandi prices, fertilizers, or government schemes..."
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none resize-none"
                required
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <Button type="submit" size="sm">
                  Publish Question
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};
