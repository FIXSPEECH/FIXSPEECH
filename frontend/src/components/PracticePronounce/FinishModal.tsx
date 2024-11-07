import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import usePronounceScoreStore from '../../store/pronounceScoreStore';


interface FinishModalProps {
    isOpen: boolean; // 모달이 열려 있는지 확인하는 상태를 부모로부터 전달받음
    onClose: () => void; // 모달 닫을 때 호출되는 함수
  }

export default function AlertDialog({isOpen, onClose}: FinishModalProps) {
  
  const {isNumber} = usePronounceScoreStore();

  return (
    <React.Fragment>
   
      <Dialog
        open={isOpen}
        onClose={onClose} 
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          "& .MuiPaper-root": {  // Dialog의 기본 Paper에 대한 스타일링
            backgroundColor: "#F3F3F3", // 원하는 색상으로 변경
            color: "#333", // 텍스트 색상도 필요시 변경
          }
        }}
      >
        <DialogTitle id="alert-dialog-title">{"연습이 완료되었습니다!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
          축하합니다! {isNumber} 개의 문장연습을 모두 마쳤습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} sx={{color: '#EC5A4D'}}>종료하기</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
