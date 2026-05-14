"use client";

import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import toast from "react-hot-toast";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
        return;
      }

      toast.success("Signed in successfully");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-mist/50 p-8 md:p-10 space-y-6">
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
      <Input
        label="Password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        required
        rightIcon={showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        onRightIconClick={() => setShowPassword(!showPassword)}
      />
      <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} icon={<LogIn className="w-4 h-4" />}>
        Sign In
      </Button>
      <p className="text-center text-xs text-charcoal/40">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-gold hover:underline font-medium">Sign up</Link>
      </p>
      <div className="pt-6 border-t border-mist/50">
        <p className="text-[10px] text-charcoal/30 text-center leading-relaxed">
          Test credentials (click Seed Database on Dashboard first):
          <br />
          <span className="font-mono text-charcoal/40">admin@maisonnoire.com / TestAdmin123!</span>
        </p>
      </div>
    </form>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ivory to-mist/30 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-gold/[0.03] via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute top-20 left-10 w-64 h-64 border border-gold/5 rounded-full" />
        <div className="absolute bottom-20 right-10 w-96 h-96 border border-gold/5 rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-px h-32 bg-gradient-to-b from-transparent via-gold/10 to-transparent" />
        <div className="absolute top-1/3 right-1/4 w-px h-24 bg-gradient-to-b from-transparent via-gold/10 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-block group">
            <h1 className="text-3xl font-serif text-charcoal mb-3 tracking-tight group-hover:text-gold transition-colors duration-300">Maison Noire</h1>
          </Link>
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-px bg-gold/30" />
            <p className="text-sm text-charcoal/40">Sign in to your account</p>
            <div className="w-4 h-px bg-gold/30" />
          </div>
        </div>
        <Suspense fallback={
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-mist/50 p-10 text-center">
            <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-charcoal/40">Loading...</p>
          </div>
        }>
          <SignInForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
