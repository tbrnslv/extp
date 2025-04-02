"use client";

import { ThemeProvider } from "./components/theme-provider";
import Questionnaire from "./Questionnaire";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Questionnaire />
    </ThemeProvider>
  );
}
