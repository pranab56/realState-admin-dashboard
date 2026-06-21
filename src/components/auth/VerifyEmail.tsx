"use client";

import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { motion } from 'framer-motion';
import { useForgotEmailOTPCheckMutation, useResendPasswordMutation } from '../../features/auth/authApi';

export default function VerifyEmail() {
  const [otp, setOtp] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  const [otpCheck, { isLoading: isLoadingOTPCheck }] = useForgotEmailOTPCheckMutation();

  const [resendOTP, { isLoading: isLoadingResendOTP }] = useResendPasswordMutation();

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    try {
      const res = await otpCheck({ email: email!, oneTimeCode: parseInt(otp) }).unwrap();
      toast.success(res.message);
      router.push(`/auth/reset-password?token=${res?.data}`);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Verification failed");
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    try {
      const response = await resendOTP({ email: email }).unwrap();
      toast.success(response.message);
      setCountdown(60); // Set 60 seconds cooldown
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Verification code resent failed");
    }
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Verify OTP</h2>
            <p className="text-sm sm:text-base text-gray-500">
              We have sent a verification code to <span className="font-semibold text-gray-700">{email || "your email"}</span>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 flex flex-col items-center">

            <div className="w-full flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup className="gap-1 sm:gap-2">
                  <InputOTPSlot index={0} className="w-10 h-10 sm:w-12 sm:h-12 border-gray-100 rounded-lg text-base sm:text-lg bg-[#F9FAFB] focus:ring-1 focus:ring-[#F1913D]" />
                  <InputOTPSlot index={1} className="w-10 h-10 sm:w-12 sm:h-12 border-gray-100 rounded-lg text-base sm:text-lg bg-[#F9FAFB] focus:ring-1 focus:ring-[#F1913D]" />
                  <InputOTPSlot index={2} className="w-10 h-10 sm:w-12 sm:h-12 border-gray-100 rounded-lg text-base sm:text-lg bg-[#F9FAFB] focus:ring-1 focus:ring-[#F1913D]" />
                  <InputOTPSlot index={3} className="w-10 h-10 sm:w-12 sm:h-12 border-gray-100 rounded-lg text-base sm:text-lg bg-[#F9FAFB] focus:ring-1 focus:ring-[#F1913D]" />
                  <InputOTPSlot index={4} className="w-10 h-10 sm:w-12 sm:h-12 border-gray-100 rounded-lg text-base sm:text-lg bg-[#F9FAFB] focus:ring-1 focus:ring-[#F1913D]" />
                  <InputOTPSlot index={5} className="w-10 h-10 sm:w-12 sm:h-12 border-gray-100 rounded-lg text-base sm:text-lg bg-[#F9FAFB] focus:ring-1 focus:ring-[#F1913D]" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              type="submit"
              disabled={isLoadingOTPCheck || otp.length !== 6}
              className="w-full h-12 bg-[#F1913D] hover:bg-[#F1913D] hover:opacity-80 text-white rounded-xl text-base font-semibold transition-all shadow-lg shadow-orange-200 group"
            >
              {isLoadingOTPCheck ? 'Verifying...' : (
                <span className="flex items-center gap-2">
                  Verify Code <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Didn&apos;t receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoadingResendOTP || countdown > 0}
                className="text-[#F1913D] font-semibold cursor-pointer hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {isLoadingResendOTP ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <Link
              href="/auth/login"
              className="text-gray-500 hover:text-[#F1913D] font-medium inline-flex items-center gap-2 group transition-colors text-sm"
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

