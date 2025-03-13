import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import "./index.scss";
import Footer from "./components/Footer";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import store from "./app/store";
import keycloak from "./app/keycloak";
import * as serviceWorker from "./serviceWorker";
import Api from "./utilities/api.ts";

const renderApp = () => {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <Provider store={store}>
      <div className="layout-app">
        <main className="layout-container">
          <App />
        </main>

        <footer className="layout-footer">
          <Footer />
        </footer>
      </div>
    </Provider>
  );
};

async function init() {
  const response = await Api.get("config");
  console.log(response.data);
  await keycloak.init(response.data.environment);
  renderApp();
}

init();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

serviceWorker.unregister();
