import { useEffect, useState } from 'react';
import Web3 from 'web3';
import { Input, Flex, InputGroup, InputRightElement, Button, ButtonGroup, Stack, InputLeftAddon, Text, Box } from '@chakra-ui/react'
import React from 'react'
import Board from './Board';

const Game = ({game, gameId, onMove, onUpdate}) => {
    const board = game.board.flat()
    return (
        <>
            <Board squares={board} onClick={onMove}></Board>
        </>
    );
}

export default Game