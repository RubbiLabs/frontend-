"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import TransactionLoadingModal, { type TransactionStatus } from "@/components/ui/TransactionLoadingModal";

interface TransactionModalContextValue {
  showTxModal: (config: {
    type: string;
    title: string;
    description?: string;
  }) => void;
  setTxStatus: (status: TransactionStatus, description?: string, txHash?: string, error?: string) => void;
  hideTxModal: () => void;
}

const TransactionModalContext = createContext<TransactionModalContextValue>({
  showTxModal: () => {},
  setTxStatus: () => {},
  hideTxModal: () => {},
});

interface ModalState {
  open: boolean;
  status: TransactionStatus;
  title: string;
  description: string;
  txHash: string | null;
  error: string | null;
}

export function TransactionModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ModalState>({
    open: false,
    status: "idle",
    title: "",
    description: "",
    txHash: null,
    error: null,
  });

  const showTxModal = useCallback((config: { type: string; title: string; description?: string }) => {
    setState({
      open: true,
      status: "submitting",
      title: config.title,
      description: config.description || "Submitting transaction via gasless relay...",
      txHash: null,
      error: null,
    });
  }, []);

  const setTxStatus = useCallback((status: TransactionStatus, description?: string, txHash?: string, error?: string) => {
    setState((prev) => ({
      ...prev,
      status,
      description: description || prev.description,
      txHash: txHash || prev.txHash,
      error: error || prev.error,
    }));
  }, []);

  const hideTxModal = useCallback(() => {
    setState({
      open: false,
      status: "idle",
      title: "",
      description: "",
      txHash: null,
      error: null,
    });
  }, []);

  return (
    <TransactionModalContext.Provider value={{ showTxModal, setTxStatus, hideTxModal }}>
      {children}
      <TransactionLoadingModal
        open={state.open}
        status={state.status}
        title={state.title}
        description={state.description}
        txHash={state.txHash}
        error={state.error}
        onClose={hideTxModal}
      />
    </TransactionModalContext.Provider>
  );
}

export function useTransactionModal() {
  return useContext(TransactionModalContext);
}
