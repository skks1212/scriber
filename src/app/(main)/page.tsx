import Link from "next/link"

export default function Page() {

    const buttons = [
        {
            text: "Join Game",
            href: "/join-game",
        },
        {
            text: "Create Private Game",
            href: "/new-game",
        }
    ]

    return (
        <div className="h-[calc(100vh-68px)] flex flex-col md:flex-row p-12 gap-12">
            {buttons.map((button, index) => (
                <Link
                    className="flex-1 border-2 border-gray-800 rounded-lg flex items-center justify-center hover:scale-105 transition-all"
                    key={index}
                    href={button.href}
                >
                    <h1 className="font-black text-2xl">
                        {button.text}
                    </h1>
                </Link>
            ))}
        </div>
    )
}