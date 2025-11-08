// app/reset-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface PasswordRequirement {
  text: string;
  met: boolean;
}

interface PasswordStrength {
  score: number;
  feedback: PasswordRequirement[];
}

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Password strength checker
  useEffect(() => {
    const checkPasswordStrength = () => {
      const feedback: PasswordRequirement[] = [];
      let score = 0;

      // Length check
      if (newPassword.length >= 8) {
        score += 1;
        feedback.push({ text: "At least 8 characters", met: true });
      } else {
        feedback.push({ text: "At least 8 characters", met: false });
      }

      // Uppercase check
      if (/[A-Z]/.test(newPassword)) {
        score += 1;
        feedback.push({ text: "One uppercase letter", met: true });
      } else {
        feedback.push({ text: "One uppercase letter", met: false });
      }

      // Lowercase check
      if (/[a-z]/.test(newPassword)) {
        score += 1;
        feedback.push({ text: "One lowercase letter", met: true });
      } else {
        feedback.push({ text: "One lowercase letter", met: false });
      }

      // Number check
      if (/[0-9]/.test(newPassword)) {
        score += 1;
        feedback.push({ text: "One number", met: true });
      } else {
        feedback.push({ text: "One number", met: false });
      }

      // Special character check
      if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
        score += 1;
        feedback.push({ text: "One special character", met: true });
      } else {
        feedback.push({ text: "One special character", met: false });
      }

      setPasswordStrength({ score, feedback });
    };

    if (newPassword) {
      checkPasswordStrength();
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  }, [newPassword]);

  const getStrengthText = () => {
    if (passwordStrength.score === 0) return "Enter a password";
    if (passwordStrength.score <= 2) return "Weak";
    if (passwordStrength.score <= 3) return "Fair";
    if (passwordStrength.score <= 4) return "Good";
    return "Strong";
  };

  useEffect(() => {
    if (!token) {
      setMessage({ type: "error", text: "Invalid reset link. Please request a new password reset." });
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!token) {
      setMessage({ type: "error", text: "Invalid reset token" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters long" });
      return;
    }

    if (passwordStrength.score < 3) {
      setMessage({ type: "error", text: "Please choose a stronger password" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: data.message || "Password reset successfully! Redirecting to login...",
        });
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } else {
        setMessage({
          type: "error",
          text: data.error || data.message || "Failed to reset password",
        });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setMessage({
        type: "error",
        text: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h1>
            <p className="text-gray-600 mb-6">The password reset link is invalid or has expired. Please request a new reset link.</p>
            <a href="/auth/login" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
              Back to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">Set New Password</h1>
          <p className="text-gray-600">Create a new password for your LISN account</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
            {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              New Password
            </label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create a strong password"
                required
                minLength={8}
                disabled={isLoading}
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Password Strength</span>
                  <span className={`text-sm font-semibold ${passwordStrength.score <= 2 ? "text-red-600" : passwordStrength.score <= 3 ? "text-yellow-600" : passwordStrength.score <= 4 ? "text-blue-600" : "text-green-600"}`}>
                    {getStrengthText()}
                  </span>
                </div>

                {/* Strength Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${passwordStrength.score <= 2 ? "bg-red-500" : passwordStrength.score <= 3 ? "bg-yellow-500" : passwordStrength.score <= 4 ? "bg-blue-500" : "bg-green-500"}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>

                {/* Password Requirements */}
                <div className="space-y-2">
                  {passwordStrength.feedback.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {item.met ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                      <span className={`text-xs ${item.met ? "text-green-600" : "text-gray-500"}`}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Confirm New Password
            </label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={8}
                disabled={isLoading}
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading}>
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className="flex items-center gap-2 p-2">
                {newPassword === confirmPassword ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Passwords match</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-red-600 font-medium">Passwords do not match</span>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!!(isLoading || message?.type === "success" || (newPassword && passwordStrength.score < 3))}
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Reset Password"}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-gray-600">
            Remember your password?{" "}
            <a href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Back to Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
