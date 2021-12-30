import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/system";
import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Home } from "./components/Home";
import store from "./redux/store";
import { theme } from "./theme";

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Provider store={store}>
                <BrowserRouter basename={process.env.PUBLIC_URL}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                    </Routes>
                </BrowserRouter>
            </Provider>
        </ThemeProvider>
    );
}

export default App;
