import { useToast } from "./use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`
              pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md
              ${toast.variant === 'destructive' 
                ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                : toast.variant === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                : 'bg-zinc-900/90 border-zinc-800 text-zinc-100'
              }
            `}
          >
            <div className="mt-0.5 shrink-0">
              {toast.variant === 'destructive' ? <AlertCircle size={18} /> : 
               toast.variant === 'success' ? <CheckCircle2 size={18} /> : 
               <Info size={18} className="text-blue-500" />}
            </div>
            <div className="flex-1 min-w-0">
              {toast.title && <h4 className="text-sm font-semibold">{toast.title}</h4>}
              {toast.description && (
                <p className={`text-sm mt-1 ${toast.variant ? 'opacity-90' : 'text-zinc-400'}`}>
                  {toast.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
