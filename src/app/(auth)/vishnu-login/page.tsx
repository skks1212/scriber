"use client"

import { API } from "@/utils/api";
import { storageAtom } from "@/utils/store";
import { User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react";

export default function Page() {

    const [storage, setStorage] = useAtom(storageAtom)
    const queryParams = useSearchParams();
    const success = queryParams.get("success");
    const token = queryParams.get("token");
    const redirect_url = queryParams.get("redirect_url");

    const handleVerification = async () => {
        if (success === "true") {
            verificationMutation.mutate()
        }
    }

    const verificationMutation = useMutation<{ token: string, user: Partial<User> }>({
        mutationKey: ["user", "login", "verify"],
        mutationFn: () => API.user.login.validateToken({ login_token: token || "" }),
        onSuccess: (data) => {
            setStorage({
                authToken: data.token,
                user: data.user
            })
        }
    })

    useEffect(() => {
        handleVerification()
    }, [success])

    return (
        <div>
            {success === "true" ? "Verifying" : "Failed to login"}
        </div>
    )
}