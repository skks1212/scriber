"use client"

import Link from "next/link";
import ScriberLogo from "./logo";
import ProfilePicture from "./profilepicture";
import { useAtom } from "jotai";
import { storageAtom } from "@/utils/store";

export default function Header() {

    const [storage, setStorage] = useAtom(storageAtom);

    return (
        <div className="sticky top-0 inset-x-0 flex items-center justify-between">
            <Link
                href={"/"}
                className="w-[150px] p-4"
            >
                <ScriberLogo />
            </Link>
            <div className="p-4">
                {storage.user ? (
                    <Link
                        href={"/user/" + storage.user.username}
                        className="flex items-center gap-2"
                    >
                        <ProfilePicture className="w-8" user={storage.user} />
                        {storage.user.username}
                    </Link>
                ) : (
                    <Link
                        href={"/login"}
                    >
                        Login
                    </Link>
                )}
            </div>
        </div>
    )
}