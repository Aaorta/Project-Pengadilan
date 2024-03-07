import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

// Only here for the multi examples demo, in your app this would be imported from elsewhere
export interface SessionData {
    username: string;
    isLoggedIn: boolean;
}

export const SESSION_OPTIONS = {
    password: "complex_password_at_least_32_characters_long",
    cookieName: "iron-examples-app-router-client-component-route-handler-swr",
    cookieOptions: {
      // secure only works in `https` environments
      // if your localhost is not on `https`, then use: `secure: process.env.NODE_ENV === "production"`
      secure: process.env.NODE_ENV === "production",
    },
}

export default async function middleware(req: NextRequest) {
    // const session = await getIronSession<SessionData>(
    //     cookies(),
    //     SESSION_OPTIONS,
    //   );

    // @ts-ignore
    // req.isAuthenticated = true
    // console.log("ttt")
    // return NextResponse.next()
}