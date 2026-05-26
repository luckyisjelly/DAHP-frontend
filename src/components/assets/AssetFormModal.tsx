import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { AssetTypeIcon } from "./AssetTypeIcon";
import {
  ASSET_TYPE_DESCRIPTION,
  ASSET_TYPE_LABEL,
  SENSITIVITY_LABEL,
  SENSITIVITY_STARS,
  VISIBLE_ASSET_TYPES,
  assetTypeColor,
} from "./assetMeta";
import { createAsset, updateAsset } from "@/api/assets";
import { ApiError } from "@/api/client";
import type {
  AssetCreateRequest,
  AssetResponse,
  AssetType,
  SensitivityLevel,
} from "@/types/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (asset: AssetResponse) => void;
  /** 편집 모드면 기존 asset 전달 */
  asset?: AssetResponse | null;
}

type Step = 1 | 2 | 3;

interface FormState {
  type: AssetType;
  title: string;
  description: string;
  externalRef: string;
  content: string;
  sensitivityLevel: SensitivityLevel;
}

const DEFAULT_FORM: FormState = {
  type: "ACCOUNT",
  title: "",
  description: "",
  externalRef: "",
  content: "",
  sensitivityLevel: "MEDIUM",
};

export function AssetFormModal({ open, onClose, onSaved, asset }: Props) {
  const isEdit = !!asset;
  const [step, setStep] = useState<Step>(isEdit ? 2 : 1);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 모달 열림/asset 변경 시 폼 초기화
  useEffect(() => {
    if (open) {
      if (asset) {
        setForm({
          type: asset.type,
          title: asset.title,
          description: asset.description ?? "",
          externalRef: asset.externalRef ?? "",
          content: asset.content ?? "",
          sensitivityLevel: asset.sensitivityLevel,
        });
        setStep(2);
      } else {
        setForm(DEFAULT_FORM);
        setStep(1);
      }
      setError(null);
    }
  }, [open, asset]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const canNext = useMemo(() => {
    if (step === 1) return !!form.type;
    if (step === 2) return form.title.trim().length > 0;
    return true;
  }, [step, form]);

  const handleNext = () => {
    setError(null);
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
  };

  const handleBack = () => {
    setError(null);
    if (step === 3) setStep(2);
    else if (step === 2 && !isEdit) setStep(1);
  };

  const handleSubmit = async () => {
    setError(null);
    setSaving(true);
    try {
      const payload: AssetCreateRequest = {
        title: form.title.trim(),
        type: form.type,
        description: form.description.trim() || undefined,
        externalRef: form.externalRef.trim() || undefined,
        content: form.content || undefined,
        sensitivityLevel: form.sensitivityLevel,
      };
      const saved = isEdit && asset
        ? await updateAsset(asset.id, payload)
        : await createAsset(payload);
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
      title={isEdit ? "자산 편집" : "자산 등록"}
      subtitle={
        step === 1
          ? "자산 유형을 선택하세요"
          : step === 2
            ? "자산 정보를 입력하세요"
            : "추가 설정"
      }
      size="lg"
      footer={
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {isEdit ? "편집 중" : `${step} / 3 단계`}
          </div>
          <div className="flex gap-2">
            {step > 1 && !isEdit && (
              <Button variant="outline" onClick={handleBack} disabled={saving}>
                이전
              </Button>
            )}
            {step === 3 && isEdit && (
              <Button variant="outline" onClick={handleBack} disabled={saving}>
                이전
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={handleNext} disabled={!canNext}>
                다음
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? "저장 중..." : isEdit ? "수정 완료" : "등록 완료"}
              </Button>
            )}
          </div>
        </div>
      }
    >
      {!isEdit && <StepIndicator current={step} />}

      {step === 1 && !isEdit && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {VISIBLE_ASSET_TYPES.map((t) => {
            const color = assetTypeColor(t);
            const selected = form.type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => update("type", t)}
                className={clsx(
                  "flex flex-col items-start gap-2 rounded-xl border bg-slate-900/40 p-5 text-left transition-colors",
                  selected
                    ? "border-violet-500 ring-2 ring-violet-500/30"
                    : "border-slate-700 hover:border-slate-600",
                )}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${color.iconBg}`}
                >
                  <AssetTypeIcon type={t} size={24} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {ASSET_TYPE_LABEL[t]}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {ASSET_TYPE_DESCRIPTION[t]}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <Field label="이름 *">
            <input
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              maxLength={200}
              placeholder={typePlaceholder(form.type, "title")}
              className={inputClass}
            />
          </Field>
          {form.type !== "MESSAGE" && (
            <Field label="URL">
              <input
                value={form.externalRef}
                onChange={(e) => update("externalRef", e.target.value)}
                maxLength={500}
                placeholder="https://example.com"
                className={inputClass}
              />
            </Field>
          )}
          {form.type === "ACCOUNT" && (
            <Field
              label="계정 정보 (사용자명/비밀번호 등)"
              hint="이 정보는 백엔드에 저장됩니다. 현재 베타에서는 평문 저장 (실 암호화 작업 중)."
            >
              <textarea
                value={form.content}
                onChange={(e) => update("content", e.target.value)}
                rows={3}
                placeholder={"예)\n사용자명: john.doe\n비밀번호: ********"}
                className={`${inputClass} resize-y`}
              />
            </Field>
          )}
          {form.type === "MESSAGE" && (
            <Field label="메시지 본문">
              <textarea
                value={form.content}
                onChange={(e) => update("content", e.target.value)}
                rows={6}
                placeholder="수신자에게 전달할 메시지..."
                className={`${inputClass} resize-y`}
              />
            </Field>
          )}
          <Field label="설명">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={2}
              maxLength={1000}
              placeholder={typePlaceholder(form.type, "description")}
              className={`${inputClass} resize-y`}
            />
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-5">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-200">중요도</p>
            <div className="grid grid-cols-3 gap-3">
              {(["LOW", "MEDIUM", "HIGH"] as SensitivityLevel[]).map((lv) => {
                const selected = form.sensitivityLevel === lv;
                const colorMap = {
                  LOW: "border-green-500 text-green-300 ring-green-500/30",
                  MEDIUM: "border-yellow-500 text-yellow-300 ring-yellow-500/30",
                  HIGH: "border-red-500 text-red-300 ring-red-500/30",
                } as const;
                return (
                  <button
                    key={lv}
                    type="button"
                    onClick={() => update("sensitivityLevel", lv)}
                    className={clsx(
                      "flex flex-col items-center gap-1 rounded-xl border bg-slate-900/40 p-4 text-center transition-colors",
                      selected
                        ? `${colorMap[lv]} ring-2`
                        : "border-slate-700 text-slate-300 hover:border-slate-600",
                    )}
                  >
                    <span
                      className={clsx(
                        "text-lg",
                        selected
                          ? lv === "LOW"
                            ? "text-green-400"
                            : lv === "MEDIUM"
                              ? "text-yellow-400"
                              : "text-red-400"
                          : "text-slate-500",
                      )}
                    >
                      {SENSITIVITY_STARS[lv]}
                    </span>
                    <span className="text-sm font-medium">
                      {SENSITIVITY_LABEL[lv]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-blue-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" />
              </svg>
              보안 안내
            </p>
            <p className="mt-1 text-xs text-blue-200/80">
              모든 데이터는 전달 조건이 충족되기 전까지 수신자에게 노출되지 않습니다. (베타: 실 암호화 도입 작업 중 — 현재 평문 저장)
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
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

function typePlaceholder(t: AssetType, field: "title" | "description") {
  if (field === "title") {
    if (t === "ACCOUNT") return "예: Gmail 계정";
    if (t === "FILE") return "예: 가족 사진 모음";
    if (t === "MESSAGE") return "예: 자녀에게 남기는 편지";
    return "";
  }
  return "이 자산에 대한 추가 정보...";
}

function StepIndicator({ current }: { current: Step }) {
  const steps: { n: Step; label: string }[] = [
    { n: 1, label: "유형 선택" },
    { n: 2, label: "정보 입력" },
    { n: 3, label: "설정" },
  ];
  return (
    <div className="mb-6 flex items-center gap-2">
      {steps.map((s, idx) => {
        const active = current === s.n;
        const done = current > s.n;
        return (
          <div key={s.n} className="flex flex-1 items-center gap-2">
            <span
              className={clsx(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                done
                  ? "bg-green-500 text-white"
                  : active
                    ? "bg-violet-500 text-white"
                    : "bg-slate-700 text-slate-400",
              )}
            >
              {done ? "✓" : s.n}
            </span>
            <span
              className={clsx(
                "text-xs",
                active ? "font-semibold text-slate-100" : "text-slate-400",
              )}
            >
              {s.label}
            </span>
            {idx < steps.length - 1 && (
              <span
                className={clsx(
                  "h-px flex-1",
                  done ? "bg-green-500/60" : "bg-slate-700",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
