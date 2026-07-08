import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Trash2,
  AlertCircle,
  Loader2,
  Smile,
  ShieldCheck,
  RefreshCw,
  Heart,
  Flag,
  ArrowLeft,
  Pin,
  ArrowRight,
  Sparkles,
  BookOpen
} from "lucide-react";
import api from "../../services/api";

interface TalkRoom {
  id: string;
  name: string;
  description: string;
}

interface TalkReply {
  id: string;
  userId: string;
  nickname: string;
  avatar: string;
  content: string;
  status: string;
  moderationReason: string | null;
  createdAt: string;
}

interface TalkReaction {
  id: string;
  userId: string;
  type: string;
}

interface TalkNote {
  id: string;
  userId: string;
  nickname: string;
  avatar: string;
  content: string;
  status: string;
  moderationReason: string | null;
  meTooCount: number;
  createdAt: string;
  replies: TalkReply[];
  reactions: TalkReaction[];
}

interface TalkProfile {
  talkNickname: string | null;
  talkAvatar: string | null;
  talkBio: string | null;
  talkTermsAccepted: boolean;
}

const AVATARS = [
  { id: "panda", emoji: "🐼", name: "Panda" },
  { id: "fox", emoji: "🦊", name: "Fox" },
  { id: "owl", emoji: "🦉", name: "Owl" },
  { id: "koala", emoji: "🐨", name: "Koala" },
  { id: "rabbit", emoji: "🐰", name: "Rabbit" },
  { id: "tiger", emoji: "🐯", name: "Tiger" },
  { id: "bear", emoji: "🐻", name: "Bear" },
  { id: "lion", emoji: "🦁", name: "Lion" },
  { id: "cat", emoji: "🐱", name: "Cat" },
  { id: "frog", emoji: "🐸", name: "Frog" }
];

const ADJECTIVES = ["Quiet", "Steady", "Peaceful", "Gentle", "Kind", "Warm", "Calm", "Soft", "Thoughtful", "Friendly", "Brave", "Joyful"];

// Client-side lightweight profanity word-filter
const BANNED_WORDS = [
  "fuck", "shit", "bitch", "asshole", "bastard", "cunt", "nigger", "retard", "faggot",
  "suck", "dick", "cock", "pussy", "sex", "boobs", "penis", "vagina", "cum", "horny",
  "blowjob", "whore", "slut"
];

