from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from analyze_wav_file import analyze_audio, calculate_metrics_simple
from accouncer_mimic import analyze_announcer, announcer_mimic
import logging
from dotenv import load_dotenv
import os
import tempfile

# .env 파일 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 인스턴스 생성
app = FastAPI(
    title="음성 분석 API",
    description="음성 파일을 분석하여 다양한 결과를 제공하는 API",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI 문서 URL
    redoc_url="/redoc",  # ReDoc 문서 URL
)

# CORS origins 설정
origins = os.getenv('ALLOWED_ORIGINS', '').split(',')

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 허용할 origin 목록
    allow_credentials=True,  # 자격 증명 허용
    allow_methods=["*"],    # 모든 HTTP 메서드 허용
    allow_headers=["*"],    # 모든 헤더 허용
)

# WAV 파일 유효성 검사 함수


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

# HTTP 예외 처리기


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

# 일반 예외 처리기


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

# 전체 음성 분석 엔드포인트


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
                                      "명료도(Clarity)": {
                                          "value": 20.27,
                                          "grade": "excellent",
                                          "unit": "dB",
                                          "reference": "20dB 이상이 최적",
                                          "interpretation": "매우 명료한 음성입니다"
                                      },
                                      "억양 패턴 일관성 (Intonation Pattern Consistency)": {
                                          "value": 59.98,
                                          "grade": "excellent",
                                          "unit": "Hz",
                                          "reference": "40-60Hz가 최적",
                                          "interpretation": "자연스러운 억양 변화를 보입니다"
                                      },
                                      "멜로디 지수(Melody Index)": {
                                          "value": -48.29,
                                          "grade": "excellent",
                                          "unit": "MFCC",
                                          "reference": "-50 ~ -30이 최적",
                                          "interpretation": "최적의 음성 멜로디를 보입니다"
                                      },
                                      "말의 리듬(Speech Rhythm)": {
                                          "value": 0.044,
                                          "grade": "excellent",
                                          "unit": "초",
                                          "reference": "0.03-0.06초가 최적",
                                          "interpretation": "적절한 발화 리듬을 보입니다"
                                      },
                                      "휴지 타이밍(Pause Timing)": {
                                          "value": 0.118,
                                          "grade": "excellent",
                                          "unit": "초",
                                          "reference": "0.1-0.15초가 최적",
                                          "interpretation": "자연스러운 휴지를 보입니다"
                                      },
                                      "속도 변동성(Rate Variability)": {
                                          "value": 88.30,
                                          "grade": "excellent",
                                          "unit": "지수",
                                          "reference": "80-90이 최적",
                                          "interpretation": "적절한 속도 변화를 보입니다"
                                      },
                                      "성대 떨림(Jitter)": {
                                          "value": 0.020,
                                          "grade": "excellent",
                                          "unit": "비율",
                                          "reference": "0.01-0.03이 최적",
                                          "interpretation": "안정적인 성대 진동을 보입니다"
                                      },
                                      "강도 변동성(AMR)": {
                                          "value": 0.005,
                                          "grade": "excellent",
                                          "unit": "비율",
                                          "reference": "0.003-0.007이 최적",
                                          "interpretation": "적절한 강도 변화를 보입니다"
                                      },
                                      "발화의 에너지(Utterance Energy)": {
                                          "value": -23.55,
                                          "grade": "excellent",
                                          "unit": "dB",
                                          "reference": "-25 ~ -20dB이 최적",
                                          "interpretation": "적절한 발화 에너지를 보입니다"
                                      }
                                  },
                                  "overall_score": 95,
                                  "recommendations": [
                                      "발음을 더 정확하게 하고 목소리를 선명하게 내보세요",
                                      "자연스러운 억양으로 말해보세요",
                                      "문장 사이의 쉼을 적절하게 가져가보세요"
                                  ],
                                  "processing_time_seconds": 3.45
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

# 아나운서 음성 모방 분석 엔드포인트

