import "./globals.css";
import { AuthProvider } from "@/contexts/AuthProvider";
import NavBar from "@/components/NavBar";

export const metadata = {
  title: "APIkachu",
  description: "PokeApp demo sin backend",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <NavBar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
