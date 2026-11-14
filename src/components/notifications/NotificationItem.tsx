"use client";

import Link from "next/link";
import { useNotificationActions } from "@/features/notifications/hooks";
import { FALLBACK_STYLE, NOTIFICATION_STYLE } from "@/features/notifications/style";
import { TONE_CLASS } from "@/features/orders/status";
import { cn, formatRelative } from "@/lib/utils";
import type { AppNotification } from "@/types/domain";
import { notificationHref } from "@/features/notifications/links"

interface Props {
  notification: AppNotification;
  /** Appelé à l'ouverture (ex. pour fermer le panneau). */
  onOpen?: () => void;
}

export function NotificationItem({ notification, onOpen }: Props) {
  const { markRead } = useNotificationActions();
  const { icon: Icon, tone } = NOTIFICATION_STYLE[notification.type] ?? FALLBACK_STYLE;
  const unread = notification.readAt === null;
  const href = notificationHref(notification.type, notification.orderId);

  function open() {
    if (unread) markRead.mutate(notification.id);
    onOpen?.();
  }

  const className = cn(
    "flex w-full items-start gap-3 rounded-2xl p-3 text-left motion-safe:transition-colors hover:bg-surface",
    unread && "bg-brand-50/60",
  );

  const content = (
    <>
      <span className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full", TONE_CLASS[tone])}>
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-sm", unread ? "font-bold" : "font-semibold")}>{notification.title}</span>
        <span className="mt-0.5 line-clamp-2 block text-sm text-ink/80">{notification.message}</span>
        <span className="mt-1 block text-xs text-muted">{formatRelative(notification.createdAt)}</span>
      </span>
      {unread && (
        <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500">
          <span className="sr-only">Non lue</span>
        </span>
      )}
    </>
  );

  return href ? (
    <Link href={href} onClick={open} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={open} className={className}>
      {content}
    </button>
  );
}