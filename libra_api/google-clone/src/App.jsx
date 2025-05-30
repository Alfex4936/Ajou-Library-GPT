// filepath: d:\Dev\Python\ajou-library-gpt\libra_api\google-clone\src\App.jsx
import { Box, CircularProgress } from "@mui/material";
import { Suspense } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import useFontFallback from "./hooks/useFontFallback";
import Home from "./pages/Home/Home";
import SearchResult from "./pages/SearchResult/SearchResult";

import "./App.css";

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

function App() {
  // Apply language-based font fallbacks automatically
  useFontFallback();

  return (
    <div className="app">
      <Suspense fallback={<LoadingFallback />}>
        <Router>
          <Routes>
            {/* Home (the one with the search on) */}
            <Route path="/" element={<Home />} />

            {/* SearchPage (The results page) */}
            <Route path="search" element={<SearchResult />} />
          </Routes>
        </Router>
      </Suspense>
    </div>
  );
}

export default App;
