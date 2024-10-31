import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
// 아이콘 img import
import clock from '../../assets/buttons/clock.png'
import find from '../../assets/buttons/find.png'
import geo from '../../assets/buttons/geo.png'
import music from '../../assets/buttons/music.png'
import read from '../../assets/buttons/read.png'

function Buttons(){
    const navigate = useNavigate()

    const gridItems = [
        { color: '#EE719E', label: '발음 훈련 강의', imageSrc: music, url: '/pronounce/lecture',  imgMargin: 50},
        { color: '#FF8C82', label: '발음 훈련 연습', imageSrc: music, url:'/pronounce/practice/', imgMargin: 50 },
        { color: '#FFAB01', label: '상황별 연습', imageSrc: geo, url:'/situation/practice' , imgMargin: 50},
        { color: '#B18CFE', label: '아나운서 따라잡기', imageSrc: read, url:'/announcer/imitate' , imgMargin: 5},
        { color: '#FE6250', label: '산성비 게임', imageSrc: clock , url:'/game',  imgMargin: 50},
        { color: '#37AFE1', label: '내 목소리 분석', imageSrc: find , url: '/analysis',  imgMargin: 50},
      ];

    return (
     <Box sx={{ flexGrow: 1, marginRight:'3%', marginLeft:'3%', marginBottom:'3%' }}>
      <Grid container spacing={2} >
        {gridItems.map((item, index) => (
          <Grid size={{ xs: 6, sm: 4, md: 2}} key={index} sx={{ backgroundColor: item.color, padding: 2 , borderRadius:'3%', height: 300, position:'relative', overflow: 'hidden'}}
            onClick={() => navigate(item.url)}>
            <div style={{ color: 'white', fontSize: '1.5rem' , wordBreak: 'keep-all', whiteSpace: 'normal'}}>{item.label}</div>
            <img src={item.imageSrc} alt={item.label} style={{ width: '100%', marginTop: item.imgMargin, marginLeft: 15, objectFit: 'cover' }} />
          </Grid>
        ))}
      </Grid>
    </Box>
    )
}


export default Buttons;