import Google from "next-auth/providers/google"

const authConfig = {
  providers: [
    Google({
      clientId: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
    }),
  ],
}

export default authConfig