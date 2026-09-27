import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as bookingsApi from '../services/bookingsApi';
import { QUERY_KEYS } from '../constants';

export function useBookings(params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.bookings(params),
    queryFn: () => bookingsApi.listBookings(params),
    keepPreviousData: true,
  });
}

export function useBooking(bookingId, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.booking(bookingId),
    queryFn: () => bookingsApi.getBooking(bookingId),
    enabled: !!bookingId,
    ...options,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookingsApi.createBooking,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, reason }) => bookingsApi.cancelBooking(bookingId, reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.booking(variables.bookingId) });
    },
  });
}
