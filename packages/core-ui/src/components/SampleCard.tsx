import { PropsWithChildren } from "react";
export function SampleCard({ children }: PropsWithChildren) {
  return (
    <div className="rounded-xl border border-black/10 p-4 shadow-sm"
         style={{ backgroundColor: `rgb(var(--a-color-bg))`, color: `rgb(var(--a-color-fg))`, borderRadius: "var(--a-radius-md)" }}>
      {children ?? "Hello from @aimeup/core-ui"}
    </div>
  );
}
