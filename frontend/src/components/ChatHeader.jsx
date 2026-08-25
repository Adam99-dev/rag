import { Icon } from "./Icons";

const ChatHeader = ({ selected, isMobile, onBack }) => {
  return (
    <div className="shrink-0 px-4 py-3 border-b border-gray-200/50 flex items-center gap-2.5">
      {isMobile && (
        <button
          onClick={onBack}
          className="p-1.5 -ml-1 rounded-lg hover:bg-black/5"
        >
          <Icon.ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      )}
      <Icon.AI className="w-10 h-10 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold text-sm truncate text-gray-800">
          {selected.name}
        </h2>
        <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          AI Ready · Ask anything
        </p>
      </div>
    </div>
  );
};

export default ChatHeader;