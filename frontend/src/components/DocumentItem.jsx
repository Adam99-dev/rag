import { theme } from "../theme";
import { Icon } from "./Icons";

const DocumentItem = ({
  doc,
  isSelected,
  onSelect,
  onRequestDelete,
}) => {
  const isReady = doc.status === "ready";

  return (
    <div
      className={`p-3 transition relative ${
        isReady ? "cursor-pointer hover:-translate-y-0.5" : "cursor-not-allowed opacity-70"
      }`}
      style={{
        ...theme.panel,
        borderRadius: "14px",
        ...(isSelected ? theme.selected : {}),
        ...(!isReady ? { pointerEvents: "none" } : {}),
      }}
      onClick={isReady ? () => onSelect(doc) : undefined}
    >
      <div className="relative flex items-start gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRequestDelete(doc);
          }}
          disabled={!isReady || doc.isDeleting}
          className={`absolute -top-1 -right-1 p-1 rounded-full transition z-10 ${
            isReady && !doc.isDeleting
              ? "hover:bg-red-100 text-gray-400 hover:text-red-500"
              : "text-gray-300"
          }`}
        >
          <Icon.Trash className="w-4 h-4 cursor-pointer" />
        </button>

        <div className="flex-shrink-0">
          <Icon.File className="w-12 h-12" />
        </div>

        <div className="flex-1 min-w-0 pr-4">
          <p className="font-medium text-sm truncate text-gray-800">{doc.name}</p>
          <p className="text-[11px] text-gray-500 mt-0.5"></p>
          <div className="flex items-center justify-between mt-1.5">
            {doc.status === "loading" ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium animate-pulse">
                  {doc.loadingText}
                </span>
                <span className="text-[11px] font-semibold text-blue-600">
                  {doc.progress}%
                </span>
              </div>
            ) : (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium capitalize">
                {doc.status}
              </span>
            )}
          </div>
        </div>

        {doc.isDeleting && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-[14px] flex items-center justify-center z-20">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-red-600">Deleting...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentItem;