import { createContext, useContext } from 'react';
import { SupabaseConnector, supabaseConnector } from './SupabaseConnector';

const SupabaseConnectorContext = createContext<SupabaseConnector>(supabaseConnector);

export const useSupabaseConnector = () => useContext(SupabaseConnectorContext);

interface SupabaseConnectorProviderProps {
  children: React.ReactNode;
  connector?: SupabaseConnector;
}

export const SupabaseConnectorProvider = ({
  children,
  connector = supabaseConnector
}: SupabaseConnectorProviderProps) => {
  return <SupabaseConnectorContext.Provider value={connector}>{children}</SupabaseConnectorContext.Provider>;
};

export default SupabaseConnectorProvider;

