import React from "react";
import { useTranslation } from "react-i18next";
import { intervalToDuration, isValid, parseISO, startOfDay } from "date-fns";
import { CalendarDays, CheckCircle2, Clock3 } from "lucide-react";
import "./FinancePeriod.css";

export default function FinancePeriod({ startDate, completeAt, fund = false }) {
  const { t, i18n } = useTranslation();
  const start = startDate ? parseISO(startDate) : null;
  if (!start || !isValid(start))
    return (
      <div className="small text-muted">{t("finance:period.unknown")}</div>
    );
  const today = startOfDay(new Date());
  const end = !fund && completeAt ? parseISO(completeAt) : today;
  if (!isValid(end)) return null;
  const locale = i18n?.language?.startsWith("bg") ? "bg-BG" : "en-GB";
  const dateFormat = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const planned = start > end;
  const parts = planned ? {} : intervalToDuration({ start, end });
  const formatUnit = (value, unit) =>
    new Intl.NumberFormat(locale, {
      style: "unit",
      unit,
      unitDisplay: "long",
    }).format(value);
  const duration =
    ["years", "months", "days"]
      .filter((unit) => parts[unit])
      .map((unit) => formatUnit(parts[unit], unit.slice(0, -1)))
      .join(" ") || formatUnit(0, "day");
  const completed = !fund && Boolean(completeAt);
  const state = planned ? "planned" : completed ? "completed" : "active";
  const StatusIcon = completed ? CheckCircle2 : Clock3;

  return (
    <div className={`finance-period finance-period--${state}`}>
      <div className="finance-period__dates">
        <CalendarDays
          size={17}
          aria-hidden="true"
          className="finance-period__calendar"
        />
        <div className="finance-period__date">
          <span className="finance-period__label">
            {t("finance:period.startDate")}
          </span>
          <time dateTime={startDate}>{dateFormat.format(start)}</time>
        </div>
        {!fund && !planned && (
          <>
            <span className="finance-period__connector" aria-hidden="true" />
            <div className="finance-period__date">
              <span className="finance-period__label">
                {t(
                  completed
                    ? "finance:period.completedOn"
                    : "finance:period.inProgress",
                )}
              </span>
              {completed ? (
                <time dateTime={completeAt}>{dateFormat.format(end)}</time>
              ) : (
                <span>{t("finance:period.untilToday")}</span>
              )}
            </div>
          </>
        )}
      </div>
      <div className="finance-period__duration">
        <StatusIcon size={15} aria-hidden="true" />
        <span>
          {planned
            ? t("finance:period.planned")
            : t(fund ? "finance:period.activeFor" : "finance:period.duration", {
                duration,
              })}
        </span>
      </div>
    </div>
  );
}
