import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "react-hot-toast";
import ClientLayout from './ClientLayout';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  title: "Zila Homes Admin Dashboard",
  description: "Zila Homes Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable}  antialiased h-screen`}
      >
        {/* <ProtectedRoute> */}
        <ClientLayout>
          {children}
          <Toaster />
        </ClientLayout>
        {/* </ProtectedRoute> */}
      </body>
    </html>
  );
}
