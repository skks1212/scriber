"use client"

import { API } from "@/utils/api"
import { useMutation } from "@tanstack/react-query"
import { useEffect } from "react"

export default function Page() {

    const tokenQuery = useMutation<{ url: string, service_token: string }>({
        mutationKey: ["user", "login"],
        mutationFn: () => API.user.login.getToken({
            client_url: window.location.origin,
        }),
        onSuccess: (data) => {
            window.location.href = data.url
        }
    })

    useEffect(() => {
        tokenQuery.mutate()
    }, [])

    return (
        <div>
            Please Wait
        </div>
    )
}