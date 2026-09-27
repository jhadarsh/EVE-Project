import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../components/common/Button.jsx';

export default function NotFoundPage() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-500">
        <Compass size={30} />
      </div>
      <h1 className="text-3xl font-bold text-charcoal-800">404</h1>
      <p className="mt-2 max-w-sm text-charcoal-400">
        We couldn't find the page you were looking for. It may have moved or no longer exists.
      </p>
      <Button as={Link} to="/" className="mt-6">
        Back to home
      </Button>
    </div>
  );
}
