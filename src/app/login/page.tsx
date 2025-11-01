import { Suspense } from 'react';
import LoginForm from '@/components/app/login-form';
import { Sparkles, Video, FileText, Users } from 'lucide-react';

export default function LoginPage() {
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
      {/* Left Side - Brand & Features */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold">LISN</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">LISN</span>
          </h1>
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">Transform your meetings with AI-powered transcription, real-time insights, and seamless collaboration.</p>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <div className="p-2 bg-white/20 rounded-lg">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-blue-100 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-blue-200 text-sm">© 2025 LISN. Transforming conversations into insights.</div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LISN</span>
          </div>
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
