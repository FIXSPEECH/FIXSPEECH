import { useState } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

function Lecture() {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "#B9E5E8" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          sx={{
            "& .MuiTab-root": { color: "white" },
            "& .Mui-selected": { color: "#B9E5E8" },
            "& .MuiTabs-indicator": { backgroundColor: "#B9E5E8" },
          }}
        >
          <Tab label="기초 발음" />
          <Tab label="발음 규칙" />
          <Tab label="실전 연습" />
        </Tabs>
      </Box>

      <Box sx={{ p: 3 }}>
        {value === 0 && <div className="text-white">기초 발음 강의 내용</div>}
        {value === 1 && <div className="text-white">발음 규칙 강의 내용</div>}
        {value === 2 && <div className="text-white">실전 연습 강의 내용</div>}
      </Box>
    </Box>
  );
}

export default Lecture;
