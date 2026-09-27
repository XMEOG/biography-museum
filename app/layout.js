import "./globals.css";

export const metadata = {
  title: "Sesli Biyografi Sergisi",
  description:
    "Bir görsel üzerindeki kişileri keşfedin ve hayat hikâyelerini birinci ağızdan dinleyin.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="bg-museum-bg text-museum-text antialiased">
        {children}
      </body>
    </html>
  );
}
