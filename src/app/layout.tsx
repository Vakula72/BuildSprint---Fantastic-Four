import './globals.css';

export const metadata = {
  title: 'Job Hunt Copilot — Agentic Career OS',
  description: 'Autonomous job hunt operating system with evidence-backed personal application and outreach strategy.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50 text-slate-900 antialiased">
      <body className="h-full flex flex-col font-sans bg-slate-50">
        {children}
      </body>
    </html>
  );
}
