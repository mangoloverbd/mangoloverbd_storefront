import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getStorefrontHandle,
  getApiBase,
  type StorefrontConfig,
} from "@/lib/config";

interface StorefrontContextValue {
  config: StorefrontConfig;
  handle: string;
}

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

async function fetchStorefrontConfig(): Promise<StorefrontConfig> {
  const res = await fetch(`${getApiBase()}/config`);

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("STORE_NOT_FOUND");
    }
    throw new Error("CONFIG_FETCH_FAILED");
  }

  return res.json();
}

function StoreNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAF8] px-6 text-center">
      <h1 className="text-4xl font-light tracking-tight text-black/80">
        Store not found
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-black/50">
        This storefront doesn&apos;t exist or hasn&apos;t been configured yet.
        Please check the URL and try again.
      </p>
    </div>
  );
}

function StoreLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-black/60" />
    </div>
  );
}

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const handle = getStorefrontHandle();

  // No handle configured — show error
  if (!handle) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAF8] px-6 text-center">
        <h1 className="text-2xl font-light tracking-tight text-black/80">
          No storefront configured
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-black/50">
          Set <code className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-xs">VITE_STOREFRONT_HANDLE</code>{" "}
          in your environment or add{" "}
          <code className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-xs">?handle=your-store</code>{" "}
          to the URL.
        </p>
      </div>
    );
  }

  return (
    <StorefrontProviderInner handle={handle}>
      {children}
    </StorefrontProviderInner>
  );
}

function StorefrontProviderInner({
  handle,
  children,
}: {
  handle: string;
  children: ReactNode;
}) {
  const { data: config, error, isLoading } = useQuery({
    queryKey: ["storefront-config", handle],
    queryFn: fetchStorefrontConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Apply branding colors as CSS custom properties
  useEffect(() => {
    if (!config) return;

    const root = document.documentElement;
    root.style.setProperty("--brand-primary", config.primaryColor);
    root.style.setProperty("--brand-background", config.backgroundColor);

    // Set page title
    if (config.storeName) {
      document.title = config.storeName;
    }

    // Set favicon if configured
    if (config.faviconUrl) {
      let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = config.faviconUrl;
    }

    return () => {
      root.style.removeProperty("--brand-primary");
      root.style.removeProperty("--brand-background");
    };
  }, [config]);

  if (isLoading) {
    return <StoreLoading />;
  }

  if (error?.message === "STORE_NOT_FOUND" || !config) {
    return <StoreNotFound />;
  }

  return (
    <StorefrontContext.Provider value={{ config, handle }}>
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront(): StorefrontContextValue {
  const context = useContext(StorefrontContext);
  if (!context) {
    throw new Error("useStorefront must be used within a StorefrontProvider");
  }
  return context;
}
