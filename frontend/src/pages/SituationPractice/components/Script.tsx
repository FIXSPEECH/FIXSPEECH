import Box from "@mui/material/Box";
import "../ScrollBar.css";

interface Script {
  content: string;
}

function Script({ content }: Script) {
  return (
    <Box 
      className="text-[#EFCC87] w-3/5" 
      style={{ marginLeft: "3%" }}
      role="article"
      aria-label="대본 내용"
    >
      <div 
        className="sm:text-lg md:text-lg lg:text-xl xl:text-xl max-h-[70vh] pr-4 overflow-y-auto custom-scrollbar"
      >
        {content}
      </div>
    </Box>
  );
}

export default Script;
