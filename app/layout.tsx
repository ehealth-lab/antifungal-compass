import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Antifungal Compass｜儿童抗真菌预防辅助工具",
  description: "基于项目规则的儿童血液系统疾病抗真菌预防评估、药物候选与剂量计算工具。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

