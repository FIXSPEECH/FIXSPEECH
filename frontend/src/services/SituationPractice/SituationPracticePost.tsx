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