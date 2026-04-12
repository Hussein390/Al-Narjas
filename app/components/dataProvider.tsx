'use client'

import React, { createContext, ReactNode, useContext, useState, Dispatch, SetStateAction } from "react";



export type ItemProps = {
  id: string,
  itemName: string;
  sellPrice: string;
  boughtPrice: string;
  installmentPrice?: string;
  text?: string;
  type: string;
  createdAt?: Date;
  environmentId: string;
  userId?: string;
  length: string;
  fixedLength?: string
  creator?: {
    name: string;
  };
};


// Define the context value type
type IsOpenContextType = {
  search: { name: string, type: string },
  setSearch: Dispatch<SetStateAction<{ name: string, type: string }>>,
  items: ItemProps[];
  setItems: Dispatch<SetStateAction<ItemProps[]>>;
  showAlert: (message: string, isSuccess?: boolean) => void;  // ✅ Added showAlert
};

// Create the context with a proper default value
const DataContext = createContext<IsOpenContextType>({
  search: { name: '', type: '' },
  setSearch: () => { },
  items: [],
  setItems: () => { },
  showAlert: () => { },
});

// Create a provider component
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ItemProps[]>([]);
  const [search, setSearch] = React.useState<{ name: string, type: string }>({ name: '', type: '' });
  const [alertMessage, setAlertMessage] = React.useState<string | null>(null);
  const [alertSuccessMessage, setAlertSuccessMessage] = React.useState<string | null>(null);

  function showAlert(message: string, isSuccess = false) {
    if (isSuccess) {
      setAlertSuccessMessage(message);
    } else {
      setAlertMessage(message);
    }
    setTimeout(() => {
      setAlertMessage(null);
      setAlertSuccessMessage(null);
    }, 5000);
  }

  return (
    <DataContext.Provider value={{  search, setSearch, setItems, items,  showAlert }}>
      {children}
      {(alertMessage || alertSuccessMessage) && (
        <div className={`fixed top-16 right-3 outline-2 ${alertSuccessMessage ? 'outline-green-600' : 'outline-red-600'}  outline rounded-md`}>
          <div className="bg-white p-4 rounded shadow-md max-w-sm text-center">
            <p className="text-black">{alertSuccessMessage || alertMessage}</p>
          </div>
        </div>
      )}
    </DataContext.Provider>
  );
};

// Custom hook to use the context
export const DataPhones = () => {
  return useContext(DataContext);
};