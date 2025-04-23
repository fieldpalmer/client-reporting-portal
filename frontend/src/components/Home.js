import React, { useState } from 'react';
import {
     Container,
     Typography,
     Paper,
     Grid,
     Card,
     CardContent,
     CardActions,
     Button,
     TextField,
     CircularProgress,
     Alert,
     Box
} from '@mui/material';
import { Description, Dashboard, AutoAwesome } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import SheetsList from './SheetsList';

const Home = () => {
     const { currentUser } = useAuth();
     const [reports, setReports] = useState([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState(null);
     const [folderId, setFolderId] = useState('');

     const loadReports = async () => {
          if (!currentUser) return;

          setLoading(true);
          setError(null);

          try {
               const response = await axios.post('http://localhost:8000/api/reports', {
                    email: currentUser.email
               });
               setReports(response.data || []);
          } catch (err) {
               setError('Failed to fetch reports. Please try again.');
               setReports([]);
          } finally {
               setLoading(false);
          }
     };

     // Load reports when user is authenticated
     React.useEffect(() => {
          if (currentUser) {
               loadReports();
          }
     }, [currentUser]);

     const handleFolderIdChange = (event) => {
          const newFolderId = event.target.value.trim();
          setFolderId(newFolderId);
          setError(null);
     };

     const handleSubmit = (event) => {
          event.preventDefault();
          if (!folderId) {
               setError('Please enter a folder ID');
               return;
          }

          // Validate folder ID format
          if (!/^[a-zA-Z0-9-_]+$/.test(folderId)) {
               setError('Invalid folder ID format. Please enter a valid Google Drive folder ID.');
               return;
          }
     };

     return (
          <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
               <Typography variant='h3' component='h1' gutterBottom align='center'>
                    Welcome to Client Reporting Portal
               </Typography>

               <Typography variant='h5' component='h2' gutterBottom align='center' color='text.secondary'>
                    Powered by Google Workspace Automation
               </Typography>

               <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={4}>
                         <Card>
                              <CardContent>
                                   <Typography variant='h6' gutterBottom>
                                        <Description sx={{ mr: 1 }} />
                                        Automated PDF Generation
                                   </Typography>
                                   <Typography variant='body2' color='text.secondary'>
                                        Generate professional PDF reports automatically using Google Docs templates and data from
                                        Sheets.
                                   </Typography>
                              </CardContent>
                         </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                         <Card>
                              <CardContent>
                                   <Typography variant='h6' gutterBottom>
                                        <Dashboard sx={{ mr: 1 }} />
                                        Interactive Dashboards
                                   </Typography>
                                   <Typography variant='body2' color='text.secondary'>
                                        Access real-time data visualizations and analytics through Looker Studio integration.
                                   </Typography>
                              </CardContent>
                         </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                         <Card>
                              <CardContent>
                                   <Typography variant='h6' gutterBottom>
                                        <AutoAwesome sx={{ mr: 1 }} />
                                        Smart Automation
                                   </Typography>
                                   <Typography variant='body2' color='text.secondary'>
                                        Automated workflows for report generation, distribution, and client notifications.
                                   </Typography>
                              </CardContent>
                         </Card>
                    </Grid>
               </Grid>

               <Paper sx={{ p: 3, mt: 4 }}>
                    {currentUser ? (
                         <>
                              <Typography variant='h5' gutterBottom>
                                   Your Reports
                              </Typography>
                              {loading ? (
                                   <CircularProgress />
                              ) : error ? (
                                   <Alert severity='error' sx={{ mt: 2 }}>
                                        {error}
                                   </Alert>
                              ) : reports && reports.length > 0 ? (
                                   <Grid container spacing={2} sx={{ mt: 2 }}>
                                        {reports.map((report, index) => (
                                             <Grid item xs={12} key={index}>
                                                  <Card>
                                                       <CardContent>
                                                            <Typography variant='h6'>{report.client}</Typography>
                                                            <Typography color='text.secondary'>{report.period}</Typography>
                                                       </CardContent>
                                                       <CardActions>
                                                            <Button
                                                                 size='small'
                                                                 href={report.pdf}
                                                                 target='_blank'
                                                                 startIcon={<Description />}
                                                            >
                                                                 Download PDF
                                                            </Button>
                                                            <Button
                                                                 size='small'
                                                                 href={report.dashboard}
                                                                 target='_blank'
                                                                 startIcon={<Dashboard />}
                                                            >
                                                                 View Dashboard
                                                            </Button>
                                                       </CardActions>
                                                  </Card>
                                             </Grid>
                                        ))}
                                   </Grid>
                              ) : (
                                   <Typography variant='body1' sx={{ mt: 2, textAlign: 'center' }}>
                                        No reports found for your account.
                                   </Typography>
                              )}
                         </>
                    ) : (
                         <Typography variant='body1' sx={{ mt: 2, textAlign: 'center' }}>
                              Please sign in to view your reports
                         </Typography>
                    )}
               </Paper>

               <Box sx={{ mt: 4, mb: 4 }}>
                    <Paper sx={{ p: 3 }}>
                         <Typography variant='h4' gutterBottom>
                              Google Sheets Viewer
                         </Typography>
                         <Typography variant='body1' paragraph>
                              Enter a Google Drive folder ID to view all Google Sheets within it.
                         </Typography>

                         <form onSubmit={handleSubmit}>
                              <TextField
                                   fullWidth
                                   label='Folder ID'
                                   variant='outlined'
                                   value={folderId}
                                   onChange={handleFolderIdChange}
                                   error={!!error}
                                   helperText={error || 'Enter the ID of the folder containing your Google Sheets'}
                                   sx={{ mb: 2 }}
                              />
                              <Button type='submit' variant='contained' color='primary' disabled={!currentUser}>
                                   View Sheets
                              </Button>
                         </form>
                    </Paper>

                    {folderId && <SheetsList folderId={folderId} />}
               </Box>
          </Container>
     );
};

export default Home;
