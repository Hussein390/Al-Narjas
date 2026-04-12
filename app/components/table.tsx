"use client"
import React, { useEffect, useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { deleteItem, getEnvironmentById, getItems,  updateItem} from '../../backend/enviroment'
import { DataPhones, ItemProps} from './dataProvider'
import { useRouter } from 'next/navigation'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type UpdateState = {
  length?: string;
  fixedLength?: string;
  sellPrice?: string;
  text?: string;
  boughtPrice?: string;
  installmentPrice?: string;
};
export default function Tables() {
  const { showAlert, search,  items, setItems } = DataPhones();
  const router = useRouter()
  const [open, setOpen] = useState<{ [key: number]: boolean }>({});
  const [allItemsMoney, setAllItemsMoney] = useState<{sellPrice: number, installmentsPrice: number, boughtPrice: number}>({sellPrice: 0, boughtPrice: 0,installmentsPrice:0});

  const [isUpdate, setIsUpdate] = useState<{ [key: number]: boolean }>({});
  const [update, setUpdate] = useState<UpdateState>({});
  const USER = typeof window !== "undefined"
    ? localStorage.getItem("chosen")
    : null;


  // Get Collaborators
  const [ownerID, setOwnerID] = useState<string>('')
  const [collaborators, setCollaborators] = useState<{ user: { id: string, name: string | null } }[] | null>(null)
  async function getUserId() {
    const EnvId = localStorage.getItem('envId')!;
    const res = await getEnvironmentById({ id: EnvId });
    // Check if res is a string (error message)
    if (typeof res === 'string') {
      showAlert("Failed to fetch environment:" + res, false);
      return;
    }

    // Assuming res is now an object with the expected structure
    if (res && 'owner' in res && Array.isArray(res.collaborators)) {
      const formattedData = [];

      // Process the owner data
      formattedData.push({ user: { id: res.owner.id, name: res.owner.name || '' } });

      // Process the collaborators data
      res.collaborators.forEach(collab => {
        if (collab.user) {
          formattedData.push({ user: { id: collab.user.id, name: collab.user.name || '' } });
        }
      });
      setCollaborators(formattedData);
    } else {
      console.error("Unexpected response format:", res);
    }
  }
  React.useEffect(() => {
    getUserId()
  }, [])









  // get Items
  async function GetItems() {
    const EnvId = localStorage.getItem('envId');
    if (!EnvId) {
      console.error('Environment ID is missing!');
      return;
    }
      const data = await getItems(EnvId);
      setItems(data as ItemProps[]);
  }

  useEffect(() => {
    GetItems();
  }, [setItems]);

  // Upate an Item
  async function UpdateItem(item: { id: string }, index: number) {
    const EnvId = localStorage.getItem('envId');
    if (!EnvId) {
      console.error('Environment ID is missing!');
      return;
    }

    const object: any = {
      environmentId: EnvId,
      id: item.id,
    };

    if (update.length !== undefined) object.length = update.length;
    if (update.fixedLength !== undefined) object.fixedLength = update.fixedLength;
    if (update.sellPrice !== undefined) object.sellPrice = update.sellPrice;
    if (update.boughtPrice !== undefined) object.boughtPrice = update.boughtPrice;
    if (update.installmentPrice !== undefined) object.installmentPrice = update.installmentPrice;
    if (update.text !== undefined) object.text = update.text;

    const result = await updateItem(object);

    if (!result) return;
    await GetItems()
    setIsUpdate(prev => ({ ...prev, [index]: false }));
    setOpen(prev => ({ ...prev, [index]: false }));

    setItems(prev =>
      prev.map(i =>
        i.id === item.id
          ? { ...i, ...object }
          : i
      )
    );
    
    setUpdate({ });
  }
  // But an Item
  async function BuyItem(item: { id: string }, index: number) {
    const EnvId = localStorage.getItem('envId');

    if (!EnvId) {
      console.error('Environment ID is missing!');
      return;
    }

    const currentItem = items.find(i => i.id === item.id);

    if (currentItem && Number(currentItem.length) >= 1) {
      showAlert('Item sold', true);

      const object = {
        environmentId: EnvId,
        id: item.id,
        length: update.length,
        fixedLength: update.fixedLength,
        
        sellPrice: update.sellPrice,
        boughtPrice: update.boughtPrice,
        text: update.text,
        installmentPrice: update.installmentPrice
      };

      await updateItem(object);

      setIsUpdate(prev => ({ ...prev, [index]: false }));
      setOpen(prev => ({ ...prev, [index]: false }));

      setItems(prev =>
        prev.map(i =>
          i.id === item.id
            ? { ...i, length: String(Number(i.length) - 1) }
            : i
        )
      );

      setUpdate({});

    } else {
      showAlert('The Item Is Not Available', false);
    }
  }

  // Delete Item
  async function DeletItem(item: { id: string }, index: number) {
    const EnvId = localStorage.getItem('envId');
    if (!EnvId) {
      console.error('Environment ID is missing!');
      return;
    }

    const object: any = {
      environmentId: EnvId,
      id: item.id,
    };
    await deleteItem(object)
    setOpen(prev => ({ ...prev, [index]: false }))
    await GetItems()
  }
  useEffect(() => {
    if (USER) setOwnerID(USER);
  }, [USER]);
  return (
    <div className='lg:w-[1200px] mb-4 lg:mb-0 lg:mr-7 grid grid-cols-1'>
      <div className="flex items-center gap-x-2 mb-3">


        <div className="md:ml-12">
          <Select
            value={ownerID}
            onValueChange={(value) => {
              setOwnerID(value);
              localStorage.setItem("chosen", value);
            }}>
            <SelectTrigger id="framework">
              <SelectValue placeholder="أختر" />
            </SelectTrigger>
            <SelectContent >
              {(() => {
                if (!collaborators || collaborators.length === 0) {
                  return <SelectItem value="IOS">No Collaborators</SelectItem>;
                }

                // Create a unique filtered list
                const filtered = collaborators.filter(
                  (user, index, self) =>
                    index === self.findIndex(u => u.user.id === user.user.id)
                );
                // Render SelectItems
                return (<>
                  {
                    filtered.map(item => (

                      <SelectItem
                        className="cursor-pointer"
                        key={item.user.id}
                        value={item.user.id || "كرار امير2"}
                      >
                        {item.user.name}
                      </SelectItem>
                    ))}
                  <SelectItem
                    value='all-users'
                    className="cursor-pointer"
                    key={"all-users"}>ALL</SelectItem>
                </>)
              })()}
            </SelectContent>
          </Select>
        </div>
 
       
  
        
      </div>
      <div className=' mx-auto max-h-[650px] overflow-y-auto relative w-full' style={{ scrollbarWidth: 'none' }}>
        
        <div className='w-full font-sans font-semibold '>

          < Table >
            <TableHeader>
              <TableRow className='border-b border-b-black'>
                <TableHead className="w-fit">Count</TableHead>
                <TableHead className="w-fit">Item Name</TableHead>
                <TableHead>Bought Price</TableHead>
                <TableHead>Sell Price</TableHead>
                <TableHead>Installment Price</TableHead>
                <TableHead>Fixed Length</TableHead>
                <TableHead>Length</TableHead>
                <TableHead>Text</TableHead>
                <TableHead >Date</TableHead>
                <TableHead className="text-right">Owned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody >
              {Array.isArray(items) && items.length >= 1 ? (
                items
                  .filter((task) => {
                    const name =
                      search.name.toLowerCase() === ""
                        ? true
                        : task.itemName.toLowerCase().includes(search.name.toLowerCase());

                    const type =
                      search.type.toLowerCase() === ""
                        ? true
                        : task.type.toLowerCase().includes(search.type.toLowerCase());

                    return name && type;
                  }).map((item, index) => (

                    <TableRow className="cursor-pointer select-none text-center" onDoubleClick={() => setOpen(prev => ({ ...prev, [index]: !prev[index] }))} key={index}>
                      <TableCell className="font-medium w-3">{index + 1}</TableCell>
                      <TableCell className="font-medium text-left">{item.itemName}</TableCell>
                      <TableCell className='text-blue-600'>{item.boughtPrice}</TableCell>
                      <TableCell className="font-sans font-semibold text-green-600">
                        {item.sellPrice}
                        {isUpdate[index] && <input value={update.sellPrice} onChange={(e) => setUpdate(prev => ({ ...prev, sellPrice: e.target.value }))} type="text" className='rounded-full ml-2 p-2 h-7 w-14 border-slate-400 border' />}
                      </TableCell>
                      <TableCell className="font-sans font-semibold text-red-600">
                        {item.installmentPrice}
                        {isUpdate[index] && <input value={update.installmentPrice} onChange={(e) => setUpdate(prev => ({ ...prev, installmentPrice: e.target.value }))} type="text" className='rounded-full ml-2 p-2 h-7 w-14 border-slate-400 border' />}
                      </TableCell>
                      <TableCell className="font-sans font-semibold text-yellow-600">
                        {item.fixedLength}
                        {/* {isUpdate[index] && <input value={update.fixedLength} onChange={(e) => setUpdate(prev => ({ ...prev, fixedLength: e.target.value }))} type="text" className='rounded-full ml-2 p-2 h-7 w-14 border-slate-400 border' />} */}
                      </TableCell>
                      <TableCell className="font-sans font-semibold">
                        {item.length}
                        {isUpdate[index] && <input value={update.length} onChange={(e) => setUpdate(prev => ({ ...prev, length: e.target.value }))} type="text" className='rounded-full ml-2 p-2 h-7 w-14 border-slate-400 border' />}
                      </TableCell>
                      <TableCell className="font-sans font-semibold text-blue-600">
                        {item.text}
                        {isUpdate[index] && <input  value={update.text} onChange={(e) => setUpdate(prev => ({ ...prev, text: e.target.value }))} type="text" className='rounded-full ml-2 p-2 h-7 w-14 border-slate-400 border' />}
                      </TableCell>
                      <TableCell >
                        {item.createdAt ? item.createdAt.toLocaleDateString('en-CA').replaceAll('-', '/') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right select-none">{item.creator ? item.creator.name : 'Hussein'}</TableCell>
                      {open[index] && <TableCell className="flex gap-x-3 items-center m-0">
                        <button onClick={() => {
                          setOpen(prev => ({ ...prev, [index]: false }))
                          setIsUpdate(prev => ({ ...prev, [index]: !prev[index] }))
                        }} className=" bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600">
                          Edit
                        </button>
                        <button onClick={() => DeletItem(item, index)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600">
                          Delete
                        </button>
                        <button onClick={() => BuyItem(item, index)} className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600">
                          Buy
                        </button>
                      </TableCell>}
                      {isUpdate[index] && <TableCell className="flex gap-x-3 items-center m-0">
                        <button onClick={() => {
                          UpdateItem(item, index)
                          setIsUpdate(prev => ({ ...prev, [index]: false }))
                        }} className=" bg-green-500 text-white p-2 rounded-full hover:bg-green-600">
                          Save
                        </button>
                        <button onClick={() => setIsUpdate(prev => ({ ...prev, [index]: false }))} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600">
                          Cancel
                        </button>
                      </TableCell>}
                    </TableRow>
                  )))
                : <p className='text-center mt-3'>No items found</p>}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}