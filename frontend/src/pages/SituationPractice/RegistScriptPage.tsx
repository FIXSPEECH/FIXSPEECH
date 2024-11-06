import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

function RegistScript() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [accent, setAccent] = useState("power"); // 기본 값 "힘있게 말하기"
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const navigate = useNavigate();

  const handlePracticeClick = () => {
    const data = {
      title,
      content,
      accent,
      time: `${minutes}분 ${seconds}초`,
    };

    console.log(data)
    navigate("/situation/practice");
  };




  // 타이틀 저장
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };
  
  // 내용 저장
  const handleContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContent(event.target.value);
  };
  
  // 악센트 선택 저장
  const handleAccentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccent(event.target.value);
  };

    // 분 선택 핸들러
    const handleMinutesChange = (event: SelectChangeEvent) => {
      setMinutes(Number(event.target.value));
    };
  
    // 초 선택 핸들러
    const handleSecondsChange = (event: SelectChangeEvent) => {
      setSeconds(Number(event.target.value));
    };
  

  // textfield 공용 css
  const CustomTextFieldStyle = {
    // 글자 색 변경
    '& .MuiInputBase-input': {
      color: '#FFAB01', // 글자 색을 #FFAB01로 변경
    },
    // label 색 변경
    '& .MuiInputLabel-root': {
      color: '#FCDA95', // 기본 label 색 변경
    },
    // 활성화 상태에서도 label 색 유지
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#FCDA95', // focus 상태에서도 동일한 label 색 유지
  },
    // 비활성화 상태에서 테두리 색 변경
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#FFAB01', // 비활성화 상태에서 테두리 색
      },
    },
    // 활성화 상태에서 테두리 색 변경
    '& .MuiOutlinedInput-root.Mui-focused': {
      '& fieldset': {
        borderColor: '#FFAB01', // focus 시 테두리 색
      },
    },
    // hover 시 테두리 색 변경
    '& .MuiOutlinedInput-root:hover': {
      '& fieldset': {
        borderColor: '#FFAB01', // hover 시 테두리 색
      },
    },
  };


  return (
    <>
    <div className="min-h-[70vh] flex justify-center items-center">
        <div className="flex flex-col justify-center align-middle">
      {/* 제목 입력 */}
      <div className="text-[#FFAB01] sm:text-lg md:text-lg lg:text-xl xl:text-xl mb-4">*연습할 대본의 제목을 입력해주세요.</div>
      <TextField
          id="outlined-multiline-flexible"
          label="제목을 입력해주세요."
          onChange={handleTitleChange}
          sx={CustomTextFieldStyle}
        />

      {/* 내용 입력 */}
      <div className="text-[#FFAB01] sm:text-lg md:text-lg lg:text-xl xl:text-xl mb-4 mt-8">*연습할 대본을 입력해주세요.</div>
      <TextField
      id="outlined-multiline-static"
      label="대본을 입력해주세요."
      multiline
      rows={4}
      onChange={handleContentChange}
      variant="outlined" // outlined 속성 추가
      sx={CustomTextFieldStyle}
    />


    {/* 강세 선택 */}
    <div className="text-[#FFAB01] sm:text-lg md:text-lg lg:text-xl xl:text-xl mb-4 mt-8">*원하는 강세를 선택해주세요.</div>
    <RadioGroup
        row
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group"
        onChange={handleAccentChange}
        sx={{
          // 라디오 버튼 색상 설정
          '& .MuiRadio-root': {
            color: '#FCDA95', // 비활성 상태 색상
            '&.Mui-checked': {
              color: '#FCDA95', // 선택된 상태 색상
            },
          },
          // 라벨 색상 설정
          '& .MuiFormControlLabel-label': {
            color: '#FFAB01',
          },
        }}
      >
        <FormControlLabel value="power" control={<Radio />} label="힘있게 말하기" />
        <FormControlLabel value="mild" control={<Radio />} label="부드럽게 말하기" />
      </RadioGroup>

    {/* 시간 선택 */}
    <div className="text-[#FFAB01] sm:text-lg md:text-lg lg:text-xl xl:text-xl mb-4 mt-8">*연습시간을 설정해주세요.</div>
   
    {/* 분 선택 */}
    <FormControl 
      sx={{
        m: 1, 
        minWidth: 120, 
        '& .MuiInputLabel-root': {
          color: '#FFAB01', // 기본 라벨 색상
          '&.Mui-focused': {
            color: '#FFAB01', // 활성화 상태의 라벨 색상
          },
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: '#FFAB01', // 테두리 색상
          },
          '&:hover fieldset': {
            borderColor: '#FFAB01', // hover 시 테두리 색상
          },
          '&.Mui-focused fieldset': {
            borderColor: '#FFAB01', // focus 시 테두리 색상
          },
          color: '#FFAB01', // Select 컴포넌트의 텍스트 색상
        },
        '& .MuiSvgIcon-root': {
          color: '#FCDA95', // 드롭다운 아이콘 색상
        },
      }} 
      size="small"
    >
      <InputLabel id="demo-select-small-label">분</InputLabel>
      <Select
        labelId="demo-select-small-label"
        id="demo-select-small"
        label="0 분"
        value={minutes.toString()}
        onChange={handleMinutesChange}
      >
        <MenuItem value={0}>0 분</MenuItem>
        <MenuItem value={1}>1 분</MenuItem>
        <MenuItem value={2}>2 분</MenuItem>
        <MenuItem value={3}>3 분</MenuItem>
        <MenuItem value={4}>4 분</MenuItem>
        <MenuItem value={5}>5 분</MenuItem>
      </Select>
    </FormControl>

     {/* 초 선택 */}
    <FormControl   sx={{
    m: 1, 
    minWidth: 120, 
    '& .MuiInputLabel-root': {
      color: '#FFAB01', // 기본 라벨 색상
      '&.Mui-focused': {
        color: '#FFAB01', // 활성화 상태의 라벨 색상
      },
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#FFAB01', // 테두리 색상
      },
      '&:hover fieldset': {
        borderColor: '#FFAB01', // hover 시 테두리 색상
      },
      '&.Mui-focused fieldset': {
        borderColor: '#FFAB01', // focus 시 테두리 색상
      },
      color: '#FFAB01', // Select 컴포넌트의 텍스트 색상
    },
    '& .MuiSvgIcon-root': {
      color: '#FCDA95', // 드롭다운 아이콘 색상
    },
  }}  size="small">
      <InputLabel id="demo-select-small-label">초</InputLabel>
      <Select
        labelId="demo-select-small-label"
        id="demo-select-small"
        value={seconds.toString()}
        label="Age"
        onChange={handleSecondsChange}
      >
        <MenuItem value={0}>0 초</MenuItem>
        <MenuItem value={10}>10 초</MenuItem>
        <MenuItem value={20}>20 초</MenuItem>
        <MenuItem value={30}>30 초</MenuItem>
        <MenuItem value={40}>40 초</MenuItem>
        <MenuItem value={50}>50 초</MenuItem>
      </Select>
    </FormControl>
    </div>
    </div>

    
      {/* 연습 시작 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
      <Button variant="contained"
        onClick={handlePracticeClick}
        sx={{
          backgroundColor: '#FFAB01',
          borderColor : '#FCDA95',
          color: 'black',
          fontSize: {
            sm: "1.125rem",  // sm:text-lg
            md: "1.125rem",  // md:text-lg
            lg: "1.25rem",   // lg:text-xl
            xl: "1.5rem",    // xl:text-2xl
          },
          marginRight: '10%',
          marginLeft: 'auto',
          marginBottom: { xs: '5%', sm: '0' }, 
          marginTop: { xs: '5%', sm: '5%', md: '0' },
        }}
      >
        연습 시작하기
      </Button>
    </div>


      {/*  /situation/practice (SituationPractice.tsx) */}

      </>
  );
}

export default RegistScript;
