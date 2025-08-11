import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Providers } from "@aimeup/core-react";
import { SampleCard } from "@aimeup/core-ui";

function App() {
  return (
    <Providers>
      <div className="min-h-screen bg-white text-slate-900 p-8">
        <SampleCard>Web is wired.</SampleCard>
      </div>
    </Providers>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
