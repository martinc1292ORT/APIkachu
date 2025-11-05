import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata = {
  title: "APIkachu",
  description: "Front cliente para el TP2 + APIkachu",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <NavBar />
        <main style={{ padding: "16px" }}>{children}</main>
      </body>
    </html>
  );
}
