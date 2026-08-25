import { theme } from "../theme";
import { Icon } from "./Icons";

const ProfileFooter = ({
  user,
  profileMenuOpen,
  setProfileMenuOpen,
  logout,
}) => {
  return (
    <div
      className="flex-shrink-0 p-3 flex items-center justify-between gap-2 relative"
      style={theme.panel}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Icon.Logo className="w-8 h-8 rounded-xl flex-shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-sm text-gray-800 truncate">DocuMind</h1>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-900 text-white font-semibold">
              {user?.plan}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 truncate">
            <span className="font-bold">{user?.name || "Guest"}</span>
          </p>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          title="Profile"
          className="w-8 h-8 flex items-center justify-center rounded-full transition"
        >
          <Icon.Profile className="w-8 h-8 cursor-pointer" />
        </button>

        {profileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setProfileMenuOpen(false)}
            />
            <div
              className="absolute bottom-full right-0 mb-2 w-48 rounded-xl shadow-lg z-50 overflow-hidden"
              style={{
                ...theme.panel,
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            >
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {user?.name || "Guest"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "Not signed in"}
                </p>
              </div>
              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  console.log("Open profile settings");
                }}
                className="cursor-pointer font-semibold w-full px-4 py-2.5 flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <Icon.Settings className="w-5 h-5" />
                Settings
              </button>
              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  logout();
                }}
                className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer font-semibold"
              >
                <Icon.Logout className="w-4 h-4 ml-1" />
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileFooter;