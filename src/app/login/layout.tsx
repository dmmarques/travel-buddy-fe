import "../globals.css";

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
      <body>{children}</body>
    </html>
  );
}
