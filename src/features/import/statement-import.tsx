"use client";

import { FileSpreadsheetIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { useFormatters } from "@/i18n/use-formatters";
import { Link } from "@/i18n/navigation";
import { parseCalStatement } from "@/lib/import/cal";
import type { PlannedRow } from "@/lib/import/plan";
import type { ParsedStatement, StatementError } from "@/lib/import/types";
import { sumAmounts } from "@/lib/money/money";

import { importStatementRows, planStatementImport } from "./actions";
import { ImportRow } from "./import-row";

type ErrorKey = StatementError | "invalid" | "failed";

type State =
  | { step: "pick"; error?: ErrorKey }
  | { step: "review"; statement: ParsedStatement; planned: PlannedRow[]; error?: ErrorKey }
  | { step: "done"; saved: number };

async function readCalFile(file: File) {
  // Loaded on demand: only this screen needs the spreadsheet reader.
  const { default: readXlsxFile } = await import("read-excel-file/browser");
  try {
    return parseCalStatement(await readXlsxFile(file));
  } catch {
    return { ok: false, error: "unreadable" } as const;
  }
}

/**
 * Cal statement import: pick the .xlsx, review what will be added (the file is read
 * in the browser and never uploaded), then save the chosen rows.
 */
export function StatementImport() {
  const t = useTranslations("import");
  const format = useFormatters();
  const [state, setState] = useState<State>({ step: "pick" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  function pickFile(file: File | undefined) {
    if (!file) return;
    startTransition(async () => {
      const parsed = await readCalFile(file);
      if (!parsed.ok) return setState({ step: "pick", error: parsed.error });

      const result = await planStatementImport("cal", parsed.statement.rows);
      if ("error" in result) return setState({ step: "pick", error: result.error });

      setSelected(
        new Set(result.planned.filter((r) => r.status === "new").map((r) => r.externalRef)),
      );
      setState({ step: "review", statement: parsed.statement, planned: result.planned });
    });
  }

  function save() {
    if (state.step !== "review") return;
    const rows = state.planned.filter((r) => selected.has(r.externalRef));
    startTransition(async () => {
      const result = await importStatementRows("cal", rows);
      setState(
        "error" in result
          ? { ...state, error: result.error }
          : { step: "done", saved: result.saved },
      );
    });
  }

  if (state.step === "done") {
    return (
      <div className="grid gap-3">
        <Notice icon="✓">{t("done", { count: state.saved })}</Notice>
        <Link href="/" className={buttonVariants()}>
          {t("seeOverview")}
        </Link>
        <Button variant="outline" onClick={() => setState({ step: "pick" })}>
          {t("importAnother")}
        </Button>
      </div>
    );
  }

  if (state.step === "pick") {
    return (
      <div className="grid gap-3 text-sm">
        <p className="text-muted-foreground">{t("calHint")}</p>
        <label
          className={buttonVariants({
            className: "cursor-pointer has-focus-visible:ring-3 has-focus-visible:ring-ring/60",
          })}
          aria-disabled={pending || undefined}
        >
          <FileSpreadsheetIcon />
          {pending ? t("reading") : t("chooseFile")}
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="sr-only"
            disabled={pending}
            onChange={(e) => {
              pickFile(e.target.files?.[0]);
              e.target.value = ""; // allow picking the same file again
            }}
          />
        </label>
        {state.error && (
          <p role="alert" className="text-destructive">
            {t(`errors.${state.error}`)}
          </p>
        )}
      </div>
    );
  }

  const { statement, planned } = state;
  const rowsTotal = sumAmounts(statement.rows.map((r) => r.amount));
  const totalMismatch = statement.total !== null && statement.total !== rowsTotal;
  const count = selected.size;

  return (
    <div className="grid gap-3 text-sm">
      <p className="font-medium">
        {t("summary", { count: planned.length, card: statement.cardLast4 ?? "none" })}
      </p>
      {totalMismatch && (
        <Notice icon="!">
          {t("totalMismatch", {
            total: format.money(statement.total!, 2),
            sum: format.money(rowsTotal, 2),
          })}
        </Notice>
      )}
      <Button size="lg" onClick={save} disabled={pending || count === 0}>
        {pending ? t("importing") : t("importButton", { count })}
      </Button>
      {state.error && (
        <p role="alert" className="text-destructive">
          {t(`errors.${state.error}`)}
        </p>
      )}
      <ul className="grid gap-2">
        {planned.map((row) => (
          <li key={row.externalRef}>
            <ImportRow
              row={row}
              checked={selected.has(row.externalRef)}
              onCheckedChange={(checked) =>
                setSelected((prev) => {
                  const next = new Set(prev);
                  if (checked) next.add(row.externalRef);
                  else next.delete(row.externalRef);
                  return next;
                })
              }
            />
          </li>
        ))}
      </ul>
      <Button variant="ghost" onClick={() => setState({ step: "pick" })} disabled={pending}>
        {t("cancel")}
      </Button>
    </div>
  );
}
