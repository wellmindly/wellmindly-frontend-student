import { motion } from "framer-motion";
import { BookOpen, ArrowRight, Loader2 } from "lucide-react";
import type { TalkRoom, TalkProfile } from "./types";
import { getAvatarEmoji } from "./types";
import { EmptyState, ErrorState } from "../ui";

interface TalkRoomListProps {
  profile: TalkProfile | null;
  rooms: TalkRoom[];
  loadingRooms: boolean;
  /** Set when the rooms request failed. Distinct from "loaded, and there are none". */
  roomsError?: boolean;
  onRetryRooms?: () => void;
  onSelectRoom: (room: TalkRoom) => void;
}

export function TalkRoomList({
  profile,
  rooms,
  loadingRooms,
  roomsError = false,
  onRetryRooms,
  onSelectRoom,
}: TalkRoomListProps) {
  return (
    <div className="h-full bg-paper overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
      <div className="max-w-2xl mx-auto space-y-6 text-left sm:space-y-8">
        {/* Header Row. Wraps rather than squeezing: at 375px the identity chip and
            the heading cannot share a line, and forcing them to broke both. */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-display font-semibold text-2xl text-ink-900 sm:text-3xl">TalkRooms</h2>
            <p className="text-ink-500 text-xs mt-1">Enter any slow, warm room below to read and drop reflections.</p>
          </div>

          {/* Short Profile summary in Room List */}
          {profile && (
            <div className="flex shrink-0 items-center gap-2 rounded-full border border-ink-200/70 bg-card px-3 py-2">
              <span className="text-xl leading-none">{getAvatarEmoji(profile.talkAvatar || "panda")}</span>
              <div className="text-left">
                <div className="text-2xs text-ink-500 uppercase font-bold whitespace-nowrap">Posting as</div>
                <div className="text-xs font-bold text-ink-800 whitespace-nowrap">{profile.talkNickname}</div>
              </div>
            </div>
          )}
        </div>

        {loadingRooms ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-plum-600 animate-spin" />
          </div>
        ) : roomsError ? (
          <ErrorState
            title="We couldn't load the rooms"
            description="This is on our side, not yours. Nothing you've written anywhere is affected."
            onRetry={onRetryRooms}
          />
        ) : rooms.length === 0 ? (
          /* A room list is opened by staff, so a student cannot fill this themselves —
             the honest empty state says who does and offers no action that would fail. */
          <EmptyState
            icon={<BookOpen className="h-6 w-6" />}
            title="No rooms are open yet"
            description="TalkRooms open when your campus turns them on. When one does, it shows up here and you can read before you write anything."
            tone="primary"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((room) => (
              <motion.button
                type="button"
                key={room.id}
                onClick={() => onSelectRoom(room)}
                whileHover={{ scale: 1.015, y: -2 }}
                className="w-full text-left bg-card border border-ink-200/70 rounded-3xl p-6 shadow-md hover:shadow-lg hover:border-plum-200 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
              >
                <div className="text-left">
                  <div className="w-10 h-10 bg-plum-100 rounded-2xl flex items-center justify-center mb-4 text-plum-600 group-hover:bg-plum-500 group-hover:text-plum-50 transition-colors duration-300">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-semibold text-ink-900 text-lg">{room.name}</h3>
                  {room.description && (
                    <p className="text-ink-500 text-xs mt-1.5 leading-relaxed">
                      {room.description}
                    </p>
                  )}
                </div>
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-ink-200/70 text-2xs font-bold text-plum-600 group-hover:text-plum-hover">
                  <span>Enter Room</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
