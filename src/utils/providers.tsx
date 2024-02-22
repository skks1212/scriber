"use client";

import { useAtom } from "jotai";
import { storageAtom } from "./store";
import { useHydrateAtoms } from "jotai/utils";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import { Storage } from "@/types/storage";
import AuthProvider from "./authprovider";

export default function Providers(props: {
    children: React.ReactNode,
    initialStorage?: Storage,
}) {

    const { initialStorage, children } = props;
    const [client] = useState(
        new QueryClient({ defaultOptions: { queries: { staleTime: 5000 } } })
    );

    useHydrateAtoms([
        [storageAtom, initialStorage || {}]
    ])

    const [storage, setStorage] = useAtom(storageAtom);

    useEffect(() => {
        const json = JSON.stringify(storage);
        document.cookie = `${process.env.NEXT_PUBLIC_STORAGE_COOKIE || "storage"}=${json}; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT; samesite=strict; secure`;
    }, [storage])

    return (
        <QueryClientProvider client={client}>
            <ReactQueryStreamedHydration>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </ReactQueryStreamedHydration>
            <ReactQueryDevtools initialIsOpen={false} position="right" />
        </QueryClientProvider>
    )
}