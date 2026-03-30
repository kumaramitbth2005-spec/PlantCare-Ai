import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PlantCare AI | Advanced Plant Disease Detection",
  description: "Monitor and protect your crops with AI-powered disease detection.",
};

import { LanguageProvider } from "@/lib/LanguageContext";
import { NotificationProvider } from "@/lib/NotificationContext";
import { AuthProvider } from "@/lib/AuthContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import MainLayout from "@/components/MainLayout";
import AlarmScheduler from "@/components/AlarmScheduler";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <LanguageProvider>
          <NotificationProvider>
            <AuthProvider>
              <ThemeProvider>
                <MainLayout>
                  <AlarmScheduler />
                  {children}
                </MainLayout>
              </ThemeProvider>
            </AuthProvider>
          </NotificationProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
