import React, { useId } from "react";
import { Trash2, AlertCircle, Send } from "lucide-react";
import { IconButton, Input, Sheet } from "../ui";
import type { TalkNote, TalkProfile } from "./types";
import { getAvatarEmoji } from "./types";

interface RepliesDrawerProps {
  selectedNote: TalkNote | null;
  onClose: () => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  submittingReply: boolean;
  profile: TalkProfile | null;
  onPostReply: (e: React.FormEvent) => void;
  onRequestDeleteReply: (replyId: string) => void;
}

export function RepliesDrawer({
  selectedNote,
  onClose,
  replyContent,
  setReplyContent,
  submittingReply,
  profile,
  onPostReply,
  onRequestDeleteReply,
}: RepliesDrawerProps) {
  const formId = useId();

  return (
    <Sheet
      open={!!selectedNote}
      onClose={onClose}
      title="Replies"
      size="sm"
      footer={
        <form id={formId} onSubmit={onPostReply} className="space-y-3 text-left">
          <Input
            label="Your reply"
            hideLabel
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Add a friendly reply..."
            required
            trailing={
              <IconButton
                type="submit"
                size="sm"
                variant="primary"
                label="Post reply"
                icon={<Send className="w-4 h-4" />}
                disabled={submittingReply || !replyContent.trim()}
              />
            }
          />

          <div className="flex items-center gap-3 p-2 bg-paper-2 border border-ink-200/70 rounded-xl">
            <span className="text-xl">{getAvatarEmoji(profile?.talkAvatar || "panda")}</span>
            <div className="text-2xs text-ink-500 font-bold">
              Reply as: <span className="text-ink-900">{profile?.talkNickname}</span>
            </div>
          </div>
        </form>
      }
    >
      {selectedNote && (
        <div className="space-y-6 text-left">
          {/* Original Note */}
          <div className="bg-paper-2 border border-ink-200/70 p-5 rounded-3xl shadow-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-2xl">{getAvatarEmoji(selectedNote.avatar)}</span>
              <div>
                <div className="text-xs font-bold text-ink-900">{selectedNote.nickname}</div>
                <div className="text-2xs text-ink-500">Original post</div>
              </div>
            </div>
            <blockquote className="text-sm text-ink-700 leading-relaxed font-normal font-reflective">
              {selectedNote.content}
            </blockquote>
          </div>

          {/* Replies Feed list */}
          <div className="space-y-3">
            {selectedNote.replies.length === 0 ? (
              <div className="text-center py-10 text-ink-500 text-xs">
                No replies yet. Be the first to drop a kind reply.
              </div>
            ) : (
              selectedNote.replies.map((reply) => {
                const isReplyFlagged = reply.status === "FLAGGED" || reply.status === "REJECTED";

                const d = new Date(reply.createdAt);
                const isToday = d.toDateString() === new Date().toDateString();
                const stamp = isToday
                  ? d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
                  : d.toLocaleDateString(undefined, { day: "numeric", month: "short" });

                return (
                  <div
                    key={reply.id}
                    className={`border p-4 rounded-2xl shadow-xs flex flex-col justify-between text-left transition-all ${
                      isReplyFlagged
                        ? "border-coral-200 bg-coral-50"
                        : "bg-card border-ink-200/70"
                    }`}
                  >
                    {isReplyFlagged && (
                      <div
                        role="status"
                        className="mb-2.5 px-3 py-1.5 bg-coral-50 border border-coral-200 text-coral-600 text-2xs rounded-lg flex items-center gap-1.5 font-bold"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>Muted: Flagged by safety moderation. Reason: &quot;{reply.moderationReason}&quot;. Only visible to you.</span>
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getAvatarEmoji(reply.avatar)}</span>
                        <div>
                          <div className="text-xs font-bold text-ink-900">{reply.nickname}</div>
                          <div className="text-2xs text-ink-500">
                            <time dateTime={new Date(reply.createdAt).toISOString()}>{stamp}</time>
                          </div>
                        </div>
                      </div>
                      {reply.isMine && (
                        <button
                          type="button"
                          aria-label="Delete your reply"
                          onClick={() => onRequestDeleteReply(reply.id)}
                          className="p-1 text-ink-400 hover:text-coral-600 rounded hover:bg-ink-100 transition-all duration-200 border-none bg-transparent cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-ink-700 leading-relaxed font-normal pl-8">
                      {reply.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </Sheet>
  );
}
