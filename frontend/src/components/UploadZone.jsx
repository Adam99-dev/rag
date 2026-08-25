import { useRef } from "react";
import { theme } from "../theme";
import { Icon } from "./Icons";

const UploadZone = ({ drag, setDrag, upload }) => {
  const fileRef = useRef(null);

  return (
    <div
      className="p-3.5 cursor-pointer transition flex-shrink-0"
      style={{
        ...theme.panel,
        ...(drag
          ? {
              background: "linear-gradient(145deg, #eff6ff, #dbeafe)",
              boxShadow: "0 8px 32px rgba(59,130,246,0.18)",
            }
          : {}),
      }}
      onClick={() => fileRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDrag(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        if (e.dataTransfer.files.length) upload([e.dataTransfer.files[0]]);
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) upload([e.target.files[0]]);
          e.target.value = "";
        }}
      />
      <div className="text-center">
        <Icon.Upload
          className={`w-10 h-10 mx-auto mb-2 text-blue-600 transition ${
            drag ? "scale-110" : ""
          }`}
        />
        <h3 className="font-semibold text-sm text-gray-800">Upload Document</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Drag & drop or click · PDF only
        </p>
      </div>
    </div>
  );
};

export default UploadZone;