import React, {Component} from 'react'
import AppBar from 'material-ui/AppBar'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import FlatButton from 'material-ui/FlatButton'
import Toggle from 'material-ui/Toggle'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import NavigationClose from 'material-ui/svg-icons/navigation/close'
import Menu from 'material-ui/svg-icons/navigation/menu'
import Home from 'material-ui/svg-icons/action/home'
import Drawer from 'material-ui/Drawer'
import { blue900, grey900, fullWhite } from 'material-ui/styles/colors'
import { hashHistory } from 'react-router'
import utilisateurManager from '../services/utilisateurManager'
import Dialog from 'material-ui/Dialog'
import LinearProgress from 'material-ui/LinearProgress'

// component to show in case of anonymous user
const Login = (props) => (
    null
) 

// component to show in case of logged user
class Logged extends React.Component { 
  constructor(props) {
    super(props)
    this.startUpload = this.startUpload.bind(this)
    this.handleCloseExportDialog = this.handleCloseExportDialog.bind(this)
    this.state = {
      exportDialogOpen: false,
      exportDialogProgress: 0,
      alertDialogOpen: false,
      alertDialogMessage: null
    }
  }

  /**
   * upload selected photos to firebase and update UI
   */
  async startUpload(){
    if(this.props.utilisateurManager.getSelectedPhotos().length === 0) {
      this.setState({
        alertDialogOpen: true,
        alertDialogMessage: 'Please do select some photos first'
      })
      return
    }
    this.setState({
      exportDialogOpen: true,
      exportDialogActions: null
    }, async () => {
      // start upload
      await this.props.utilisateurManager.uploadSelectedPhotos((progressPercent) => {
        // update progress value
        this.setState({
          exportDialogProgress: progressPercent
        })
      })
      // show dialog exit button after finishing upload
      this.setState({
        exportDialogActions: (<FlatButton label="Done" primary={true} onTouchTap={this.handleCloseExportDialog} />)
      })
    })
  }

  /**
   * close export dialog, reset upload progress and redirect user to home page 
   */
  async handleCloseExportDialog() {
    this.setState({
      exportDialogProgress: 0,
      exportDialogOpen: false
    }, () => {
      hashHistory.push('/')
    })
  }

  render(){
    return (
      <div>
        <Dialog
        actions={this.state.exportDialogActions}
        modal={false}
        open={this.state.exportDialogOpen}
        >
          <p>Uploading your awesome photos to the cloud!</p>
          <LinearProgress mode="determinate" value={this.state.exportDialogProgress} />
        </Dialog>
        <Dialog
        actions={<FlatButton label="Okay" primary={true} onTouchTap={() => this.setState({alertDialogOpen: false})} />}
        modal={false}
        open={this.state.alertDialogOpen}
        >
          {this.state.alertDialogMessage}
        </Dialog>
      <IconMenu
        iconButtonElement={
          <IconButton><MoreVertIcon color={fullWhite} /></IconButton>
        }
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
      >
        <MenuItem primaryText="Export" onTouchTap={this.startUpload} />
      </IconMenu>
      </div>
    )
  }
}

export default class GaleriesAppBar extends React.Component {
    constructor(props){
      super(props)
      // make sure class methods are bound to this object/component
      this.handleToggle = this.handleToggle.bind(this)
      this.doCheckLogin = this.doCheckLogin.bind(this)

      this.utilisateurManager = new utilisateurManager()

      // listen to authentication events
      this.utilisateurManager.on('auth.login', this.doCheckLogin)
      this.utilisateurManager.on('auth.logout', this.doCheckLogin)
      this.utilisateurManager.on('auth.update', this.doCheckLogin)
      this.state = {
        menuOpen: false // primary side menu state
      }
    }

    
    componentWillMount() {
      this.doCheckLogin()
    }

    handleToggle() {
      this.setState({
        menuOpen: !this.state.menuOpen
      })
    }

    handleClose() {
      this.setState({
        menuOpen: false
      })
    }

    /**
     * check if current user is logged in and get his profile if possible
     */
    async doCheckLogin() {
      this.setState({
          isLoggedIn: await this.utilisateurManager.isLoggedIn(), 
          profile: await this.utilisateurManager.getProfile()
      }, () => {
        // redirect to home page if user isn't logged in
        if(!this.state.isLoggedIn) {
          hashHistory.push('/')
        }
      })
    }

    render() {
      return (
        <section>
          <AppBar
            iconElementLeft={this.props.isHomePage || true ?  <IconButton onTouchTap={this.handleToggle}><Menu /></IconButton> : <IconButton onTouchTap={() => hashHistory.push('/')}><Home /></IconButton>}
            iconElementRight={this.state.isLoggedIn ? <Logged utilisateurManager={this.utilisateurManager} /> : <Login />}
          />
          <Drawer 
            docked={false}
            open={this.state.menuOpen}
            onRequestChange={(menuOpen) => this.setState({menuOpen})}>
            <AppBar style={{background: blue900}} title="Navigation" onTouchTap={this.handleToggle} />
            <MenuItem onTouchTap={() => this.handleClose() & hashHistory.push('/')}>Home</MenuItem>
            {this.state.isLoggedIn ? <MenuItem onTouchTap={() => this.handleClose() & hashHistory.push('/galeries')}>Geleries</MenuItem> : null}
            {this.state.isLoggedIn ? <MenuItem primaryText="Sign out" onClick={async () => (await this.utilisateurManager.logout('facebook')) & this.handleClose()} /> : null}
          </Drawer>
        </section>
      )
    }
}