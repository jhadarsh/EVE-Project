import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../services/authApi";
import { centresApi } from "../services/centresApi";
import { testsApi } from "../services/testsApi";
import { bookingsApi } from "../services/bookingsApi";
import { paymentsApi } from "../services/paymentsApi";
import { logsApi } from "../services/logsApi";

export const useCentres = (p) =>
  useQuery({
    queryKey: ["centres", p],
    queryFn: () => centresApi.list(p).then((r) => r.data),
    placeholderData: (p) => p,
  });
export const useCentre = (id) =>
  useQuery({
    queryKey: ["centre", id],
    queryFn: () => centresApi.get(id).then((r) => r.data.data),
    enabled: !!id,
  });
export const useCentreTests = (id, p) =>
  useQuery({
    queryKey: ["centre-tests", id, p],
    queryFn: () => centresApi.tests(id, p).then((r) => r.data),
    enabled: !!id,
    placeholderData: (p) => p,
  });
export const useCentreSlots = (id, p) =>
  useQuery({
    queryKey: ["centre-slots", id, p],
    queryFn: () => centresApi.slots(id, p).then((r) => r.data),
    enabled: !!id,
    placeholderData: (p) => p,
  });
export const useTests = (p) =>
  useQuery({
    queryKey: ["tests", p],
    queryFn: () => testsApi.list(p).then((r) => r.data),
    placeholderData: (p) => p,
  });
export const useTest = (id) =>
  useQuery({
    queryKey: ["test", id],
    queryFn: () => testsApi.get(id).then((r) => r.data.data),
    enabled: !!id,
  });
export const useBookings = (p) =>
  useQuery({
    queryKey: ["bookings", p],
    queryFn: () => bookingsApi.list(p).then((r) => r.data),
    placeholderData: (p) => p,
  });
export const useBooking = (id) =>
  useQuery({
    queryKey: ["booking", id],
    queryFn: () => bookingsApi.get(id).then((r) => r.data.data),
    enabled: !!id,
  });
export const usePayment = (id, enabled = true) =>
  useQuery({
    queryKey: ["payment", id],
    queryFn: () => paymentsApi.get(id).then((r) => r.data.data),
    enabled: !!id && enabled,
  });
export const usePaymentStatus = (id, enabled = true) =>
  useQuery({
    queryKey: ["payment-status", id],
    queryFn: () => paymentsApi.status(id).then((r) => r.data.data),
    enabled: !!id && enabled,
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      return status === "PENDING" ? 2500 : false;
    },
  });
export const useAdminLogs = (p) =>
  useQuery({
    queryKey: ["logs", p],
    queryFn: () => logsApi.list(p).then((r) => r.data),
    placeholderData: (p) => p,
  });

export const useInvalidate = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries();
};
export const mutations = {
  login: () => useMutation({ mutationFn: authApi.login }),
  signup: () => useMutation({ mutationFn: authApi.signup }),
  verify: () => useMutation({ mutationFn: authApi.verify }),
  resend: () => useMutation({ mutationFn: authApi.resendVerification }),
  logout: () => useMutation({ mutationFn: authApi.logout }),
  createBooking: () => useMutation({ mutationFn: bookingsApi.create }),
  cancelBooking: () =>
    useMutation({
      mutationFn: ({ id, reason }) =>
        bookingsApi.cancel(id, reason ? { reason } : {}),
    }),
  createPayment: () =>
    useMutation({
      mutationFn: ({ bookingId }) => paymentsApi.create(bookingId),
    }),
};
