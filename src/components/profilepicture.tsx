"use client"

import { User } from "@prisma/client"
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge"

type ImgRes = 100 | 200 | 400 | 800;

export default function ProfilePicture(props: {
    user: Partial<User>,
    className?: string
}) {

    const [computedWidth, setComputedWidth] = useState<ImgRes>(100);
    const [divWidth, setDivWidth] = useState<number>(0);
    const { user, className } = props
    const ref = useRef<HTMLDivElement>(null);

    const sizes: ImgRes[] = [100, 200, 400, 800];

    useEffect(() => {
        const width = ref.current?.clientWidth;

        if (width) {
            const size = sizes.find((size) => size >= width);
            if (size) setComputedWidth(size);
        }
    }, [user.profile_picture_url]);

    useEffect(() => {
        const updateDivWidth = () => {
            setDivWidth(ref.current?.clientWidth || 100);
        };
        updateDivWidth();
        window.addEventListener("resize", updateDivWidth);
        return () => {
            window.removeEventListener("resize", updateDivWidth);
        };
    }, []);

    return (
        <div
            className={twMerge("inline-flex w-full aspect-square bg-gray-900 items-center justify-center rounded-full", className)}
            style={{
                fontSize: `${divWidth / 3}px`,
                ...(user.profile_picture_url ? {
                    backgroundImage: `url(${user.profile_picture_url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                } : undefined)
            }}
            ref={ref}
        >
            {!user.profile_picture_url ? (
                <i className="far fa-user" />
            ) : null}
        </div>
    )
}