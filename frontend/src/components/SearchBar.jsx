import { theme } from "../theme";
import { Icon } from "./Icons";

const SearchBar = ({ search, setSearch }) => {
  return (
    <div
      className="px-3 py-2.5 flex items-center gap-2 flex-shrink-0"
      style={theme.input}
    >
      <Icon.Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search documents..."
        className="flex-1 bg-transparent focus:outline-none text-sm placeholder:text-gray-400"
      />
    </div>
  );
};

export default SearchBar;