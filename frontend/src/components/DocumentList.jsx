import { theme } from "../theme";
import { Icon } from "./Icons";
import DocumentItem from "./DocumentItem";

const DocumentList = ({
  docs,
  loading,
  selected,
  onSelect,
  onRequestDelete,
}) => {
  return (
    <div
      className="flex-1 min-h-0 overflow-hidden rounded-[20px]"
      style={theme.panel}
    >
      <div className="h-full overflow-y-auto p-2 space-y-2">
        {loading ? (
          <div className="h-full p-2 space-y-2 animate-pulse">
            <div className="h-20 rounded-[14px] bg-gray-100" />
            <div className="h-20 rounded-[14px] bg-gray-100" />
          </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-gray-400">
            <Icon.File className="w-11 h-11 mb-2 opacity-40" />
            <p className="text-sm font-medium">No documents yet</p>
            <p className="text-xs mt-1 opacity-70">Upload a PDF to get started</p>
          </div>
        ) : (
          docs.map((doc) => (
            <DocumentItem
              key={doc.id}
              doc={doc}
              isSelected={selected?.id === doc.id}
              onSelect={onSelect}
              onRequestDelete={onRequestDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentList;
