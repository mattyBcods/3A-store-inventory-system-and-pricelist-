import { useEffect, useRef } from 'react';

/** Native dialogs provide modal focus handling and keyboard navigation. */
export default function Modal({ id, titleId, children, onClose, locked = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);
  return (
    <dialog
      id={id}
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (!locked) onClose?.();
      }}
    >
      {children}
    </dialog>
  );
}
