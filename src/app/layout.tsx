import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { cookies } from "next/headers";
import Providers from "@/utils/providers";
import { Storage } from "@/types/storage";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Scriber",
  description: "Play drawing games with your friends!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const cookieStore = cookies();
  const cookie = cookieStore.get(
    process.env.NEXT_PUBLIC_STORAGE_COOKIE || "storage"
  );
  const storage = JSON.parse(cookie?.value || "{}") as Storage

  return (
    <html lang="en">
      <head>
        <Script src="https://www.writeroo.net/fawesome.js" strategy="beforeInteractive" />
      </head>
      <body className={inter.className}>
        <Providers initialStorage={storage}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
