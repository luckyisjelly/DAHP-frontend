import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { RELATIONSHIP_PRESETS } from "./recipientMeta";
import { createRecipient, updateRecipient } from "@/api/recipients";
import { ApiError } from "@/api/client";
import type {
  RecipientCreateRequest,
  RecipientResponse,
} from "@/types/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (recipient: RecipientResponse) => void;
  recipient?: RecipientResponse | null;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  relationship: string;
  memo: string;
}

const DEFAULT_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  relationship: "",
  memo: "",
};

export function RecipientFormModal({
  open,
  onClose,
  onSaved,
  recipient,
}: Props) {
  const isEdit = !!recipient;
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (recipient) {
        setForm({
          name: recipient.name,
          email: recipient.email,
          phone: recipient.phone ?? "",
          relationship: recipient.relationship ?? "",
          memo: recipient.memo ?? "",
        });
      } else {
        setForm(DEFAULT_FORM);
      }
      setError(null);
    }
  }, [open, recipient]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const canSave = form.name.trim() && form.email.trim();

  const handleSubmit = async () => {
    if (!canSave) return;
    setError(null);
    setSaving(true);
    try {
      const payload: RecipientCreateRequest = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        relationship: form.relationship.trim() || undefined,
        memo: form.memo.trim() || undefined,
      };
      const saved = isEdit && recipient
        ? await updateRecipient(recipient.id, payload)
        : await createRecipient(payload);
      onSaved(saved);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      title={isEdit ? "수신자 편집" : "수신자 추가"}
      subtitle="자산을 전달받을 사람의 정보를 입력하세요"
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            취소
          </Button>
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={!canSave || saving}
          >
            {saving ? "저장 중..." : isEdit ? "수정 완료" : "수신자 추가"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="이름 *">
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            maxLength={100}
            placeholder="홍길동"
            className={inputClass}
          />
        </Field>

        <Field label="이메일 *">
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            maxLength={255}
            placeholder="example@email.com"
            className={inputClass}
          />
        </Field>

        <Field label="전화번호" hint="선택 사항">
          <input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            maxLength={30}
            placeholder="+82 10-0000-0000"
            className={inputClass}
          />
        </Field>

        <Field label="관계">
          <div className="flex flex-wrap gap-2">
            {RELATIONSHIP_PRESETS.map((preset) => {
              const active = form.relationship === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => update("relationship", active ? "" : preset)}
                  className={clsx(
                    "rounded-md border px-3 py-1.5 text-xs transition-colors",
                    active
                      ? "border-violet-500 bg-violet-500/10 text-violet-300"
                      : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-slate-200",
                  )}
                >
                  {preset}
                </button>
              );
            })}
            <input
              value={
                RELATIONSHIP_PRESETS.includes(
                  form.relationship as (typeof RELATIONSHIP_PRESETS)[number],
                )
                  ? ""
                  : form.relationship
              }
              onChange={(e) => update("relationship", e.target.value)}
              maxLength={50}
              placeholder="직접 입력"
              className="w-32 rounded-md border border-slate-700 bg-slate-800/40 px-2 py-1 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-violet-500"
            />
          </div>
        </Field>

        <Field label="메모" hint="선택 사항, 최대 500자">
          <textarea
            value={form.memo}
            onChange={(e) => update("memo", e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="이 수신자에 대한 메모..."
            className={`${inputClass} resize-y`}
          />
        </Field>

        {error && (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <p className="text-xs text-slate-500">
          백엔드에 인증 방법/접근 권한 필드가 아직 없어 기본값으로 등록됩니다. (베타)
        </p>
      </div>
    </Modal>
  );
}

const inputClass =
  "w-full rounded-md border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-violet-500 focus:bg-slate-800";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-slate-300">{label}</span>
      {children}
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
