export const Icon = {
  Logo: ({ className }) => (
    <img src="../icons/logo.png" alt="" className={className} />
  ),
  Profile: ({ className }) => (
    <img className={className} src="../icons/profile_icon.png" alt="" />
  ),
  AI: ({ className }) => (
    <video
      className={className}
      src="../icons/ai_icon.webm"
      autoPlay
      loop
      muted
      playsInline
    />
  ),
  Upload: ({ className }) => (
    <img className={className} src="../icons/upload_icon.png" alt="" />
  ),
  File: ({ className }) => (
    <img className={className} src="../icons/file_icon.png" alt="" />
  ),
  Search: ({ className }) => (
    <img className={className} src="../icons/search_icon.png" alt="" />
  ),
  Send: ({ className }) => (
    <img className={className} src="../icons/send_icon.png" alt="" />
  ),
  Trash: ({ className }) => (
    <img className={className} src="../icons/delete_icon.png" alt="" />
  ),
  Database: ({ className }) => (
    <img className={className} src="../icons/database_icon.png" alt="" />
  ),
  Logout: ({ className }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  ),
  Settings: ({ className }) => (
    <img className={className} src="../icons/setting_icon.png" alt="" />
  ),
  ChevronLeft: ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={5}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  ),
  Danger: ({ className }) => (
    <img className={className} src="../icons/danger_icon.png" alt="" />
  ),
  ChevronDown: ({ className }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),

  Success: ({ className }) => (
    <img className={className} src="../icons/tick_icon.png" alt="" />
  ),
  Info: ({ className }) => (
    <img className={className} src="../icons/info_icon.png" alt="" />
  ),
  Warning: ({ className }) => (
    <img className={className} src="../icons/warning_icon.png" alt="" />
  ),
  Error: ({ className }) => (
    <img className={className} src="../icons/error_icon.png" alt="" />
  ),
};
