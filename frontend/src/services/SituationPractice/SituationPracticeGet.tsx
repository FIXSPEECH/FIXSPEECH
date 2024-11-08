import axiosInstance from "../axiosInstance";

// 개별 스크립트 항목에 대한 타입
interface Script {
    title: string;
    minute: number;
    second: number;
    createdAt: string;
}

export async function ScriptListGet(page = 0, size = 10) {
    try {
        let results: Script[] = [];
        let hasMoreData = true;

        while (hasMoreData) {
            const response = await axiosInstance.get(`/script?page=${page}&size=${size}`);
            const data =  response.data.data.content;

            results = [...results, ...data];

            if (data.length < size) {
                hasMoreData = false;  // 더 이상 데이터가 없다고 판단하여 반복 종료
            } else {
                page += 1;  // 다음 페이지 요청
            }
        }

        return Promise.resolve(results);
    } catch (error) {
        return Promise.reject(error);
    }
}
