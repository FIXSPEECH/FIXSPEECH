from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware # CORS 대응
from fastapi.responses import JSONResponse
from analyze_wav_file import analyze_audio

app = FastAPI()

def validate_wav_file(file: UploadFile):
    if file.content_type != "audio/wav":
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .wav file.")

@app.post("/analyze/full")
async def analyze_full(file: UploadFile = File(...)):
    results = await analyze_audio(file)
    return JSONResponse(content=results)

@app.post("/analyze/mimic")
async def mimic_announcer(file: UploadFile = File(...)):
    results = await analyze_audio(file)
    return JSONResponse(content=results)

@app.post("/analyze/practice")
async def practice_script(file: UploadFile = File(...)):
    results = await analyze_audio(file)
    return JSONResponse(content=results)




# @app.get("/")
# async def root():
#     return {"message": "Hello World"}

# @app.get("/hello/{name}")
# async def say_hello(name: str):
#     return {"message": f"Hello {name}"}