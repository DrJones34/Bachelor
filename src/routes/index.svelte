<!-- This Svelte server has the responsibility of handling the clients:
    logging them in with their spotify account
    sending requests to the flask server
    receiving updated information from the database through mqtt

    (mqtt and flask communication not implemented yet) 
    script section need cleanup -->
<script>
	let showOverlay = false;

	//import {TextField, Button} from 'svelte-materialify'
	//import {track} from "../stores/songstore";
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	export const track = writable([]);
	var server_url = "http://badonk.myddns.me:32800/" // use this for deployed server
	//var server_url = 'http://127.0.0.1:5000/'; // use this for local server
	//var svelte_url = "http://badonk.myddns.me:32700/" // use this for deployed server
	var svelte_url = 'https://yeboi.vercel.app/'

    
	var redirect_uri = svelte_url;
	var client_id = 'da26fd2687ef488e927623251a3fcffc';
	var client_secret = 'bd04cf03a60e4d0eb30131e095894a3b';
	var access_token = null;
	var refresh_token = null;

	var loadedResults = [];
	var trackSearch = '';

	const AUTHORIZE = 'https://accounts.spotify.com/authorize';
	const TOKEN = 'https://accounts.spotify.com/api/token';
	const SEARCH = 'https://api.spotify.com/v1/search';

	var voteResults = [];
	//svar alreadyVoted = [];
	var votedEle = [];
	var client;
	var location = {
		host: 'broker.mqttdashboard.com',
		port: 8000,
		protocol: 'mqtt',
		clientId: 'AU-Bachelor-cientId-',
		topic: 'bachelor22gruppe7AU',
		topicevent: 'bachelor22gruppe7AU/event'
	};


	onMount(async () => {
		console.log('loader');
		if (window.location.search.length > 0) {
			handleRedirect();
		} else {
			access_token = localStorage.getItem('access_token');
			if (access_token == null) {
				// we don't have an access token so present token section
				console.log('page loaded and we DONT have token');
			} else {
				// we have an access token so present device section
				console.log('page loaded and we have token');
			}
		}

		client = new Paho.MQTT.Client(
			location.host,
			Number(location.port),
			localStorage.getItem('UID')
		);
		// set callback handlers
		client.onConnectionLost = onConnectionLost;
		client.onMessageArrived = onMessageArrived;

		// connect the client
		client.connect({ onSuccess: onConnect });
		console.log(client);
	});

	async function getVoteList() {
		const response = await fetch(server_url + 'voteList/'); //TODO: should fetch name, artist, cover, uri
		const data = await response.json();
		var list = data['items'];
		console.log(list);
        var oldVotes = []
		oldVotes = JSON.parse(localStorage.getItem('alreadyVoted'));
		if (list.length == 0) {
            var oldVotes = []
			localStorage.setItem('alreadyVoted', JSON.stringify(oldVotes));
		}
        if(oldVotes != undefined){
            for (var i = 0; i < oldVotes.length; i++) {
                for (var y = 0; y < list.length; y++) {
                    if (list[y][2] == oldVotes[i].trackURI) {
                        console.log('remove it');
                        var dict = {
                            trackName: list[y][0],
                            artists: list[y][1],
                            trackURI: list[y][2],
                            coverURI: list[y][3],
                            upVoted: oldVotes[i].answer
                        };
                        list.splice(y, 1);
                        votedEle[votedEle.length] = dict;
                    }
                }
            }
        }
		console.log(list);
		if (list.length > 0) {
			console.log('adding to list');
			for (var y = 0; y < list.length; y++) {
				var dict = {
					trackName: list[y][0],
					artists: list[y][1],
					trackURI: list[y][2],
					coverURI: list[y][3],
					upVoted: list[y][4]
				};
				voteResults[voteResults.length] = dict;
			}
			console.log(voteResults);
		}
	}

	$: {
		console.log(trackSearch);
		trackSearch.trim()
		if (trackSearch) {
			searchTrack();
		} else {
			loadedResults = [];
		}
	}

	trackSearch.length === 0;

	function searchTrack() {
		let url = SEARCH;
		url += '?q=' + trackSearch;
		url += '&type=track,artist';
		//url += "&market=DK";
		url += '&limit=10'; //hardcoded limit

		let xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		//xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.setRequestHeader('Authorization', 'Authorization: Bearer ' + access_token);
		xhr.send();
		xhr.onload = handleSearchResults;
	}

	function handleSearchResults() {
		if (this.status == 200) {
			var data = JSON.parse(this.responseText);
			console.log(data['tracks']['items']);
			var results = data['tracks']['items'];
			for (var i = 0; i < results.length; i++) {
				var artist = '';
				for (var o = 0; o < results[i]['artists'].length; o++) {
					artist += results[i]['artists'][o]['name'];
					if (o + 1 < results[i]['artists'].length) {
						artist += ', ';
					}
				}
				var dict = {
					trackName: results[i]['name'],
					trackURI: results[i]['uri'],
					coverURI: results[i]['album']['images'][0]['url'],
					artists: artist
				};

				loadedResults[i] = dict;
			}
		} else if (this.status == 401) {
			console.log(this.response_text);
			console.log('access token expired, making new.');
			refreshAccessToken();
		} else {
			console.log(this.responseText);
			alert(this.responseText);
		}
	}

	function refreshAccessToken() {
		refresh_token = localStorage.getItem('refresh_token');
		let body = 'grant_type=refresh_token';
		body += '&refresh_token=' + refresh_token;
		body += '&client_id=' + client_id;
		callAuthorizationApi(body);
	}

	async function postToBackend(trackName, artists, trackURI, coverURI) {
        setAlreadyVoted(trackURI);
		var UID = localStorage.getItem('UID');
		console.log('UID:', UID);
		console.log('trackURI:', trackURI);
		console.log(coverURI);
		var url = server_url + 'requestSong/';
		let xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.setRequestHeader('Access-Control-Allow-Origin', redirect_uri);
		// //xhr.setRequestHeader('Authorization', 'Authorization: Bearer ' +access_token);
		let body = 'trackURI=' + trackURI;
		body += '&trackName=' + trackName;
		body += '&artists=' + artists;
		body += '&coverURI=' + coverURI;
		body += '&UID=' + UID;
		xhr.send(body);
	}

    function setAlreadyVoted(trackURI) {
        var oldVotes = []
		oldVotes = JSON.parse(localStorage.getItem('alreadyVoted'));
        var dict = {
            trackURI: trackURI,
            answer: true
        }
        if (oldVotes != undefined) {
            oldVotes[oldVotes.length] = dict;
            localStorage.setItem('alreadyVoted', JSON.stringify(oldVotes));	
        }
        else {
            var oldVotes = [];
            oldVotes.push(dict);
            localStorage.setItem('alreadyVoted', JSON.stringify(oldVotes));
        }
    }

	// called when the client connects
	function onConnect() {
		// Once a connection has been made, make a subscription and send a message.
		console.log('onConnect');
		client.subscribe(location.topic);
		client.subscribe(location.topicevent);
		var message = new Paho.MQTT.Message('Hello');
		message.destinationName = location.topic;
		client.send(message);

		getVoteList();
	}

	// called when the client loses its connection
	function onConnectionLost(responseObject) {
		if (responseObject.errorCode !== 0) {
			console.log('onConnectionLost:' + responseObject.errorMessage);
		}
	}

	// called when a message arrives
	function onMessageArrived(message) {
		console.log('onMessageArrived:' + message.payloadString);
		if (message.destinationName == 'bachelor22gruppe7AU/event') eventRecieved(message);
		var data = message.payloadString.split(';');
		if (data.length === 4) {
			var trackName = data[0];
			var artists = data[1];
			var coverURI = data[2];
			var trackURI = data[3];
			var oldVotes = JSON.parse(localStorage.getItem('alreadyVoted'));
            for (var i = 0; i < oldVotes.length; i++) {
                if (trackURI === oldVotes[i].trackURI){
                    var dictvoted = {
                        trackName: trackName,
                        artists: artists,
                        trackURI: trackURI,
                        coverURI: coverURI,
                        upVoted: oldVotes[i].answer
                    };
                    votedEle[votedEle.length] = dictvoted;
                    return; // add to votedele
                } 
            }
			if (coverURI != undefined && trackURI != undefined) {
				console.log('adding to list');
				var dict = {
					trackName: trackName,
					artists: artists,
					coverURI: coverURI,
					trackURI: trackURI
				};
				voteResults[voteResults.length] = dict;
				console.log(voteResults);
			}
        }
	}

	function voteOnSong(trackURI, coverURI, vote) {
		console.log('voted on: ' + trackURI);
		console.log('This was the vote ' + vote);
        var oldVotes = JSON.parse(localStorage.getItem('alreadyVoted'));
        var dict = {
            trackURI: trackURI,
            answer: vote
        }

		oldVotes[oldVotes.length] = dict;
        localStorage.setItem('alreadyVoted', JSON.stringify(oldVotes));
		// for (var i = 0; i < voteResults.length; i++) {
		// 	if (trackURI === voteResults[i].trackURI) {
		// 		//voteResults = voteResults.filter((e) => e !== voteResults[i]);
		// 		localStorage.setItem('alreadyVoted', alreadyVoted.toString());
		// 	}
		// }
		var UID = localStorage.getItem('UID');
		let url = server_url + 'voteOnSong/';
		let xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.setRequestHeader('Access-Control-Allow-Origin', redirect_uri);
		// //xhr.setRequestHeader('Authorization', 'Authorization: Bearer ' +access_token);
		let body = 'trackURI=' + trackURI;
		body += '&coverURI=' + coverURI;
		body += '&UID=' + UID;
		body += '&vote=' + vote;
		xhr.send(body);
	}

	function eventRecieved(message){
		console.log("event recieved with mqtt");
		var data = JSON.parse(message.payloadString)
		if (data[0] == 'Event Begin') {
			console.log(data)
			if (localStorage.getItem('eventItems') != ''){
				console.log('event already entered');
			} else { 
				localStorage.setItem('eventItems', JSON.stringify(data));
				window.location.href = svelte_url + 'event';
			}
		}
		else if (data[0] == 'Event End') {
			console.log(data)
			localStorage.setItem('eventItems', '');
		}

	}

	function handleRedirect() {
		let code = getCode();
		fetchAccessToken(code);
		window.history.pushState('', '', redirect_uri); // remove param from url
	}

	function getCode() {
		let code = null;
		const queryString = window.location.search;
		if (queryString.length > 0) {
			const urlParams = new URLSearchParams(queryString);
			code = urlParams.get('code');
		}
		return code;
	}

	function fetchAccessToken(code) {
		let body = 'grant_type=authorization_code';
		body += '&code=' + code;
		body += '&redirect_uri=' + encodeURI(redirect_uri);
		body += '&client_id=' + client_id;
		body += '&client_secret=' + client_secret;
		callAuthorizationApi(body);
	}

	function callAuthorizationApi(body) {
		let xhr = new XMLHttpRequest();
		xhr.open('POST', TOKEN, true);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ':' + client_secret));
		xhr.send(body);
		xhr.onload = handleAuthorizationResponse;
	}

	function handleAuthorizationResponse() {
		if (this.status == 200) {
			var data = JSON.parse(this.responseText);
			console.log(data);
			var data = JSON.parse(this.responseText);
			if (data.access_token != undefined) {
				access_token = data.access_token;
				localStorage.setItem('access_token', access_token);
			}
			if (data.refresh_token != undefined) {
				refresh_token = data.refresh_token;
				localStorage.setItem('refresh_token', refresh_token);
			}
			if (localStorage.getItem('UID') == undefined) {
				var UID = Math.floor(Math.random() * Date.now());
				localStorage.setItem('UID', String(UID));
			}
		} else {
			console.log(this.responseText);
			alert(this.responseText);
		}
	}

	function handleClick() {
		localStorage.setItem('client_id', client_id);
		localStorage.setItem('client_secret', client_secret); // In a real app you should not expose your client_secret to the user

		let url = AUTHORIZE;
		url += '?client_id=' + client_id;
		url += '&response_type=code';
		url += '&redirect_uri=' + encodeURI(redirect_uri);
		url += '&show_dialog=true';
		url +=
			'&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private';
		window.location.href = url; // Show Spotify's authorization screen
	}

	function moveSong(trackURI, vote) {
		voteResults.forEach((element) => {
			if (trackURI == element.trackURI) {
				if (vote == true) {
					element.upVoted = true;
				} else {
					element.upVoted = false;
				}
				votedEle.push(element);
				votedEle = votedEle;
				voteResults = voteResults.filter((element) => element.trackURI !== trackURI);
			}
		});
	}


