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
      {/* Room subheader. The title row and the sort control stack below `sm`: sharing
          one line at 375px pushed the Recent/Interactive toggle off the right edge. */}
      <div className="shrink-0 border-b border-ink-200/70 bg-paper px-4 py-3 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Back to rooms"
            onClick={onBackToRooms}
            className="shrink-0 p-2 hover:bg-ink-100 border border-ink-200/70 rounded-xl text-ink-500 hover:text-ink-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <div className="min-w-0 text-left">
            <h3 className="font-display font-semibold text-ink-900 text-base leading-tight sm:text-lg">
              {selectedRoom?.name}
            </h3>
            <p className="text-2xs text-ink-500 mt-0.5 truncate">{selectedRoom?.description}</p>
          </div>
        </div>

        {/* Sorting Toggles - full width on its own row on mobile, inline from sm up. */}
        <div className="mt-3 sm:mt-0 sm:shrink-0">
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
      </div>

      {/* Main Grid notes area. The tail padding clears the extended FAB, which floats
          over this scroller - without it the last note sits under the button. */}
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-28 sm:px-6 sm:py-6 sm:pb-28">
        <div className="max-w-2xl mx-auto">
          {loadingNotes ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-plum-600 animate-spin" />
            </div>
          ) : notes.length === 0 ? (
            <div className="bg-card border border-ink-200/70 p-8 text-center rounded-3xl shadow-sm sm:p-12">
              <MessageSquare className="w-12 h-12 text-ink-400 mx-auto mb-4" aria-hidden="true" />
              <h4 className="font-display font-semibold text-ink-900 text-lg">Quiet in here right now</h4>
              <p className="text-ink-500 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
                No notes dropped yet. Write something out to warm up the wall for classmates.
              </p>
              {/* An empty board with only a floating icon gave no clue that writing was
                  possible. This is the same action, spelled out where the eye already is. */}
              <button
                type="button"
                onClick={onOpenDropNote}
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-plum-500 px-5 text-sm font-bold text-plum-50 transition-colors hover:bg-plum-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400 cursor-pointer border-none"
              >
                <PenLine className="h-4 w-4" aria-hidden="true" />
                Drop the first note
              </button>
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

      {/* Extended FAB. A bare 56px circle with a pen glyph read as decoration - nothing
          on it said "you can write here". The label is always visible, and the button
          sits above the home-indicator inset so it is reachable on a notched phone. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(1.25rem+var(--safe-area-bottom))] z-[var(--z-nav)] flex justify-end px-4 sm:px-6">
        <motion.button
          type="button"
          onClick={onOpenDropNote}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="pointer-events-auto inline-flex min-h-14 items-center gap-2.5 rounded-full bg-plum-500 pl-5 pr-6 text-sm font-bold text-plum-50 shadow-lg transition-colors hover:bg-plum-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400 cursor-pointer border-none"
        >
          <PenLine className="h-5 w-5 shrink-0" aria-hidden="true" />
          Drop a note
        </motion.button>
      </div>
    </div>
  );
}
