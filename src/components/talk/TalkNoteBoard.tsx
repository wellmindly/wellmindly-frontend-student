import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  AlertCircle,
  Trash2,
  Flag,
  Pin,
  Heart,
  Smile,
  PenLine,
} from "lucide-react";
import { SegmentedControl } from "../ui";
import type { TalkRoom, TalkNote } from "./types";
import { getAvatarEmoji } from "./types";

interface TalkNoteBoardProps {
  selectedRoom: TalkRoom | null;
  onBackToRooms: () => void;
  sortOrder: "recent" | "interactive";
  setSortOrder: (order: "recent" | "interactive") => void;
  loadingNotes: boolean;
  notes: TalkNote[];
  onReact: (noteId: string, type: string) => void;
  onSelectNote: (note: TalkNote) => void;
  onOpenDropNote: () => void;
  onRequestReportNote: (noteId: string) => void;
  onRequestDeleteNote: (noteId: string) => void;
}

export function TalkNoteBoard({
  selectedRoom,
  onBackToRooms,
  sortOrder,
  setSortOrder,
  loadingNotes,
  notes,
  onReact,
  onSelectNote,
  onOpenDropNote,
  onRequestReportNote,
  onRequestDeleteNote,
}: TalkNoteBoardProps) {
  return (
    <div className="h-full bg-paper flex flex-col">
      {/* Sticky Room Subheader with controls */}
      <div className="bg-paper border-b border-ink-200/70 px-6 py-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Back to rooms"
            onClick={onBackToRooms}
            className="p-2 hover:bg-ink-100 border border-ink-200/70 rounded-xl text-ink-500 hover:text-ink-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <div className="text-left">
            <h3 className="font-display font-semibold text-ink-900 text-lg leading-tight">{selectedRoom?.name}</h3>
            <p className="text-2xs text-ink-500 mt-0.5 truncate max-w-[200px] sm:max-w-md">
              {selectedRoom?.description}
            </p>
          </div>
        </div>

        {/* Sorting Toggles */}
        <SegmentedControl<"recent" | "interactive">
          label="Sort notes"
          size="sm"
          value={sortOrder}
          onChange={setSortOrder}
          options={[
            { value: "recent", label: "Recent" },
            { value: "interactive", label: "Interactive" },
          ]}
        />
      </div>

      {/* Main Grid notes area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto">
          {loadingNotes ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-plum-600 animate-spin" />
            </div>
          ) : notes.length === 0 ? (
            <div className="bg-card border border-ink-200/70 p-12 text-center rounded-3xl shadow-sm">
              <MessageSquare className="w-12 h-12 text-ink-400 mx-auto mb-4" aria-hidden="true" />
              <h4 className="font-display font-semibold text-ink-900 text-lg">Quiet in here right now</h4>
              <p className="text-ink-500 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
                No notes dropped yet. Write something out to warm up the wall for classmates.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {notes.map((note) => {
                const meTooReacted = note.reactions.some((r) => r.isMine && r.type === "METOO");
                const supportReacted = note.reactions.some((r) => r.isMine && r.type === "SUPPORT");
                const hugReacted = note.reactions.some((r) => r.isMine && r.type === "HUG");

                const isFlagged = note.status === "FLAGGED" || note.status === "REJECTED";

                const d = new Date(note.createdAt);
                const isToday = d.toDateString() === new Date().toDateString();
                const stamp = isToday
                  ? d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
                  : d.toLocaleDateString(undefined, { day: "numeric", month: "short" });

                return (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border rounded-3xl p-5 shadow-md flex flex-col justify-between transition-all duration-300 ${
                      isFlagged
                        ? "border-coral-200 bg-coral-50"
                        : "bg-card border-ink-200/70 hover:shadow-lg"
                    }`}
                  >
                    <div>
                      {/* Safety Flag Banner */}
                      {isFlagged && (
                        <div
                          role="status"
                          className="mb-4 px-3.5 py-2 bg-coral-50 border border-coral-200 text-coral-600 text-xs rounded-xl flex items-center gap-2 font-bold leading-normal"
                        >
                          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>
                            {note.status === "FLAGGED" ? (
                              "Only you can see this. Someone on our team will read it."
                            ) : (
                              <>
                                Muted: Flagged by safety moderation because: <i>&quot;{note.moderationReason || "Violates community guidelines"}&quot;</i>. Only visible to you.
                              </>
                            )}
                          </span>
                        </div>
                      )}

                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{getAvatarEmoji(note.avatar)}</span>
                          <div className="text-left">
                            <div className="text-xs font-bold text-ink-900">{note.nickname}</div>
                            <div className="text-2xs text-ink-500">
                              <time dateTime={new Date(note.createdAt).toISOString()}>{stamp}</time>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          {note.isMine && (
                            <button
                              type="button"
                              aria-label="Delete your note"
                              onClick={() => onRequestDeleteNote(note.id)}
                              className="p-1.5 text-ink-400 hover:text-coral-600 rounded-lg hover:bg-ink-100 transition-all duration-200 border-none bg-transparent cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          )}
                          {!isFlagged && (
                            <button
                              type="button"
                              aria-label="Report this note"
                              onClick={() => onRequestReportNote(note.id)}
                              className="p-1.5 text-ink-400 hover:text-gold-600 rounded-lg hover:bg-ink-100 transition-all duration-200 border-none bg-transparent cursor-pointer"
                            >
                              <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <blockquote className="text-sm text-ink-800 leading-relaxed font-normal mb-5 text-left font-reflective">
                        {note.content}
                      </blockquote>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-ink-200/70 pt-4 mt-auto">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          aria-pressed={meTooReacted}
                          aria-label="Me too"
                          onClick={() => !isFlagged && onReact(note.id, "METOO")}
                          disabled={isFlagged}
                          className={`min-h-11 min-w-11 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border-none cursor-pointer ${
                            meTooReacted
                              ? "bg-plum-100 text-plum-600 font-extrabold"
                              : "bg-paper-2 text-ink-500 hover:text-ink-800"
                          } ${isFlagged ? "opacity-35 cursor-not-allowed" : ""}`}
                        >
                          <Pin className="w-3.5 h-3.5" aria-hidden="true" /> {note.meTooCount}
                        </button>

                        <button
                          type="button"
                          aria-pressed={supportReacted}
                          aria-label="Sending support"
                          onClick={() => !isFlagged && onReact(note.id, "SUPPORT")}
                          disabled={isFlagged}
                          className={`min-h-11 min-w-11 flex items-center justify-center p-1.5 rounded-xl transition-all duration-200 border-none cursor-pointer ${
                            supportReacted ? "bg-coral-50 text-coral-600" : "bg-paper-2 text-ink-500 hover:text-ink-800"
                          } ${isFlagged ? "opacity-35 cursor-not-allowed" : ""}`}
                        >
                          <Heart className="w-3.5 h-3.5" aria-hidden="true" fill={supportReacted ? "currentColor" : "none"} />
                        </button>

                        <button
                          type="button"
                          aria-pressed={hugReacted}
                          aria-label="Been there"
                          onClick={() => !isFlagged && onReact(note.id, "HUG")}
                          disabled={isFlagged}
                          className={`min-h-11 min-w-11 flex items-center justify-center p-1.5 rounded-xl transition-all duration-200 border-none cursor-pointer ${
                            hugReacted ? "bg-gold-100 text-gold-600" : "bg-paper-2 text-ink-500 hover:text-ink-800"
                          } ${isFlagged ? "opacity-35 cursor-not-allowed" : ""}`}
                        >
                          <Smile className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectNote(note)}
                        className="text-xs font-bold text-plum-600 hover:text-plum-hover flex items-center gap-1 cursor-pointer border-none bg-transparent"
                      >
                        <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{note.replies.length} replies</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button (FAB) to write note */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          type="button"
          aria-label="Write a note"
          onClick={onOpenDropNote}
          className="h-14 w-14 rounded-full bg-plum-500 text-plum-50 shadow-lg hover:bg-plum-hover transition-all flex items-center justify-center scale-100 hover:scale-105 active:scale-95 cursor-pointer border-none"
        >
          <PenLine className="w-6 h-6" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
