import Header from "@/components/header";

export default function Layout(props: {
    children: React.ReactNode
}) {

    const { children } = props;

    return (
        <>
            <Header />
            {children}
        </>
    )
}