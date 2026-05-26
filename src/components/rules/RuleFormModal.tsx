import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { TriggerTypeIcon } from "./TriggerTypeIcon";
import { MultiSelectPicker, type PickerItem } from "./MultiSelectPicker";
import {
  CONDITION_DESCRIPTION,
  CONDITION_LABEL,
  conditionIconColor,
} from "./ruleMeta";
import { createRule, updateRule } from "@/api/rules";
import { listAssets } from "@/api/assets";
import { listRecipients } from "@/api/recipients";
import { ApiError } from "@/api/client";
import { ASSET_TYPE_LABEL } from "@/components/assets/assetMeta";
import type {
  AssetResponse,
  HandoverConditionType,
  HandoverRuleCreateRequest,
  HandoverRuleResponse,
  RecipientResponse,
} from "@/types/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (rule: HandoverRuleResponse) => void;
  rule?: HandoverRuleResponse | null;
}

type Step = 1 | 2 | 3;

const TRIGGER_TYPES: HandoverConditionType[] = [
  "INACTIVITY_PERIOD",
  "SPECIFIC_DATE",
  "MANUAL_APPROVAL",
];

interface FormState {
  conditionType: HandoverConditionType;
  title: string;
  description: string;
  inactivityDays: number;
  specificDate: string;
  assetIds: number[];
  recipientIds: number[];
}

const DEFAULT_FORM: FormState = {
  conditionType: "INACTIVITY_PERIOD",
  title: "",
  description: "",
  inactivityDays: 90,
  specificDate: "",
  assetIds: [],
  recipientIds: [],
};

function todayIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function RuleFormModal({ open, onClose, onSaved, rule }: Props) {
  const isEdit = !!rule;
  const [step, setStep] = useState<Step>(isEdit ? 2 : 1);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [assets, setAssets] = useState<AssetResponse[]>([]);
  const [recipients, setRecipients] = useState<RecipientResponse[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [recipientsLoading, setRecipientsLoading] = useState(false);

  // 폼 초기화
  useEffect(() => {
    if (!open) return;
    if (rule) {
      // 편집 모드: 기존 값 채우기
      const next: FormState = {
        conditionType: rule.conditionType,
        title: rule.title,
        description: rule.description ?? "",
        inactivityDays:
          rule.conditionType === "INACTIVITY_PERIOD"
            ? parseInt(rule.conditionValue ?? "90", 10) || 90
            : 90,
        specificDate:
          rule.conditionType === "SPECIFIC_DATE"
            ? rule.conditionValue ?? ""
            : "",
        assetIds: rule.assets.map((a) => a.id),
        recipientIds: rule.recipients.map((r) => r.id),
      };
      setForm(next);
      setStep(2);
    } else {
      setForm({ ...DEFAULT_FORM, specificDate: todayIso() });
      setStep(1);
    }
    setError(null);
  }, [open, rule]);

  // 자산/수신자 목록 fetch (모달 열릴 때 1회)
  useEffect(() => {
    if (!open) return;
    setAssetsLoading(true);
    listAssets({ size: 100, sort: "createdAt,desc" })
      .then((p) => setAssets(p.content))
      .catch(() => setAssets([]))
      .finally(() => setAssetsLoading(false));
    setRecipientsLoading(true);
    listRecipients({ size: 100, sort: "createdAt,desc" })
      .then((p) => setRecipients(p.content))
      .catch(() => setRecipients([]))
      .finally(() => setRecipientsLoading(false));
  }, [open]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const assetItems: PickerItem[] = useMemo(
    () =>
      assets.map((a) => ({
        id: a.id,
        label: a.title,
        subtitle: a.description ?? undefined,
        badge: ASSET_TYPE_LABEL[a.type],
      })),
    [assets],
  );

  const recipientItems: PickerItem[] = useMemo(
    () =>
      recipients.map((r) => ({
        id: r.id,
        label: r.name,
        subtitle: r.email,
        badge: r.relationship ?? undefined,
      })),
    [recipients],
  );

  const canNext = useMemo(() => {
    if (step === 1) return !!form.conditionType;
    if (step === 2) {
      if (!form.title.trim()) return false;
      if (form.conditionType === "INACTIVITY_PERIOD")
        return form.inactivityDays >= 1 && form.inactivityDays <= 365;
      if (form.conditionType === "SPECIFIC_DATE") return !!form.specificDate;
      return true;
    }
    return true;
  }, [step, form]);

  const canSubmit =
    form.assetIds.length > 0 && form.recipientIds.length > 0 && canNext;

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
    if (!canSubmit) return;
    setError(null);
    setSaving(true);
    try {
      const conditionValue =
        form.conditionType === "INACTIVITY_PERIOD"
          ? String(form.inactivityDays)
          : form.conditionType === "SPECIFIC_DATE"
            ? form.specificDate
            : undefined;
      const payload: HandoverRuleCreateRequest = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        conditionType: form.conditionType,
        conditionValue,
        assetIds: form.assetIds,
        recipientIds: form.recipientIds,
      };
      const saved = isEdit && rule
        ? await updateRule(rule.id, payload)
        : await createRule(payload);
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
      title={isEdit ? "인계 규칙 편집" : "인계 규칙 생성"}
      subtitle={
        step === 1
          ? "트리거 유형을 선택하세요"
          : step === 2
            ? "조건을 설정하세요"
            : "대상 자산과 수신자를 선택하세요"
      }
      size="lg"
      footer={
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {isEdit ? "편집 중" : `${step} / 3 단계`}
          </div>
          <div className="flex gap-2">
            {((step === 2 && !isEdit) || step === 3) && (
              <Button variant="outline" onClick={handleBack} disabled={saving}>
                이전
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={handleNext} disabled={!canNext}>
                다음
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canSubmit || saving}>
                {saving ? "저장 중..." : isEdit ? "수정 완료" : "규칙 생성"}
              </Button>
            )}
          </div>
        </div>
      }
    >
      {!isEdit && <StepIndicator current={step} />}

      {step === 1 && !isEdit && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TRIGGER_TYPES.map((t) => {
            const color = conditionIconColor(t);
            const selected = form.conditionType === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => update("conditionType", t)}
                className={clsx(
                  "flex flex-col items-start gap-2 rounded-xl border bg-slate-900/40 p-5 text-left transition-colors",
                  selected
                    ? "border-violet-500 ring-2 ring-violet-500/30"
                    : "border-slate-700 hover:border-slate-600",
                )}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${color.bg} ${color.fg}`}
                >
                  <TriggerTypeIcon type={t} size={24} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {CONDITION_LABEL[t]}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {CONDITION_DESCRIPTION[t]}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-slate-400">
            트리거: <span className="text-slate-200">{CONDITION_LABEL[form.conditionType]}</span>
          </div>

          <Field label="규칙 이름 *">
            <input
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              maxLength={200}
              placeholder="예: 90일 미접속 시 가족에게 전달"
              className={inputClass}
            />
          </Field>

          {form.conditionType === "INACTIVITY_PERIOD" && (
            <div className="flex flex-col gap-2 text-sm">
              <span className="text-slate-300">
                미접속 기간: {form.inactivityDays}일
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={7}
                  max={365}
                  value={form.inactivityDays}
                  onChange={(e) =>
                    update("inactivityDays", Number(e.target.value))
                  }
                  className="flex-1 accent-violet-500"
                />
                <span className="w-16 rounded-md border border-slate-700 bg-slate-800/60 px-2 py-1 text-center text-sm text-slate-100">
                  {form.inactivityDays}일
                </span>
              </div>
              <div className="flex gap-2">
                {[30, 90, 180, 365].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => update("inactivityDays", d)}
                    className={clsx(
                      "rounded-md border px-2 py-1 text-xs transition-colors",
                      form.inactivityDays === d
                        ? "border-violet-500 bg-violet-500/10 text-violet-300"
                        : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-slate-200",
                    )}
                  >
                    {d === 90 ? "90일 (권장)" : `${d}일`}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-500">
                마지막 체크인으로부터 이 기간이 지나면 자동으로 자산이 전달됩니다.
              </span>
            </div>
          )}

          {form.conditionType === "SPECIFIC_DATE" && (
            <Field label="전달 날짜">
              <input
                type="date"
                value={form.specificDate}
                onChange={(e) => update("specificDate", e.target.value)}
                className={inputClass}
              />
              <span className="text-xs text-slate-500">
                지정한 날짜가 지나면 자동으로 자산이 전달됩니다.
              </span>
            </Field>
          )}

          {form.conditionType === "MANUAL_APPROVAL" && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
              <p className="text-sm font-medium text-green-300">수동 트리거</p>
              <p className="mt-1 text-xs text-green-200/80">
                자동 조건 없이, 규칙 활성화 후 "즉시 실행" 버튼을 직접 누를 때만
                자산이 전달됩니다.
              </p>
            </div>
          )}

          <Field label="설명" hint="선택 사항">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={2}
              placeholder="이 규칙에 대한 메모..."
              className={`${inputClass} resize-y`}
            />
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-200">
              대상 자산 <span className="text-red-400">*</span>{" "}
              <span className="text-xs font-normal text-slate-500">
                ({form.assetIds.length}개 선택)
              </span>
            </p>
            <MultiSelectPicker
              items={assetItems}
              selected={form.assetIds}
              onChange={(ids) => update("assetIds", ids)}
              loading={assetsLoading}
              emptyText="등록된 자산이 없습니다. 먼저 자산을 등록해주세요."
              searchPlaceholder="자산 검색..."
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-200">
              대상 수신자 <span className="text-red-400">*</span>{" "}
              <span className="text-xs font-normal text-slate-500">
                ({form.recipientIds.length}명 선택)
              </span>
            </p>
            <MultiSelectPicker
              items={recipientItems}
              selected={form.recipientIds}
              onChange={(ids) => update("recipientIds", ids)}
              loading={recipientsLoading}
              emptyText="등록된 수신자가 없습니다. 먼저 수신자를 추가해주세요."
              searchPlaceholder="수신자 검색..."
            />
          </div>

          <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
            <p className="text-sm font-medium text-blue-300">
              총 {form.assetIds.length * form.recipientIds.length}건의 인계 이벤트가 발생합니다
            </p>
            <p className="mt-1 text-xs text-blue-200/80">
              조건 충족 시 자산 {form.assetIds.length}개 × 수신자{" "}
              {form.recipientIds.length}명의 조합으로 각각 별도 이벤트가 생성됩니다.
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

function StepIndicator({ current }: { current: Step }) {
  const steps: { n: Step; label: string }[] = [
    { n: 1, label: "유형 선택" },
    { n: 2, label: "조건 설정" },
    { n: 3, label: "대상 선택" },
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
