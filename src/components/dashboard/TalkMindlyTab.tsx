import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import api from "../../services/api";
import type { TalkRoom, TalkNote, TalkProfile } from "../talk/types";
import { ADJECTIVES, containsProfanity } from "../talk/types";
import { TalkTermsScreen, TalkProfileScreen } from "../talk/TalkOnboarding";
import { TalkRoomList } from "../talk/TalkRoomList";
import { TalkNoteBoard } from "../talk/TalkNoteBoard";
import { DropNoteSheet } from "../talk/DropNoteSheet";
import { RepliesDrawer } from "../talk/RepliesDrawer";
import { CrisisModal, TalkAlertDialog } from "../talk/TalkDialogs";

export function TalkMindlyTab() {
  const [profile, setProfile] = useState<TalkProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeScreen, setActiveScreen] = useState<
    "onboarding-terms" | "onboarding-profile" | "room-list" | "room-detail"
  >("room-list");

  // Profile Form states
  const [avatarInput, setAvatarInput] = useState("panda");
  const [nicknameInput, setNicknameInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Rooms and Note Wall States
  const [rooms, setRooms] = useState<TalkRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<TalkRoom | null>(null);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState(false);
  const [notes, setNotes] = useState<TalkNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [sortOrder, setSortOrder] = useState<"recent" | "interactive">("recent");

  // Post / Drop Note State
  const [isDropNoteOpen, setIsDropNoteOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [profanityWarning, setProfanityWarning] = useState(false);

  // Selected Note / Replies Drawer State
  const [selectedNote, setSelectedNote] = useState<TalkNote | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Crisis alert and Confirmation states
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [crisisAlertMessage, setCrisisAlertMessage] = useState("");
  const [customAlert, setCustomAlert] = useState<{
    show: boolean;
    type: "confirm-delete" | "confirm-delete-reply" | "confirm-report" | "error" | "info";
    targetId?: string;
    message: string;
  }>({ show: false, type: "info", message: "" });

  // 1. Initial Load: Fetch Profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await api.get("/talk/profile");
      if (response.data && response.data.profile) {
        const prof = response.data.profile;
        setProfile(prof);

        if (!prof.talkTermsAccepted) {
          setActiveScreen("onboarding-terms");
        } else if (!prof.talkNickname) {
          setActiveScreen("onboarding-profile");
          rollRandomIdentity();
        } else {
          setActiveScreen("room-list");
          fetchRooms();
        }
      }
    } catch (err) {
      console.error("Failed to load talk profile:", err);
      setActiveScreen("onboarding-terms");
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      setRoomsError(false);
      const response = await api.get("/talk/rooms");
      // The route returns a bare array; tolerate a wrapped shape rather than handing a
      // non-array to the list, which would throw on .map instead of showing a state.
      const roomList: TalkRoom[] = Array.isArray(response.data)
        ? response.data
        : response.data?.rooms || [];
      setRooms(roomList);
      if (roomList.length > 0) {
        setSelectedRoom(roomList[0]);
        fetchNotes(roomList[0].id);
      }
    } catch (err) {
      console.error("Failed to load rooms:", err);
      setRooms([]);
      setRoomsError(true);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleSelectRoom = (room: TalkRoom) => {
    setSelectedRoom(room);
    setActiveScreen("room-detail");
    fetchNotes(room.id);
  };

  const fetchNotes = async (roomId: string) => {
    try {
      setLoadingNotes(true);
      const response = await api.get(`/talk/rooms/${roomId}/notes?sort=${sortOrder}`);
      const list = Array.isArray(response.data) ? response.data : (response.data?.notes || []);
      setNotes(list);
    } catch (err) {
      console.error("Failed to load notes:", err);
    } finally {
      setLoadingNotes(false);
    }
  };

  // 2. Fetch Notes when Room or Sort order changes
  useEffect(() => {
    if (selectedRoom) {
      fetchNotes(selectedRoom.id);
    }
  }, [selectedRoom, sortOrder]);

  // Random generator for identity profile
  const rollRandomIdentity = () => {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = ["Panda", "Fox", "Owl", "Koala", "Rabbit", "Tiger", "Bear", "Lion", "Cat", "Frog"][
      Math.floor(Math.random() * 10)
    ];
    setNicknameInput(`${adj} ${noun}`);
  };

  const handleAcceptTerms = () => {
    setActiveScreen("onboarding-profile");
    rollRandomIdentity();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim()) return;

    try {
      setSavingProfile(true);
      setProfileError("");
      const response = await api.post("/talk/profile", {
        talkNickname: nicknameInput.trim(),
        talkAvatar: avatarInput,
        talkBio: bioInput.trim() || undefined,
        talkTermsAccepted: true,
      });

      if (response.data && response.data.profile) {
        setProfile(response.data.profile);
        setActiveScreen("room-list");
        fetchRooms();
      }
    } catch (err: any) {
      console.error("Failed to save talk profile:", err);
      setProfileError(err.response?.data?.error || "Nickname might already be in use. Try rolling another.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDropNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !noteContent.trim()) return;

    if (containsProfanity(noteContent)) {
      setProfanityWarning(true);
      return;
    }
    setProfanityWarning(false);

    try {
      setSubmittingNote(true);
      const room = selectedRoom;
      const response = await api.post(`/talk/rooms/${room.id}/notes`, {
        content: noteContent.trim(),
      });

      const { isCrisis, message } = response.data || {};

      if (isCrisis) {
        setCrisisAlertMessage(message || "");
        setIsCrisisModalOpen(true);
      }

      setNoteContent("");
      setIsDropNoteOpen(false);
      const fresh = await api.get(`/talk/rooms/${room.id}/notes?sort=${sortOrder}`);
      const freshNotes = Array.isArray(fresh.data) ? fresh.data : (fresh.data?.notes || []);
      setNotes(freshNotes);

      setTimeout(async () => {
        try {
          const polled = await api.get(`/talk/rooms/${room.id}/notes?sort=${sortOrder}`);
          const polledNotes = Array.isArray(polled.data) ? polled.data : (polled.data?.notes || []);
          if (polledNotes.length > 0) {
            setNotes(polledNotes);
          }
        } catch (e) {}
      }, 3000);
    } catch (err: any) {
      console.error("Failed to drop note:", err);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNote || !selectedRoom || !replyContent.trim()) return;

    if (containsProfanity(replyContent)) {
      alert("Please keep your peer reply supportive and respectful.");
      return;
    }

    try {
      setSubmittingReply(true);
      const response = await api.post(`/talk/notes/${selectedNote.id}/replies`, {
        content: replyContent.trim(),
      });

      const { reply, isCrisis, message } = response.data || {};

      if (isCrisis) {
        setCrisisAlertMessage(message || "");
        setIsCrisisModalOpen(true);
      }

      if (reply) {
        setSelectedNote((prev) =>
          prev
            ? {
                ...prev,
                replies: [...prev.replies, reply],
              }
            : null
        );
      }

      setReplyContent("");
      const fresh = await api.get(`/talk/rooms/${selectedRoom.id}/notes?sort=${sortOrder}`);
      if (fresh.data && fresh.data.notes) {
        setNotes(fresh.data.notes);
      }
    } catch (err: any) {
      console.error("Failed to post reply:", err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleReact = async (noteId: string, type: string) => {
    try {
      setNotes((prevNotes) =>
        prevNotes.map((note) => {
          if (note.id !== noteId) return note;

          const existingIdx = note.reactions.findIndex((r) => r.isMine && r.type === type);
          let newReactions = [...note.reactions];
          let newMeTooCount = note.meTooCount;

          if (existingIdx >= 0) {
            newReactions.splice(existingIdx, 1);
            if (type === "METOO") newMeTooCount = Math.max(0, newMeTooCount - 1);
          } else {
            newReactions.push({ id: "temp-" + Date.now(), isMine: true, type });
            if (type === "METOO") newMeTooCount += 1;
          }

          return {
            ...note,
            reactions: newReactions,
            meTooCount: newMeTooCount,
          };
        })
      );

      const response = await api.post(`/talk/notes/${noteId}/react`, { type });
      if (response.data && response.data.reactions) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === noteId
              ? {
                  ...n,
                  reactions: response.data.reactions,
                  meTooCount: response.data.reactions.filter((r: any) => r.type === "METOO").length,
                }
              : n
          )
        );
      }
    } catch (err) {
      console.error("Failed to send reaction:", err);
    }
  };

  const executeReportNote = async (noteId: string) => {
    try {
      await api.post(`/talk/notes/${noteId}/report`);
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, status: "FLAGGED", moderationReason: "Under user review" } : n
        )
      );
    } catch (err) {
      console.error("Failed to report note:", err);
    }
  };

  const executeDeleteNote = async (noteId: string) => {
    try {
      await api.delete(`/talk/notes/${noteId}`);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (selectedNote?.id === noteId) setSelectedNote(null);
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const executeDeleteReply = async (replyId: string) => {
    try {
      await api.delete(`/talk/replies/${replyId}`);
      if (selectedNote) {
        setSelectedNote({
          ...selectedNote,
          replies: selectedNote.replies.filter((r) => r.id !== replyId),
        });
      }
      setNotes((prev) =>
        prev.map((n) =>
          n.id === selectedNote?.id
            ? { ...n, replies: n.replies.filter((r) => r.id !== replyId) }
            : n
        )
      );
    } catch (err) {
      console.error("Failed to delete reply:", err);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex h-full items-center justify-center bg-paper">
        <Loader2 className="w-8 h-8 text-plum-600 animate-spin" />
      </div>
    );
  }

  if (activeScreen === "onboarding-terms") {
    return <TalkTermsScreen onAcceptTerms={handleAcceptTerms} />;
  }

  if (activeScreen === "onboarding-profile") {
    return (
      <TalkProfileScreen
        avatarInput={avatarInput}
        setAvatarInput={setAvatarInput}
        nicknameInput={nicknameInput}
        setNicknameInput={setNicknameInput}
        bioInput={bioInput}
        setBioInput={setBioInput}
        profileError={profileError}
        savingProfile={savingProfile}
        onSaveProfile={handleSaveProfile}
        onRollRandomIdentity={rollRandomIdentity}
      />
    );
  }

  if (activeScreen === "room-list") {
    return (
      <TalkRoomList
        profile={profile}
        rooms={rooms}
        loadingRooms={loadingRooms}
        roomsError={roomsError}
        onRetryRooms={fetchRooms}
        onSelectRoom={handleSelectRoom}
      />
    );
  }

  return (
    <>
      <TalkNoteBoard
        selectedRoom={selectedRoom}
        onBackToRooms={() => {
          setSelectedRoom(null);
          setActiveScreen("room-list");
        }}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        loadingNotes={loadingNotes}
        notes={notes}
        onReact={handleReact}
        onSelectNote={(note) => setSelectedNote(note)}
        onOpenDropNote={() => setIsDropNoteOpen(true)}
        onRequestReportNote={(noteId) =>
          setCustomAlert({
            show: true,
            type: "confirm-report",
            targetId: noteId,
            message: "Report this peer note for safety or toxicity review?",
          })
        }
        onRequestDeleteNote={(noteId) =>
          setCustomAlert({
            show: true,
            type: "confirm-delete",
            targetId: noteId,
            message: "Are you sure you want to permanently delete this note?",
          })
        }
      />

      <DropNoteSheet
        isOpen={isDropNoteOpen}
        onClose={() => setIsDropNoteOpen(false)}
        noteContent={noteContent}
        setNoteContent={setNoteContent}
        profanityWarning={profanityWarning}
        submittingNote={submittingNote}
        profile={profile}
        onDropNote={handleDropNote}
      />

      <RepliesDrawer
        selectedNote={selectedNote}
        onClose={() => setSelectedNote(null)}
        replyContent={replyContent}
        setReplyContent={setReplyContent}
        submittingReply={submittingReply}
        profile={profile}
        onPostReply={handlePostReply}
        onRequestDeleteReply={(replyId) =>
          setCustomAlert({
            show: true,
            type: "confirm-delete-reply",
            targetId: replyId,
            message: "Are you sure you want to permanently delete this reply?",
          })
        }
      />

      <CrisisModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
        crisisAlertMessage={crisisAlertMessage}
      />

      <TalkAlertDialog
        customAlert={customAlert}
        onClose={() => setCustomAlert({ show: false, type: "error", message: "" })}
        onConfirm={() => {
          const targetId = customAlert.targetId || "";
          setCustomAlert({ show: false, type: "error", message: "" });
          if (customAlert.type === "confirm-report") {
            executeReportNote(targetId);
          } else if (customAlert.type === "confirm-delete") {
            executeDeleteNote(targetId);
          } else if (customAlert.type === "confirm-delete-reply") {
            executeDeleteReply(targetId);
          }
        }}
      />
    </>
  );
}
