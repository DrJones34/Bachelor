<script>
	import { onMount } from 'svelte';
	var redirect_uri = 'http://127.0.0.1:3000/';

	//var server_url = "http://badonk.myddns.me:32800/" // use this for deployed server
	var server_url = 'http://127.0.0.1:5000/'; // use this for local server
	//var svelte_url = "http://badonk.myddns.me:32700/" // use this for deployed server
	var svelte_url = 'http://127.0.0.1:3000/'

	var items = [];
	var currentTime = Math.floor(new Date().getTime()/1000.0)
	var countdown = 0;

	onMount(async () => { 
		items = JSON.parse(localStorage.getItem('eventItems'))
		console.log(items)

		countdownEvent()
	});
	
	async function countdownEvent() {
		currentTime = Math.floor(new Date().getTime()/1000.0)
		countdown = items[1] - currentTime;
		console.log(currentTime)
		if (countdown <= 2) {
			// redirect to votelist
			console.log('countdown ended, redirect now')
			window.location.href = svelte_url;
		} else {
			await new Promise(r => setTimeout(r, countdown*1000));
			countdownEvent()
		}
	}

	function ballotVote(pos) {
		var UID = localStorage.getItem('UID');
		let url = server_url + 'eventvote/';
		let xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);

		let body = 'pos=' + pos;
		body += '&UID=' + UID;
		xhr.send(body);

		window.location.href = svelte_url;
	}

</script>

<!-- send event vote til server_url + 'eventvote/' med svar 0, 1, 2 eller 3 sammen med UID
	efter request er sendt afsted kald window.location.href = svelte_url + 'voteList'; -->

<h1 class="blink" >
Take your vote
</h1>

{#if items.length > 0}
<body>

		<button
			on:click={() => ballotVote(0)}>
			<img src={items[2][0][3]} alt="searchIcon" width="80rem" height="80rem"/>
			<p id="trackName">{items[2][0][0]}</p>
			<p id="artists">{items[2][0][1]}</p>
		</button>

		<button
			on:click={() => ballotVote(1)}>
			<img src={items[2][1][3]} alt="searchIcon" width="80rem" height="80rem"/>
			<p id="trackName">{items[2][1][0]}</p>
			<p id="artists">{items[2][1][1]}</p>
		</button>

		<button
			on:click={() => ballotVote(2)}>
			<img src={items[2][2][3]} alt="searchIcon" width="80rem" height="80rem"/>
			<p id="trackName">{items[2][2][0]}</p>
			<p id="artists">{items[2][2][1]}</p>
		</button>

		<button
			on:click={() => ballotVote(3)}>
			<img src={items[2][3][3]} alt="searchIcon" width="80rem" height="80rem"/>
			<p id="trackName">{items[2][3][0]}</p>
			<p id="artists">{items[2][3][1]}</p>
		</button>

	</body>
{/if}

<style>
	:global(body) {
		background-color: #272522;
		color: #f29545;
		height: 100%; 
		overflow: hidden;
	}

	img {
		position: relative;
		left: 25%;
		margin-bottom: 10%;
	}

	h1 {
		text-align: center;
		margin-bottom: 5rem;
		color: white;
		font-size: x-large;
    	font-family: Verdana, Geneva, Tahoma, sans-serif;
		margin-top: 10%;
	}

	#trackName{
        color: white;
        font-size: small;
        margin-top: 7%;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        margin-right: 2%;
		text-align: center;
    }

    #artists{
        color: white;
        font-size: x-small;
		text-align: center;
		margin-bottom: 5%;
    }


	button {
		float: left;
		width: 40%;
		margin-left: 3%;
		margin-right: 3%;
		margin-bottom: 6%;
		background-color: #1D1E1F;
		position: relative;
		left: 3%;
		padding-bottom: 3rem;
		padding-top: 3rem;
		border: 5rem;
	}

	.blink {
        animation: blink-animation 1s steps(5, start) infinite;
        -webkit-animation: blink-animation 1s steps(5, start) infinite;
      }
      @keyframes blink-animation {
        to {
          visibility: hidden;
        }
      }
      @-webkit-keyframes blink-animation {
        to {
          visibility: hidden;
        }
      }
</style>
