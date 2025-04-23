import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Alert, Snackbar } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Google as GoogleIcon } from '@mui/icons-material';

const Navbar = () => {
     const { currentUser, signInWithGoogle, logout, error } = useAuth();
     const [showError, setShowError] = React.useState(false);

     React.useEffect(() => {
          if (error) {
               setShowError(true);
          }
     }, [error]);

     const handleCloseError = () => {
          setShowError(false);
     };

     return (
          <>
               <AppBar position='static'>
                    <Toolbar>
                         <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
                              📈 Client Reporting Portal
                         </Typography>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Button color='inherit' component={Link} to='/'>
                                   Home
                              </Button>
                              <Button color='inherit' href='https://workspace.google.com' target='_blank'>
                                   Google Workspace
                              </Button>
                              {currentUser ? (
                                   <>
                                        <Avatar
                                             src={currentUser.photoURL}
                                             alt={currentUser.displayName}
                                             sx={{ width: 32, height: 32 }}
                                        />
                                        <Button color='inherit' onClick={logout}>
                                             Logout
                                        </Button>
                                   </>
                              ) : (
                                   <Button color='inherit' startIcon={<GoogleIcon />} onClick={signInWithGoogle}>
                                        Sign in with Google
                                   </Button>
                              )}
                         </Box>
                    </Toolbar>
               </AppBar>
               <Snackbar
                    open={showError}
                    autoHideDuration={6000}
                    onClose={handleCloseError}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
               >
                    <Alert onClose={handleCloseError} severity='error' sx={{ width: '100%' }}>
                         {error}
                    </Alert>
               </Snackbar>
          </>
     );
};

export default Navbar;
