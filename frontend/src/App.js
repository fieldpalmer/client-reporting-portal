import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import Home from './components/Home';
import Navbar from './components/Navbar';

const theme = createTheme({
     palette: {
          primary: {
               main: '#3367d6'
          },
          secondary: {
               main: '#f50057'
          },
          background: {
               default: '#f5f5f5'
          }
     },
     typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
               fontSize: '2.5rem',
               fontWeight: 500
          }
     }
});

function App() {
     return (
          <AuthProvider>
               <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Router>
                         <Navbar />
                         <Routes>
                              <Route path='/' element={<Home />} />
                         </Routes>
                    </Router>
               </ThemeProvider>
          </AuthProvider>
     );
}

export default App;
