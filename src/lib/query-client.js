import { QueryClient } from '@tanstack/react-query';


export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			staleTime: 5 * 60 * 1000,   // Data stays fresh for 5 minutes — no refetch on page nav
			gcTime: 10 * 60 * 1000,      // Keep unused cache for 10 minutes before garbage collecting
		},
	},
});