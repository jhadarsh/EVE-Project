import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-charcoal-100 bg-white">
      <div className="container-page grid grid-cols-2 gap-8 py-12 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
            EV
          </span>
          <p className="mt-3 text-sm text-charcoal-400">
            Book diagnostic tests at trusted centres near you, without the waiting room guesswork.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-charcoal-700">Product</h4>
          <ul className="mt-3 space-y-2 text-sm text-charcoal-400">
            <li>Find centres</li>
            <li>Browse tests</li>
            <li>Track a booking</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-charcoal-700">Support</h4>
          <ul className="mt-3 space-y-2 text-sm text-charcoal-400">
            <li>Help centre</li>
            <li>Contact us</li>
            <li>Cancellation policy</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-charcoal-700">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-charcoal-400">
            <li>About EVE</li>
            <li>Privacy</li>
            <li>Terms</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-charcoal-100 py-5 text-center text-xs text-charcoal-300">
        &copy; {new Date().getFullYear()} EVE Healthcare. All rights reserved.
      </div>
    </footer>
  );
}
