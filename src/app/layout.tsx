'use client';

import { usePathname } from 'next/navigation';
import type { Metadata } from "next";
import "./globals.css";

const PUBLIC_PATHS = ['/', '/onboarding', '/login', '/reset-password'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '?')
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const publicPage = isPublicPath(pathname);
  const isStudentView = pathname.startsWith('/dashboard');

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/jpeg" href="https://ejjsahtohaydoogtilgp.supabase.co/storage/v1/object/public/branding/wfd-logo-1848.jpg" />
      </head>
      <body className="bg-[#f9f9f9] text-wfd-charcoal min-h-screen font-sans">
        {publicPage ? (
          children
        ) : (
          <>
            <header className={`${isStudentView ? 'bg-wfd-crimson' : 'bg-wfd-charcoal'} text-white py-4 shadow-md transition-colors`}>
              <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
                <img
                  src="https://ejjsahtohaydoogtilgp.supabase.co/storage/v1/object/public/branding/wfd-logo-1848.jpg"
                  alt="Winchester Fire Department"
                  className="h-14 w-auto rounded"
                />
                <div>
                  <h1 className={`${isStudentView ? 'text-white' : 'text-wfd-crimson'} text-xl font-bold leading-tight`}
                      style={isStudentView ? { textShadow: '1px 1px 2px rgba(0,0,0,0.7)' } : undefined}>
                    Winchester Fire Department
                  </h1>
                  <p className={`text-sm ${isStudentView ? 'text-wfd-gold italic' : 'text-gray-400'}`}>Division of EMS — Student Portal</p>
                </div>
              </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
          </>
        )}
      </body>
    </html>
  );
}
