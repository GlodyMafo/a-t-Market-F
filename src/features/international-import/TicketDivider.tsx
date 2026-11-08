export function TicketDivider() {
  return (
    <div aria-hidden className="relative h-6">
      <span className="absolute -left-3 top-0 h-6 w-6 rounded-full bg-white" />
      <span className="absolute -right-3 top-0 h-6 w-6 rounded-full bg-white" />
      <span className="absolute inset-x-6 top-1/2 border-t-2 border-dashed border-ink/15" />
    </div>
  );
}