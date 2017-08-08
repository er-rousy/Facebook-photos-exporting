import React from 'react'
import { Grid, Row, Col } from 'react-flexbox-grid'
import RaisedButton from 'material-ui/RaisedButton'
import {GridList, GridTile} from 'material-ui/GridList'
import IconButton from 'material-ui/IconButton'
import Subheader from 'material-ui/Subheader'
import CheckCircle from 'material-ui/svg-icons/action/check-circle'
import { blue900, amber800, grey900, fullWhite, fullBlack } from 'material-ui/styles/colors'
import RefreshIndicator from 'material-ui/RefreshIndicator'
import { Link } from 'react-router'
import utilisateurManager from '../services/utilisateurManager'
import { hashHistory } from 'react-router'
import CircularProgress from 'material-ui/CircularProgress'

export default class Galeries extends React.Component {
    constructor(props) {
      super(props)
      this.utilisateurManager = new utilisateurManager()
      this.state = {
        albums: [],
        isLoading: true
      }
    }
    
    componentWillMount() {
      this.loadAlbums()
    }

    /**
     * load full list of user's albums
     */
    async loadAlbums(){
      try{
        this.setState({
          albums: await this.utilisateurManager.getAlbums(),
          isLoading: false
        })
      } catch(exception){
        console.error(exception)
        // redirect to home page in case of access token issue
        if(exception.error && 
          [190, 2500, 104].includes(exception.error.code)){
            hashHistory.push('/')
          }
      }
    }

    // TODO: refactor, clean up markup & implement masonry grid as separate component
    render(){
        return (
            <section>
                {this.state.albums.length == 0 && !this.state.isLoading ? 
                (
                  <h4>Oops! there is no albums for you today :(</h4>
                ) : (
                  <div className="masonry-grid images">
                    {this.state.albums.map((album) => (
                      <article key={album.id} className="item" onClick={() => hashHistory.push(`/galerie/${album.id}`)}>
                        <img src={album.thumbnail} className="image" />
                        <span className="title" style={{color: fullWhite, fontSize: '1.25em'}}>{album.name}</span>
                      </article>
                    ))}
                  </div>
                )}

                {this.state.isLoading ? 
                (
                  <div style={{textAlign: 'center', marginTop: '25px'}}><CircularProgress size={30} thickness={5} /></div>
                ) : null}
            </section>
        )
    }
}