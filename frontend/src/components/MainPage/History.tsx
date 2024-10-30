// @ts-ignore
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import '../../styles/MainPage/History.css'
// @ts-ignore
// import ReactTooltip from 'react-tooltip';

function History() {

    return (
        <div style={{marginLeft:'3%'}}  className='w-1/2  mt-5 mb-10'>
        <CalendarHeatmap
            startDate={new Date(new Date().setMonth(new Date().getMonth() - 4))}
            endDate={new Date(new Date().setMonth(new Date().getMonth() ))}
            values={[
                { date: '2024-08-01', count: 12 },
                { date: '2024-09-22', count: 122 },
                { date: '2024-10-30', count: 38 },
                // ...and so on
            ]}
            onClick={(value:any )=> alert(`Clicked on value with count: ${value.count}`)}
           className="custom-calendar-height"
            />
        </div>
        
    )
}

export default History;