import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientInfoSchema } from '../../validators/bookingValidators';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';

export default function PatientForm({ defaultValues, onSubmit, submitting }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(patientInfoSchema),
    defaultValues: defaultValues || {
      patient_name: '',
      patient_dob: '',
      patient_phone: '',
      patient_email: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Patient full name"
        required
        {...register('patient_name')}
        error={errors.patient_name?.message}
        placeholder="John Doe"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Date of birth"
          type="date"
          {...register('patient_dob')}
          error={errors.patient_dob?.message}
          hint="Optional"
        />
        <Input
          label="Phone number"
          required
          {...register('patient_phone')}
          error={errors.patient_phone?.message}
          placeholder="9876543210"
        />
      </div>
      <Input
        label="Email address"
        type="email"
        required
        {...register('patient_email')}
        error={errors.patient_email?.message}
        placeholder="john@example.com"
      />
      <Button type="submit" className="w-full sm:w-auto" loading={submitting}>
        Continue to confirmation
      </Button>
    </form>
  );
}
