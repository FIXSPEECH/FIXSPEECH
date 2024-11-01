import Avatar from '@mui/material/Avatar';

function UserInfo() {
    return (
        <div className="flex items-center mt-10 w-1/4" style={{marginLeft:'3%'}}>
             <Avatar alt="사용자" src="/static/images/avatar/1.jpg"  sx={{ width: 80, height: 80 }} />
             <div className="flex flex-col items-center gap-2 ml-4">
                <div className="flex justify-center items-center text-white bg-white bg-opacity-25 rounded-md w-48 h-9"> 내 목소리 분석하기 </div>
                <div className='flex justify-center items-center text-white bg-white bg-opacity-25 rounded-md w-48 h-9'> 로그아웃 </div>
             </div>
        </div>
    )
}

export default UserInfo;