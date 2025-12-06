import "../globals.css";
import { Toaster } from "@/components/ui/sonner";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Login | TravelBuddy</title>
        <meta
          name="description"
          content="Login to TravelBuddy to plan and manage your trips."
        />
      </head>
      <body>
        {children}
        <div id="toast-root">
          <Toaster position="top-center" />
        </div>
      </body>
    </html>
  );
}
