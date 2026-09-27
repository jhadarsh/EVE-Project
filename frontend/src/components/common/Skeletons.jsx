import React from 'react';
import { cn } from '../../utils/cn';

export function SkeletonBlock({ className }) {
  return <div className={cn('animate-pulse rounded-xl bg-charcoal-100', className)} />;
}

export function CentreCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-charcoal-100 bg-white p-5 shadow-soft">
      <SkeletonBlock className="h-32 w-full" />
      <SkeletonBlock className="mt-4 h-5 w-3/4" />
      <SkeletonBlock className="mt-2 h-4 w-1/2" />
      <SkeletonBlock className="mt-4 h-9 w-28 rounded-full" />
    </div>
  );
}

export function CentreGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CentreCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-charcoal-100 bg-white p-4">
      <SkeletonBlock className="h-12 w-12 rounded-full" />
      <div className="flex-1">
        <SkeletonBlock className="h-4 w-2/3" />
        <SkeletonBlock className="mt-2 h-3 w-1/3" />
      </div>
      <SkeletonBlock className="h-8 w-20 rounded-full" />
    </div>
  );
}

export function ListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ListRowSkeleton key={i} />
      ))}
    </div>
  );
}