</script>

{#if access_token == null}
	<h1>voteON</h1>
	<button class="authenticate" id="authenticate" on:click={handleClick}>
		Login with Your Spotify Premium
	</button>
{:else}

<div class="searchBar" id="searchBar">
		<button type="submit" id="searchIcon" class="searchIcon"/>
		<input
			class="inputSearch"
			id="inputSearch"
			type="search"
			autocomplete="off"
			placeholder="Search for song or artist"
			on:click={() => (showOverlay = true)}
			bind:value={trackSearch}
		/>
	</div>

{/if}

{#if showOverlay}
	
	<button 
    id="cancelButton" 
    on:click={() => trackSearch = ''}
    on:click={() => (showOverlay = false)}
    >Cancel</button>

	{#if trackSearch.length == 0}

	<div class="emptySearch">
		<div id="h2">Request what you would like to hear</div>
		<div id="h3">Search for songs or artists</div>
	</div>
	{/if}

		
		<div class="containerSearch">
			{#if loadedResults.length > 1}
				{#each loadedResults as { trackName, artists, trackURI, coverURI, checked }}
					<img src={coverURI} alt="cover images" width="40" height="40" />
					<div class="searchSongs">
						<p id="trackName">{trackName}</p>
						<p id="artists">{artists}</p>
					</div>
					{#if checked == true}
						<button
							class="parent"
							id="checkedRequestSongIcon"
						/>
					{:else}
						<button
							class="parent"
							id="requestSongIcon"
							on:click={() => postToBackend(trackName, artists, trackURI, coverURI)}
							on:click={() => (checked = true)}
						/> 
					{/if}
				{/each}
			{/if}
		</div>
	

{:else}
	<!-- fra voteList -->

	<div class="container">
		{#if voteResults.length > 0}
			{#each voteResults as { trackName, artists, trackURI, coverURI }}
				<img src={coverURI} alt="cover images" width="40" height="40" />
				<div class="searchSongs">
					<p id="trackName">{trackName}</p>
					<p id="artists">{artists}</p>
				</div>

				<button
					id="voteSongUpIcon"
					on:click={() => voteOnSong(trackURI, coverURI, true)}
					on:click={() => moveSong(trackURI, true)}
				/>

				<button
					id="voteSongDownIcon"
					on:click={() => voteOnSong(trackURI, coverURI, false)}
					on:click={() => moveSong(trackURI, false)}
				/>
			{/each}
		{/if}
	</div>

	<div class="seperatorLine" />

	<!-- når man stemmer skal vi flytte elementet fra listen over herned, og derfor også flytte de fyldte knapper sammen med -->

	<div class="containerVoted">
		{#if votedEle.length > 0}
			{#each votedEle as { trackName, artists, trackURI, coverURI, upVoted }}
				<img src={coverURI} alt="cover images" width="40" height="40" />
				<div class="searchSongs">
					<p id="trackName">{trackName}</p>
					<p id="artists">{artists}</p>
				</div>
				{#if upVoted == true}
					<button id="checkedVoteSongUpIcon" />
					<button id="voteSongDownIcon" />
				{:else}
					<button id="voteSongUpIcon" />
					<button id="checkedVoteSongDownIcon" />
				{/if}
			{/each}
		{/if}
	</div>
{/if}

<style>
	:global(body) {
		background-color: #272522;
		color: #f29545;
		margin: 7%;
	}

	.container {
		display: grid;
		grid-template-columns: 17% 60% 15% 15%;
		margin-top: 0.25rem;
	}

	.containerVoted {
		display: grid;
		grid-template-columns: 17% 60% 15% 15%;
		margin-top: 0.25rem;
		opacity: 0.5;
	}

	img {
		float: left;
		position: relative;
		margin-top: 25%;
	}

	#trackName {
		color: white;
		font-size: small;
		margin-top: 7%;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		margin-right: 2%;
	}

	#artists {
		color: white;
		font-size: x-small;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		margin-right: 2%;
	}

	#voteSongUpIcon {
		background: none;
		background-image: url('./static/upVote.png');
		width: 40%;
		border: 0px solid transparent;
		background-repeat: no-repeat;
		background-size: 100% auto;
		cursor: pointer;
		float: left;
		position: relative;
		margin-top: 25%;
		padding-top: 17px;
		margin-left: 7%;
	}

	#checkedVoteSongUpIcon {
		background: none;
		background-image: url('./static/upVoted.png');
		width: 40%;
		border: 0px solid transparent;
		background-repeat: no-repeat;
		background-size: 100% auto;
		cursor: pointer;
		float: left;
		position: relative;
		margin-top: 25%;
		padding-top: 17px;
		margin-left: 7%;
	}

	#voteSongDownIcon {
		background: none;
		background-image: url('./static/downVote.png');
		width: 40%;
		border: 0px solid transparent;
		background-repeat: no-repeat;
		background-size: 100% auto;
		cursor: pointer;
		float: right;
		position: relative;
		margin-top: 25%;
		padding-top: 17px;
		margin-right: 7%;
	}

	#checkedVoteSongDownIcon {
		background: none;
		background-image: url('./static/downVoted.png');
		width: 40%;
		border: 0px solid transparent;
		background-repeat: no-repeat;
		background-size: 100% auto;
		cursor: pointer;
		float: right;
		position: relative;
		margin-top: 25%;
		padding-top: 17px;
		margin-right: 7%;
	}

	.authenticate, #authenticate {
		color: white;
		padding: 15px;
		text-align: center;
		background-color: #1d1e1f;
		font-size: small;
		font-family: Verdana, Geneva, Tahoma, sans-serif;
		border-radius: 25px;
		border: none;
		cursor: pointer;
		margin: auto;
		margin-top: 15%;
		width: 100%;
	}

	h1 {
		margin: auto;
		margin-top: 50%;
		width: 100%;
		color: #f29545;
		font-size: xx-large;
		font-family: Verdana, Geneva, Tahoma, sans-serif;
		text-align: center;
	}

	.containerSearch {
		display: grid;
		grid-template-columns: 17% 70% 25%;
		margin-top: 5%;
	}

	/*css til search bar UDEN overlay*/
	.searchBar {
		color: white;
		padding: 8px;
		background-color: #1d1e1f;
		font-size: small;
		font-family: Verdana, Geneva, Tahoma, sans-serif;
		border-radius: 25px;
		border: none;
		width: 85%;
		display: inline-flex;
		caret-color: white;
		padding-left: 1%;
		outline: none;
		margin-bottom: 0.25rem;
	}

	.inputSearch{
		border: none;
		background: transparent;
		padding: 4px 4px;
		outline: none;
		width: 100%;
	}

		/*css til orange button*/
		.searchIcon {
		background: none;
		background-image: url('./static/searchIcon.png');
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



	input[type='search']::placeholder {
		color: #48403b;
		font-size: small;
		padding-left: 1%;
		width: 100%;
	}

	/*css for cancel button in search bar*/
	input[type='search']::-webkit-search-cancel-button {
		-webkit-appearance: none; /*Remove default */

		background: none;
		background-image: url('./static/cancel.png');
		width: 10px;
		border: 10px solid transparent;
		background-repeat: no-repeat;
		background-size: 100% auto;
		position: relative;
		margin-bottom: 3%;
	}

	#requestSongIcon {
		background: none;
		background-image: url('./static/requestSong.png');
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
		background-image: url('./static/alreadyRequested.png');
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

	#cancelButton {
		float: right;
		font-size: x-small;
		position: absolute;
		margin-top: 1rem;
		margin-left: 1rem;
	}

	.seperatorLine {
		border-top: 0.5px solid white;
		margin-top: 5%;
	}

	.emptySearch{
		color: white;
		text-align: center;
		margin: auto;
  		width: 90%;
	}

	#h2{
		font-size: medium;
		margin-top: 70%;
		font-weight: bold;

	}

	#h3{
		font-size: small;
	}

</style>
