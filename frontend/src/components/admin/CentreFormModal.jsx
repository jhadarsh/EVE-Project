import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../common/Modal.jsx';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import { centreSchema } from '../../validators/adminValidators';

export default function CentreFormModal({ open, onClose, onSubmit, initialValues, submitting }) {
  const isEdit = !!initialValues;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(centreSchema),
    values: initialValues || { name: '', location: '', address: '', description: '', is_active: true },
  });

  const submit = (values) => {
    onSubmit(values, () => {
      reset();
      onClose();
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit diagnostic centre' : 'Add diagnostic centre'} size="lg">
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <Input label="Name" required {...register('name')} error={errors.name?.message} placeholder="ABC Diagnostics" />
        <Input label="Location" required {...register('location')} error={errors.location?.message} placeholder="Agra" />
        <Input label="Address" required {...register('address')} error={errors.address?.message} placeholder="123 Main Road, Agra" />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal-700">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full rounded-xl border border-charcoal-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            placeholder="Diagnostic testing centre"
          />
          {errors.description && <p className="mt-1.5 text-xs font-medium text-danger-500">{errors.description.message}</p>}
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
            {isEdit ? 'Save changes' : 'Create centre'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
