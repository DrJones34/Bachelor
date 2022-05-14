<script>
    import {overlayStore} from '../js/overlay.js';
    // import { deactivateOverlay } from '../js/overlay.js';

    let showOverlay = false;

    // const SEARCH = "https://api.spotify.com/v1/search"
    // const TOKEN = "https://accounts.spotify.com/api/token";

    // var trackSearch = "";
    // var access_token = null; //husk at get access token
    // var loadedResults = [];
    // var refresh_token = null;
    // var client_id = "da26fd2687ef488e927623251a3fcffc"; 
    // var client_secret = "bd04cf03a60e4d0eb30131e095894a3b";
    // var server_url = "http://127.0.0.1:5000/" // use this for local server
    // var redirect_uri = "http://127.0.0.1:3000/"


    overlayStore.subscribe(overlay => {
        showOverlay = overlay.show;
    })

    // function refreshAccessToken(){
    //     refresh_token = localStorage.getItem("refresh_token");
    //     let body = "grant_type=refresh_token";
    //     body += "&refresh_token=" + refresh_token;
    //     body += "&client_id=" + client_id;
    //     callAuthorizationApi(body);
    // }

    // function callAuthorizationApi(body){
    //     let xhr = new XMLHttpRequest();
    //     xhr.open("POST", TOKEN, true);
    //     xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    //     xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    //     xhr.send(body);
    //     xhr.onload = handleAuthorizationResponse;
    // }
    
    // function handleAuthorizationResponse(){
    //     if ( this.status == 200 ){
    //         var data = JSON.parse(this.responseText);
    //         console.log(data);
    //         var data = JSON.parse(this.responseText);
    //         if ( data.access_token != undefined ){
    //             access_token = data.access_token;
    //             localStorage.setItem("access_token", access_token);
    //         }
    //         if ( data.refresh_token  != undefined ){
    //             refresh_token = data.refresh_token;
    //             localStorage.setItem("refresh_token", refresh_token);
    //         }
    //         if (localStorage.getItem("UID") == undefined){
    //             var UID = Math.floor(Math.random()* Date.now());
    //             localStorage.setItem("UID", String(UID));
    //         }
    //     }
    //     else {
    //         console.log(this.responseText);
    //         alert(this.responseText);
    //     }
    // }

    // function searchTrack() {
    //     let url = SEARCH;
    //     url += "?q=" + trackSearch;
    //     url += "&type=track,artist";
    //     //url += "&market=DK";
    //     url += "&limit=10"; //hardcoded limit
        
    //     let xhr = new XMLHttpRequest();
    //     xhr.open("GET", url, true);
    //     //xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    //     xhr.setRequestHeader('Authorization', 'Authorization: Bearer ' + access_token);
    //     xhr.send();
    //     xhr.onload = handleSearchResults;
    // }
    
    // function handleSearchResults() {
    //     if ( this.status == 200 ){
    //         var data = JSON.parse(this.responseText);
    //         console.log(data["tracks"]["items"]);
    //         var results = data["tracks"]["items"];
    //         for (var i = 0; i < results.length; i++) {
    //             var artist = "";
    //             for (var o = 0; o < results[i]["artists"].length; o++){
    //                 artist += results[i]["artists"][o]["name"];
    //                 if (o+1 < results[i]["artists"].length) {
    //                     artist += ", ";
    //                 }
    //             }
    //             var dict = {
    //                 trackName: results[i]["name"],
    //                 trackURI: results[i]["uri"],
    //                 coverURI: results[i]["album"]["images"][0]["url"],
    //                 artists: artist
    //             };

    //             loadedResults[i] = dict;
    //         }            
            
    //     } else if (this.status == 401) {
    //         console.log(this.response_text)
    //         console.log("access token expired, making new.")
    //         refreshAccessToken();
    //     }
    //     else {
    //         console.log(this.responseText);
    //         alert(this.responseText);
    //     }
    // }
    
    // async function postToBackend(trackName, artists, trackURI, coverURI){
    //     var UID = localStorage.getItem("UID");
    //     console.log("UID:", UID);
    //     console.log("trackURI:", trackURI);
    //     console.log(coverURI);
    //     var url = server_url+'requestSong/';
    //     let xhr = new XMLHttpRequest();
    //     xhr.open("POST", url, true);
    //     xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    //     xhr.setRequestHeader('Access-Control-Allow-Origin', redirect_uri)
    //     // //xhr.setRequestHeader('Authorization', 'Authorization: Bearer ' +access_token);
    //     let body = "trackURI=" + trackURI;
    //     body += "&trackName=" + trackName;
    //     body += "&artists=" + artists;
    //     body += "&coverURI="+ coverURI;
    //     body += "&UID=" + UID;
    //     xhr.send(body);
    // }
    

