"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { ColorDot } from "@/components/ui/color-dot";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES, categoryColor } from "@/config/categories";
import type { IsoDate } from "@/lib/dates/dates";
import {
  MERCHANT_MAX_LENGTH,
  type NewTransactionField,
  NOTE_MAX_LENGTH,
} from "@/lib/transactions/new-transaction";

import { addTransaction, type AddTransactionState } from "./actions";

const INITIAL: AddTransactionState = {};
const DEFAULT_CATEGORY = "food";

type AddTransactionFormProps = {
  /** Default and latest selectable date. */
  today: IsoDate;
};

/** Quick manual entry: amount, where, when, category and an optional note. */
export function AddTransactionForm({ today }: AddTransactionFormProps) {
  const t = useTranslations("addTransaction");
  const tc = useTranslations("categories");
  const [state, action, pending] = useActionState(addTransaction, INITIAL);
  const values = state.values ?? {};

  const errorId = (field: NewTransactionField) => `${field}-error`;
  const fieldProps = (field: NewTransactionField) => ({
    id: field,
    name: field,
    defaultValue: values[field],
    "aria-invalid": !!state.errors?.[field],
    "aria-describedby": state.errors?.[field] ? errorId(field) : undefined,
  });
  const fieldError = (field: NewTransactionField) => {
    const error = state.errors?.[field];
    return error ? (
      <p id={errorId(field)} className="text-sm text-destructive">
        {t(`errors.${error}`)}
      </p>
    ) : null;
  };

  const categories = CATEGORIES.map((c) => ({
    value: c.id,
    label: tc(c.id),
    icon: <ColorDot color={categoryColor(c.id)} size="sm" />,
  }));

  return (
    <form action={action} noValidate className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="amount">{t("amount")}</Label>
        <div className="relative" dir="ltr">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 start-4 flex items-center font-display text-2xl font-semibold text-muted-foreground"
          >
            ₪
          </span>
          <Input
            {...fieldProps("amount")}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            autoFocus
            className="h-16 ps-11 font-display text-3xl font-bold tabular-nums"
          />
        </div>
        {fieldError("amount")}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="merchant">{t("merchant")}</Label>
        <Input
          {...fieldProps("merchant")}
          maxLength={MERCHANT_MAX_LENGTH}
          autoComplete="off"
          placeholder={t("merchantPlaceholder")}
        />
        {fieldError("merchant")}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="date">{t("date")}</Label>
        <Input
          {...fieldProps("date")}
          type="date"
          defaultValue={values.date ?? today}
          max={today}
          className="text-start"
        />
        {fieldError("date")}
      </div>

      <div className="grid gap-2">
        <span id="categoryId-label" className="text-sm leading-none font-medium">
          {t("category")}
        </span>
        <ChoiceChips
          name="categoryId"
          options={categories}
          defaultValue={values.categoryId || DEFAULT_CATEGORY}
          labelledBy="categoryId-label"
          invalid={!!state.errors?.categoryId}
          describedBy={state.errors?.categoryId ? errorId("categoryId") : undefined}
        />
        {fieldError("categoryId")}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="note">
          {t("note")} <span className="font-normal text-muted-foreground">{t("optional")}</span>
        </Label>
        <Input {...fieldProps("note")} maxLength={NOTE_MAX_LENGTH} autoComplete="off" />
        {fieldError("note")}
      </div>

      {state.failed && (
        <p role="alert" className="text-sm text-destructive">
          {t("errors.saveFailed")}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-1 w-full" disabled={pending}>
        {pending ? t("saving") : t("save")}
      </Button>
    </form>
  );
}
