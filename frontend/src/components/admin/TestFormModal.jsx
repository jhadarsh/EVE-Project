import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../common/Modal.jsx';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import { testSchema } from '../../validators/adminValidators';

export default function TestFormModal({ open, onClose, onSubmit, initialValues, submitting }) {
  const isEdit = !!initialValues;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(testSchema),
    values: initialValues || { name: '', description: '', information: '', is_active: true },
  });

  const submit = (values) => {
    onSubmit(values, () => {
      reset();
      onClose();
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit diagnostic test' : 'Add diagnostic test'} size="lg">
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <Input label="Name" required {...register('name')} error={errors.name?.message} placeholder="CBC" />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal-700">Description</label>
          <textarea
            {...register('description')}
            rows={2}
            className="w-full rounded-xl border border-charcoal-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            placeholder="Complete Blood Count"
          />
          {errors.description && <p className="mt-1.5 text-xs font-medium text-danger-500">{errors.description.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal-700">Patient information</label>
          <textarea
            {...register('information')}
            rows={3}
            className="w-full rounded-xl border border-charcoal-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            placeholder="Fasting required for 8 hours before the test."
          />
          {errors.information && <p className="mt-1.5 text-xs font-medium text-danger-500">{errors.information.message}</p>}
        </div>
        {isEdit && (
          <label className="flex items-center gap-2.5 text-sm font-medium text-charcoal-700">
            <input type="checkbox" {...register('is_active')} className="h-4 w-4 rounded border-charcoal-300 text-brand-600" />
            Active
          </label>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save changes' : 'Create test'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
