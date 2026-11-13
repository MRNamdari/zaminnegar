"use client";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/60 transition-opacity duration-300
        ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}
      `}
    >
      <div className="relative w-full max-w-lg rounded-xl bg-slate-800 p-6">
        <button onClick={onClose} className="cursor-pointer absolute top-4 left-4 text-white">
          ✕
        </button>

        {children}
      </div>
    </div>
  );
}
