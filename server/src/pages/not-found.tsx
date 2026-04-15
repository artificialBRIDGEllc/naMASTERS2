import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.1)_0%,transparent_50%)]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 bg-zinc-900/80 backdrop-blur-xl border border-white/5 rounded-[32px] text-center shadow-2xl relative z-10"
      >
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold font-display text-white mb-2">404</h1>
        <p className="text-zinc-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        
        <Link href="/">
          <div className="inline-block cursor-pointer px-8 py-3 rounded-xl bg-white text-black font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
            Return to Dashboard
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
