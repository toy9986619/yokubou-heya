import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

import { Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider } from '@/contexts/AuthContext';
import AuthToolbarControl from '@/components/AuthToolbarControl';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Yokubou Heya",
  description: "表達雙向害羞意圖的小工具",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body className={inter.className}>
        <AuthProvider>
          <Box display="flex" flexDirection="column" height="100%">
            <Box>
              <AppBar position="static">
                <Toolbar>
                  <Box flexGrow={1}>
                    <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Typography variant="h6">{metadata.title}</Typography>
                    </Link>
                  </Box>
                  <AuthToolbarControl />
                </Toolbar>
              </AppBar>
            </Box>
            <Box display="flex" flex={1}>
              <Box flex={1} height="100%">
                {children}
              </Box>
            </Box>
          </Box>
        </AuthProvider>
      </body>
    </html>
  );
}
