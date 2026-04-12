import { signIn } from "@/auth"

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans">
      <button onClick={async()=>{
        "use server"
        await signIn("google")

      }}>Singin</button>
    </div>
  );
}
