import { Construction } from 'lucide-react';

export function AdminUnderDevelopmentOverlay({ message, children }) {
  return (
    <div className="flex flex-col gap-4">
      <div
        role="status"
        className="flex items-start gap-3 rounded-xl border-2 border-amber-500/70 bg-amber-500/15 px-4 py-4 text-amber-950 shadow-sm dark:border-amber-400/60 dark:bg-amber-400/15 dark:text-amber-50"
      >
        <Construction
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300"
        />
        <p className="text-sm font-semibold leading-snug sm:text-base">{message}</p>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none select-none opacity-40 grayscale"
      >
        {children}
      </div>
    </div>
  );
}
