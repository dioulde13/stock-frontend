// components/Modal.tsx
import React, { ReactNode } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{title}</h2>
        </div>
        <div className={styles.body}>
          {children}
        </div>
        <div className={styles.footer}>
          <button onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
