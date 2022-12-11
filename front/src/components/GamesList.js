import { useEffect, useState } from 'react';
import React from 'react'
import {
    Card,
    CardBody,
    Box,
    Stack,
  } from '@chakra-ui/react'
  import Web3 from 'web3';
import { toEther } from '../utils';



const GamesList = ({contract}) => {
    const [games, setGames] = useState([]);
    
    useEffect(() => {
        const fetchGames = async () => {
            let lastGame = await contract.methods.numberOfGames().call()
            let _games = []
            for (let i = 1; i <= lastGame; i++) {
                const game = await contract.methods.getGameInfo(i).call();
                if (game.status == 0) {
                    _games.push([i, game])
                }
            }
            setGames(_games)
        }
        if (contract != undefined) {
            fetchGames()
        }
    }, [contract])
    return (
        <Box>
            <Stack spacing={5} justify="center">
                {
                    games.map(([gameId, game]) => { 
                        return <Card key={gameId} size='sm'>
                            <CardBody>Game: #{gameId}. Bet: {toEther(game.required_bet)} ETH</CardBody>
                        </Card>
                    })
                }
            </Stack>
        </Box>

    );
}

export default GamesList