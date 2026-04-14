"use client"
import React, { useEffect,  useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { deleteItem, getEnvironmentById, getItems, updateItem } from '../../backend/enviroment'
import { DataPhones, ItemProps } from './dataProvider'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from 'next/image'

type UpdateState = {
  length?: string;
  fixedLength?: string;
  sellPrice?: string;
  text?: string;
  boughtPrice?: string;
  installmentPrice?: string;
  location?: string;
  image?: string;
  buyerName?: string;
  buyerNumber?: string;
};

export default function Tables() {
  const { showAlert, search, items, setItems } = DataPhones();
  const [open, setOpen] = useState<{ [key: number]: boolean }>({});
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  const [isUpdate, setIsUpdate] = useState<{ [key: number]: boolean }>({});
  const [update, setUpdate] = useState<UpdateState>({});



  
  async function getUserId() {
    const EnvId = localStorage.getItem('envId')!;
    const res = await getEnvironmentById({ id: EnvId });
    if (typeof res === 'string') {
      showAlert("Failed to fetch environment:" + res, false);
      return;
    }

    if (res && 'owner' in res && Array.isArray(res.collaborators)) {
      const formattedData = [];
      formattedData.push({ user: { id: res.owner.id, name: res.owner.name || '' } });
      res.collaborators.forEach(collab => {
        if (collab.user) {
          formattedData.push({ user: { id: collab.user.id, name: collab.user.name || '' } });
        }
      });
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
  }, [setItems, GetItems]);

  // Open location in Google Maps
  const openLocationInMaps = (location: string) => {
    if (!location) {
      showAlert("No location available", false);
      return;
    }
    // Check if it's coordinates (latitude, longitude)
    const isCoordinates = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(location);
    let mapsUrl;
    
    if (isCoordinates) {
      mapsUrl = `https://www.google.com/maps?q=${location}`;
    } else {
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    }
    
    window.open(mapsUrl, '_blank');
  };

  // Open image in modal
  const openImageModal = (imageUrl: string) => {
    if (!imageUrl) {
      showAlert("No image available", false);
      return;
    }
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  // Update an Item
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
    if (update.location !== undefined) object.location = update.location;
    if (update.image !== undefined) object.image = update.image;
    if (update.buyerName !== undefined) object.buyerName = update.buyerName;
    if (update.buyerNumber !== undefined) object.buyerNumber = update.buyerNumber;

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

    setUpdate({});
  }
  
  // Buy an Item
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
        installmentPrice: update.installmentPrice,
        location: update.location,
        image: update.image,
        buyerName: update.buyerName,
        buyerNumber: update.buyerNumber
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
  
  
  
  return (
    <div className='lg:w-[1200px] mb-4 lg:mb-0 lg:mr-7 grid grid-cols-1'>
      {/* Image Modal */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-auto h-auto p-0 bg-black/90">
          <DialogHeader>
            <DialogTitle className="text-white sr-only">Image Preview</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            <Image 
              src={selectedImage} 
              alt="Preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* <div className="flex items-center gap-x-2 mb-3">
        <div className="md:ml-12">
          <Select
            value={ownerID}
            onValueChange={(value) => {
              setOwnerID(value!);
              localStorage.setItem("chosen", value!);
            }}>
            <SelectTrigger id="framework">
              <SelectValue placeholder="أختر" />
            </SelectTrigger>
            <SelectContent>
              {(() => {
                if (!collaborators || collaborators.length === 0) {
                  return <SelectItem value="IOS">No Collaborators</SelectItem>;
                }

                const filtered = collaborators.filter(
                  (user, index, self) =>
                    index === self.findIndex(u => u.user.id === user.user.id)
                );
                return (<>
                  {
                    filtered.map(item => (
                      <SelectItem
                        className="cursor-pointer"
                        key={item.user.id}
                        value={item.user.id || "حمودي الخزعلي"}
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
       */}
      <div className='mx-auto max-h-[650px] overflow-y-auto relative w-full' style={{ scrollbarWidth: 'none' }}>
        <div className='w-full font-sans font-semibold '>
          <Table>
            <TableHeader>
              <TableRow className='border-b border-b-black'>
  <TableHead className="w-fit">Count</TableHead>
  <TableHead className="w-fit">اسم العنصر</TableHead>
   <TableHead>اسم المشتري</TableHead>
  <TableHead>رقم المشتري</TableHead>
  <TableHead>سعر الشراء</TableHead>
  <TableHead>سعر البيع</TableHead>

  <TableHead>العدد الثابت</TableHead>
  <TableHead>العدد</TableHead>
  <TableHead>ملاحظه</TableHead>
   <TableHead>الموقع</TableHead>
  <TableHead>الصورة</TableHead>
  <TableHead>التاريخ</TableHead>
</TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(items) && items.length >= 1 && (
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
                      {/* Buyer Name */}
                      <TableCell className="font-sans text-orange-700 font-semibold">
                        {item.buyerName || '-'}
                    
                      </TableCell>
                      
                      {/* Buyer Number */}
                      <TableCell className="font-sans font-semibold">
                        {item.buyerNumber || '-'}
                        
                      </TableCell>
                      <TableCell className='text-blue-600'>{item.boughtPrice}</TableCell>
                      <TableCell className="font-sans font-semibold text-green-600">
                        {item.sellPrice}
                        {isUpdate[index] && <input value={update.sellPrice} onChange={(e) => setUpdate(prev => ({ ...prev, sellPrice: e.target.value }))} type="text" className='rounded-full ml-2 p-2 h-7 w-14 border-slate-400 border' />}
                      </TableCell>
                      
                     
                      
                      <TableCell className="font-sans font-semibold text-yellow-600">
                        {item.fixedLength}
                      </TableCell>
                      <TableCell className="font-sans font-semibold">
                        {item.length}
                        {isUpdate[index] && <input value={update.length} onChange={(e) => setUpdate(prev => ({ ...prev, length: e.target.value }))} type="text" className='rounded-full ml-2 p-2 h-7 w-14 border-slate-400 border' />}
                      </TableCell>
                      <TableCell className="font-sans font-semibold text-blue-600">
                        {item.text}
                        {isUpdate[index] && <input value={update.text} onChange={(e) => setUpdate(prev => ({ ...prev, text: e.target.value }))} type="text" className='rounded-full ml-2 p-2 h-7 w-14 border-slate-400 border' />}
                      </TableCell>
                      
                       {/* Location Cell - Click to open in Google Maps */}
                      <TableCell className="font-sans font-semibold">
                        {item.location ? (
                          <button
                            onClick={() => openLocationInMaps(item.location!)}
                            className="text-blue-500 hover:text-blue-700 underline flex items-center gap-1"
                            title="Click to open in Google Maps"
                          >
                            📍 {item.location.length > 20 ? item.location.substring(0, 15     ) + '...' : item.location}
                          </button>
                        ) : (
                          <span className="text-gray-400">No location</span>
                        )}
                        
                      </TableCell>
                      
                      {/* Image Cell - Click to open modal */}
                      <TableCell className="font-sans font-semibold">
                        {item.image ? (
                          <button
                            onClick={() => openImageModal(item.image!)}
                            className="text-green-500 hover:text-green-700 underline flex items-center gap-1"
                            title="Click to view image"
                          >
                            🖼️ View Image
                          </button>
                        ) : (
                          <span className="text-gray-400">No image</span>
                        )}
                        
                      </TableCell>
                      
                      <TableCell>
                        {item.createdAt ? item.createdAt.toLocaleDateString('en-CA').replaceAll('-', '/') : 'N/A'}
                      </TableCell>
                      
                      {open[index] && (
                        <TableCell className="flex gap-x-3 items-center m-0">
                          <button onClick={() => {
                            setOpen(prev => ({ ...prev, [index]: false }))
                            setIsUpdate(prev => ({ ...prev, [index]: !prev[index] }))
                            // Set current values for editing
                            setUpdate({
                              length: item.length,
                              sellPrice: item.sellPrice,
                              text: item.text,
                              location: item.location,
                              image: item.image,
                              buyerName: item.buyerName,
                              buyerNumber: item.buyerNumber
                            })
                          }} className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600">
                            Edit
                          </button>
                          <button onClick={() => DeletItem(item, index)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600">
                            Delete
                          </button>
                          <button onClick={() => BuyItem(item, index)} className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600">
                            Buy
                          </button>
                        </TableCell>
                      )}
                      {isUpdate[index] && (
                        <TableCell className="flex gap-x-3 items-center m-0">
                          <button onClick={() => {
                            UpdateItem(item, index)
                            setIsUpdate(prev => ({ ...prev, [index]: false }))
                          }} className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600">
                            Save
                          </button>
                          <button onClick={() => setIsUpdate(prev => ({ ...prev, [index]: false }))} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600">
                            Cancel
                          </button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}