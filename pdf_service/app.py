from fastapi import FastAPI, HTTPException, Body
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from generate_pdf import generate_pdf_buffer
import os

app = FastAPI()

# CORS
origins = [
    "http://localhost:5173",
    "https://transport-erp-previous.vercel.app",
    "*" # For dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    tripData: Dict[str, Any]
    options: Dict[str, Optional[str]]
    slipNumbers: Dict[str, Any]

@app.get("/")
def read_root():
    return {"status": "PDF Service Running"}

@app.post("/print/generate")
async def generate_print(request: GenerateRequest):
    try:
        pdf_buffer = generate_pdf_buffer(request.tripData, request.options, request.slipNumbers)
        
        headers = {
            'Content-Disposition': 'inline; filename="generated_slip.pdf"'
        }
        
        return Response(content=pdf_buffer.getvalue(), media_type="application/pdf", headers=headers)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
