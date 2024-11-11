from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from analyze_wav_file import analyze_audio, calculate_metrics_simple
from accouncer_mimic import announcer_mimic
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
        logger.error(f"Invalid file type: {file.filename}. Expected .wav file")
        raise HTTPException(
            status_code=400,
            detail={
                "status": "error",
                "message": "Invalid file type. Please upload a .wav file.",
                "code": "INVALID_FILE_TYPE",
                "file_name": file.filename,
                "file_content_type": file.content_type,
                "error_details": "파일 확장자가 .wav가 아닙니다."
            }
        )

# HTTP 예외 처리기


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    logger.error(f"HTTP Exception occurred: Status Code: {exc.status_code}, Detail: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": str(exc.detail),
            "code": exc.status_code,
            "request_path": str(request.url),
            "request_method": request.method,
            "error_details": "HTTP 요청 처리 중 오류가 발생했습니다."
        }
    )

# 일반 예외 처리기


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unexpected error occurred: {str(exc)}", exc_info=True)
    error_context = {
        "exception_type": type(exc).__name__,
        "exception_message": str(exc),
        "request_path": str(request.url),
        "request_method": request.method
    }
    logger.error(f"Error context: {error_context}")
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Internal server error occurred",
            "detail": str(exc),
            "code": "INTERNAL_SERVER_ERROR",
            "error_context": error_context,
            "error_details": "서버 내부에서 예상치 못한 오류가 발생했습니다."
        }
    )

# 전체 음성 분석 엔드포인트


