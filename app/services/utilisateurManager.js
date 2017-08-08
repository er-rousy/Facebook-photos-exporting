import hello from 'hellojs'
import axios from 'axios'
import * as firebase from 'firebase';
// allow single instance during app lifecycle
let utilisateurManagerInstance = null

/**
 * Manage user authentication and account albums/photos using Hello.js library
 */
class utilisateurManager {
    constructor() {
        // initialize a new instance if needed
        if (!utilisateurManagerInstance) {
            utilisateurManagerInstance = this
            hello.init({
                facebook: FACEBOOK_APP_ID
            }, {
                    scope: 'photos',
                    display: 'popup',
                    force: false
                });
        }
        // proxify some of Hello.js methods
        this.login = hello.login.bind(hello)
        this.logout = hello.logout.bind(hello)
        this.on = hello.on.bind(hello)
        this.off = hello.on.bind(hello)

        // listen to logout event
        this.on('auth.logout', this.onLogout.bind(this))
        return utilisateurManagerInstance
    }

    /**
     * get list of all user's albums sorted by name (ascending)
     */
    async getAlbums() {
        let albums = []
        let fetchedAlbums = []
        // default Facebook Api endpoint query string params 
        let options = {
            limit: 2
        }
        do {
            let response = await hello('facebook').api('me/albums', 'get', options)
            options.after = response.paging ? response.paging.cursors.after : ''
            fetchedAlbums = response.data
            albums = albums.concat(fetchedAlbums)
        } while (fetchedAlbums.length > 0) // stop once there is no more data
        // return sorted array
        return albums.sort((x, y) => x.name.localeCompare(y.name))
    }

    /**
     * get list of photos in a specific user's album
     * @param {*int} albumId Facebook Album ID
     * @param {*string} pageAfter Facebook pagination token
     */
    async getAlbumPhotos(albumId, pageAfter) {
        let photos = []
        let fetchedPhotos = []
        // default Facebook Api endpoint query string params 
        let options = {
            id: albumId,
            limit: 1,
            fields: 'id, picture, images'
        }
        if (pageAfter) {
            options.after = pageAfter
        }
        let response = await hello('facebook').api('me/album', 'get', options)
        response.data = response.data.map(photo => {
            // set uncropped image as photo thumbnail
            photo.thumbnail = photo.images.reverse()[0].source
            return photo
        })
        return response
    }

    /**
     * check if current user is logged in using Facebook OAuth
     */
    async isLoggedIn() {
        let session = hello('facebook').getAuthResponse()
        let currentTime = (new Date()).getTime() / 1000
        return session && session.access_token && session.expires > currentTime
    }

    /**
     * get current user profile data
     */
    async getProfile() {
        try {
            return await hello('facebook').api('me')
        } catch (exception) {
            // return empty object in case of inactive access token
            if (exception.error && exception.error.code === 2500) {
                return {}
            } else {
                throw exception
            }
        }
    }

    /**
     * handle user sign out
     */
    onLogout() {
        // empty selected photos collections
        // as it contains sensitive data such as access token
        localStorage.removeItem('selectedPhotos')
    }

    /**
     * get file name from url
     * @param { string } url 
     */
    GetFilename(url) {
        if (url) {
            var matchs = url.toString().match(/.*\/(.+?)\./);
            if (matchs && matchs.length > 1) {
                return matchs[1];
            }
        }
        return "";
    }
    /**
     * get list of selected photos from persistence store (default: localStorage)
     */
    getSelectedPhotos() {
        return JSON.parse(localStorage.getItem('selectedPhotos')) || []
    }

    /**
     * add a photo to selected photos list
     */
    addSelectedPhoto(photo) {
        let selectedPhotos = this.getSelectedPhotos()
        // prevent duplicate elements
        if (!selectedPhotos.find(i => i.id === photo.id)) {
            selectedPhotos.push(photo)
            // serialize array as Json
            localStorage.setItem('selectedPhotos', JSON.stringify(selectedPhotos))
        }
    }

    /**
     * remove a photo from selected photos list
     */
    removeSelectedPhoto(photo) {
        let selectedPhotos = this.getSelectedPhotos()
        selectedPhotos = selectedPhotos.filter(i => i.id !== photo.id)
        localStorage.setItem('selectedPhotos', JSON.stringify(selectedPhotos))
    }

    /**
     * upload selected photos to firebase
     * @param {*callback} progressCallback function to report uploading progress
     */
    async uploadSelectedPhotos(progressCallback = (percent) => undefined) {
        let selectedPhotos = this.getSelectedPhotos()
        if (selectedPhotos.length === 0) return;

        let profile = await this.getProfile();
        // get firebase client token
        let token = (await axios.post('/api/get-token', { user_fb_id: profile.id })).data;
        var config = {
            apiKey: "AIzaSyCGekgEJT43B8iJkDi5JALjFBqaov00IZo",
            authDomain: "hidden-founder.firebaseapp.com",
            projectId: "hidden-founder",
            storageBucket: "hidden-founder.appspot.com"
        };
        let appFirebase = firebase.initializeApp(config);
        appFirebase.auth().signInWithCustomToken(token);

        let processedPhotosCount = 1;
        for (let photo of selectedPhotos) {
            // download image

            let image = (await axios.get(photo.thumbnail,{responseType: 'blob'})).data;
            // Create a root reference
            let storageRef = appFirebase.storage().ref();
            // Create a reference to image
            let mountainsRef = storageRef.child('images/' + photo.id + '.jpg');
            // Create file metadata including the content type
            let metadata = {
                contentType: 'image/jpeg',
            };
            // Upload the file and metadata
            await mountainsRef.put(image, metadata);
            // report progress 
            let progressPercent = (processedPhotosCount++ * 100) / selectedPhotos.length
            progressCallback(progressPercent)

            this.removeSelectedPhoto(photo)
        }
    }
}


export default utilisateurManager