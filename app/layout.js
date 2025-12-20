import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Nexus CRM | Intelligent Enterprise Sales Platform",
    template: "%s | Nexus CRM"
  },
  description: "Boost sales productivity with Nexus CRM. An intelligent, AI-powered customer relationship management platform designed for modern sales teams.",
  keywords: ["CRM", "Sales", "AI", "Enterprise", "Pipeline Management", "Nexus"],
  authors: [{ name: "Nexus Team" }],
  creator: "Nexus CRM",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nexus-crm.com",
    title: "Nexus CRM | Intelligent Enterprise Sales Platform",
    description: "Boost sales productivity with Nexus CRM. An intelligent, AI-powered customer relationship management platform designed for modern sales teams.",
    siteName: "Nexus CRM",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexus CRM | Intelligent Enterprise Sales Platform",
    description: "Boost sales productivity with Nexus CRM. An intelligent, AI-powered customer relationship management platform designed for modern sales teams.",
    creator: "@nexuscrm",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
