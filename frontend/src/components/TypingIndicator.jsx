import { TypeAnimation } from "react-type-animation";
import { Riple } from "react-loading-indicators";

const TypingIndicator = () => {
  return (
    <div className="flex items-center text-xs text-gray-600 animate-in fade-in duration-300">
      <div className="shrink-0 scale-45">
        <Riple color="#000000" size="small" text="" textColor="" />
      </div>
      <TypeAnimation
        sequence={["Searching...", 1000, "Comparing...", 1000, "Reranking...", 1000]}
        wrapper="span"
        cursor={false}
        repeat={Infinity}
        style={{
          fontSize: "0.75rem",
          display: "inline-block",
          fontWeight: 500,
          lineHeight: 0,
        }}
      />
    </div>
  );
};

export default TypingIndicator;