"use client";

import { BellOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Pagination } from "@/components/products/Pagination";
import { useNotificationActions, useNotifications } from "@/features/notifications/hooks";
import { cn } from "@/lib/utils";
import { errorMessage } from "@/services/api/errors";

export function NotificationsList() {
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data, isLoading, isPlaceholderData, error, refetch } = useNotifications({ page, limit: 15, unreadOnly });
  const { markAll } = useNotificationActions();
  const unread = data?.meta?.unread ?? 0;

  const tab = (active: boolean) =>
    cn(
      "min-h-11 rounded-full px-4 text-sm font-semibold motion-safe:transition-colors",
      active ? "bg-brand-500 text-white" : "bg-surface text-muted hover:bg-brand-50 hover:text-brand-700",
    );

  function switchTo(onlyUnread: boolean) {
    setUnreadOnly(onlyUnread);
    setPage(1);
  }

  return (
    <section aria-labelledby="notifications-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 id="notifications-title" className="font-display text-2xl font-extrabold tracking-tight">
          Notifications
          {unread > 0 && <span className="ml-2 align-middle text-sm font-semibold text-muted">· {unread} non lue{unread > 1 ? "s" : ""}</span>}
        </h1>
        <button
          type="button"
          disabled={unread === 0 || markAll.isPending}
          onClick={() =>
            markAll.mutate(undefined, {
              onSuccess: () => toast.success("Toutes les notifications sont marquées comme lues."),
              onError: (failure) => toast.error(errorMessage(failure)),
            })
          }
          className="min-h-11 rounded-full border border-line px-4 text-sm font-semibold motion-safe:transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
        >
          Tout marquer comme lu
        </button>
      </div>

      <div className="mt-4 flex gap-2" role="group" aria-label="Filtrer les notifications">
        <button type="button" onClick={() => switchTo(false)} aria-pressed={!unreadOnly} className={tab(!unreadOnly)}>
          Toutes
        </button>
        <button type="button" onClick={() => switchTo(true)} aria-pressed={unreadOnly} className={tab(unreadOnly)}>
          Non lues
        </button>
      </div>

      {isLoading && (
        <ul className="mt-5 space-y-2" aria-busy="true" aria-label="Chargement des notifications">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="skeleton h-20 rounded-2xl bg-ink/[0.06]" />
          ))}
        </ul>
      )}

      {error && <ErrorState title="Impossible de charger vos notifications" message={errorMessage(error)} onRetry={() => refetch()} />}

      {data && data.items.length === 0 && (
        <EmptyState
          icon={BellOff}
          title={unreadOnly ? "Aucune notification non lue" : "Aucune notification"}
          message="Vous serez prévenu ici du paiement, de l'avancement et de la livraison de vos commandes."
        />
      )}

      {data && data.items.length > 0 && (
        <>
          <ul className={cn("mt-5 space-y-2", isPlaceholderData && "opacity-60 motion-safe:transition-opacity")} aria-busy={isPlaceholderData}>
            {data.items.map((notification) => (
              <li key={notification.id} className="rounded-3xl border border-line bg-white p-1.5">
                <NotificationItem notification={notification} />
              </li>
            ))}
          </ul>
          <Pagination
            page={page}
            totalPages={data.meta?.totalPages ?? 1}
            onChange={(next) => {
              setPage(next);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}
    </section>
  );
}