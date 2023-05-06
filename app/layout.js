import "./globals.css";
import Navbar from "./components/navbar.js";
import Footer from "./components/footer.js";

export const metadata = {
  title: "Pindown",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="bg-no-repeat bg-gradient-to-b from-gra-one via-gra-two to-gra-tri ..."
    >
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