</script>

{#if showOverlay}
<main class="overlay">

    <!-- <div class="search">
    <button 
		type="submit" 
		id="searchIcon" 
		on:click={searchTrack}
		/> 
    <input type="search" autocomplete="off" id="search" placeholder="Search for song or artist" bind:value = {trackSearch}> 
</div>

    <div class="containerSearch">
        {#if loadedResults.length > 1}
        {#each loadedResults as {trackName, artists, trackURI, coverURI, checked}}
        <img src= {coverURI} alt = "cover images" width="40" height="40">
        <div class="searchSongs"> 
            <p id="trackName"> {trackName}</p>
            <p id="artists"> {artists}</p>
        </div>
        {#if checked == true}
            <button 
            class="parent" 
            id="checkedRequestSongIcon" 
            on:click={() => postToBackend(trackName, artists, trackURI, coverURI)}
            />
        {:else}
            <button 
            class="parent" 
            id="requestSongIcon" 
            on:click={() => postToBackend(trackName, artists, trackURI, coverURI)}
            on:click={()=> checked = true}
            />
        {/if}
        {/each}
        {/if}
        </div>

        <button on:click={deactivateOverlay}>
            Cancel
        </button> -->

</main>
{/if}


<style>

    /*CSS hører til overlay (search)*/

	/* .containerSearch{
    display: grid;
    grid-template-columns: 17% 70% 25%;
    margin-top: 5%;
    } */

    /*css til search bar*/
    /* .search {
    color: white; 
    padding: 8px;
    background-color: #1D1E1F;
    font-size: small;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    border-radius: 25px;
    border: none;
    width: 100%;
    display: inline-flex;
    margin: 0 auto;
    caret-color: white;
    padding-left: 1%;
    outline: none;
    margin-bottom: 2%;
    } */

    /*css til orange button*/    
    /* #searchIcon {
    background: none;
    background-image: url("./static/searchIcon.png");
    width: 18px;
    border: 2px solid transparent; 
    background-repeat: no-repeat;
    background-size: 100% auto;
    cursor: pointer;
    float: left;
    position: relative;
    margin-top: 2%;
    margin-right: 3%;
    margin-left: 3%;
    }

    #search {
    border: none;
    background: transparent;
    padding: 4px 4px;
    outline: none;
    width: 100%;
    }

    input[type="search"]::placeholder {
    color: #48403B;
    font-size: small;
    padding-left: 1%;
    width: 100%;
    } */

    /*css for cancel button in search bar*/
    /*Rinput[type="search"]::-webkit-search-cancel-button {
    -webkit-appearance: none;  /*Remove default */

    /* background: none;
    background-image: url("./static/cancel.png");
    width: 10px;
    border: 10px solid transparent;     
    background-repeat: no-repeat;
    background-size: 100% auto;
    position: relative;
    margin-bottom: 3%;
    }

    .parent {
    position: relative;
    top: 0;
    left: 0;
    }

    #requestSongIcon { 
    background: none;
    background-image: url("./static/requestSong.png");
    width: 25%;
    border: 2px solid transparent; 
    background-repeat: no-repeat;
    background-size: 100% auto;
    cursor: pointer;
    float: right;
    position: relative;
    margin-top: 25%;
    padding-top: 17px;
    }

    #checkedRequestSongIcon { 
    background: none;
    background-image: url("./static/alreadyRequested.png");
    width: 25%;
    border: 2px solid transparent; 
    background-repeat: no-repeat;
    background-size: 100% auto;
    cursor: pointer;
    float: right;
    position: relative;
    margin-top: 25%;
    padding-top: 17px;
    } */

</style>