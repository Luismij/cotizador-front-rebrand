import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';
import { BrowserRouter as Router } from 'react-router-dom';
import Views from './views';
import { Route, Switch } from 'react-router-dom';
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import { THEME_CONFIG } from './configs/AppConfig';
import { API_BASE_URL } from 'configs/AppConfig'
import axios from 'axios'
import { UserContext } from 'contexts/UserContext';
import Loading from 'components/shared-components/Loading';


const themes = {
  dark: `${process.env.PUBLIC_URL}/css/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/css/light-theme.css`,
};

function App() {
  const [user, setUser] = useState('loading')

  useEffect(() => {
    const init = async () => {
      const jwtToken = localStorage.getItem('jwt')
      try {
        if (jwtToken) {
          const options = {
            method: 'GET',
            url: API_BASE_URL + "/user/loginjwt",
            headers: { 'jwt-token': jwtToken }
          }
          const res = await axios.request(options)
          setUser(res.data)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.log(error);
        //localStorage.removeItem('jwt')
      }
    }
    init()
    /* return () => {
      cleanup
    } */
  }, [])

  if (user === 'loading') {
    return (<Loading cover='content' />)
  }
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <div className="App">
        <Provider store={store}>
          <ThemeSwitcherProvider themeMap={themes} defaultTheme={THEME_CONFIG.currentTheme} insertionPoint="styles-insertion-point">
            <Router>
              <Switch>
                <Route path="/" component={Views} />
              </Switch>
            </Router>
          </ThemeSwitcherProvider>
        </Provider>
      </div>
    </UserContext.Provider>
  );
}

export default App;
