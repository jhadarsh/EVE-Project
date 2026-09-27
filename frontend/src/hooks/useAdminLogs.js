import { useQuery } from '@tanstack/react-query';
import * as logsApi from '../services/logsApi';
import { QUERY_KEYS } from '../constants';

export function useAdminLogs(params = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.adminLogs(params),
    queryFn: () => logsApi.listLogs(params),
    keepPreviousData: true,
  });
}
