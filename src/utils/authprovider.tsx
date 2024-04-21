"use client";

import { useAtom } from "jotai";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@prisma/client";
import { storageAtom } from "./store";
import { API } from "./api";

export default function AuthProvider(props: {
    children: React.ReactNode,
}) {
    const { children } = props;

    const path = usePathname();
    const router = useRouter();

    const [storage, setStorage] = useAtom(storageAtom);
    const meMutation = useMutation<User>({
        mutationFn: API.user.me,
        onSuccess: (data) => {
            setStorage((st) => ({ ...st, user: data }))
        },
        onError: () => {
            setStorage((st) => ({ ...st, auth_token: undefined }))
        }
    })

    useEffect(() => {
        if (storage.authToken) {
            meMutation.mutate();
        }
    }, [storage.authToken])

    useEffect(() => {
        if (storage.user && ["/login", "/vishnu-login"].includes(path || "")) {
            router.push("/")
        }
    }, [path, storage.user])

    return children;
}