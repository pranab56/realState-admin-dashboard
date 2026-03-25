"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';

import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});

  const router = useRouter();

  const validate = () => {
    const newErrors: { email?: string } = {};

    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
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
      setIsSuccess(true);
      toast.success('Reset link sent successfully!');

      // Optional: Redirect after success or just show success state
      setTimeout(() => {
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Forgot Password</h2>
            <p className="text-sm sm:text-base text-gray-500">
              Enter your registered email to receive an OTP.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <Input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                disabled={isLoading || isSuccess}
                className={cn(
                  "h-12 bg-[#F9FAFB] border-gray-100 rounded-xl focus-visible:ring-1 transition-all",
                  errors.email ? "focus-visible:ring-red-500 bg-red-50/50" : "focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]"
                )}
              />
              {errors.email && (
                <p className="text-xs font-medium text-red-500 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
                  {errors.email}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full h-12 bg-[#F1913D] hover:bg-[#F1913D] hover:opacity-80 text-white rounded-xl text-base font-semibold transition-all shadow-lg shadow-orange-200 group mt-2"
            >
              {isLoading ? 'Sending...' : isSuccess ? 'Code Sent!' : (
                <span className="flex items-center gap-2">
                  Send Reset Link <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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

