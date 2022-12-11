import { useEffect, useState } from 'react';
import React from 'react'
import {
    Card,
    CardBody,
    Box,
    Stack,
  } from '@chakra-ui/react'

const status = (s) => {
    if (s == 0) {
        return "Not started"
    } else if (s == 1) {
        return "In progress"
    } else if (s == 2) {
        return "Finished"
    }
}

const mark = (playerNumber) => {
    if (playerNumber == 1) {
        return 'X'
    } else if (playerNumber == 2) {
        return 'O'
    } else {
        return ''
    }
}

const turn = (playerTurn, playerNumber) => {
    if (playerTurn != 1 && playerTurn != 2) {
        return [false, "Invalid player turn"]
    } else if (playerNumber == playerTurn) {
        return [true, "It's your turn"]
    } else {
        return [false, "Waiting for opponent's move"]
    }
}

const GameInfo = ({game, gameId, playerNumber, account}) => {
    const opponent = game.playerOne.addr.toLowerCase() === account.toLowerCase() ? game.playerTwo.addr : game.playerOne.addr;
    const [myTurn, setMyTrun] = useState(false);
    const [turnText, setTurnText] = useState("");

    useEffect(() => {
        const [myTurn, turnText] = turn(game.playerTurn, playerNumber)
        setMyTrun(myTurn)
        setTurnText(turnText)
    }, [game])
    
    return (
        <Box>
            <Stack spacing={5} justify="center" p={10}>
                <Card size='sm'>
                    <CardBody>Game: #{gameId}</CardBody>
                </Card>
                <Card size='sm'>
                    <CardBody>Opponent: {opponent}</CardBody>
                </Card>
                <Card size='sm'>
                    <CardBody>Bet: {game.required_bet / 10**18}</CardBody>
                </Card>
                <Card size='sm'>
                    <CardBody>Status: {status(game.status)}</CardBody>
                </Card>
                <Card size='sm'>
                    <CardBody>You are player #{playerNumber}, your mark is {mark(playerNumber)}</CardBody>
                </Card>
                <Card size='sm' background={myTurn ? 'yellow.100' : ''}>
                    <CardBody >{turnText}</CardBody>
                </Card>
            </Stack>
        </Box>

    );
}

export default GameInfo