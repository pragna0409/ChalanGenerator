import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, InventoryItem, Chalan } from '../types';
import * as api from '../utils/dataApi';

interface DataContextType {
  clients: Client[];
  inventory: InventoryItem[];
  chalans: Chalan[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  addClients: (clients: Omit<Client, 'id' | 'createdAt'>[]) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt'>) => Promise<void>;
  addInventoryItems: (items: Omit<InventoryItem, 'id' | 'createdAt'>[]) => Promise<void>;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  addChalan: (chalan: Omit<Chalan, 'id' | 'createdAt'>) => Promise<void>;
  updateChalan: (id: string, chalan: Partial<Chalan>) => Promise<void>;
  deleteChalan: (id: string) => Promise<void>;
  getClientInventory: (clientId: string) => InventoryItem[];
  getClientChalanCount: (clientId: string) => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children, isAuthenticated }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [chalans, setChalans] = useState<Chalan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch all data
  const fetchAllData = async () => {
    if (!isAuthenticated) {
      setClients([]);
      setInventory([]);
      setChalans([]);
      return;
    }

    setIsLoading(true);
    try {
      const [clientsData, inventoryData, chalansData] = await Promise.all([
        api.getClients(),
        api.getInventory(),
        api.getChalans()
      ]);
      setClients(clientsData);
      setInventory(inventoryData);
      setChalans(chalansData);
    } catch (err) {
      console.error('Error fetching data:', err);
      // Clear data on error (e.g., invalid token)
      setClients([]);
      setInventory([]);
      setChalans([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when component mounts and when authentication status changes
  useEffect(() => {
    fetchAllData();
  }, [isAuthenticated]);

  const addClient = async (client: Omit<Client, 'id' | 'createdAt'>) => {
    await api.addClient(client);
    await fetchAllData();
  };

  const addClients = async (newClients: Omit<Client, 'id' | 'createdAt'>[]) => {
    for (const client of newClients) {
      await api.addClient(client);
    }
    setClients(await api.getClients());
  };

  const updateClient = async (id: string, client: Partial<Client>) => {
    await api.updateClient(id, client);
    setClients(await api.getClients());
  };

  const deleteClient = async (id: string) => {
    await api.deleteClient(id);
    setClients(await api.getClients());
  };

  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'createdAt'>) => {
    await api.addInventoryItem(item);
    setInventory(await api.getInventory());
  };

  const addInventoryItems = async (newItems: Omit<InventoryItem, 'id' | 'createdAt'>[]) => {
    for (const item of newItems) {
      await api.addInventoryItem(item);
    }
    setInventory(await api.getInventory());
  };

  const updateInventoryItem = async (id: string, item: Partial<InventoryItem>) => {
    await api.updateInventoryItem(id, item);
    setInventory(await api.getInventory());
  };

  const deleteInventoryItem = async (id: string) => {
    await api.deleteInventoryItem(id);
    setInventory(await api.getInventory());
  };

  const addChalan = async (chalan: Omit<Chalan, 'id' | 'createdAt'>) => {
    await api.addChalan(chalan);
    setChalans(await api.getChalans());
  };

  const updateChalan = async (id: string, chalan: Partial<Chalan>) => {
    await api.updateChalan(id, chalan);
    setChalans(await api.getChalans());
  };

  const deleteChalan = async (id: string) => {
    await api.deleteChalan(id);
    setChalans(await api.getChalans());
  };

  const getClientInventory = (clientId: string) => {
    return inventory.filter(item => item.clientId === clientId);
  };

  const getClientChalanCount = (clientId: string) => {
    return chalans.filter(chalan => chalan.clientId === clientId).length;
  };

  const value: DataContextType = {
    clients,
    inventory,
    chalans,
    addClient,
    addClients,
    updateClient,
    deleteClient,
    addInventoryItem,
    addInventoryItems,
    updateInventoryItem,
    deleteInventoryItem,
    addChalan,
    updateChalan,
    deleteChalan,
    getClientInventory,
    getClientChalanCount
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};