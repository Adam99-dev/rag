import { Icon } from "./Icons";

const DeleteConfirmModal = ({
  show,
  doc,
  onCancel,
  onConfirm,
}) => {
  if (!show || !doc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-96 max-w-md mx-4">
        <div className="flex items-center gap-3 mb-4">
          <Icon.Danger className="w-8 h-8" />
          <h3 className="text-lg font-semibold text-gray-900">Delete Document</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete{" "}
          <span className="font-medium text-gray-900">"{doc.name}"</span>? This
          action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;