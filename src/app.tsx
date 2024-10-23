import "./css/output.css";
import React from "react";
import MainView from "./components/main-view";

// const { QueryClient, QueryClientProvider } = Spicetify.ReactQuery;
// const queryClient = new QueryClient();

function App() {
  return (
    // This doesn't work for some reason
    // <QueryClientProvider client={queryClient}>
    <MainView />
    // </QueryClientProvider>
  );
}

export default App;
