import Avatar from '@mui/material/Avatar';

function UserInfo() {
    return (
        <>
             <Avatar alt="사용자" src="/static/images/avatar/1.jpg"  sx={{ width: 70, height: 70, marginLeft:'3%' }} />
             <div>
                <div> 내 목소리 분석하기 </div>
                <div> 로그아웃 </div>
             </div>
        </>
    )
}

export default UserInfo;