@app.post("/analyze/mimic",
          summary="아나운서 음성 모방 분석",
          description="아나운서 음성과 비교하여 유사도를 분석합니다.",
          response_description="모방 분석 결과 JSON",
          responses={
              200: {
                  "description": "성공적으로 분석됨",
                  "content": {
                      "application/json": {
                          "example": {
                              "status": "success",
                              "data": {
                                  "metrics": {
                                      "명료도(Clarity)": {
                                          "value": 20.27,
                                          "grade": "excellent",
                                          "unit": "dB",
                                          "reference": "20dB 이상이 최적",
                                          "interpretation": "매우 명료한 음성입니다"
                                      },
                                      "억양 패턴 일관성 (Intonation Pattern Consistency)": {
                                          "value": 59.98,
                                          "grade": "excellent",
                                          "unit": "Hz",
                                          "reference": "40-60Hz가 최적",
                                          "interpretation": "자연스러운 억양 변화를 보입니다"
                                      },
                                      "멜로디 지수(Melody Index)": {
                                          "value": -48.29,
                                          "grade": "excellent",
                                          "unit": "MFCC",
                                          "reference": "-50 ~ -30이 최적",
                                          "interpretation": "최적의 음성 멜로디를 보입니다"
                                      },
                                      "말의 리듬(Speech Rhythm)": {
                                          "value": 0.044,
                                          "grade": "excellent",
                                          "unit": "초",
                                          "reference": "0.03-0.06초가 최적",
                                          "interpretation": "적절한 발화 리듬을 보입니다"
                                      },
                                      "휴지 타이밍(Pause Timing)": {
                                          "value": 0.118,
                                          "grade": "excellent",
                                          "unit": "초",
                                          "reference": "0.1-0.15초가 최적",
                                          "interpretation": "자연스러운 휴지를 보입니다"
                                      },
                                      "속도 변동성(Rate Variability)": {
                                          "value": 88.30,
                                          "grade": "excellent",
                                          "unit": "지수",
                                          "reference": "80-90이 최적",
                                          "interpretation": "적절한 속도 변화를 보입니다"
                                      },
                                      "성대 떨림(Jitter)": {
                                          "value": 0.020,
                                          "grade": "excellent",
                                          "unit": "비율",
                                          "reference": "0.01-0.03이 최적",
                                          "interpretation": "안정적인 성대 진동을 보입니다"
                                      },
                                      "강도 변동성(AMR)": {
                                          "value": 0.005,
                                          "grade": "excellent",
                                          "unit": "비율",
                                          "reference": "0.003-0.007이 최적",
                                          "interpretation": "적절한 강도 변화를 보입니다"
                                      },
                                      "발화의 에너지(Utterance Energy)": {
                                          "value": -23.55,
                                          "grade": "excellent",
                                          "unit": "dB",
                                          "reference": "-25 ~ -20dB이 최적",
                                          "interpretation": "적절한 발화 에너지를 보입니다"
                                      }
                                  },
                                  "overall_score": 85,
                                  "recommendations": [
                                      "발음을 더 정확하게 하고 목소리를 선명하게 내보세요",
                                      "자연스러운 억양으로 말해보세요",
                                      "문장 사이의 쉼을 적절하게 가져가보세요"
                                  ],
                                  "similarity_score": 78.5,  # 아나운서 음성과의 유사도
                                  "processing_time_seconds": 3.45
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
async def mimic_announcer(accouncer_info: list, file: UploadFile = File(..., description="분석할 WAV 파일")):
    # WAV 파일 유효성 검사
    validate_wav_file(file)
    try:
        # 음성 분석 수행
        results = await announcer_mimic(file, accouncer_info)
        # TODO: 아나운서 음성과의 유사도 분석 로직 추가
        results["data"]["similarity_score"] = 78.5  # 예시 값
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/analyze/practice",
          summary="스크립트 연습 분석",
          description="내 대본으로 연습하여 음성을 분석합니다.",
          response_description="연습 분석 결과 JSON",
          responses={
              200: {
                  "description": "성공적으로 분석됨",
                  "content": {
                      "application/json": {
                          "example": {
                              "status": "success",
                              "data": {
                                  "similarity_distance": 92.5,
                                  "user_F0": [1, 2, 3, 4, 5, 6, 7, 8],
                                  "metrics": {
                                      "명료도(Clarity)": 20.27,
                                      "억양 패턴 일관성 (Intonation Pattern Consistency)": 59.98,
                                      "멜로디 지수(Melody Index)": -48.29,
                                      "말의 리듬(Speech Rhythm)": 0.044,
                                      "휴지 타이밍(Pause Timing)": 0.118,
                                      "속도 변동성(Rate Variability)": 88.30,
                                      "성대 떨림(Jitter)": 0.020,
                                      "강도 변동성(AMR)": 0.005,
                                      "발화의 에너지(Utterance Energy)": -23.55,
                                  },
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
async def practice_script(file: UploadFile = File(..., description="분석할 WAV 파일")):
    # WAV 파일 유효성 검사
    validate_wav_file(file)
    try:
        # 음성 분석 수행
        results = await analyze_audio(file)
        # TODO: 스크립트 정확도 분석 로직 추가
        results["data"]["script_accuracy"] = 92.5  # 예시 값
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 단순 음성 분석 엔드포인트


@app.post("/analyze/simple",
          summary="단순 음성 분석",
          description="메트릭 값만 반환하는 단순 음성 분석을 수행합니다.",
          response_description="단순 분석 결과 JSON"
          )
async def analyze_simple(file: UploadFile = File(..., description="분석할 WAV 파일")):
    validate_wav_file(file)
    try:
        contents = await file.read()

        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_file.write(contents)
            temp_file.flush()
            temp_path = temp_file.name

        try:
            metrics = calculate_metrics_simple(temp_path)
            return {
                "status": "success",
                "data": {
                    "metrics": metrics
                }
            }
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await file.close()


@app.post("/analyze/announcer",
          summary="아나운서 음성 분석",
          description="아나운서 음성 분석해서 DB 저장하기 위한 일시적 엔드포인트.",
          response_description={
              200: {
                  "description": "성공적으로 분석됨",
                  "content": {
                      "application/json": {
                          "example": {
                              "status": "success",
                              "data": {
                                  "announcer_f0_data":[{"time":0.232,"F0":232},{"time":0.464,"F0":232},...],
                                  "metrics": {
                                      "명료도(Clarity)": 20.27,
                                      "억양 패턴 일관성 (Intonation Pattern Consistency)": 59.98,
                                      "멜로디 지수(Melody Index)": -48.29,
                                      "말의 리듬(Speech Rhythm)": 0.044,
                                      "휴지 타이밍(Pause Timing)": 0.118,
                                      "속도 변동성(Rate Variability)": 88.30,
                                      "성대 떨림(Jitter)": 0.020,
                                      "강도 변동성(AMR)": 0.005,
                                      "발화의 에너지(Utterance Energy)": -23.55,
                                  },
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
async def analyze_announcer(file: UploadFile = File(..., description="분석할 WAV 파일")):
    validate_wav_file(file)
    try:
        contents = await file.read()

        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_file.write(contents)
            temp_file.flush()
            temp_path = temp_file.name

        try:
            metrics = calculate_metrics_simple(temp_path)
            # 여기서 metrics를 사용하여 DB에 저장하는 로직을 구현해야 합니다.
            return {
                "status": "success",
                "data": {
                    "metrics": metrics
                }
            }
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await file.close()