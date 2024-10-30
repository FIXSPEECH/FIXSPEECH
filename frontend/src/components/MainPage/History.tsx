import { useEffect } from 'react';
import CalHeatmap from 'cal-heatmap';
import 'cal-heatmap/cal-heatmap.css';

function History(){

    const data = {
        "2024-10-01": 3,
        "2024-10-02": 6,
    };
      
    
    useEffect(() => {
        const startDate = new Date(new Date().setMonth(new Date().getMonth() - 4)); // 4개월 전
        console.log("Start Date:", startDate); // 시작 날짜 출력
        
        const cal = new CalHeatmap();      

        cal.paint({
            range: 5, // 범위
            domain: { type: 'month', sort:'asc' },
            subDomain: { type: 'day' },
            date: {start: new Date(new Date().setMonth(new Date().getMonth() - 4))},
            data: data,
            scale: {
                color: {
                  // Try some values: Purples, Blues, Turbo, Magma, etc ...
                  scheme: 'Cool',
                  type: 'linear',
                },
              },
        });  

  
        // 클린업 함수: 컴포넌트 언마운트 시에 실행됨
        return () => {
            cal.destroy(); // 필요 시 이전 인스턴스를 정리
        };
    }, []); // 빈 배열로 설정하여 마운트 시 한 번만 실행

  

    return(
        <>
            <div id="cal-heatmap" className='mt-4' style={{marginLeft:'3%'}}/>
        </>
       
    )
}

export default History;