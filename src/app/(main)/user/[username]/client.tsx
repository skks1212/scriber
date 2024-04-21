"use client";

import ProfilePicture from "@/components/profilepicture";
import Input from "@/components/ui/input";
import { API } from "@/utils/api";
import { storageAtom } from "@/utils/store";
import { User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserClient(props: {
    user: Partial<User>
}) {

    const router = useRouter();

    const userMutation = useMutation<Partial<User>, { username: string[] }>({
        mutationFn: () => API.user.update({ username }),
        onSuccess: (data) => {
            setStorage({ ...storage, user: data })
            setEditMode(false)
            router.push(`/user/${data.username}`)
        }
    })

    const [storage, setStorage] = useAtom(storageAtom);

    const { user } = props
    const [username, setUsername] = useState(user.username)
    const [editMode, setEditMode] = useState(false)

    return (
        <div
            className="flex items-center justify-center"
        >
            <div className="text-center">
                <ProfilePicture className="w-40" user={user} />
                <br />
                <br />
                {!editMode ? (
                    <span className="text-2xl font-black">
                        {user.username}
                        {storage.user?.username === user.username && (
                            <button
                                className="text-xl font-normal text-gray-600 ml-4"
                                onClick={() => setEditMode(true)}
                            >
                                Edit
                            </button>
                        )}
                    </span>
                ) : (
                    <div>
                        <div className="flex items-center gap-2">
                            <Input
                                className="text-2xl"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <button
                                onClick={() => {
                                    userMutation.mutate()
                                }}
                            >
                                Done
                            </button>
                        </div>
                        <span className="text-red-500">
                            {userMutation.error?.username.join(",")}
                        </span>
                    </div>
                )}
                <br />
                <br />
                <button
                    className="sc-button button-primary"
                    onClick={() => {
                        setStorage({ ...storage, authToken: undefined, user: undefined })
                        router.push("/")
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    )
}