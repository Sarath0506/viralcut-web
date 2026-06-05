import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/providers/auth-provider";
import { selectedBrandStorageKey } from "@/lib/portal";

type SelectedBrandContextValue = {
  brandProfileId: string | null;
  companyName: string | null;
  setBrand: (brandProfileId: string, companyName: string) => void;
  clearBrand: () => void;
};

const SelectedBrandContext = createContext<SelectedBrandContextValue | null>(
  null,
);

export function SelectedBrandProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { auth } = useAuth();
  const role = auth?.user.role ?? null;
  const storageKey = selectedBrandStorageKey(role);

  const [brandProfileId, setBrandProfileId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    if (!storageKey) {
      setBrandProfileId(null);
      setCompanyName(null);
      return;
    }
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          brandProfileId: string;
          companyName: string;
        };
        setBrandProfileId(parsed.brandProfileId);
        setCompanyName(parsed.companyName);
      } catch {
        localStorage.removeItem(storageKey);
        setBrandProfileId(null);
        setCompanyName(null);
      }
    } else {
      setBrandProfileId(null);
      setCompanyName(null);
    }
  }, [storageKey]);

  const setBrand = useCallback(
    (nextId: string, nextName: string) => {
      setBrandProfileId(nextId);
      setCompanyName(nextName);
      if (storageKey) {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ brandProfileId: nextId, companyName: nextName }),
        );
      }
    },
    [storageKey],
  );

  const clearBrand = useCallback(() => {
    setBrandProfileId(null);
    setCompanyName(null);
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  const value = useMemo(
    () => ({ brandProfileId, companyName, setBrand, clearBrand }),
    [brandProfileId, companyName, setBrand, clearBrand],
  );

  return (
    <SelectedBrandContext.Provider value={value}>
      {children}
    </SelectedBrandContext.Provider>
  );
}

export function useSelectedBrand() {
  const ctx = useContext(SelectedBrandContext);
  if (!ctx) {
    throw new Error("useSelectedBrand must be used within SelectedBrandProvider");
  }
  return ctx;
}
