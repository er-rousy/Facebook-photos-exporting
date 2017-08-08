import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, hashHistory, IndexRoute } from 'react-router'
import injectTapEventPlugin from 'react-tap-event-plugin'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import './skin.scss'
import AppBar from './components/appBar'
import Index from './pages/index'
import Galeries from './pages/galeries'
import Galerie from './pages/galerie'



/**
 * Main app
 */
class GalerieApp extends React.Component {
    render() {
        return (
            <MuiThemeProvider>
                <section>
                    <AppBar />
                    <h1>Building a mini Facebook photos exporting app</h1>
                    {this.props.children}
                </section>
            </MuiThemeProvider>
        )
    }
}

/**
 * App routes
 */
class GalerieRoutes extends React.Component {
    render() {
        return (
            <Router history={hashHistory}>
                <Route path="/" component={GalerieApp}>
                    <IndexRoute component={Index} />
                    <Route path="/galeries" component={Galeries} />
                    <Route path="/galerie/:galerieId" component={Galerie} />
                </Route>
            </Router>
        )
    }
}

// Material UI
injectTapEventPlugin()

ReactDOM.render(<GalerieRoutes />, document.getElementById('root'))

export default { GalerieApp, GalerieRoutes }

