import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WFD EMS Student Portal",
  description: "Winchester Fire Department — Division of EMS — Student Training & Rotation Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en">
      <head>
        <link rel="icon" type="image/jpeg" href="https://ejjsahtohaydoogtilgp.supabase.co/storage/v1/object/public/branding/wfd-logo-1848.jpg" />
      </head>
      <body className="bg-white text-wfd-charcoal min-h-screen font-sans">
        <header className="bg-wfd-charcoal text-white py-4 shadow-md">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
            <img
              src="https://ejjsahtohaydoogtilgp.supabase.co/storage/v1/object/public/branding/wfd-logo-1848.jpg"
              alt="Winchester Fire Department"
              className="h-14 w-auto rounded"
            />
            <div>
              <h1 className="text-wfd-crimson text-xl font-bold leading-tight">
                Winchester Fire Department
              </h1>
              <p className="text-gray-400 text-sm">Division of EMS — Student Portal</p>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
