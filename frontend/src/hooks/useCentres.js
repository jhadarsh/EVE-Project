import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as centresApi from '../services/centresApi';
import { QUERY_KEYS } from '../constants';

export function useCentres(params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.centres(params),
    queryFn: () => centresApi.listCentres(params),
    keepPreviousData: true,
  });
}

export function useCentre(centreId) {
  return useQuery({
    queryKey: QUERY_KEYS.centre(centreId),
    queryFn: () => centresApi.getCentre(centreId),
    enabled: !!centreId,
  });
}

export function useCentreTests(centreId, params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.centreTests(centreId, params),
    queryFn: () => centresApi.listCentreTests(centreId, params),
    enabled: !!centreId,
    keepPreviousData: true,
  });
}

export function useCentreSlots(centreId, params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.centreSlots(centreId, params),
    queryFn: () => centresApi.listCentreSlots(centreId, params),
    enabled: !!centreId,
    keepPreviousData: true,
  });
}

export function useCreateCentre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: centresApi.createCentre,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['centres'] }),
  });
}

export function useUpdateCentre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ centreId, payload }) => centresApi.updateCentre(centreId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['centres'] }),
  });
}
