import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => Promise<void> | void;
}

export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  variant = "danger",
  onConfirm,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "처리 중..." : confirmLabel}
          </Button>
        </div>
      }
    >
      {description && <p className="text-sm text-slate-300">{description}</p>}
      {error && (
        <p className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </Modal>
  );
}
