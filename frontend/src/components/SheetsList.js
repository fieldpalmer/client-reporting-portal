import React, { useState, useEffect } from 'react';
import {
     Container,
     Typography,
     List,
     ListItem,
     ListItemText,
     ListItemIcon,
     Button,
     CircularProgress,
     Alert,
     Paper
} from '@mui/material';
import { TableChart as TableIcon } from '@mui/icons-material';
import axios from 'axios';

const SheetsList = ({ folderId }) => {
     const [sheets, setSheets] = useState([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState(null);

     useEffect(() => {
          const fetchSheets = async () => {
               if (!folderId) return;

               // Validate folder ID format
               if (!/^[a-zA-Z0-9-_]+$/.test(folderId)) {
                    setError('Invalid folder ID format. Please enter a valid Google Drive folder ID.');
                    return;
               }

               setLoading(true);
               setError(null);

               try {
                    const response = await axios.get(`http://localhost:8000/api/sheets/${folderId}`);
                    setSheets(response.data);
               } catch (err) {
                    if (err.response) {
                         switch (err.response.status) {
                              case 404:
                                   setError("Folder not found or you don't have access to it.");
                                   break;
                              case 500:
                                   setError('Failed to fetch sheets. Please check your credentials and try again.');
                                   break;
                              default:
                                   setError('An unexpected error occurred. Please try again.');
                         }
                    } else {
                         setError('Network error. Please check your connection and try again.');
                    }
                    console.error('Error fetching sheets:', err);
               } finally {
                    setLoading(false);
               }
          };

          fetchSheets();
     }, [folderId]);

     return (
          <Container maxWidth='md' sx={{ mt: 4 }}>
               <Paper sx={{ p: 3 }}>
                    <Typography variant='h5' gutterBottom>
                         Available Sheets
                    </Typography>

                    {loading ? (
                         <CircularProgress />
                    ) : error ? (
                         <Alert severity='error'>{error}</Alert>
                    ) : sheets.length > 0 ? (
                         <List>
                              {sheets.map((sheet) => (
                                   <ListItem
                                        key={sheet.id}
                                        secondaryAction={
                                             <Button variant='outlined' href={sheet.url} target='_blank' startIcon={<TableIcon />}>
                                                  Open
                                             </Button>
                                        }
                                   >
                                        <ListItemIcon>
                                             <TableIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={sheet.name} secondary={`ID: ${sheet.id}`} />
                                   </ListItem>
                              ))}
                         </List>
                    ) : (
                         <Typography variant='body1' color='text.secondary'>
                              No sheets found in this folder.
                         </Typography>
                    )}
               </Paper>
          </Container>
     );
};

export default SheetsList;
