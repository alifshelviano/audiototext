"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, Users, Video, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface PasswordRequirement {
  text: string;
  met: boolean;
}

interface PasswordStrength {
  score: number;
  feedback: PasswordRequirement[];
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
  });
  const router = useRouter();

  // Password strength checker
  useEffect(() => {
    const checkPasswordStrength = () => {
      const feedback: PasswordRequirement[] = [];
      let score = 0;

      // Length check
      if (password.length >= 8) {
        score += 1;
        feedback.push({ text: "At least 8 characters", met: true });
      } else {
        feedback.push({ text: "At least 8 characters", met: false });
      }

      // Uppercase check
      if (/[A-Z]/.test(password)) {
        score += 1;
        feedback.push({ text: "One uppercase letter", met: true });
      } else {
        feedback.push({ text: "One uppercase letter", met: false });
      }

      // Lowercase check
      if (/[a-z]/.test(password)) {
        score += 1;
        feedback.push({ text: "One lowercase letter", met: true });
      } else {
        feedback.push({ text: "One lowercase letter", met: false });
      }

      // Number check
      if (/[0-9]/.test(password)) {
        score += 1;
        feedback.push({ text: "One number", met: true });
      } else {
        feedback.push({ text: "One number", met: false });
      }

      // Special character check
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        score += 1;
        feedback.push({ text: "One special character", met: true });
      } else {
        feedback.push({ text: "One special character", met: false });
      }

      setPasswordStrength({ score, feedback });
    };

    if (password) {
      checkPasswordStrength();
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength.score === 0) return "bg-gray-200";
    if (passwordStrength.score <= 2) return "bg-red-500";
    if (passwordStrength.score <= 3) return "bg-yellow-500";
    if (passwordStrength.score <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength.score === 0) return "Enter a password";
    if (passwordStrength.score <= 2) return "Weak";
    if (passwordStrength.score <= 3) return "Fair";
    if (passwordStrength.score <= 4) return "Good";
    return "Strong";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    if (passwordStrength.score < 3) {
      setError("Please choose a stronger password");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const signInResponse = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (signInResponse?.ok) {
          router.push("/dashboard");
        } else {
          setError("Failed to automatically log in. Please go to the login page.");
        }
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      setError("Network error: Could not connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Video className="w-6 h-6" />,
      title: "Smart Meetings",
      description: "AI-powered meeting transcription and analysis",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Live Transcripts",
      description: "Real-time transcription in multiple languages",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Share insights and collaborate seamlessly",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Left Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Brand */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LISN</span>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">Create Account</h2>
              <p className="text-gray-600">Join thousands of teams using LISN</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {confirmPassword && (
                  <div className="flex items-center gap-2">
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-600">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-xs text-red-600">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
                type="submit"
                disabled={isLoading || (password.length > 0 && passwordStrength.score < 3)}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                Already have an account?{" "}
                <a href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Sign in
                </a>
              </p>
            </div>

            {/* Privacy notice */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-gray-600 hover:text-gray-800 underline">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="text-gray-600 hover:text-gray-800 underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Brand & Features with Background Image */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/register-background.jpg')", // Replace with your image path
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-blue-800/80" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">LISN</span>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl font-bold mb-6 leading-tight text-white">
            Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">LISN</span> Today
          </h1>
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">Transform your meetings with AI-powered transcription, real-time insights, and seamless collaboration.</p>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                <div className="p-2 bg-white/20 rounded-lg text-white">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold text-lg text-white">{feature.title}</h3>
                  <p className="text-blue-100 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-blue-200 text-sm">© 2025 LISN. Transforming conversations into insights.</div>
      </div>
    </div>
  );
}