@app.post("/analyze/full",
    summary="전체 음성 분석",
    description="""업로드된 WAV 파일의 전체적인 음성 분석을 수행합니다. 성별에 따른 기준을 적용합니다.
    
    분석되는 메트릭:
    - 명료도(Clarity): 음성의 선명도
    - 억양 패턴 일관성(Intonation Pattern Consistency): 음성의 자연스러운 억양 변화
    - 멜로디 지수(Melody Index): 음성의 높낮이 변화
    - 말의 리듬(Speech Rhythm): 발화의 리듬감
    - 휴지 타이밍(Pause Timing): 문장 간 쉼의 적절성
    - 속도 변동성(Rate Variability): 말하기 속도의 안정성
    - 성대 떨림(Jitter): 성대 진동의 안정성
    - 강도 변동성(AMR): 음성 크기의 변화
    - 발화의 에너지(Utterance Energy): 전반적인 음성 에너지
    
    각 메트릭은 Excellent/Good/Poor로 평가되며, 성별에 따라 다른 기준이 적용됩니다.""",
    response_description="성별 기준이 적용된 상세 분석 결과 JSON",
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
                                    "reference": "남성: 13~15dB, 여성: 14~16dB가 적정 범위",
                                    "interpretation": "매우 명료한 음성입니다"
                                },
                                "억양 패턴 일관성 (Intonation Pattern Consistency)": {
                                    "value": 59.98,
                                    "grade": "excellent",
                                    "unit": "Hz",
                                    "reference": "남성: 15~30Hz, 여성: 20~35Hz가 적정 범위",
                                    "interpretation": "자연스러운 억양 변화를 보입니다"
                                },
                                "멜로디 지수(Melody Index)": {
                                    "value": -48.29,
                                    "grade": "good",
                                    "unit": "MFCC",
                                    "reference": "남성: -40 이상, 여성: -35 이상이 최적",
                                    "interpretation": "양호한 음성 멜로디를 보입니다"
                                },
                                "말의 리듬(Speech Rhythm)": {
                                    "value": 0.044,
                                    "grade": "poor",
                                    "unit": "초",
                                    "reference": "남성: 0.06~0.1초, 여성: 0.05~0.09초가 적정 범위",
                                    "interpretation": "개선이 필요한 발화 리듬입니다"
                                },
                                "휴지 타이밍(Pause Timing)": {
                                    "value": 0.118,
                                    "grade": "excellent",
                                    "unit": "초",
                                    "reference": "남성: 0.09~0.13초, 여성: 0.08~0.12초가 적정 범위",
                                    "interpretation": "자연스러운 휴지를 보입니다"
                                },
                                "속도 변동성(Rate Variability)": {
                                    "value": 88.30,
                                    "grade": "poor",
                                    "unit": "Hz",
                                    "reference": "남성: 60~75Hz, 여성: 65~80Hz가 적정 범위",
                                    "interpretation": "개선이 필요한 속도 변화입니다"
                                },
                                "성대 떨림(Jitter)": {
                                    "value": 0.020,
                                    "grade": "excellent",
                                    "unit": "비율",
                                    "reference": "남성: 0.03 이하, 여성: 0.02 이하가 최적",
                                    "interpretation": "안정적인 성대 진동을 보입니다"
                                },
                                "강도 변동성(AMR)": {
                                    "value": 0.005,
                                    "grade": "excellent",
                                    "unit": "비율",
                                    "reference": "남성: 0.004~0.007, 여성: 0.003~0.006이 적정 범위",
                                    "interpretation": "적절한 강도 변화를 보입니다"
                                },
                                "발화의 에너지(Utterance Energy)": {
                                    "value": -23.55,
                                    "grade": "excellent",
                                    "unit": "dB",
                                    "reference": "남성: -24dB 이상, 여성: -23dB 이상이 최적",
                                    "interpretation": "적절한 발화 에너지를 보입니다"
                                }
                            },
                            "overall_score": 85,
                            "recommendations": [
                                "말의 속도를 더 자연스럽게 조절해보세요",
                                "말하기 속도의 변화를 더 안정적으로 가져가보세요",
                                "발화 리듬을 더 자연스럽게 조절해보세요"
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
                        "message": "Invalid file type or gender",
                        "code": "INVALID_REQUEST"
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
                        "message": "Error processing audio file",
                        "code": "PROCESSING_ERROR"
                    }
                }
            }
        }
    }
)
async def analyze_full(
    file: UploadFile = File(..., description="분석할 WAV 파일"),
    gender: str = Form(..., description="성별 (male 또는 female)")
):
    validate_wav_file(file)
    if gender not in ["male", "female"]:
        raise HTTPException(
            status_code=400,
            detail={
                "status": "error",
                "message": "Invalid gender. Must be 'male' or 'female'",
                "code": "INVALID_GENDER"
            }
        )
    try:
        results = await analyze_audio(file, gender)
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
                                  "f0_similarity_distance": 73.35,
                                  "f0_similarity_percentage": 77.77,
                                  "user_f0_data": "[99.71, 131.57, 145.15, 154.67, 113.88, 154.67, 165.77, 163.86, 162.92, 149.4, 108.11, 122.05, 141.83, 134.65, 112.57, 122.05, 119.96, 96.87, 107.49, 110.64, 98.0, 119.96, 119.96, 173.61, 162.92, 141.83, 124.19, 107.49, 103.83, 85.81, 81.93]",
                                  "announcer_f0_data": "[99.71, 115.2, 127.83, 140.2, 115.2, 138.59, 137.79, 130.81, 130.81, 131.57, 81.93, 85.81, 113.22, 113.88, 99.71, 91.44, 91.44, 73.84, 107.49, 65.41, 85.81, 83.85, 103.23, 161.98, 146.83, 157.37, 129.31, 100.87, 88.83, 83.85, 76.01, 75.13, 68.9]"
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
async def mimic_announcer(user_file: UploadFile = File(..., description="사용자 음성 파일"),
                          announcer_url: str = Body(..., embed=True, description="아나운서 음성 파일 URL")):
    """
    사용자 음성 파일과 아나운서 음성 파일 URL을 이용하여 유사도 계산
    """
    try:
        # 두 파일을 이용해 유사도 계산
        results = await announcer_mimic(user_file, announcer_url)
        return JSONResponse(content=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/practice",
    summary="스크립트 연습 분석",
    description="내 대본으로 연습하여 음성을 분석합니다. 성별에 따른 기준을 적용합니다.",
    response_description="연습 분석 결과 JSON",
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
                            "script_accuracy": 92.5,  # 스크립트 정확도
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
async def practice_script(
    file: UploadFile = File(..., description="분석할 WAV 파일"),
    gender: str = Form(..., description="성별 (male 또는 female)")
):
    # WAV 파일 유효성 검사
    validate_wav_file(file)
    if gender not in ["male", "female"]:
        raise HTTPException(
            status_code=400,
            detail={
                "status": "error",
                "message": "Invalid gender. Must be 'male' or 'female'",
                "code": "INVALID_GENDER",
                "error_details": "성별은 'male' 또는 'female'만 가능합니다."
            }
        )
    try:
        # 음성 분석 수행
        results = await analyze_audio(file, gender)
        # TODO: 스크립트 정확도 분석 로직 추가
        results["data"]["script_accuracy"] = 92.5  # 예시 값
        return results

    except ValueError as e:
        logger.error(f"Value error in audio processing: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": "Audio processing error",
                "code": "INVALID_AUDIO_DATA",
                "error_details": "음성 데이터 처리 중 오류가 발생했습니다."
            }
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": "Internal server error",
                "code": "INTERNAL_SERVER_ERROR",
                "error_details": "서버 내부 오류가 발생했습니다. 관리자에게 문의하세요.",
                "error_trace": str(e)
            }
        )

# 단순 음성 분석 엔드포인트


@app.post("/analyze/simple",
    summary="단순 음성 분석",
    description="""메트릭 값만 반환하는 단순 음성 분석을 수행합니다.
    성별 기준이 적용되지 않으며, 순수 측정값만 반환됩니다.""",
    response_description="기본 메트릭 값 JSON",
    responses={
        200: {
            "description": "성공적으로 분석됨",
            "content": {
                "application/json": {
                    "example": {
                        "status": "success",
                        "data": {
                            "metrics": {
                                "명료도(Clarity)": 20.27,
                                "억양 패턴 일관성 (Intonation Pattern Consistency)": 59.98,
                                "멜로디 지수(Melody Index)": -48.29,
                                "말의 리듬(Speech Rhythm)": 0.044,
                                "휴지 타이밍(Pause Timing)": 0.118,
                                "속도 변동성(Rate Variability)": 88.30,
                                "성대 떨림(Jitter)": 0.020,
                                "강도 변동성(AMR)": 0.005,
                                "발화의 에너지(Utterance Energy)": -23.55
                            }
                        }
                    }
                }
            }
        }
    }
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
                os.unlink(temp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await file.close()
