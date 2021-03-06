# Getting started with an XYO Archivist

An archivist in the XYO network serves as the data-layer component between the bridge and the diviner.
It accepts and aggregates data from bridges and makes that data available to Diviners via a GraphQL API. In essence it is the scribe node of the XYO network.

As long as an archivist follows the protocols of the XYO network specified in the [yellow paper](https://docs.xyo.network/XYO-Yellow-Paper.pdf)
they may implement the component however they wish. This application supports using MySQL as the persistence engine that
backs the archivist repository, LevelDb to persist origin-chain data specific to this node, and TCP as the transport
layer for doing bound-witness interactions between the Archivist and other Bridges.

# Prerequisites

- You must have [docker](https://www.docker.com/get-started) installled and running

# Getting Started

##### Clone the repository 

```bash
git clone https://github.com/XYOracleNetwork/sdk-core-nodejs.git -b develop
```

##### Go into the directory

```sh
cd sdk-core-nodejs
```

##### Install dependencies

```sh
yarn install
```

##### Build the SDK

```sh
yarn build
```

**Note** This will take a moment, so be patient, it will take around 30 seconds.

##### Bootstrap or manage your MySQL service

```sh
  yarn manage:db
```

```sh
Existing XyoDb container found. Status: Running
? What would you like to do with the existing XyoDb service? …
❯ Restart the existing database 
  Kill it and start a new one // SELECT THIS OPTION
  No action
```

**Note that you should go ahead and kill any processes, and allow the wizard to select your db credentials**

- These credentials are a simple username and password

```sh
? Enter a username for the sql database › admin
? Enter a password for the sql database › password
```

Once you confirm these values your MySQL service will start up

```sh
Starting MySQL service with credentials:
	Username: admin
	password: password

Successfully started a MySQL service @ 127.0.0.1:3306

```
**NOTE** No need to paste the command into your shell for the developmeny environment

##### Start the Archivist

```sh
yarn start:archivist
```

**NOTE** Keep this terminal window open and leave it alone after starting the archivist

##### Pull in some mock data
**You'll have to do this in another terminal window or tab and keep this open as well**

```sh
yarn mock-data
```

##### Run your package with a simple node command

```sh
node packages/app
```

You will now be directed to configure your archivist, please follow these steps **exactly** as written (if for some reason you are running any instances on ports (except the database port 3306) you can change the last digit by one):

`No config found, would you like to create one now? (Y/n) · true`

`What would you like to name your XYO Node? · <your name>`

`Where would you like to store your data? · /Users/<yourUserDirectory>/<yourProjectDirectory>/sdk-core-nodejs/packages/app/node-data`

`What is your public ip address? · 0.0.0.0`

`What port would you like to use for your peer to peer protocol? · 11500` *Note* Make sure that this port is different than the diviner port, or any other port that might be in use. 

`Do you want to add bootstrap nodes? (Y/n) · true`

`These addresses were found on the `peers.xyo.network` DNS record.You can select and deselect each address by pressing spacebar · Hit enter and do not select items`

This will default to false, press `y` or `t`
`Do you want to add any more individual bootstrap nodes? (y/N) · true`

Go ahead and enter the example address provided
`What is the address value of the bootstrap node? Should look something like /ip4/127.0.0.1/tcp/11500 · /ip4/127.0.0.1/tcp/11501` This port number should match the one that you entered for your peer to peer protocol answer **(for convention a good range is 11501 - 11510) one of the nodes needs to run 11500**

This will default to false, now we hit enter
`Do you want to add any more individual bootstrap nodes? (y/N) · false`

Ensure that your archivist can do bound witness
`Do you want your node to act as a server for doing bound-witnesses? (Y/n) · true`

Select your port for peer to peer protocol 
`What port would you like to use for your peer to peer protocol? · 11000` This is your bound witness port, it should be different from the diviner port

Ensure that the component features for support are Archivist
`Which component features do you want your Xyo Node to support? · archivist` If you select diviner, you won't get the correct options to set up an archivist

Set up the database with the values from your bootstrapping earlier
`Enter the `host` value for your MySQL database · 127.0.0.1`
`Enter the `user` value for your MySQL database · admin`
`Enter the `password` value for your MySQL database · password`
`Enter the `database` value for your MySQL database · Xyo`
**This is the one port value that you should not have to change!**
`Enter the `port` value for your MySQL database · 3306`

Set up your archivist with a GraphQL Server
`Do you want your node to have a GraphQL server (Y/n) · true`
`What port should your GraphQL server run on? · 11001`

Press enter to set up all of the GraphQL endpoints
`Which GraphQL api endpoints would you like to support? (use space-bar to toggle selection. Press enter once finished) · about, blockByHash, blockList, intersections, blocksByPublicKey, entities`

Start the node
`Do you want to start the node after configuration is complete? (Y/n) · true`

You will see some GraphQL data and dialing nodes, notice the Xyo objects and nodes at work! 

You should then see that you have discovered a peer, which will feed your archivist heuristics! Exciting stuff! 

To check out a bound witness, try this command (you are running the database on Docker)

```sh
docker exec -i XyoDb mysql -uadmin -ppassword  <<< "SELECT meta FROM Xyo.OriginBlocks WHERE id=6"
```

When you enter that command, you are going to get some output with a rawSignature, heuristics, rssi, and latitude and longitude!

To make it prettier, let's go into the browser and enter our raw JSON in a string like this:

console.log(JSON.parse(`your raw json (make sure you use backtics!)`))

## Congratulations! You have now started an XYO Archivist!