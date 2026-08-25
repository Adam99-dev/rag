import UploadZone from "./UploadZone";
import SearchBar from "./SearchBar";
import DocumentList from "./DocumentList";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ProfileFooter from "./ProfileFooter";

const Sidebar = ({
  isMobile,
  drag,
  setDrag,
  upload,
  search,
  setSearch,
  filteredDocs,
  loading,
  selected,
  onSelect,
  showDeleteConfirm,
  docToDelete,
  setShowDeleteConfirm,
  setDocToDelete,
  handleDeleteDoc,
  user,
  profileMenuOpen,
  setProfileMenuOpen,
  logout,
}) => {
  return (
    <aside
      className={`${
        isMobile ? "w-full" : "w-[280px] lg:w-[300px]"
      } flex-shrink-0 flex flex-col h-full p-3 gap-3`}
    >
      <UploadZone drag={drag} setDrag={setDrag} upload={upload} />
      <SearchBar search={search} setSearch={setSearch} />
      <DocumentList
        docs={filteredDocs}
        loading={loading}
        selected={selected}
        onSelect={onSelect}
        onRequestDelete={(doc) => {
          setDocToDelete(doc);
          setShowDeleteConfirm(true);
        }}
      />
      <DeleteConfirmModal
        show={showDeleteConfirm}
        doc={docToDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDocToDelete(null);
        }}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          handleDeleteDoc(docToDelete.id);
        }}
      />
      <ProfileFooter
        user={user}
        profileMenuOpen={profileMenuOpen}
        setProfileMenuOpen={setProfileMenuOpen}
        logout={logout}
      />
    </aside>
  );
};

export default Sidebar;
