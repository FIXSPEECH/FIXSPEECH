import axiosInstance from "../axiosInstance";


interface Script{
    title: string;
    content: string;
    accent: string;
    minute: number;
    second: number;
}

export async function ScriptPost(payload: Script) {
    return axiosInstance
        .post('/script', payload)
        .then((response) => {
            return Promise.resolve(response.data)
        })
        .catch((error) => {
            return Promise.reject(error)
        })
}

export async function ScriptDelte(scriptId: number) {
    return axiosInstance
        .delete(`/script/${scriptId}`)
        .then((response) => {
            return Promise.resolve(response.data)
        })
        .catch((error) => {
            return Promise.reject(error)
        })
}


// 상황별 연습 목소리 post
export async function ScriptVoicePost(payload: FormData, scriptId: number) {
    return axiosInstance
        .post(`/script/analyze/${scriptId}`, payload, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        } )
        .then((response) => {
            return Promise.resolve(response.data)
        })
        .catch ((error) => {
            return Promise.reject(error)
        })
}



// 음성 분석 결과 단일 삭제
export async function ScriptVoiceResultDelete(resultId: number) {
    return axiosInstance
        .delete(`/script/result/detail/${resultId}`)
        .then((response) => {
            Promise.resolve(response.data)
        })
        .catch((error) => {
            Promise.reject(error)
        })
}

