from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import logging
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="Client Reporting Portal API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ReportRequest(BaseModel):
    email: str

class Report(BaseModel):
    client: str
    period: str
    pdf: str
    dashboard: str

class Sheet(BaseModel):
    id: str
    name: str
    url: str

# Initialize Google Workspace services
SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/documents.readonly'
]

def get_google_service():
    try:
        credentials_path = 'credentials.json'
        if not os.path.exists(credentials_path):
            logger.error(f"Credentials file not found at {credentials_path}")
            raise FileNotFoundError(f"Credentials file not found at {credentials_path}")
            
        credentials = service_account.Credentials.from_service_account_file(
            credentials_path, scopes=SCOPES
        )
        return credentials
    except Exception as e:
        logger.error(f"Error loading credentials: {str(e)}")
        raise

def get_drive_service():
    try:
        credentials = get_google_service()
        return build('drive', 'v3', credentials=credentials)
    except Exception as e:
        logger.error(f"Error creating Drive service: {str(e)}")
        raise

@app.get("/api/sheets/{folder_id}", response_model=List[Sheet])
async def list_sheets_in_folder(folder_id: str):
    try:
        logger.info(f"Attempting to list sheets in folder: {folder_id}")
        drive_service = get_drive_service()
        
        # Query for Google Sheets in the specified folder
        results = drive_service.files().list(
            q=f"mimeType='application/vnd.google-apps.spreadsheet' and '{folder_id}' in parents and trashed = false",
            fields="files(id, name, webViewLink)",
            orderBy="name"
        ).execute()
        
        sheets = results.get('files', [])
        
        if not sheets:
            logger.info(f"No sheets found in folder {folder_id}")
            return []
            
        logger.info(f"Found {len(sheets)} sheets in folder {folder_id}")
        return [
            Sheet(
                id=sheet['id'],
                name=sheet['name'],
                url=sheet['webViewLink']
            ) for sheet in sheets
        ]
    except HttpError as e:
        logger.error(f"Google API error: {str(e)}")
        if e.resp.status == 404:
            raise HTTPException(
                status_code=404,
                detail=f"Folder with ID {folder_id} not found or you don't have access to it."
            )
        elif e.resp.status == 403:
            raise HTTPException(
                status_code=403,
                detail="Permission denied. Please check the service account permissions."
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Google API error: {str(e)}"
            )
    except FileNotFoundError as e:
        logger.error(f"Credentials error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Service account credentials not found. Please check the credentials.json file."
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list sheets: {str(e)}"
        )

@app.post("/api/reports", response_model=List[Report])
async def get_client_reports(request: ReportRequest):
    try:
        # In a real application, you would:
        # 1. Authenticate with Google Workspace
        # 2. Query the spreadsheet for reports matching the email
        # 3. Return the formatted results
        
        # For demo purposes, returning mock data
        mock_reports = [
            {
                "client": "Acme Corp",
                "period": "March 2023",
                "pdf": "https://drive.google.com/file/d/example1",
                "dashboard": "https://lookerstudio.google.com/reporting/example1"
            },
            {
                "client": "Globex Inc",
                "period": "March 2023",
                "pdf": "https://drive.google.com/file/d/example2",
                "dashboard": "https://lookerstudio.google.com/reporting/example2"
            }
        ]
        
        return mock_reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"} 