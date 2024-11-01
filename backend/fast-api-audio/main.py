from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from analyze_wav_file import analyze_audio
import logging
from dotenv import load_dotenv
import os

# .env 파일 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="음성 분석 API",
    description="음성 파일을 분석하여 다양한 결과를 제공하는 API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS origins 설정
origins = os.getenv('ALLOWED_ORIGINS', '').split(',')

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def validate_wav_file(file: UploadFile):
    if not file.filename.endswith('.wav'):
        raise HTTPException(
            status_code=400, 
            detail={
                "status": "error",
                "message": "Invalid file type. Please upload a .wav file.",
                "code": "INVALID_FILE_TYPE"
            }
        )

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": str(exc.detail),
            "code": exc.status_code
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Internal server error occurred",
            "detail": str(exc),
            "code": "INTERNAL_SERVER_ERROR"
        }
    )

@app.post("/analyze/full",
    summary="전체 음성 분석",
    description="업로드된 WAV 파일의 전체적인 음성 분석을 수행합니다.",
    response_description="분석 결과 JSON",
    responses={
        200: {
            "description": "성공적으로 분석됨",
            "content": {
                "application/json": {
                    "example": {
                        "status": "success",
                        "data": {
                            "metrics": {
                                "명료도": 0.0,
                                "억양 패턴 일관성": 0.0
                            }
                        }
                    }
                }
            }
        },
        400: {
            "description": "잘못된 요청",
            "content": {
                "application/json": {
                    "example": {
                        "status": "error",
                        "message": "Invalid file type",
                        "code": "INVALID_FILE_TYPE"
                    }
                }
            }
        },
        500: {
            "description": "서버 에러",
            "content": {
                "application/json": {
                    "example": {
                        "status": "error",
                        "message": "Internal server error occurred",
                        "code": "INTERNAL_SERVER_ERROR"
                    }
                }
            }
        }
    }
)
async def analyze_full(file: UploadFile = File(..., description="분석할 WAV 파일")):
    validate_wav_file(file)
    try:
        results = await analyze_audio(file)
        return JSONResponse(content=results)
    except Exception as e:
        logger.error(f"Error analyzing file: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": "Error analyzing audio file",
                "detail": str(e),
                "code": "ANALYSIS_ERROR"
            }
        )

@app.post("/analyze/mimic",
    summary="아나운서 음성 모방 분석",
    description="아나운서 음성과 비교하여 유사도를 분석합니다.",
    response_description="모방 분석 결과 JSON"
)
async def mimic_announcer(file: UploadFile = File(..., description="분석할 WAV 파일")):
    validate_wav_file(file)
    try:
        results = await analyze_audio(file)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/practice",
    summary="스크립트 연습 분석",
    description="내 대본으로 연습하여 음성을 분석합니다.",
    response_description="연습 분석 결과 JSON"
)
async def practice_script(file: UploadFile = File(..., description="분석할 WAV 파일")):
    validate_wav_file(file)
    try:
        results = await analyze_audio(file)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))