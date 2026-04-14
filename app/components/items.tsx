"use client"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { createItem, getEnvironmentById, getItems } from "../../backend/enviroment"
import { DataPhones, ItemProps } from "./dataProvider"
import Image from "next/image"

export function ItemsCreate({ setOpen }: { setOpen: (b: string | null) => void }) {
  const { showAlert, setItems } = DataPhones();
  const [collaborators, setCollaborators] = React.useState([{ user: { id: '', name: '' } }]);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = React.useState(false);

  const [item, setItem] = React.useState<ItemProps>({
    id: '',
    itemName: '',
    sellPrice: '',
    type: 'Android',
    environmentId: '',
    boughtPrice: '',
    location: '',
    image: '',
    buyerName: '',
    buyerNumber: '',
    text: '',
    userId: '',
    length: '1',
    fixedLength: '1',
    creator: {
      name: ''
    }
  });

  // Get current location
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      showAlert("Geolocation is not supported by your browser", false);
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Option 1: Just store coordinates
        const locationString = `${latitude}, ${longitude}`;
        setItem(prev => ({ ...prev, location: locationString }));
        showAlert("Location captured successfully!", true);
        
        // Option 2: Get address from coordinates (Reverse Geocoding)
        // Uncomment this if you want the actual address instead of coordinates
        /*
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const address = data.display_name || `${latitude}, ${longitude}`;
          setItem(prev => ({ ...prev, location: address }));
          showAlert("Location captured successfully!", true);
        } catch (error) {
          console.error("Error getting address:", error);
          setItem(prev => ({ ...prev, location: locationString }));
        }
        */
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "Failed to get location";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Please allow location access to use this feature";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        showAlert(errorMessage, false);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showAlert("Image size should be less than 5MB", false);
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        showAlert("Please select an image file", false);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setItem(prev => ({ ...prev, image: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  async function getPhones() {
    const EnvId = localStorage.getItem('envId')!;
    const data = await getItems(EnvId);
    setItems(data as ItemProps[]);
  }

  async function CREATE_ITEMS() {
    if (item) {
      if (!item.itemName.trim()) {
        showAlert("Please enter a name", false);
        return;
      }
      if (!item.boughtPrice || !item.sellPrice) {
        showAlert("Please add both bought and sell prices", false);
        return;
      }
    }
    const EnvId = localStorage.getItem('envId');
    item.environmentId = EnvId!;
    const res = await createItem(item);
    if (res instanceof Error) {
      showAlert(res.message, false);
      setOpen(null);
      return;
    }
    if (res) {
      showAlert("Item created successfully", true);
      getPhones();
    }

    setItem(prev => ({
      ...prev,
      itemName: '',
      sellPrice: 'Android',
      location: '',
      buyerName: '',
      buyerNumber: '',
      image: '',
      boughtPrice: '',
      text: '',
      type: '',
      userId: '',
      length: '1',
      fixedLength: '1',
      creator: {
        name: ''
      }
    }));
    setImagePreview(null);
    setOpen(null)
    return
  }

  async function getUserId() {
    const EnvId = localStorage.getItem('envId')!;
    const res = await getEnvironmentById({ id: EnvId });
    if (typeof res === 'string') {
      console.log("Failed to fetch environment:", res);
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
      console.log(formattedData)
      setCollaborators(formattedData);
    } else {
      console.error("Unexpected response format:", res);
    }
  }

  React.useEffect(() => {
    getUserId()
  }, [])

  return (
    <Card className={`delay-50 min-w-[360px]`}>
      <CardHeader>
        <CardTitle>Create</CardTitle>
        <CardDescription>You can create Items</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div id='main' className="flex justify-between gap-x-4 w-full items-start gap-4">
            <div className="w-full flex flex-col gap-y-3">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">أسم العنصر</Label>
                <Input 
                  onChange={(e) => {
                    setItem(prev => ({ ...prev, itemName: e.target.value }));
                  }} 
                  value={item.itemName} 
                  id="name" 
                  placeholder={'Phone Name'} 
                  className="appearance-none" 
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="BoughtPrice">سعر الشراء</Label>
                <Input 
                  onChange={(e) => {
                    setItem(prev => ({ ...prev, boughtPrice: e.target.value }));
                  }} 
                  value={item.boughtPrice} 
                  type="number" 
                  id="BoughtPrice" 
                  placeholder={'Bought Price'} 
                  className="appearance-none" 
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="Price">سعر البيع</Label>
                <Input 
                  onChange={(e) => {
                    setItem(prev => ({ ...prev, sellPrice: e.target.value }));
                  }} 
                  value={item.sellPrice} 
                  type="number" 
                  id="Price" 
                  placeholder={'Sell Price'} 
                  className="appearance-none" 
                />
              </div>

              {/* LOCATION FIELD WITH AUTO-DETECT BUTTON */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="Location">الموقع</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input 
                      onChange={(e) => {
                        setItem(prev => ({ ...prev, location: e.target.value }));
                      }} 
                      value={item.location} 
                      type="text" 
                      id="Location" 
                      placeholder={'Location or click the button to auto-detect'} 
                      className="appearance-none" 
                    />
                  </div>
                  <Button 
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    variant="outline"
                    size="sm"
                  >
                    {isGettingLocation ? "Getting..." : "📍"}
                  </Button>
                </div>
              </div>

              {/* IMAGE FIELD - FILE UPLOAD */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="Image">الصورة</Label>
                <Input 
                  onChange={handleImageChange}
                  type="file" 
                  id="Image" 
                  accept="image/jpeg,image/png,image/webp"
                  className="appearance-none cursor-pointer" 
                />
                {imagePreview && (
                  <div className="mt-2">
                    <Image
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="FixedPieces">العدد الثابت</Label>
                <Input 
                  onChange={(e) => {
                    setItem(prev => ({ ...prev, fixedLength: e.target.value }));
                  }} 
                  value={item.fixedLength} 
                  type="number" 
                  id="FixedPieces" 
                  placeholder={'Fixed Pieces'} 
                  className="appearance-none" 
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="Pieces">العدد</Label>
                <Input 
                  onChange={(e) => {
                    setItem(prev => ({ ...prev, length: e.target.value }));
                  }} 
                  value={item.length} 
                  type="number" 
                  id="Pieces" 
                  placeholder={'Pieces'} 
                  className="appearance-none" 
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="CustomerName">اسم العميل</Label>
                <Input 
                  onChange={(e) => {
                    setItem(prev => ({ ...prev, buyerName: e.target.value }));
                  }} 
                  value={item.buyerName} 
                  type="text" 
                  id="CustomerName" 
                  placeholder={'Customer Name'} 
                  className="appearance-none" 
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="CustomerNumber">رقم العميل</Label>
                <Input 
                  onChange={(e) => {
                    setItem(prev => ({ ...prev, buyerNumber: e.target.value }));
                  }} 
                  value={item.buyerNumber} 
                  type="tel" 
                  id="CustomerNumber" 
                  placeholder={'Customer Number'} 
                  className="appearance-none" 
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="Notes">ملاحضات</Label>
                <Input 
                  onChange={(e) => {
                    setItem(prev => ({ ...prev, text: e.target.value }));
                  }} 
                  value={item.text} 
                  type="text" 
                  id="Notes" 
                  placeholder={'Notes'} 
                  className="appearance-none" 
                />
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setOpen(null)}>Cancel</Button>
        <Button onClick={() => CREATE_ITEMS()}>Create</Button>
      </CardFooter>
    </Card>
  );
}