import Link from "next/link";
import ScriberLogo from "./logo";
import { getUser } from "@/utils/helpers";

export default async function Header() {

    const user = await getUser();

    return (
        <div className="sticky top-0 inset-x-0 flex items-center justify-between">
            <Link
                href={"/"}
                className="w-[150px] p-4"
            >
                <ScriberLogo />
            </Link>
            <div className="p-4">
                {user ? (
                    <Link
                        href={"/user/" + user.username}
                        className="flex items-center gap-2"
                    >
                        {user.profile_picture_url ? (
                            <img
                                src={user.profile_picture_url}
                                alt={user.username}
                                className="w-8 h-8 rounded-full"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-900">
                                <i className="far fa-user" />
                            </div>
                        )}
                        {user.username}
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