import Toast from "./Toast";

const ToastContainer = ({ toasts, removeToast }) => {
  if (!toasts?.length) return null;

  return (
    <>
      <style>{`
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateY(-16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes toastOut {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(-12px) scale(0.96);
          }
        }
      `}</style>

      <div
        className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2.5 pointer-events-none"
        style={{ maxWidth: "calc(100vw - 32px)" }}
      >
        {toasts.map((t) => (
          <Toast
            key={t.id}
            id={t.id}
            message={t.message}
            type={t.type}
            duration={t.duration}
            action={t.action}
            onClose={removeToast}
          />
        ))}
      </div>
    </>
  );
};

export default ToastContainer;