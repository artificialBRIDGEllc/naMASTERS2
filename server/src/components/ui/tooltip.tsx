import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

const TooltipContext = React.createContext<{
  open: boolean;
  setOpen: (v: boolean) => void;
}>({ open: false, setOpen: () => {} });

export function TooltipProvider({ children, ..._rest }: { children: React.ReactNode; delayDuration?: number }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div 
        className="relative inline-block"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </div>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({ children, ..._rest }: { children: React.ReactNode; asChild?: boolean }) {
  return <>{children}</>;
}

export function TooltipContent({ children, className, hidden: isHidden, ..._rest }: {
  children: React.ReactNode;
  className?: string;
  side?: string;
  align?: string;
  hidden?: boolean;
}) {
  const { open } = React.useContext(TooltipContext);
  if (isHidden) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 5, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 2, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 px-3 py-1.5 text-xs font-medium text-white bg-zinc-800 rounded-md shadow-xl border border-zinc-700 whitespace-nowrap pointer-events-none ${className ?? ""}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
