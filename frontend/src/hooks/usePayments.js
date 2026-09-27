import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as paymentsApi from "../services/paymentsApi";
import { QUERY_KEYS, PAYMENT_STATUS } from "../constants";

export function useCreatePayment() {
  return useMutation({
    mutationFn: paymentsApi.createPayment,
  });
}

export function usePayment(paymentId) {
  return useQuery({
    queryKey: QUERY_KEYS.payment(paymentId),
    queryFn: () => paymentsApi.getPayment(paymentId),
    enabled: !!paymentId,
  });
}

// Polls payment status while it is PENDING (the simulated webhook resolves it asynchronously).
// React Query v5 dropped per-query onSuccess, so the "status settled" side effect
// (refreshing the related booking) is handled here via a plain effect instead.
export function usePaymentStatus(paymentId) {
  const queryClient = useQueryClient();
  const settledRef = useRef(false);

  const query = useQuery({
    queryKey: QUERY_KEYS.paymentStatus(paymentId),
    queryFn: () => paymentsApi.getPaymentStatus(paymentId),
    enabled: !!paymentId,
    refetchInterval: (q) => {
      const status = q.state.data?.data?.status;
      return status === PAYMENT_STATUS.PENDING ? 3000 : false;
    },
  });

  useEffect(() => {
    const status = query.data?.data?.status;
    if (status && status !== PAYMENT_STATUS.PENDING && !settledRef.current) {
      settledRef.current = true;
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    }
  }, [query.data, queryClient]);

  return query;
}
