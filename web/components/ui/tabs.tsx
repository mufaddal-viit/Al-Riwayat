"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  idBase: string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error(`<${component}> must be used within <Tabs>.`);
  }
  return context;
}

interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Minimal, dependency-free tabs with keyboard support. Controlled (pass
 * `value` + `onValueChange`) or uncontrolled (pass `defaultValue`).
 */
function Tabs({
  value: controlledValue,
  defaultValue,
  onValueChange,
  children,
  className,
}: TabsProps) {
  const reactId = React.useId();
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolled;

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolled(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const context = React.useMemo<TabsContextValue>(
    () => ({ value, setValue, idBase: reactId }),
    [value, setValue, reactId],
  );

  return (
    <TabsContext.Provider value={context}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="tablist"
    className={cn(
      "inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 p-1",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const { value: active, setValue, idBase } = useTabsContext("TabsTrigger");
    const isActive = active === value;

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={`${idBase}-trigger-${value}`}
        aria-selected={isActive}
        aria-controls={`${idBase}-content-${value}`}
        tabIndex={isActive ? 0 : -1}
        data-state={isActive ? "active" : "inactive"}
        onClick={() => setValue(value)}
        className={cn(
          "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          isActive
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
          className,
        )}
        {...props}
      />
    );
  },
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const { value: active, idBase } = useTabsContext("TabsContent");
    if (active !== value) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`${idBase}-content-${value}`}
        aria-labelledby={`${idBase}-trigger-${value}`}
        tabIndex={0}
        className={cn("focus-visible:outline-none", className)}
        {...props}
      />
    );
  },
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
