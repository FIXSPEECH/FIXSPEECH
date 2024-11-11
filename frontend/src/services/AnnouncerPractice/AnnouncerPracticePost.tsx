import fastApiInstance from "../axiosFastInstance";

// interface Audio{
//     user_file: Blob | null;
//     announcer_url: string
// }

export function audioPost(payload: FormData) {
    return fastApiInstance
        .post('/analyze/mimic', payload)
        .then((response) => {
            return Promise.resolve(response.data)
        })
        .catch((error) => {
            return Promise.reject(error)
        })
}