import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, ArrowRight, User, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, signup, isLoggingIn, isSigningUp, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      signup({ data: { name, email, password } });
    } else {
      login({ data: { email, password } });
    }
  };

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    setName("");
    setEmail("");
    setPassword("");
  };

  const isSubmitting = isLoggingIn || isSigningUp;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#07070a] selection:bg-primary/30">
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/auth-bg.png`}
          alt="Abstract Background" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-transparent to-purple-950/10" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-6 sm:p-8 z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl neu-raised flex items-center justify-center p-3"
          >
            <img src={`${import.meta.env.BASE_URL}images/logo-icon.png`} alt="Logo" className="w-full h-full object-contain drop-shadow-lg" />
          </motion.div>
          <h1 className="text-4xl font-display font-extrabold tracking-tight mb-2 text-white drop-shadow-md">
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 drop-shadow-[0_0_20px_rgba(37,99,235,0.5)]">INSURE</span>
            itALL
          </h1>
          <p className="text-zinc-500 text-sm font-medium tracking-[0.2em] uppercase">Medicare Power Dialer</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="neu-raised rounded-3xl p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {isSignUp && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-blue-400 transition-colors duration-300">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name"
                        required
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder:text-zinc-600 neu-input focus:outline-none"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-blue-400 transition-colors duration-300">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@insureitall.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder:text-zinc-600 neu-input focus:outline-none"
                />
              </div>
              
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-blue-400 transition-colors duration-300">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? "Create a password (min 6 chars)" : "••••••••"}
                  required
                  minLength={isSignUp ? 6 : undefined}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder:text-zinc-600 neu-input focus:outline-none"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white neu-btn-primary",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              )}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSignUp ? (
                <>
                  Create Account
                  <UserPlus size={18} />
                </>
              ) : (
                <>
                  Sign In securely
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        <button
          type="button"
          onClick={toggleMode}
          className="mt-5 w-full text-center text-sm text-zinc-500 hover:text-white transition-colors duration-300"
        >
          {isSignUp ? (
            <>Already have an account? <span className="text-blue-400 font-medium">Sign In</span></>
          ) : (
            <>Don't have an account? <span className="text-blue-400 font-medium">Sign Up</span></>
          )}
        </button>
        
        <p className="mt-6 text-center text-xs text-zinc-700">
          Secure, TCPA-compliant dialing infrastructure.<br/>
          Unauthorized access is strictly prohibited.
        </p>
      </motion.div>
    </div>
  );
}
