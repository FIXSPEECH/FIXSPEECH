import axiosInstance from "../axiosInstance";



export async function AnalysisDelete(recordId: number) {
    return axiosInstance
        .delete(`/record/${recordId}`)
        .then((response) => {
            Promise.resolve(response.data)
        })
        .catch((error) => {
            Promise.reject(error)
        })
}