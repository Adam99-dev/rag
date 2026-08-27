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
          <div className="p-2 space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3 animate-pulse"
                style={{ ...theme.panel, borderRadius: "14px" }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-200" />
                  <div className="flex-1 min-w-0 pr-4 space-y-2 pt-1">
                    <div className="h-3.5 w-3/4 rounded bg-gray-200" />
                    <div className="h-2.5 w-1/3 rounded bg-gray-200" />
                    <div className="h-2 w-1/4 rounded-full bg-gray-100 mt-2" />
                  </div>
                </div>
              </div>
            ))}
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
