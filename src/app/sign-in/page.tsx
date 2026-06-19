"use client";

import { Suspense, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import toast from "react-hot-toast";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");

  const [errorMessage, setErrorMessage] = useState(
    errorParam === "OAuthAccountNotLinked"
      ? "This email is already linked to another sign-in method"
      : errorParam === "AccessDenied"
        ? "Access denied. Contact support."
        : errorParam
          ? "An authentication error occurred. Please try again."
          : ""
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (errorParam) {
      const timer = setTimeout(() => setErrorMessage(""), 8000);
      return () => clearTimeout(timer);
    }
  }, [errorParam]);

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
        toast.error(
          result.error === "CredentialsSignin"
            ? "Invalid email or password"
            : result.error
        );
        setLoading(false);
        return;
      }

      toast.success("Signed in successfully");

      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      const role = sessionData?.user?.role;

      if (role === "admin" || role === "staff") {
        router.push(
          callbackUrl.startsWith("/sign") ? "/dashboard" : callbackUrl
        );
      } else {
        router.push(
          callbackUrl.startsWith("/sign") || callbackUrl.startsWith("/dashboard")
            ? "/"
            : callbackUrl
        );
      }
    } catch {
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <>
      {errorMessage && (
        <div className="mb-6 p-4 bg-rosegold/10 border border-rosegold/20 rounded-xl text-sm text-rosegold text-center">
          {errorMessage}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-mist/50 p-8 md:p-10 space-y-6"
      >
        <Input
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          rightIcon={
            showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )
          }
          onRightIconClick={() => setShowPassword(!showPassword)}
        />
        <div className="space-y-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
            icon={<LogIn className="w-4 h-4" />}
          >
            Sign In
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-mist/60" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-charcoal/30">
                or continue with
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              signIn("google", { callbackUrl: "/" })
            }
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-mist/60 rounded-xl text-sm text-charcoal/60 hover:text-charcoal hover:border-charcoal/20 hover:bg-mist/30 transition-all duration-200"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>

        <p className="text-center text-xs text-charcoal/40">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="text-gold hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </form>
    </>
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
            <h1 className="text-3xl font-serif mb-3 tracking-[0.15em] text-gradient-gold">
              KARTEL
            </h1>
          </Link>
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-px bg-gold/30" />
            <p className="text-sm text-charcoal/40">
              Sign in to your account
            </p>
            <div className="w-4 h-px bg-gold/30" />
          </div>
        </div>
        <Suspense
          fallback={
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-mist/50 p-10 text-center">
              <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-charcoal/40">Loading...</p>
            </div>
          }
        >
          <SignInForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
