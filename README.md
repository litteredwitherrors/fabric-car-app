# Hyperledger Fabric Demo Car App
This demo is a WIP. This project is based on the Write your First Hyperledger App Documentation found [here]('http://hyperledger-fabric.readthedocs.io/en/latest/write_first_app.html'). We use Express.js to turn the Fabric Node SDK into a RESTful API that is used in conjunction with the included React.js client.

## Install dependencies

```

$ npm install

```

## Start Fabric

```

$ ./startFabric.sh

```

## Build React Client

```

$ npm run build

```

# Start Express

```

$ npm start

```

## API

### Show All Cars
---
Returns JSON data of all cars from the database

- **URL**

  /cars

- **Method**

  `GET`

### Show a Single Car
---
Returns JSON data of a single car from the database

- **URL**
  /cars/:car

- **URL Params**

 **Required**:

  `car=[string]`

### Create a Car
---

- **URL**

  /cars

- **Method**

  `POST`



# More to be added

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>
