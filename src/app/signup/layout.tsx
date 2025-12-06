import "../globals.css";
import { Toaster } from "@/components/ui/sonner";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <div id="toast-root">
          <Toaster position="top-center" />
        </div>
      </body>
    </html>
  );
}
