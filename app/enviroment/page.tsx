'use client'
import React, { useEffect, useState } from 'react'
import { AddCollaborator } from '../components/AddCollaborator'
import { getARole, getEnvironmentById } from '../../backend/enviroment'
import { CreateEnvironment } from './componenets/createEnviroment'
import { JoinEnvironment } from '../components/joinEnviroment'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type collaboratorsProps = {
  role: string,
  user: {
    id: string,
    name: string,
    image: string
  }
}
type envirnomentProps = {
  id: string,
  name: string,
  owner: { name: string },
  password: string,
  items: { creatorId: string }[],
  collaborators: collaboratorsProps[],
}

export default function Page() {
  const [isOpen, setIsOpen] = useState<string | null>(null);
  const [envirnoment, setEnvironment] = useState<envirnomentProps>();
  const [envId, setEnvId] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("envId") : null
  );
  async function getRole() {
    const EnvId = localStorage.getItem('envId');
    if (!EnvId) {
      console.error('Environment ID is missing!');
      return;
    }
    setEnvId(EnvId)
    const res = await getARole(EnvId);

    if (res === "ADMIN" || res === "VIEWER") {
    } else {
      console.warn("Unexpected role response:", res);
    }
  }
 useEffect(() => {
  const fetchRole = async () => {
    await getRole()
  }
  fetchRole()
}, [])
  useEffect(() => {

    async function fetchEnvironment() {
      try {
        const data = await getEnvironmentById({ id: envId! });
        setEnvironment(data as envirnomentProps);
        console.log(data)
      } catch (err) {
        console.error(err);
      }
    }
    fetchEnvironment();
  }, [envId]);

  console.log(envirnoment)
  return (
    <div className='max-w-5xl mx-auto mt-6 relative'>
      <div className="flex items-center gap-x-3">
        <button className="p-2 border hover:bg-blue-400 hover:text-white rounded-md delay-100"
          onClick={() => setIsOpen("add")}>Add</button>
        <button className="p-2 border  hover:bg-blue-400 hover:text-white rounded-md delay-100" onClick={() => { setIsOpen("join") }}>Join</button>
        <button className="p-2 border hidden md:flex hover:bg-blue-400 hover:text-white   rounded-md delay-100" onClick={() => { setIsOpen("env") }}>Create Environment</button>
        <Link href={'/'} className='p-2 rounded border bg-slate-100 hover:bg-slate-200 delay-75 '><ArrowLeft /></Link>

      </div>

      {envirnoment ? (
        <div className="p-6 rounded-md border shadow mt-4 flex items-start justify-between flex-col md:flex-row">
          <div>
            <p className="my-2 font-sans font-semibold " style={{ direction: 'rtl' }}>
              أسم بيأت العمل: <span className='ml-1 text-blue-500'>{envirnoment.name}</span>
            </p>
            <p className="my-2 font-sans font-semibold" style={{ direction: 'rtl' }}>
              المالك: <span className='mr-1 text-green-500'>{envirnoment.owner.name ?? 'hussein'}</span>
            </p>

        

            <p className="my-2 font-sans font-semibold" style={{ direction: 'rtl' }}>
              اشياء: <span className='mr-1 text-lime-600'>{envirnoment.items.length}</span>
            </p>
          </div>

          <div>
            <p className="my-2 font-sans font-semibold" style={{ direction: 'rtl' }}>
              المساهمين: <span className='mr-1 text-green-500'>{envirnoment.collaborators.length}</span>
            </p>
            <p className="my-2 font-sans font-semibold" style={{ direction: 'rtl' }}>
              الايدي: <span className='mr-1 text-lime-600'>{envirnoment.id}</span>
            </p>
            <p className="my-2 font-sans font-semibold" style={{ direction: 'rtl' }}>
              الرمز: <span className='mr-1 text-cyan-600'>{envirnoment.password}</span>
            </p>
          </div>
        </div>
      ) : <p>No Environment</p>}

      

      {isOpen === "add" && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-white z-30 border">
          <AddCollaborator setIsOpen={setIsOpen} />
        </div>
      )}
      {isOpen === "env" && <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-white z-30"><CreateEnvironment setIsOpen={setIsOpen} /></div>}
      {isOpen === "join" && <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-white z-30"><JoinEnvironment setIsOpen={setIsOpen} /></div>}
    </div>
  )
}