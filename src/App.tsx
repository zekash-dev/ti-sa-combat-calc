import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/system";
import React from "react";
import { Provider } from "react-redux";

import { Home } from "./components/Home";
import store from "./redux/store";
import { theme } from "./theme";

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Provider store={store}>
                <Home />
            </Provider>
        </ThemeProvider>
    );
}

export default App;
