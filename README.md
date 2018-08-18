# OverdraftToken
ERC20 compatible token with overdraft capabilities

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

```
Node.js
NPM
Ganache
```

(To perform migrations or tests, we need a node running on http://localhost:8545, preferably ganache for test or dev enviroments, this is configutable on truffle.js file)

### Installing

A step by step series of examples that tell you have to get a development env running

Install all the project dependencies using npm:

```
npm install
```

Install a test node (Ganache) and run it (will likely need superadmin privileges since the node will be installes globally):

```
npm i ganache-cli
ganache-cli -d
```

Compile smart contracts:

```
truffle compile
```

Migrate smart contracts:

1. With default account
```
truffle migrate
```
2. With custom account
```
truffle migrate 0xcustomAccount
```

Run truffle tests:

```
truffle test
```

Check code coverage:

```
./node_modules/.bin/solidity-coverage
```



## Built With

* [Node](https://nodejs.org/en/) - The web framework used
* [NPM](https://www.npmjs.com/get-npm) - Dependency Management
* [Truffle](https://truffleframework.com/) - Ethereum suite
* [Ganache-cli](https://github.com/trufflesuite/ganache-cli) - Ethereum test node
* [Solium](https://github.com/duaraghav8/Solium) - Solidity linter
* [Mocha](https://mochajs.org/) - Tests suite
* [Chai](http://www.chaijs.com/) - Assertion library
* [openzeppelin-solidity](https://github.com/OpenZeppelin/openzeppelin-solidity) - Contract standards

## Authors

* **Enrique Alcázar** -  [Enrique Alcázar](https://github.com/kikoncuo)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.


