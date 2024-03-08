'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './Home';

const Wrapper = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  );
};

export default Wrapper;
