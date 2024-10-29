import { useNavigate } from 'react-router-dom';
import '../../styles/Header/Header.css'

function Header(){

    const navigate= useNavigate()

    return (
        <div className='logo-header' onClick={() => navigate('/mainpage') }>FIXSPEECH</div>
    )
}

export default Header;