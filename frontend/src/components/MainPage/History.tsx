// @ts-ignore
import CalendarHeatmap from 'react-calendar-heatmap';
import '../../styles/MainPage/History.css';
import { useState, useEffect } from 'react';

function History() {
    return (
        <div style={{ marginLeft: '3%', marginRight:'3%' }} className='mt-5 mb-10'>
            <CalendarHeatmap
                startDate={new Date(new Date().setMonth(new Date().getMonth() - 4))}
                endDate={new Date(new Date().setMonth(new Date().getMonth()))}
                values={[
                    { date: '2024-08-01', count: 1 },
                    { date: '2024-09-22', count: 2 },
                    { date: '2024-10-30', count: 4 },
                    // ...and so on
                ]}
                onClick={(value: any) => alert(`Clicked on value with count: ${value.count}`)}
            />
        </div>
    );
}

export default History;
