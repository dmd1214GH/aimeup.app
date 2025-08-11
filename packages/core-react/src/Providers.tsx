import { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { makeStore } from "./state/store";
import { makeQueryClient } from "./lib/queryClient";

const store = makeStore();
const queryClient = makeQueryClient();

export function Providers({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
}
