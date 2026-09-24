import "./globals.css";

export const metadata = {
  title: "Formly",
  description: "Crea, administra y comparte formularios — MARDOM",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F4F6F9] text-[#1A2233] font-sans text-[14.5px]">
        {children}
      </body>
    </html>
  );
}
