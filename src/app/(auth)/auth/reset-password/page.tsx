"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import toast from 'react-hot-toast';

import { motion } from 'framer-motion';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const router = useRouter();
  const searchParams = useSearchParams();
  console.log(searchParams)

  const validate = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Password reset successfully!');

      // Redirect to login
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F7FC] font-sans items-center justify-center p-4">
      <div className="w-full max-w-[480px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-10 bg-orange-50 rounded-xl shadow-sm border border-gray-100/50"
        >
          <div className="text-center mb-10">
            <div className="w-32 h-12  flex items-center justify-center mx-auto mb-4">
              <Image src="/icons/logo.png" alt="Logo" width={1000} height={10000} className="" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Set a new password</h2>
            <p className="text-sm sm:text-base text-gray-500">
              Your new password must be different to previously used password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">New Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create new password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  className={cn(
                    "h-12 bg-[#F9FAFB] border-gray-100 rounded-xl focus-visible:ring-1 transition-all pr-10",
                    errors.password ? "focus-visible:ring-red-500 bg-red-50/50" : "focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  className={cn(
                    "h-12 bg-[#F9FAFB] border-gray-100 rounded-xl focus-visible:ring-1 transition-all pr-10",
                    errors.confirmPassword ? "focus-visible:ring-red-500 bg-red-50/50" : "focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs font-medium text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#F1913D] hover:bg-[#F1913D] hover:opacity-80 text-white rounded-xl text-base font-semibold transition-all shadow-lg shadow-orange-200 group mt-2"
            >
              {isLoading ? 'Resetting...' : (
                <span className="flex items-center gap-2">
                  Reset Password <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/auth/login"
              className="text-[#F1913D] font-semibold hover:underline inline-flex items-center gap-2 group transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
