import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Script from "../../components/SituationPractice/Script";
import Timer from "../../components/SituationPractice/Timer";
import Recorder from "../../components/Recorder";
import { ScriptGet } from "../../services/SituationPractice/SituationPracticeGet";
import useModalStore from "../../store/modalStore";
import useVoiceStore from "../../store/voiceStore";
import { ScriptVoicePost } from "../../services/SituationPractice/SituationPracticePost";
import Swal from 'sweetalert2';
import '../../styles/SituationPractice/SwalStyles.css'

interface Data {
  title: string;
  content: string;
  accent: string;
  second: number;
  createdAt: string;
}


function SituationPractice() {
  const {scriptId} = useParams();
  const Id = Number(scriptId)
  const [data, setData] = useState<Data>();
  const {isModal, setIsModal} = useModalStore();
  const {audioBlob} = useVoiceStore();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>('')

  console.log('id 타입', typeof Id)

  const postVoice = async() => {
    if(!audioBlob) {
      console.error('Audio blob is nulll')
      return;
    }
    
    // 현재 시간을 이용해 고유한 파일명 생성
    const timestamp = new Date().getTime();
    const filename = `recording_${timestamp}.wav`;

    const file = new File([audioBlob], filename, {
      type: 'audio/wav'
    });

    const data = new FormData()

    data.append('record', file)

    try {
      const response = await ScriptVoicePost(data, Id)

      setStatus(response.status)
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    if (isModal === true) {
      postVoice();
    }

    console.log('isModal', isModal)
    console.log('audioBlob', audioBlob)
  }, [isModal])


  useEffect(() => {
    if (status === 'C000') {
      Swal.fire({
        title: "대본 연습이 전송되었습니다.",
        text: '분석 완료시 알려드리겠습니다.',
        showDenyButton: false,
        confirmButtonText: "확인",
        customClass: {
          confirmButton: "swal2-confirm-btn", // 삭제 버튼
        },
        buttonsStyling: false
      }) .then(() =>{
        setStatus('')
        setIsModal(false)
        navigate('/situation')
      })
  }
  }, [status])
  
  useEffect(() => {
    const PracticeContent = async() => {
      try{
        const response = await ScriptGet(Id)
        console.log(response)

        if (response.status === 'C000') {
          setData(response.data);
        }

      } catch(e) {
        console.log(e)
      }
    }

    PracticeContent();
  }, [Id])

  return (
    <div className="flex min-h-[80vh] items-center">

      {data ? (
      <>
        <Script content={data.content} />
        <div className="flex-col w-2/5 justify-center align-middle">
          <Timer seconds={data.second} />
          <Recorder color={"#FFAB01"} barColor={"rgb(239,204,135)"} width={200} height={60} visualizeWidth="200px" modalType="regist" />
        </div>
      </>
    ) : (
      <div>Loading...</div> // 데이터 로딩 중에 표시될 내용
    )}
  </div>
  );
}

export default SituationPractice;
