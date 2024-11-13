import fastApiInstance from "../axiosFastInstance";

interface Stt {
    answer_text: string,
    user_text: string
}

export function sttPost(payload: Stt){
    return fastApiInstance
        .post('/analyze/pronunciation', payload)
        .then((response) => {
            return Promise.resolve(response.data)
        })
        .catch ((error) => {
            Promise.reject(error)
        })
}