export function TalkMindlyTab() {
  const [profile, setProfile] = useState<TalkProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeScreen, setActiveScreen] = useState<"onboarding-terms" | "onboarding-profile" | "room-list" | "room-detail">("onboarding-terms");

  // Profile Onboarding State
  const [nicknameInput, setNicknameInput] = useState("");
  const [avatarInput, setAvatarInput] = useState("panda");
  const [bioInput, setBioInput] = useState("");
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Rooms and Note States
  const [rooms, setRooms] = useState<TalkRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<TalkRoom | null>(null);
  const [notes, setNotes] = useState<TalkNote[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [sortOrder, setSortOrder] = useState<"recent" | "interactive">("recent");

  // Note dropping
  const [noteContent, setNoteContent] = useState("");
  const [isDropNoteOpen, setIsDropNoteOpen] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);
  const [profanityWarning, setProfanityWarning] = useState(false);

  // Threaded replies panel
  const [selectedNote, setSelectedNote] = useState<TalkNote | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Custom Alert Modals State
  const [customAlert, setCustomAlert] = useState<{
    show: boolean;
    type: 'confirm-report' | 'confirm-delete' | 'confirm-delete-reply' | 'info-flagged' | 'error';
    targetId?: string;
    message: string;
  }>({ show: false, type: 'error', message: '' });

  // Crisis Safety alert (ai flagged response)
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [crisisAlertMessage, setCrisisAlertMessage] = useState("");

  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Retrieve current user info
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u && u.id) setCurrentUserId(u.id);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Fetch Talk Profile
  const fetchProfile = async () => {
    try {
      const response = await api.get("/talk/profile");
      const data = response.data as TalkProfile;
      setProfile(data);
      if (!data.talkTermsAccepted) {
        setActiveScreen("onboarding-terms");
      } else if (!data.talkNickname) {
        setActiveScreen("onboarding-profile");
        rollRandomIdentity();
      } else {
        setActiveScreen("room-list");
      }
    } catch (err) {
      console.error("Failed to fetch Talk profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch rooms list
  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const response = await api.get("/talk/rooms");
      setRooms(response.data);
    } catch (err) {
      console.error("Failed to fetch TalkRooms:", err);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (activeScreen === "room-list") {
      fetchRooms();
    }
  }, [activeScreen]);

  // Fetch notes when room or sorting shifts
  useEffect(() => {
    const room = selectedRoom;
    if (!room) return;
    const roomId = room.id;

    async function getNotes() {
      setLoadingNotes(true);
      try {
        const response = await api.get(`/talk/rooms/${roomId}/notes?sort=${sortOrder}`);
        setNotes(response.data);
      } catch (err) {
        console.error("Error fetching room notes:", err);
      } finally {
        setLoadingNotes(false);
      }
    }
    getNotes();
  }, [selectedRoom, sortOrder]);

  const rollRandomIdentity = () => {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const av = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    setNicknameInput(`${adj} ${av.name}`);
    setAvatarInput(av.id);
  };

  const handleAcceptTerms = () => {
    setActiveScreen("onboarding-profile");
    rollRandomIdentity();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim() || savingProfile) return;

    setSavingProfile(true);
    setProfileError("");
    try {
      const response = await api.post("/talk/profile", {
        nickname: nicknameInput.trim(),
        avatar: avatarInput,
        bio: bioInput.trim(),
        acceptTerms: true
      });
      setProfile(response.data);
      setActiveScreen("room-list");
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      setProfileError(err.response?.data?.error || "Failed to set up identity. Please choose a different nickname.");
    } finally {
      setSavingProfile(false);
    }
  };

  const containsProfanity = (text: string): boolean => {
    const lower = text.toLowerCase();
    return BANNED_WORDS.some(word => lower.includes(word));
  };

  const handleDropNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const room = selectedRoom;
    if (!noteContent.trim() || submittingNote || !room) return;

    if (containsProfanity(noteContent)) {
      setProfanityWarning(true);
      setTimeout(() => setProfanityWarning(false), 4000);
      return;
    }

    setSubmittingNote(true);
    try {
      const response = await api.post(`/talk/rooms/${room.id}/notes`, {
        content: noteContent
      });

      const { note, isCrisis, message } = response.data;

      if (isCrisis) {
        setCrisisAlertMessage(message);
        setIsCrisisModalOpen(true);
      } else {
        setNotes((prev) => [note, ...prev]);
        setNoteContent("");
        setIsDropNoteOpen(false);
        // Refresh notes in 3 seconds to fetch the updated background safety classification state
        setTimeout(async () => {
          try {
            const fresh = await api.get(`/talk/rooms/${room.id}/notes?sort=${sortOrder}`);
            setNotes(fresh.data);
          } catch (e) {}
        }, 3000);
      }
    } catch (err: any) {
      console.error("Failed to drop note:", err);
      setCustomAlert({ show: true, type: 'error', message: err.response?.data?.error || "Failed to drop note" });
    } finally {
      setSubmittingNote(false);
    }
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || submittingReply || !selectedNote) return;

    if (containsProfanity(replyContent)) {
      setProfanityWarning(true);
      setTimeout(() => setProfanityWarning(false), 4000);
      return;
    }

    setSubmittingReply(true);
    try {
      const response = await api.post(`/talk/notes/${selectedNote.id}/replies`, {
        content: replyContent
      });

      const { reply, isCrisis, message } = response.data;

      if (isCrisis) {
        setCrisisAlertMessage(message);
        setIsCrisisModalOpen(true);
      } else {
        const updatedReplies = [...selectedNote.replies, reply];
        const updatedNote = { ...selectedNote, replies: updatedReplies };
        setNotes((prev) => prev.map((n) => (n.id === selectedNote.id ? updatedNote : n)));
        setSelectedNote(updatedNote);
        setReplyContent("");

        // Refresh notes in 3 seconds to fetch safety verification result
        setTimeout(async () => {
          if (!selectedRoom) return;
          try {
            const fresh = await api.get(`/talk/rooms/${selectedRoom.id}/notes?sort=${sortOrder}`);
            setNotes(fresh.data);
            const matchingNote = fresh.data.find((n: TalkNote) => n.id === selectedNote.id);
            if (matchingNote) setSelectedNote(matchingNote);
          } catch (e) {}
        }, 3000);
      }
    } catch (err: any) {
      console.error("Failed to post reply:", err);
      setCustomAlert({ show: true, type: 'error', message: err.response?.data?.error || "Failed to add reply" });
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleReact = async (noteId: string, type: "SUPPORT" | "HUG" | "METOO") => {
    try {
      const response = await api.post(`/talk/notes/${noteId}/react`, { type });
      const { status } = response.data;

      setNotes((prev) =>
        prev.map((n) => {
          if (n.id !== noteId) return n;

          let updatedReactions = [...n.reactions];
          let updatedMeTooCount = n.meTooCount;

          if (status === "added") {
            updatedReactions.push({ id: Math.random().toString(), userId: currentUserId, type });
            if (type === "METOO") updatedMeTooCount += 1;
          } else {
            updatedReactions = updatedReactions.filter((r) => !(r.userId === currentUserId && r.type === type));
            if (type === "METOO") updatedMeTooCount -= 1;
          }

          const updatedNote = { ...n, reactions: updatedReactions, meTooCount: updatedMeTooCount };
          if (selectedNote && selectedNote.id === noteId) {
            setSelectedNote(updatedNote);
          }
          return updatedNote;
        })
      );
    } catch (err) {
      console.error("Failed to react:", err);
    }
  };

  const executeReportNote = async (noteId: string) => {
    try {
      await api.post(`/talk/notes/${noteId}/report`);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (selectedNote && selectedNote.id === noteId) {
        setSelectedNote(null);
      }
      setCustomAlert({ show: true, type: 'info-flagged', message: 'Note has been reported successfully and hidden pending human moderation review.' });
    } catch (err) {
      console.error("Failed to report note:", err);
    }
  };

  const executeDeleteNote = async (noteId: string) => {
    try {
      await api.delete(`/talk/notes/${noteId}`);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (selectedNote && selectedNote.id === noteId) {
        setSelectedNote(null);
      }
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const executeDeleteReply = async (replyId: string) => {
    try {
      await api.delete(`/talk/replies/${replyId}`);
      if (selectedNote) {
        const updatedReplies = selectedNote.replies.filter((r) => r.id !== replyId);
        const updatedNote = { ...selectedNote, replies: updatedReplies };
        setNotes((prev) => prev.map((n) => (n.id === selectedNote.id ? updatedNote : n)));
        setSelectedNote(updatedNote);
      }
    } catch (err) {
      console.error("Failed to delete reply:", err);
    }
  };

  const getAvatarEmoji = (avId: string) => {
    return AVATARS.find((a) => a.id === avId)?.emoji || "🐼";
  };

  if (loadingProfile) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0b0d11] talkmindly-font-sans">
        <Loader2 className="w-8 h-8 text-plum animate-spin" />
      </div>
    );
  }

  // Phase 1: Onboarding - Terms & Safety Rules
  if (activeScreen === "onboarding-terms") {
    return (
      <div className="h-full flex items-center justify-center bg-[#0b0d11] talkmindly-font-sans p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-[#131722] rounded-3xl p-8 border border-[#212534]/50 shadow-2xl text-center"
        >
          <div className="w-14 h-14 bg-plum/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-plum">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="font-serif font-black text-2xl text-white mb-2">Welcome to TalkMindly</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-6">Peer support rules & guidelines</p>
          
          <div className="text-left space-y-4 mb-8 text-xs text-slate-300 leading-relaxed max-h-[260px] overflow-y-auto pr-2">
            <div className="p-3.5 bg-[#1a1f2e] rounded-xl border border-[#262c3e]">
              <h4 className="font-bold text-white">1. Anonymity is Protected</h4>
              <p className="mt-1 text-slate-400">Students will only see your custom nickname and avatar. Real names are kept private.</p>
            </div>
            <div className="p-3.5 bg-[#1a1f2e] rounded-xl border border-[#262c3e]">
              <h4 className="font-bold text-white">2. Safety Accountability</h4>
              <p className="mt-1 text-slate-400">All notes link privately to your account backend. If AI safety flags crisis content, it routes directly to clinical overrides.</p>
            </div>
            <div className="p-3.5 bg-[#1a1f2e] rounded-xl border border-[#262c3e]">
              <h4 className="font-bold text-white">3. Kind Interactions Only</h4>
              <p className="mt-1 text-slate-400">We enforce supportive signals. Profanity is filtered, and reports hide notes immediately.</p>
            </div>
          </div>

          <button
            onClick={handleAcceptTerms}
            className="w-full bg-plum hover:bg-plum/90 text-white font-bold text-sm py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-plum/25 flex items-center justify-center gap-2 cursor-pointer border-none"
          >
            I Accept terms & guidelines <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  // Phase 2: Onboarding - Create Identity Profile
  if (activeScreen === "onboarding-profile") {
    return (
      <div className="h-full flex items-center justify-center bg-[#0b0d11] talkmindly-font-sans p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-[#131722] rounded-3xl p-8 border border-[#212534]/50 shadow-2xl text-left"
        >
          <h2 className="font-serif font-black text-2xl text-white mb-2">Create Your Identity</h2>
          <p className="text-slate-400 text-xs mb-6">Choose an avatar and nickname. Your identity is locked once saved.</p>
          
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {profileError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/35 text-rose-400 text-xs rounded-xl flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" /> {profileError}
              </div>
            )}

            {/* Avatar Selector Grid */}
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-3 uppercase tracking-wider">Select Avatar Icon</label>
              <div className="grid grid-cols-5 gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setAvatarInput(av.id)}
                    className={`text-3xl p-2 rounded-2xl hover:bg-[#1a1f2e] transition-all duration-200 border-2 ${
                      avatarInput === av.id ? "border-plum bg-plum/10" : "border-transparent bg-transparent"
                    }`}
                  >
                    {av.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Nickname Selector */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Your Nickname</label>
                <button
                  type="button"
                  onClick={rollRandomIdentity}
                  className="flex items-center gap-1 text-[11px] font-bold text-plum hover:text-plum/80"
                >
                  <RefreshCw className="w-3 h-3 animate-spin-hover" /> Roll Random
                </button>
              </div>
              <input
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                placeholder="e.g. Quiet Panda"
                maxLength={25}
                className="w-full p-3.5 text-sm bg-[#1a1f2e] text-white border border-[#262c3e] rounded-xl focus:outline-none focus:ring-1 focus:ring-plum placeholder:text-slate-500"
                required
              />
            </div>

            {/* Bio / About */}
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wider">Small Bio / About</label>
              <textarea
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                placeholder="A tiny line about you... e.g. Just a junior studying CS, trying to pace myself."
                maxLength={160}
                className="w-full min-h-[70px] p-3.5 text-sm bg-[#1a1f2e] text-white border border-[#262c3e] rounded-xl focus:outline-none focus:ring-1 focus:ring-plum resize-none placeholder:text-slate-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block text-right">{bioInput.length}/160 characters</span>
            </div>

            <button
              type="submit"
              disabled={savingProfile || !nicknameInput.trim()}
              className="w-full bg-plum hover:bg-plum/90 text-white font-bold text-sm py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-plum/25 flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              {savingProfile ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Save & Enter Board <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Phase 3: Room Landing Directory Screen
  if (activeScreen === "room-list") {
    return (
      <div className="h-full bg-[#0b0d11] talkmindly-font-sans overflow-y-auto px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-8 text-left">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-black text-3xl text-white">TalkRooms</h2>
              <p className="text-slate-400 text-xs mt-1">Enter any slow, warm room below to read and drop reflections.</p>
            </div>
            
            {/* Short Profile summary in Room List */}
            {profile && (
              <div className="flex items-center gap-2 bg-[#131722] border border-[#212534]/50 p-2.5 rounded-full px-4">
                <span className="text-xl">{getAvatarEmoji(profile.talkAvatar || "panda")}</span>
                <div className="text-left">
                  <div className="text-[9px] text-slate-400 uppercase font-black">Anonymous</div>
                  <div className="text-xs font-bold text-slate-200">{profile.talkNickname}</div>
                </div>
              </div>
            )}
          </div>

          {loadingRooms ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-plum animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <motion.div
                  key={room.id}
                  onClick={() => {
                    setSelectedRoom(room);
                    setActiveScreen("room-detail");
                  }}
                  whileHover={{ scale: 1.015, y: -2 }}
                  className="bg-[#131722] border border-[#212534]/50 rounded-3xl p-6 shadow-md hover:shadow-xl hover:border-plum/20 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="text-left">
                    <div className="w-10 h-10 bg-plum/10 rounded-2xl flex items-center justify-center mb-4 text-plum group-hover:bg-plum group-hover:text-white transition-colors duration-300">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif font-bold text-white text-lg">{room.name}</h3>
                    <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                      {room.description || "Room description coming soon..."}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#1d212d] text-[11px] font-bold text-plum group-hover:text-plum-hover">
                    <span>Enter Room</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Phase 4: Room Detail wall of notes (Twitter / Threads style)
  return (
    <div className="h-full bg-[#0b0d11] talkmindly-font-sans flex flex-col">
      {/* Sticky Room Subheader with controls */}
      <div className="bg-[#12141c] border-b border-[#212431] px-6 py-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedRoom(null);
              setActiveScreen("room-list");
            }}
            className="p-2 hover:bg-[#1d212d] border border-[#2d3347] rounded-xl text-slate-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-left">
            <h3 className="font-serif font-bold text-white text-lg leading-tight">{selectedRoom?.name}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px] sm:max-w-md">
              {selectedRoom?.description}
            </p>
          </div>
        </div>

        {/* Sorting Toggles */}
        <div className="flex gap-1.5 bg-[#171922] p-1 rounded-full border border-[#212431]">
          <button
            onClick={() => setSortOrder("recent")}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
              sortOrder === "recent" ? "bg-[#252835] text-white shadow-sm" : "text-slate-400"
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setSortOrder("interactive")}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
              sortOrder === "interactive" ? "bg-[#252835] text-white shadow-sm" : "text-slate-400"
            }`}
          >
            Interactive
          </button>
        </div>
      </div>

      {/* Main Grid notes area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto">
          {loadingNotes ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-plum animate-spin" />
            </div>
          ) : notes.length === 0 ? (
            <div className="bg-[#131722] border border-[#212534]/50 p-12 text-center rounded-3xl shadow-lg">
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h4 className="font-serif font-black text-white text-lg">Quiet in here right now</h4>
              <p className="text-slate-400 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
                No notes dropped yet. Write something out to warm up the wall for classmates.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {notes.map((note) => {
                const meTooReacted = note.reactions.some((r) => r.userId === currentUserId && r.type === "METOO");
                const supportReacted = note.reactions.some((r) => r.userId === currentUserId && r.type === "SUPPORT");
                const hugReacted = note.reactions.some((r) => r.userId === currentUserId && r.type === "HUG");

                const isFlagged = note.status === "FLAGGED" || note.status === "REJECTED";

                return (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border rounded-3xl p-5 shadow-md flex flex-col justify-between transition-all duration-300 ${
                      isFlagged
                        ? "border-rose-500/25 bg-rose-950/10"
                        : "bg-[#131722] border-[#212534]/50 hover:shadow-lg"
                    }`}
                  >
                    <div>
                      {/* Safety Flag Banner */}
                      {isFlagged && (
                        <div className="mb-4 px-3.5 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2 font-bold leading-normal">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>Muted: Flagged by safety moderation because: <i>"{note.moderationReason || "Violates community guidelines"}"</i>. Only visible to you.</span>
                        </div>
                      )}

                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{getAvatarEmoji(note.avatar)}</span>
                          <div style={{ textAlign: "left" }}>
                            <div className="text-xs font-black text-slate-200">{note.nickname}</div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          {note.userId === currentUserId && (
                            <button
                              onClick={() => setCustomAlert({
                                show: true,
                                type: 'confirm-delete',
                                targetId: note.id,
                                message: 'Are you sure you want to permanently delete this note?'
                              })}
                              className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-all duration-200 border-none bg-transparent cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {!isFlagged && (
                            <button
                              onClick={() => setCustomAlert({
                                show: true,
                                type: 'confirm-report',
                                targetId: note.id,
                                message: 'Report this peer note for safety or toxicity review?'
                              })}
                              className="p-1.5 text-slate-500 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition-all duration-200 border-none bg-transparent cursor-pointer"
                            >
                              <Flag className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-[15px] text-slate-200 leading-relaxed font-normal mb-5 text-left talkmindly-font-serif">
                        "{note.content}"
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-[#1d212d] pt-4 mt-auto">
                      <div className="flex gap-2">
                        <button
                          onClick={() => !isFlagged && handleReact(note.id, "METOO")}
                          disabled={isFlagged}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border-none cursor-pointer ${
                            meTooReacted
                              ? "bg-plum/10 text-plum font-extrabold"
                              : "bg-[#1a1f2e] text-slate-400 hover:text-slate-200"
                          } ${isFlagged ? "opacity-35 cursor-not-allowed" : ""}`}
                        >
                          <Pin className="w-3.5 h-3.5" /> {note.meTooCount}
                        </button>

                        <button
                          onClick={() => !isFlagged && handleReact(note.id, "SUPPORT")}
                          disabled={isFlagged}
                          className={`flex items-center justify-center p-1.5 rounded-xl transition-all duration-200 border-none cursor-pointer ${
                            supportReacted ? "bg-rose-500/10 text-rose-400" : "bg-[#1a1f2e] text-slate-400"
                          } ${isFlagged ? "opacity-35 cursor-not-allowed" : ""}`}
                        >
                          <Heart className="w-3.5 h-3.5" fill={supportReacted ? "currentColor" : "none"} />
                        </button>

                        <button
                          onClick={() => !isFlagged && handleReact(note.id, "HUG")}
                          disabled={isFlagged}
                          className={`flex items-center justify-center p-1.5 rounded-xl transition-all duration-200 border-none cursor-pointer ${
                            hugReacted ? "bg-amber-500/10 text-amber-400" : "bg-[#1a1f2e] text-slate-400"
                          } ${isFlagged ? "opacity-35 cursor-not-allowed" : ""}`}
                        >
                          <Smile className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => setSelectedNote(note)}
                        className="text-xs font-bold text-plum hover:text-plum-hover flex items-center gap-1 cursor-pointer border-none bg-transparent"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
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
          onClick={() => setIsDropNoteOpen(true)}
          className="h-14 w-14 rounded-full bg-plum text-white shadow-xl shadow-plum/20 hover:bg-plum-hover transition-all flex items-center justify-center scale-100 hover:scale-105 active:scale-95 cursor-pointer border-none"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      </div>

      {/* Slide-over sheet for Drop Note */}
      <AnimatePresence>
        {isDropNoteOpen && (
          <div className="fixed inset-0 bg-[#000]/60 backdrop-blur-sm z-40 flex items-end sm:items-center sm:justify-center">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full sm:max-w-md bg-[#0f1118] border-t sm:border border-[#212534] shadow-2xl p-6 rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif font-black text-white text-lg">Drop a Note</h3>
                <button
                  onClick={() => setIsDropNoteOpen(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-300 bg-[#1a1f2e] border border-[#2d3347] rounded-full hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleDropNote} className="space-y-4 text-left">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="How are you doing today? e.g. Trying to hold on. Busy week but getting through..."
                  maxLength={280}
                  className="w-full min-h-[140px] p-4 text-sm bg-[#161a24] text-white border border-[#262c3e] rounded-2xl focus:outline-none focus:ring-1 focus:ring-plum resize-none placeholder:text-slate-500 talkmindly-font-serif"
                  style={{ fontSize: "14.5px", lineHeight: "1.6" }}
                  required
                />

                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>{noteContent.length}/280 characters</span>
                  {profanityWarning && (
                    <span className="text-rose-400 font-bold flex items-center gap-1 animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5" /> Please keep words friendly
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 bg-[#131722] p-3.5 border border-[#212534]/50 rounded-2xl">
                  <span className="text-2xl">{getAvatarEmoji(profile?.talkAvatar || "panda")}</span>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase font-black">Posting as</div>
                    <div className="text-xs font-black text-slate-200">{profile?.talkNickname}</div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingNote || !noteContent.trim()}
                  className="w-full bg-plum hover:bg-plum-hover disabled:opacity-50 text-white font-bold text-sm py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-plum/25 flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  {submittingNote ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Drop Note
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-over sheet for replies */}
      <AnimatePresence>
        {selectedNote && (
          <div className="fixed inset-0 bg-[#000]/60 backdrop-blur-sm z-40 flex justify-end">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md h-full bg-[#0f1118] border-l border-[#212534] shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                {/* Drawer Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedNote(null)}
                      className="p-2 hover:bg-[#1a1f2e] border border-[#2d3347] rounded-xl text-slate-300 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h3 className="font-serif font-black text-white text-lg">Replies</h3>
                  </div>
                </div>

                {/* Original Note */}
                <div className="bg-[#131722] border border-[#212534]/50 p-5 rounded-3xl mb-6 shadow-md text-left">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-2xl">{getAvatarEmoji(selectedNote.avatar)}</span>
                    <div>
                      <div className="text-xs font-black text-slate-200">{selectedNote.nickname}</div>
                      <div className="text-[10px] text-slate-400">Original post</div>
                    </div>
                  </div>
                  <div className="text-[14.5px] text-slate-300 leading-relaxed font-normal talkmindly-font-serif">
                    "{selectedNote.content}"
                  </div>
                </div>

                {/* Replies Feed list */}
                <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2">
                  {selectedNote.replies.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      No replies yet. Be the first to drop a kind reply.
                    </div>
                  ) : (
                    selectedNote.replies.map((reply) => {
                      const isReplyFlagged = reply.status === "FLAGGED" || reply.status === "REJECTED";

                      return (
                        <div
                          key={reply.id}
                          className={`border p-4 rounded-2xl shadow-md flex flex-col justify-between text-left transition-all ${
                            isReplyFlagged
                              ? "border-rose-500/20 bg-rose-950/10"
                              : "bg-[#131722] border-[#212534]/30"
                          }`}
                        >
                          {isReplyFlagged && (
                            <div className="mb-2.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] rounded-lg flex items-center gap-1.5 font-bold">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>Muted: Flagged by safety moderation. Reason: "{reply.moderationReason}". Only visible to you.</span>
                            </div>
                          )}

                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{getAvatarEmoji(reply.avatar)}</span>
                              <div>
                                <div className="text-xs font-bold text-slate-200">{reply.nickname}</div>
                                <div className="text-[9px] text-slate-400">
                                  {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                            {reply.userId === currentUserId && (
                              <button
                                onClick={() => setCustomAlert({
                                  show: true,
                                  type: 'confirm-delete-reply',
                                  targetId: reply.id,
                                  message: 'Are you sure you want to permanently delete this reply?'
                                })}
                                className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-all duration-200 border-none bg-transparent cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <div className="text-xs text-slate-300 leading-relaxed font-normal pl-8">
                            {reply.content}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Reply Input Form */}
              <div className="border-t border-[#1d212d] pt-4 mt-6 bg-[#0f1118]">
                <form onSubmit={handlePostReply} className="space-y-3 text-left">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Add a friendly reply..."
                      className="flex-1 p-3.5 text-xs bg-[#161a24] text-white border border-[#262c3e] rounded-xl focus:outline-none focus:ring-1 focus:ring-plum placeholder:text-slate-500"
                      style={{ fontSize: "13px" }}
                      required
                    />
                    <button
                      type="submit"
                      disabled={submittingReply || !replyContent.trim()}
                      className="bg-plum hover:bg-plum-hover disabled:opacity-50 text-white p-3.5 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer border-none"
                    >
                      {submittingReply ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 p-2 bg-[#131722] border border-[#212534]/50 rounded-xl">
                    <span className="text-xl">{getAvatarEmoji(profile?.talkAvatar || "panda")}</span>
                    <div className="text-[10px] text-slate-400 font-bold">Reply as: <span className="text-slate-200">{profile?.talkNickname}</span></div>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Safety / Crisis Alert Modal */}
      <AnimatePresence>
        {isCrisisModalOpen && (
          <div className="fixed inset-0 bg-[#000]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#131722] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-500/20 text-center talkmindly-font-sans"
            >
              <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-black text-white text-lg mb-2">We are here with you</h3>
              <p className="text-slate-300 text-xs leading-relaxed mb-6">
                {crisisAlertMessage}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setIsCrisisModalOpen(false)}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all duration-300 cursor-pointer border-none"
                >
                  Close & Contact Support
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Alert/Confirm Dialogue Overlay */}
      <AnimatePresence>
        {customAlert.show && (
          <div className="fixed inset-0 bg-[#000]/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#131722] border border-[#2d3347] rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center talkmindly-font-sans"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                customAlert.type.startsWith('confirm') ? 'bg-plum/15 text-plum' : 'bg-emerald-500/15 text-emerald-400'
              }`}>
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-black text-white text-md mb-2">
                {customAlert.type === 'confirm-report' ? 'Report Note' :
                 customAlert.type === 'confirm-delete' ? 'Delete Note' :
                 customAlert.type === 'confirm-delete-reply' ? 'Delete Reply' : 'Status'}
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed mb-6">
                {customAlert.message}
              </p>

              <div className="flex gap-2">
                {customAlert.type.startsWith('confirm') ? (
                  <>
                    <button
                      onClick={() => setCustomAlert({ show: false, type: 'error', message: '' })}
                      className="flex-1 bg-[#1a1f2e] hover:bg-[#252a3b] border border-[#2d3347] text-slate-300 font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const targetId = customAlert.targetId || '';
                        setCustomAlert({ show: false, type: 'error', message: '' });
                        if (customAlert.type === 'confirm-report') {
                          executeReportNote(targetId);
                        } else if (customAlert.type === 'confirm-delete') {
                          executeDeleteNote(targetId);
                        } else if (customAlert.type === 'confirm-delete-reply') {
                          executeDeleteReply(targetId);
                        }
                      }}
                      className="flex-1 bg-plum hover:bg-plum/90 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer border-none"
                    >
                      Confirm
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setCustomAlert({ show: false, type: 'error', message: '' })}
                    className="w-full bg-[#1a1f2e] hover:bg-[#252a3b] border border-[#2d3347] text-slate-300 font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer"
                  >
                    Okay
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
