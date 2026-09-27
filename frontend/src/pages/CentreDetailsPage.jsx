import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Search as SearchIcon, Building2 } from 'lucide-react';
import { useCentre, useCentreTests } from '../hooks/useCentres';
import { useBookingSelection } from '../context/BookingContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import TestCard from '../components/tests/TestCard.jsx';
import TestSelectionSummary from '../components/tests/TestSelectionSummary.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Modal from '../components/common/Modal.jsx';
import { ListSkeleton } from '../components/common/Skeletons.jsx';

export default function CentreDetailsPage() {
  const { centreId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { centre, selectedTests, setCentre, toggleTest, removeTest, setRedirectAfterAuth } = useBookingSelection();

  const [search, setSearch] = useState('');
  const [infoTest, setInfoTest] = useState(null);

  const centreQuery = useCentre(centreId);
  const testsParams = useMemo(() => (search ? { search, limit: 50 } : { limit: 50 }), [search]);
  const testsQuery = useCentreTests(centreId, testsParams);

  const centreData = centreQuery.data?.data;
  const centreTests = testsQuery.data?.data || [];

  // Keep the booking-selection context in sync with the centre being viewed,
  // so a refresh or auth interruption doesn't lose which centre was chosen.
  React.useEffect(() => {
    if (centreData && centre?.id !== centreData.id) {
      setCentre({ id: centreData.id, name: centreData.name, location: centreData.location, address: centreData.address });
    }
  }, [centreData, centre?.id, setCentre]);

  const selectedForThisCentre = centre?.id === centreId ? selectedTests : [];
  const total = selectedForThisCentre.reduce((sum, t) => sum + Number(t.price || 0), 0);

  const handleToggle = (centreTest) => {
    toggleTest({
      id: centreTest.id,
      test_id: centreTest.test_id,
      name: centreTest.tests?.name,
      price: centreTest.price,
    });
  };

  const handleContinue = () => {
    const path = `/booking`;
    if (!isAuthenticated) {
      setRedirectAfterAuth(path);
      navigate('/login', { state: { from: path } });
      return;
    }
    navigate(path);
  };

  if (centreQuery.isLoading) {
    return (
      <div className="container-page py-16">
        <Spinner />
      </div>
    );
  }

  if (centreQuery.isError) {
    return (
      <div className="container-page py-16">
        <ErrorState error={centreQuery.error} onRetry={centreQuery.refetch} title="Centre not found" />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-start gap-4 rounded-2xl border border-charcoal-100 bg-white p-6 shadow-soft">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
            <Building2 size={26} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-charcoal-800 sm:text-2xl">{centreData.name}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-charcoal-400">
              <MapPin size={14} /> {centreData.address}
            </p>
            {centreData.description && <p className="mt-2 max-w-2xl text-sm text-charcoal-500">{centreData.description}</p>}
          </div>
        </div>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-charcoal-800">Available tests</h2>
            <div className="relative w-full max-w-xs">
              <SearchIcon size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tests..."
                className="w-full rounded-full border border-charcoal-200 bg-white py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
          </div>

          {testsQuery.isLoading && <ListSkeleton count={5} />}
          {testsQuery.isError && <ErrorState error={testsQuery.error} onRetry={testsQuery.refetch} />}
          {testsQuery.isSuccess && centreTests.length === 0 && (
            <EmptyState title="No tests available" description="This centre hasn't listed any tests matching your search." />
          )}
          {testsQuery.isSuccess && centreTests.length > 0 && (
            <div className="space-y-3">
              {centreTests.map((ct) => (
                <TestCard
                  key={ct.id}
                  centreTest={ct}
                  selected={selectedForThisCentre.some((t) => t.id === ct.id)}
                  onToggle={handleToggle}
                  onInfo={setInfoTest}
                />
              ))}
            </div>
          )}
        </div>

        <TestSelectionSummary
          selectedTests={selectedForThisCentre}
          total={total}
          onRemove={removeTest}
          onContinue={handleContinue}
        />
      </div>

      <Modal open={!!infoTest} onClose={() => setInfoTest(null)} title={infoTest?.name} size="sm">
        <p className="text-sm text-charcoal-500">{infoTest?.information}</p>
      </Modal>
    </div>
  );
}
