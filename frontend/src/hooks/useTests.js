import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as testsApi from '../services/testsApi';
import { QUERY_KEYS } from '../constants';

export function useTests(params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.tests(params),
    queryFn: () => testsApi.listTests(params),
    keepPreviousData: true,
  });
}

export function useTest(testId) {
  return useQuery({
    queryKey: QUERY_KEYS.test(testId),
    queryFn: () => testsApi.getTest(testId),
    enabled: !!testId,
  });
}

export function useCreateTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: testsApi.createTest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tests'] }),
  });
}

export function useUpdateTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ testId, payload }) => testsApi.updateTest(testId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tests'] }),
  });
}
