
import './App.css';
import { useEffect, useState } from 'react';
import Web3 from 'web3';
import { Input, Flex, InputGroup, InputRightElement, Button, ButtonGroup, Stack, InputLeftAddon, Text, Box, useToast } from '@chakra-ui/react'
import { CHAIN_ID, CONTACT_ABI, CONTACT_ADDRESS } from './config';
import Game from './components/Game';
import GameInfo from './components/GameInfo';

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

function App() {
  const [forceUpdated, setForceUpdate] = useState(0); // integer state
  const forceUpdate = () => setForceUpdate(value => value + 1)

  const [account, setAccount] = useState();
  const [gameId, setGameId] = useState();
  const [game, setGame] = useState();
  const [inGame, setInGame] = useState(false);
  const [gameFreePlaces, setGameFreePlaces] = useState(0);
  const [playerNumber, setPlayerNumber] = useState(0);

  const [continueGameId, setContinueGameId] = useState("")
  const [gameBet, setGameBet] = useState("10")
  
  const [contract, setContract] = useState(); 
  const [loadingTx, setLoadingTx] = useState(false);
  const toast = useToast()

  useEffect(() => {
    if(window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      })
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      })
    }

    async function load() {
      const web3 = new Web3(Web3.givenProvider);

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: web3.utils.toHex(CHAIN_ID) }]
        });
      } catch (err) {
          // This error code indicates that the chain has not been added to MetaMask
        if (err.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName: 'Klaytn',
                chainId: web3.utils.toHex(CHAIN_ID),
                nativeCurrency: { name: 'KLAY', decimals: 18, symbol: 'KLAY' },
                rpcUrls: ['https://api.baobab.klaytn.net:8651/']
              }
            ]
          });
        }
      }
      const accounts = await web3.eth.requestAccounts();
      setAccount(accounts[0]);
      web3.eth.defaultAccount = account;
      const contract = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS, {
        from: account
      });
      setContract(contract);
      console.log(contract.methods)
    }

    load();
    const interval = setInterval(() => {forceUpdate()}, 1000);
    return () => {
      clearInterval(interval);
    };
   }, []);
  

  async function updateGame() {
    console.log('update game with id: ', gameId)
    if (gameId !== undefined) {
      const newGame = await contract.methods.getGameInfo(gameId).call();
      console.log("new game:", newGame);
      setGame(newGame)
    }
  }
  useEffect(() => {
    updateGame()
  }, [gameId, contract, forceUpdated]);


  useEffect(() => {
    if (game !== undefined) {
      if (account === game.playerOne.addr || account == game.playerTwo.addr) {
        setInGame(true)
      }
      let free = 0;
      if (game.playerOne.addr === ZERO_ADDRESS) {
        free += 1
      }
      if (game.playerTwo.addr === ZERO_ADDRESS) {
        free += 1
      }
      setGameFreePlaces(free)

      if (game.playerOne.addr == account) {
        setPlayerNumber(1)
      } else if (game.playerTwo.addr == account) {
        setPlayerNumber(2)
      } else {
        setPlayerNumber(0)
      }
    }
  }, [game])

  const handleBoardMove = async (move) => {
    let x = Math.floor(move / 3)
    let y = move % 3 
    
    setLoadingTx(true)
    let method = contract.methods.makeMove(gameId, x, y);
    method.estimateGas({gas: 5000000, from: account})
      .then(() => {
        method.send({from: account})
        .on('receipt', function(receipt) {
          let over = receipt.events.GameOver;
          if (over) {
            let winner = over.returnValues.winner
            if (winner == playerNumber) {
              toast({
                title: 'You win!',
                position: 'top',
                status: 'success',
                isClosable: true,
                duration: 20000,
                description: ':)'
                
              })
            // draw
            } else if (winner == 3) {
              toast({
                title: 'Draw!',
                position: 'top',
                status: 'warning',
                isClosable: true,
                duration: 20000,
                description: ':/'
              })
            } else {
              toast({
                title: 'You lose',
                position: 'top',
                status: 'warning',
                isClosable: true,
                duration: 20000,
                description: ':('
              })
            }
          }
        })
      })
      .catch((error) => {
        toast({
            title: 'Invalid move',
            position: 'top',
            status: 'error',
            description: error.message,
            isClosable: true,
        })
      })
      .finally(() => setLoadingTx(false));
  }

  const handleNewGame = async (e) => {
    e.preventDefault()
    console.log('start new game')
    setLoadingTx(true)
    let method = contract.methods.newGame(Web3.utils.toWei(gameBet, 'ether'));
    method.send({from: account}).on('receipt', function(receipt) {
      
      const gameId = receipt.events.GameCreated.returnValues.gameId
      setGameId(gameId)
    }).finally(() => setLoadingTx(false));
  }
  

  const handleContinueGame = async (e) => {
    if (continueGameId > 0) {
      let lastGame = await contract.methods.numberOfGames().call();
      if (lastGame >= continueGameId) {
        setGameId(continueGameId)
      } else {
        toast({
          title: 'Game not found',
          position: 'top',
          status: 'error',
          isClosable: true,
        })
      }
    }
  }

  const handleUpdateGame = async (e) => {
    e.preventDefault()
    console.log("UPDATE GAME", e)
  }
  
  const handleJoinGame = async (e) => {
    e.preventDefault()
    console.log('join game ', gameId)
    setLoadingTx(true)
    contract.methods.joinGame(gameId).send({
      from: account,
      value: game.required_bet
    }).on('receipt', function(receipt) {
      updateGame()
    }).finally(() => setLoadingTx(false))
  }

  const handleGoHome = async (e) => {
    setGame(undefined)
    setGameId(undefined)
    setGameFreePlaces(0)
    setInGame(false)
    setContinueGameId("")
  }

  let show = ""
  if (gameId === undefined) {
    show = "start"
  } else if (!inGame) {
    if (gameFreePlaces > 0) {
      show = "join"
    } else if (game !== undefined) {
      show = "finished"
    } else {
      show = "error"
    }
  } else {
    show = "board"
  }

  return (
    <div>
      <Flex justify="center" direction="column" align="center">
        <Box h={100}></Box>
        {show === "start" &&
          <Stack direction="column" spacing={5}>
            <Text align="center">Start tic-tac-toe game:</Text>
            <InputGroup size='md' w={500}>
              <InputLeftAddon>
                ETH
                </InputLeftAddon>
              <Input
                value={gameBet}
                onChange={(e) => {setGameBet(e.target.value)}}
              > 
              </Input>
              <Button w="8rem" ml={2} colorScheme='twitter' onClick={handleNewGame} isLoading={loadingTx}>New game</Button>
              
            </InputGroup>
            
            <Text align="center">Or join existing game:</Text>
            <InputGroup size='md' w={500}>
              <InputLeftAddon>
              Game# 
              </InputLeftAddon>
              <Input
                onChange={(e) => {setContinueGameId(e.target.value)}}
                value={continueGameId}
                placeholder='number'
              />
              
              <Button colorScheme='twitter' ml={2} w="8rem" onClick={handleContinueGame} isLoading={loadingTx}>Join</Button>
              
            </InputGroup>
          </Stack>
        }
        
        {show === "join" &&
          <Stack align="center">
            <Text>Game #{gameId} is created, but you are not in game.</Text>
            <Text>Game has {gameFreePlaces} free places, you can join</Text>
            <Button w="10rem" colorScheme="twitter" onClick={handleJoinGame} isLoading={loadingTx} >Join</Button>
            <Button onClick={handleGoHome}>Back</Button>
          </Stack>
        }
        {show === "finished" && 
          <Stack>
            <Text>Game #{gameId} has finished or has no free places</Text>
            <Button onClick={handleGoHome}>Back</Button>
          </Stack>
        }

        {show === "board" && 
          <Stack align="center">
            <GameInfo game={game} gameId={gameId} account={account} playerNumber={playerNumber}></GameInfo>
            <Game game={game} gameId={gameId} onMove={handleBoardMove} onUpdate={handleUpdateGame}></Game>
            <Button onClick={handleGoHome}>Back</Button>
          </Stack>
        }
      </Flex>
    </div>
  );
}

export default App;
