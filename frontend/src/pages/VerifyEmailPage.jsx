import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { MailCheck } from 'lucide-react';
import { verifySchema } from '../validators/authValidators';
import { useAuth } from '../context/AuthContext.jsx';
import { useBookingSelection } from '../context/BookingContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import { ApiError } from '../services/apiClient';

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verify, resend } = useAuth();
  const { redirectAfterAuth } = useBookingSelection();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifySchema),
    defaultValues: { email: location.state?.email || '', token: '', type: 'signup' },
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await verify(values);
      toast.success('Email verified successfully');
      navigate(redirectAfterAuth || '/', { replace: true });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async (email) => {
    if (!email) {
      setFormError('Enter your email address first.');
      return;
    }
    setResending(true);
    try {
      await resend(email);
      toast.success('Verification email sent');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not resend the email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm rounded-2xl border border-charcoal-100 bg-white p-8 shadow-card"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-500">
          <MailCheck size={22} />
        </div>
        <h1 className="text-xl font-bold text-charcoal-800">Verify your email</h1>
        <p className="mt-1 text-sm text-charcoal-400">Enter the code we sent to your email address.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input label="Email" type="email" required {...register('email')} error={errors.email?.message} />
          <Input label="Verification code" required {...register('token')} error={errors.token?.message} placeholder="123456" />
          {formError && <p className="text-sm font-medium text-danger-500">{formError}</p>}
          <Button type="submit" className="w-full" loading={submitting}>
            Verify
          </Button>
        </form>

        <button
          type="button"
          onClick={() => handleResend(getValues('email'))}
          disabled={resending}
          className="mt-4 w-full text-center text-sm font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
        >
          {resending ? 'Sending...' : "Didn't get a code? Resend"}
        </button>
      </motion.div>
    </div>
  );
}
