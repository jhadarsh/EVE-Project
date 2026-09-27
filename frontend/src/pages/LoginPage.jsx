import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { loginSchema } from '../validators/authValidators';
import { useAuth } from '../context/AuthContext.jsx';
import { useBookingSelection } from '../context/BookingContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import { ApiError } from '../services/apiClient';

export default function LoginPage() {
  const { login } = useAuth();
  const { redirectAfterAuth } = useBookingSelection();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await login(values);
      toast.success('Welcome back!');
      const dest = location.state?.from || redirectAfterAuth || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      setFormError(message);
    } finally {
      setSubmitting(false);
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
        <h1 className="text-xl font-bold text-charcoal-800">Welcome back</h1>
        <p className="mt-1 text-sm text-charcoal-400">Log in to continue booking your tests.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input label="Email" type="email" required {...register('email')} error={errors.email?.message} />
          <Input label="Password" type="password" required {...register('password')} error={errors.password?.message} />
          {formError && <p className="text-sm font-medium text-danger-500">{formError}</p>}
          <Button type="submit" className="w-full" loading={submitting}>
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-charcoal-400">
          Don&rsquo;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
