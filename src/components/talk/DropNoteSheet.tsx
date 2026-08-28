import React, { useId } from "react";
import { Send } from "lucide-react";
import { Button, Sheet, Textarea } from "../ui";
import type { TalkProfile } from "./types";
import { getAvatarEmoji } from "./types";

interface DropNoteSheetProps {
  isOpen: boolean;
  onClose: () => void;
  noteContent: string;
  setNoteContent: (content: string) => void;
  profanityWarning: boolean;
  submittingNote: boolean;
  profile: TalkProfile | null;
  onDropNote: (e: React.FormEvent) => void;
}

export function DropNoteSheet({
  isOpen,
  onClose,
  noteContent,
  setNoteContent,
  profanityWarning,
  submittingNote,
  profile,
  onDropNote,
}: DropNoteSheetProps) {
  const formId = useId();

  return (
    <Sheet
      open={isOpen}
      onClose={onClose}
      title="Drop a note"
      size="sm"
      footer={
        <Button
          type="submit"
          form={formId}
          fullWidth
          loading={submittingNote}
          loadingLabel="Posting your note…"
          disabled={!noteContent.trim()}
          leadingIcon={<Send className="w-4 h-4" />}
        >
          Drop note
        </Button>
      }
    >
      <form id={formId} onSubmit={onDropNote} className="space-y-4 text-left">
        <Textarea
          label="Your note"
          hideLabel
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="How are you doing today? e.g. Trying to hold on. Busy week but getting through..."
          maxLength={280}
          reflective
          required
          error={profanityWarning ? "Please keep words friendly" : null}
        />

        <div className="flex items-center gap-3 bg-paper-2 p-3.5 border border-ink-200/70 rounded-2xl">
          <span className="text-2xl">{getAvatarEmoji(profile?.talkAvatar || "panda")}</span>
          <div>
            <div className="text-2xs text-ink-500 uppercase font-bold">Posting as</div>
            <div className="text-xs font-bold text-ink-900">{profile?.talkNickname}</div>
          </div>
        </div>
      </form>
    </Sheet>
  );
}
