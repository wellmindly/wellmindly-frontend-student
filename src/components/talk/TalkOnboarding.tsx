import React, { useId } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, RefreshCw, Sparkles } from "lucide-react";
import { Button, IconButton, Input, Textarea } from "../ui";
import { AVATARS } from "./types";

interface TalkTermsScreenProps {
  onAcceptTerms: () => void;
}

export function TalkTermsScreen({ onAcceptTerms }: TalkTermsScreenProps) {
  return (
    <div className="h-full flex items-center justify-center bg-paper p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-card rounded-3xl p-8 border border-ink-200/70 shadow-lg text-center"
      >
        <div className="w-14 h-14 bg-plum-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-plum-600">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="font-display font-semibold text-2xl text-ink-900 mb-2">Welcome to TalkMindly</h2>
        <p className="text-xs text-ink-500 font-bold uppercase tracking-wider mb-6">How this space actually works</p>
        
        <div
          tabIndex={0}
          aria-label="Community guidelines"
          className="text-left space-y-4 mb-8 text-sm text-ink-700 leading-relaxed max-h-[min(60vh,420px)] overflow-y-auto pr-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400 rounded-xl"
        >
          <div className="p-3.5 bg-paper-2 rounded-xl border border-ink-200/70">
            <h3 className="font-bold text-ink-900">What other students see</h3>
            <p className="mt-1 text-ink-700">Your nickname and avatar, and nothing else — your real name is never shown. Your nickname is permanent: it&apos;s the same on every note you write, so people may come to recognise it as yours.</p>
          </div>
          <div className="p-3.5 bg-paper-2 rounded-xl border border-ink-200/70">
            <h3 className="font-bold text-ink-900">What our team sees</h3>
            <p className="mt-1 text-ink-700">Your notes are linked to your account, so staff can see who wrote what. If our safety check thinks a note describes a crisis, the note is hidden from the board and added to a queue for our team to review. That review is not instant, and this is not an emergency service.</p>
          </div>
          <div className="p-3.5 bg-paper-2 rounded-xl border border-ink-200/70">
            <h3 className="font-bold text-ink-900">How we keep it kind</h3>
            <p className="mt-1 text-ink-700">Strong language is blocked before a note posts. If someone reports a note it disappears from the board straight away, while our team looks at it.</p>
          </div>
        </div>

        <Button
          fullWidth
          size="lg"
          onClick={onAcceptTerms}
          trailingIcon={<ArrowRight className="w-4 h-4" />}
        >
          I understand and agree
        </Button>
      </motion.div>
    </div>
  );
}

interface TalkProfileScreenProps {
  avatarInput: string;
  setAvatarInput: (av: string) => void;
  nicknameInput: string;
  setNicknameInput: (nick: string) => void;
  bioInput: string;
  setBioInput: (bio: string) => void;
  profileError: string;
  savingProfile: boolean;
  onSaveProfile: (e: React.FormEvent) => void;
  onRollRandomIdentity: () => void;
}

export function TalkProfileScreen({
  avatarInput,
  setAvatarInput,
  nicknameInput,
  setNicknameInput,
  bioInput,
  setBioInput,
  profileError,
  savingProfile,
  onSaveProfile,
  onRollRandomIdentity,
}: TalkProfileScreenProps) {
  const avatarGroupId = useId();

  return (
    <div className="h-full flex items-center justify-center bg-paper p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-card rounded-3xl p-8 border border-ink-200/70 shadow-lg text-left"
      >
        <h2 className="font-display font-semibold text-2xl text-ink-900 mb-2">Create Your Identity</h2>
        <p className="text-ink-500 text-xs mb-6">Choose an avatar and a nickname. Neither can be changed later.</p>
        
        <form onSubmit={onSaveProfile} className="space-y-6">
          <p role="status" aria-live="polite" className="min-h-5 text-2xs font-medium text-danger">
            {profileError}
          </p>

          {/* Avatar Selector Grid */}
          <div>
            <h3 id={avatarGroupId} className="text-sm font-semibold text-ink-800 mb-3">Pick an avatar</h3>
            <div role="group" aria-labelledby={avatarGroupId} className="grid grid-cols-5 gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  aria-pressed={avatarInput === av.id}
                  aria-label={av.name}
                  onClick={() => setAvatarInput(av.id)}
                  className={`min-w-11 min-h-11 h-12 w-full flex items-center justify-center text-3xl rounded-2xl hover:bg-ink-100 transition-all duration-200 border-2 cursor-pointer ${
                    avatarInput === av.id ? "border-plum-500 bg-plum-100" : "border-transparent bg-transparent"
                  }`}
                >
                  <span aria-hidden="true">{av.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nickname Selector */}
          <Input
            label="Your nickname"
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            placeholder="e.g. Quiet Panda"
            maxLength={25}
            required
            trailing={
              <IconButton
                icon={<RefreshCw className="w-4 h-4" />}
                label="Roll a random nickname"
                onClick={onRollRandomIdentity}
                size="sm"
              />
            }
          />

          {/* Bio / About */}
          <Textarea
            label="A small bio"
            value={bioInput}
            onChange={(e) => setBioInput(e.target.value)}
            placeholder="A tiny line about you... e.g. Just a junior studying CS, trying to pace myself."
            maxLength={160}
          />

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={savingProfile}
            loadingLabel="Saving your profile…"
            disabled={!nicknameInput.trim()}
            leadingIcon={<Sparkles className="w-4 h-4" />}
          >
            Save and enter the board
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
