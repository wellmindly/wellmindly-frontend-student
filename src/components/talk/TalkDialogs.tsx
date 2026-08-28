import { LifeBuoy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, Sheet, ConfirmSheet } from "../ui";

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  crisisAlertMessage: string;
}

export function CrisisModal({
  isOpen,
  onClose,
  crisisAlertMessage,
}: CrisisModalProps) {
  const navigate = useNavigate();

  return (
    <Sheet
      open={isOpen}
      onClose={onClose}
      title="Before you go back"
      size="sm"
      dismissOnScrimClick={false}
      footer={
        <div className="flex flex-col gap-2">
          <Button
            fullWidth
            variant="primary"
            leadingIcon={<LifeBuoy className="w-4 h-4" />}
            onClick={() => {
              onClose();
              navigate("/crisis");
            }}
          >
            See who you can talk to now
          </Button>
          <Button fullWidth variant="ghost" onClick={onClose}>
            Back to the board
          </Button>
        </div>
      }
    >
      <p className="text-sm leading-relaxed text-ink-700">
        {crisisAlertMessage ||
          "What you wrote has been kept off the board for now, and someone on our team will read it. That review is not instant, and we are not an emergency service - so if you need help sooner, the people on the next page can talk to you today."}
      </p>
    </Sheet>
  );
}

interface TalkAlertDialogProps {
  customAlert: {
    show: boolean;
    type: string;
    targetId?: string;
    message: string;
  };
  onClose: () => void;
  onConfirm: () => void;
}

export function TalkAlertDialog({
  customAlert,
  onClose,
  onConfirm,
}: TalkAlertDialogProps) {
  const isConfirm = customAlert.type.startsWith("confirm");

  if (isConfirm) {
    const title =
      customAlert.type === "confirm-report"
        ? "Report this note?"
        : customAlert.type === "confirm-delete"
        ? "Delete your note?"
        : customAlert.type === "confirm-delete-reply"
        ? "Delete your reply?"
        : "Confirm action";

    const confirmLabel =
      customAlert.type === "confirm-report" ? "Report it" : "Delete it";

    return (
      <ConfirmSheet
        open={customAlert.show}
        onClose={onClose}
        onConfirm={onConfirm}
        title={title}
        description={customAlert.message}
        confirmLabel={confirmLabel}
        cancelLabel="Cancel"
        destructive={true}
      />
    );
  }

  return (
    <Sheet
      open={customAlert.show}
      onClose={onClose}
      title="Something went wrong"
      size="sm"
      footer={
        <Button fullWidth variant="ghost" onClick={onClose}>
          Okay
        </Button>
      }
    >
      <p className="text-sm leading-relaxed text-ink-700">{customAlert.message}</p>
    </Sheet>
  );
}
