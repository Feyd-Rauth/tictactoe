const PROD = process.env.REACT_APP_PROD == 'true'
export const CONTACT_ADDRESS = PROD ? '0x9d4eC135d5917Bb4FFa40E005F64f0410F3c5940' : '0xb12378cddf6a78b04e7ef47c9c93d6c51d091079';
export const CHAIN_ID = PROD ? 1001 : 1338;


export const CONTACT_ABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "gameId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "creator",
          "type": "address"
        }
      ],
      "name": "GameCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "gameId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "enum TicTacToe.Winners",
          "name": "winner",
          "type": "uint8"
        }
      ],
      "name": "GameOver",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "gameId",
          "type": "uint256"
        },
        {
          "components": [
            {
              "internalType": "address",
              "name": "addr",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "bet",
              "type": "uint256"
            }
          ],
          "indexed": false,
          "internalType": "struct TicTacToe.Player",
          "name": "player",
          "type": "tuple"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "playerNumber",
          "type": "uint8"
        }
      ],
      "name": "PlayerJoinedGame",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "gameId",
          "type": "uint256"
        },
        {
          "components": [
            {
              "internalType": "address",
              "name": "addr",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "bet",
              "type": "uint256"
            }
          ],
          "indexed": false,
          "internalType": "struct TicTacToe.Player",
          "name": "player",
          "type": "tuple"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "xCoordinate",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "yCoordinate",
          "type": "uint256"
        }
      ],
      "name": "PlayerMadeMove",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "numberOfGames",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_required_bet",
          "type": "uint256"
        }
      ],
      "name": "newGame",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "gameId",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_gameId",
          "type": "uint256"
        }
      ],
      "name": "getGameInfo",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "totalBet",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "required_bet",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "addr",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "bet",
                  "type": "uint256"
                }
              ],
              "internalType": "struct TicTacToe.Player",
              "name": "playerOne",
              "type": "tuple"
            },
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "addr",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "bet",
                  "type": "uint256"
                }
              ],
              "internalType": "struct TicTacToe.Player",
              "name": "playerTwo",
              "type": "tuple"
            },
            {
              "internalType": "enum TicTacToe.Winners",
              "name": "winner",
              "type": "uint8"
            },
            {
              "internalType": "enum TicTacToe.Status",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "enum TicTacToe.PlayerTypes",
              "name": "playerTurn",
              "type": "uint8"
            },
            {
              "internalType": "enum TicTacToe.PlayerTypes[3][3]",
              "name": "board",
              "type": "uint8[3][3]"
            }
          ],
          "internalType": "struct TicTacToe.Game",
          "name": "game",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_gameId",
          "type": "uint256"
        }
      ],
      "name": "joinGame",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_gameId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_xCoordinate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_yCoordinate",
          "type": "uint256"
        }
      ],
      "name": "makeMove",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_gameId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_xCoordinate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_yCoordinate",
          "type": "uint256"
        }
      ],
      "name": "_makeMove",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "reason",
          "type": "string"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]