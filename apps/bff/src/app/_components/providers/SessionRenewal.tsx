'use client';

import { useSessionRenewal } from "@/app/features/auth/use-session-renewal";

export function SessionRenewal({children}: {children?: React.ReactNode}){
    useSessionRenewal()
    return children
}