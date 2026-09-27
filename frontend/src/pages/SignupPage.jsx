import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { signupSchema } from '../validators/authValidators';
import { useAuth } from '../context/AuthContext.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import { ApiError } from '../services/apiClient';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (values) => {
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await signup(values);
      if (res.emailConfirmed === false) {
        navigate('/verify-email', { state: { email: values.email } });
      } else {
        navigate('/');
      }
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
        <h1 className="text-xl font-bold text-charcoal-800">Create your account</h1>
        <p className="mt-1 text-sm text-charcoal-400">Book diagnostic tests in a few clicks.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input label="Full name" required {...register('full_name')} error={errors.full_name?.message} />
          <Input label="Email" type="email" required {...register('email')} error={errors.email?.message} />
          <Input label="Phone number" required {...register('phone')} error={errors.phone?.message} placeholder="9876543210" />
          <Input
            label="Password"
            type="password"
            required
            {...register('password')}
            error={errors.password?.message}
            hint="At least 8 characters"
          />
          {formError && <p className="text-sm font-medium text-danger-500">{formError}</p>}
          <Button type="submit" className="w-full" loading={submitting}>
            Sign up
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-charcoal-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
