import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="text-gray-900">{children}</body>
    </html>
  );
}
