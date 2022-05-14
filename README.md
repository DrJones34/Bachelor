# this flask server has the purpose of handling endpoints used by clients to:
    # GET information from the database and spotify player.
    # POST changes to the database.
    # the  flask server also has the responsibility of manipulating the final playing spotify account.
    # Algorithm that selects top votes and places them on a seperate list to be played at some point. 
    # selecting from the above mentioned list x-number of songs for the special event. 

# MQTT -> svelte & flask -> MQTT communication not implemented yet

# This Svelte server has the responsibility of handling the clients:
    # logging them in with their spotify account
    # sending requests to the flask server
    # receiving updated information from the database through mqtt


Once you've installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev
