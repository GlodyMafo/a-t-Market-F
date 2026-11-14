import { Check } from "lucide-react";
import { TRACKING_LABELS, timelineSteps, type OrderKind } from "@/features/orders/status";
import { cn, formatDateTime } from "@/lib/utils";
import type { TrackingEvent } from "@/types/domain";

interface Props {
  kind: OrderKind;
  events: TrackingEvent[];
  paid: boolean;
}

/** Étapes issues du backend : une étape n'est « atteinte » que si un événement réel existe. */
export function TrackingTimeline({ kind, events, paid }: Props) {
  const steps = timelineSteps(kind, events);
  const reached = steps.map((step) => events.filter((e) => e.status === step).pop() ?? null);
  const lastIndex = reached.reduce((acc, event, i) => (event ? i : acc), -1);

  return (
    <section aria-labelledby="tracking-title" className="rounded-3xl border border-line bg-white p-5 md:p-6">
      <h2 id="tracking-title" className="font-display text-lg font-extrabold tracking-tight">
        Suivi de la commande
      </h2>
      {paid && events.length === 0 && (
        <p className="mt-2 rounded-2xl bg-brand-50 p-3 text-sm text-brand-900">
          Paiement reçu. Le suivi démarre dès que notre équipe prend votre commande en charge.
        </p>
      )}

      <ol className="mt-5">
        {steps.map((status, i) => {
          const event = reached[i];
          const done = event !== null;
          const current = i === lastIndex;
          return (
            <li key={status} aria-current={current ? "step" : undefined} className="relative flex gap-4 pb-6 last:pb-0">
              {i < steps.length - 1 && (
                <span aria-hidden className={cn("absolute left-[0.6875rem] top-6 h-[calc(100%-1.5rem)] w-0.5", i < lastIndex ? "bg-brand-500" : "bg-line")} />
              )}
              <span
                className={cn(
                  "relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                  done ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-white",
                  current && "ring-4 ring-brand-100",
                )}
              >
                {done && <Check className="h-3.5 w-3.5" aria-hidden />}
              </span>
              <div className="min-w-0">
                <p className={cn("text-sm font-semibold", !done && "text-muted")}>
                  {event?.label ?? TRACKING_LABELS[status]}
                </p>
                {event && <p className="text-xs text-muted">{formatDateTime(event.createdAt)}</p>}
                {event?.message && <p className="mt-1 text-sm text-ink/80">{event.message}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}