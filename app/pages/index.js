import React from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import Avatar from 'material-ui/Avatar'
import Mood from 'material-ui/svg-icons/social/mood'
import Collections from 'material-ui/svg-icons/image/collections'
import { blue900, grey900, fullWhite } from 'material-ui/styles/colors'
import { Link } from 'react-router'
import CircularProgress from 'material-ui/CircularProgress'
import utilisateurManager from '../services/utilisateurManager'



export default class Index extends React.Component {
    constructor(props) {
        super(props)
        // make sure class methods are bound to this object/component
        this.doLogin = this.doLogin.bind(this)
        this.doCheckLogin = this.doCheckLogin.bind(this)
        this.utilisateurManager = new utilisateurManager()
        // listen to logout authentication event
        this.utilisateurManager.on('auth.logout', this.doCheckLogin)
        this.state = {
            isLoading: true
        }
    }

    componentWillMount(){
        this.doCheckLogin()
    }
    
    /**
     * redirect user to Facebook OAuth login page
     */
    async doLogin() {
        try{
            await this.utilisateurManager.login('facebook')
            await this.doCheckLogin()
        } catch(exception) {
            console.error(exception)
        }
    }

    /**
     * check if current user is logged in and get his profile if possible
     */
    async doCheckLogin() {
        try{
            this.setState({
                isLoggedIn: await this.utilisateurManager.isLoggedIn(), 
                profile: await this.utilisateurManager.getProfile()
            })
        } catch(exception) {
            console.error(exception)
        } finally {
            this.setState({
                isLoading: false
            })
        }
    }

    render(){
        return (
            <section>
                {this.state.isLoading ? 
                (
                    <div style={{textAlign: 'center'}}><CircularProgress size={60} thickness={5} /></div>
                )
                :
                this.state.isLoggedIn ? 
                (
                    <div>
                        <Avatar src={this.state.profile.thumbnail} size={60} /> 
                        <h3 style={{color: grey900, fontWeight: 100}}>{this.state.profile.name}</h3>
                        <Link to="/galeries">
                            <RaisedButton
                                label="Get started" 
                                backgroundColor={grey900} 
                                labelColor={fullWhite}
                                icon={<Collections color={fullWhite} />}
                                onTouchTap={this.doLogin}
                            />
                        </Link>
                    </div>
                ) 
                : 
                (
                    <RaisedButton 
                        label="Sign in" 
                        backgroundColor={blue900} 
                        labelColor={fullWhite}
                        icon={<Mood color={fullWhite} />}
                        onTouchTap={this.doLogin}
                    />
                )} 
            </section>
        )
        
    }
}