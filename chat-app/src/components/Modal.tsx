import React from 'react';

interface ModalProps {
  onRequestClose: () => void;
  onConfirm: () => void;
  modalMessage: string;
}

const CustomModal: React.FC<ModalProps> = ({
  onRequestClose,
  onConfirm,
  modalMessage,
}) => {
  return (
    <div className="absolute top-0 left-0 h-full w-full flex justify-center items-center bg-black bg-opacity-20">
      <div className="h-full w-full max-h-[150px] max-w-[500px] bg-gray-100 flex flex-col justify-between rounded-lg border border-inherit shadow-lg p-2">
        <h2 className="w-full flex justify-center items-center font-bold text-[25px] text-gray-500">
          Confirm Removal
        </h2>
        <p>{modalMessage}</p>
        <div className="flex justify-end items-center">
          <button onClick={onConfirm} className="w-[100px] button">
            Confirm
          </button>
          <button onClick={onRequestClose} className="w-[100px] button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
