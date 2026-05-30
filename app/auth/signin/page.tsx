/**
 * ConsulTara TeleConsultation Platform - Sign In Page
 * 
 * This page provides the sign-in interface matching the provided screenshot design.
 * Features a split layout with an image on the left and login form on the right.
 */

'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

function getDashboardRoute(
  user: { role: 'patient' | 'doctor' } | undefined,
  patientProfile: { firstName?: string } | null | undefined,
  doctorProfile: { firstName?: string } | null | undefined,
) {
  if (user?.role === 'patient') {
    return '/patient/dashboard';
  }

  if (user?.role === 'doctor') {
    return '/doctor/dashboard';
  }

  return '/auth/select-role';
}

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await signIn(email, password);
      
      if (result.success) {
        toast.success('Welcome back!');
        router.push(getDashboardRoute(result.user, result.patientProfile, result.doctorProfile));
      } else {
        toast.error(result.error || 'Sign in failed');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    toast.info('Google sign-in coming soon');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1200&h=1600&fit=crop"
          alt="Telehealth consultation between doctor and patient"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F3EFE3]">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <Link href="/" className="flex flex-col items-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ConsulTara%20Logo-oqtBESzen2QQnxkVKzgc7RxAQEbHnb.png"
              alt="ConsulTara Logo"
              width={80}
              height={80}
              className="mb-4"
            />
            <h1 className="text-2xl font-semibold text-[#769382]">ConsulTara</h1>
          </Link>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#2D3B35] text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-[#C0C3B9]/30 border-[#C0C3B9] focus:border-[#769382] focus:ring-[#769382] placeholder:text-[#2D3B35]/50"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#2D3B35] text-sm">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-[#C0C3B9]/30 border-[#C0C3B9] focus:border-[#769382] focus:ring-[#769382] placeholder:text-[#2D3B35]/50 pr-12"
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = !showPassword;
                    setShowPassword(next);
                    try {
                      if (passwordRef.current) passwordRef.current.type = next ? 'text' : 'password';
                    } catch (e) {
                      // ignore
                    }
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2D3B35]/50 hover:text-[#2D3B35] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-[#C0C3B9] data-[state=checked]:bg-[#769382] data-[state=checked]:border-[#769382]"
                />
                <Label 
                  htmlFor="remember" 
                  className="text-sm text-[#2D3B35] cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-[#769382] hover:text-[#769382]/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#769382] hover:bg-[#769382]/90 text-white font-medium"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#C0C3B9]" />
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full h-12 bg-[#C0C3B9]/30 border-[#C0C3B9] hover:bg-[#C0C3B9]/50 text-[#2D3B35]"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
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
              Or sign in with Google
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-[#2D3B35]/70">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/select-role"
              className="text-[#769382] font-medium hover:text-[#769382]/80 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
