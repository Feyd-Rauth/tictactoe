// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract TicTacToe {

    uint256 constant fee = 1 gwei;

    enum PlayerTypes { None, PlayerOne, PlayerTwo }
    enum Winners { None, PlayerOne, PlayerTwo, Draw }
    enum Status { NotStarted, InProgress, Finished }

    struct Player {
        address addr;
        uint256 bet;
    }

    struct Game {
        uint256 totalBet;
        uint256 required_bet;
        Player playerOne;
        Player playerTwo;
        Winners winner;
        Status status;
        PlayerTypes playerTurn;
        PlayerTypes[3][3] board;
    }


    mapping(uint256 => Game) private games;

    uint256 public numberOfGames;


    event GameCreated(uint256 gameId, address creator);

    event PlayerJoinedGame(uint256 gameId, Player player, uint8 playerNumber);

    event PlayerMadeMove(uint256 gameId, Player player, uint xCoordinate, uint yCoordinate);

    event GameOver(uint256 gameId, Winners winner);


    function newGame(uint256 _required_bet) public returns (uint256 gameId) {
        require(_required_bet > fee, "required_bet is too low");
        Game memory game;
        game.playerTurn = PlayerTypes.PlayerOne;
        game.status = Status.NotStarted;
        game.required_bet = _required_bet;

        numberOfGames++;
        games[numberOfGames] = game;

        emit GameCreated(numberOfGames, msg.sender);

        return numberOfGames;
    }

    function getGameInfo(uint256 _gameId) public view returns(Game memory game) {
        game = games[_gameId];
    }

    function joinGame(uint256 _gameId) public payable {
        bool success;
        string memory reason;

        (success, reason) = _joinGame(msg.value, _gameId);
        require(success, reason);
    }

    function _joinGame(uint256 _value, uint256 _gameId) private returns (bool success, string memory reason) {
        if (_value <= fee) {
            return (false, "Bet should be greater than a fee.");
        }

        if (_value == 0) {
            return (false, "No eth stacked.");
        }

        if (_gameId > numberOfGames) {
            return (false, "No such game exists.");
        }

        Player memory player = Player(msg.sender, _value - fee);
        Game storage game = games[_gameId];
        require(_value == game.required_bet, "invalid bet amount");

        if (game.playerOne.addr == address(0)) {
            game.playerOne = player;
            game.totalBet += _value - fee;
            emit PlayerJoinedGame(_gameId, player, uint8(PlayerTypes.PlayerOne));

            return (true, "");
        }

        if (game.playerTwo.addr == address(0)) {
            require(game.playerOne.addr != msg.sender);
            game.playerTwo = player;
            game.totalBet += _value - fee;
            emit PlayerJoinedGame(_gameId, player, uint8(PlayerTypes.PlayerTwo));
            game.status = Status.InProgress;
            return (true, "");
        }

        return (false, "All seats taken.");
    }


    function makeMove(uint256 _gameId, uint _xCoordinate, uint _yCoordinate) public  {
        bool success;
        string memory reason;
        (success, reason) = _makeMove(_gameId, _xCoordinate, _yCoordinate);
        require(success, reason);
    }
    
    function _makeMove(uint256 _gameId, uint _xCoordinate, uint _yCoordinate) public returns (bool success, string memory reason) {
        if (_gameId > numberOfGames) {
            return (false, "No such game exists.");
        }

        Game storage game = games[_gameId];
        if (game.status != Status.InProgress) {
            return (false, "Game is not in progress");
        }

        Player memory player = getCurrentPlayer(game);
        if (player.addr == address(0)) {
            return(false, "Current player not found.");
        }
        
        if (game.winner != Winners.None) {
            return (false, "The game has already ended.");
        }

        // Only the player whose turn it is may make a move.
        if (msg.sender != player.addr) {
            return (false, "It is not your turn.");
        }

        if (game.board[_xCoordinate][_yCoordinate] != PlayerTypes.None) {
            return (false, "There is already a mark at the given coordinates.");
        }

        game.board[_xCoordinate][_yCoordinate] = game.playerTurn;
        emit PlayerMadeMove(_gameId, player, _xCoordinate, _yCoordinate);

        Winners winner = calculateWinner(game.board);
        if (winner != Winners.None) {
            game.winner = winner;
            game.status = Status.Finished;

            if (winner == Winners.Draw) {
                (bool sent, bytes memory data) = payable(game.playerOne.addr).call{value: game.playerOne.bet}("");
                require(sent, "Failed to send Ether");

                (sent, data) = payable(game.playerTwo.addr).call{value: game.playerTwo.bet}("");
                require(sent, "Failed to send Ether");
    
            } else {
                Player memory playerWon = getCurrentPlayer(game);
                (bool sent, bytes memory data) = payable(playerWon.addr).call{value: game.totalBet}("");
                require(sent, "Failed to send Ether");
            }

            emit GameOver(_gameId, winner);

            return (true, "");
        }

        nextPlayer(game);

        return (true, "");
    }


    function getCurrentPlayer(Game storage _game) private view returns (Player memory player) {
        if (_game.playerTurn == PlayerTypes.PlayerOne) {
            return _game.playerOne;
        }

        if (_game.playerTurn == PlayerTypes.PlayerTwo) {
            return _game.playerTwo;
        }

        
        return Player(address(0), 0);
    }

    function calculateWinner(PlayerTypes[3][3] memory _board) private pure returns (Winners winner) {
        PlayerTypes player = winnerInRow(_board);
        if (player == PlayerTypes.PlayerOne) {
            return Winners.PlayerOne;
        }
        if (player == PlayerTypes.PlayerTwo) {
            return Winners.PlayerTwo;
        }

        player = winnerInColumn(_board);
        if (player == PlayerTypes.PlayerOne) {
            return Winners.PlayerOne;
        }
        if (player == PlayerTypes.PlayerTwo) {
            return Winners.PlayerTwo;
        }

        player = winnerInDiagonal(_board);
        if (player == PlayerTypes.PlayerOne) {
            return Winners.PlayerOne;
        }
        if (player == PlayerTypes.PlayerTwo) {
            return Winners.PlayerTwo;
        }

        if (isBoardFull(_board)) {
            return Winners.Draw;
        }

        return Winners.None;
    }

    function winnerInRow(PlayerTypes[3][3] memory _board) private pure returns (PlayerTypes winner) {
        for (uint8 x = 0; x < 3; x++) {
            if (
                _board[x][0] == _board[x][1]
                && _board[x][1]  == _board[x][2]
                && _board[x][0] != PlayerTypes.None
            ) {
                return _board[x][0];
            }
        }

        return PlayerTypes.None;
    }

    function winnerInColumn(PlayerTypes[3][3] memory _board) private pure returns (PlayerTypes winner) {
        for (uint8 y = 0; y < 3; y++) {
            if (
                _board[0][y] == _board[1][y]
                && _board[1][y] == _board[2][y]
                && _board[0][y] != PlayerTypes.None
            ) {
                return _board[0][y];
            }
        }

        return PlayerTypes.None;
    }

    function winnerInDiagonal(PlayerTypes[3][3] memory _board) private pure returns (PlayerTypes winner) {
        if (
            _board[0][0] == _board[1][1]
            && _board[1][1] == _board[2][2]
            && _board[0][0] != PlayerTypes.None
        ) {
            return _board[0][0];
        }

        if (
            _board[0][2] == _board[1][1]
            && _board[1][1] == _board[2][0]
            && _board[0][2] != PlayerTypes.None
        ) {
            return _board[0][2];
        }

        return PlayerTypes.None;
    }

    function isBoardFull(PlayerTypes[3][3] memory _board) private pure returns (bool isFull) {
        for (uint8 x = 0; x < 3; x++) {
            for (uint8 y = 0; y < 3; y++) {
                if (_board[x][y] == PlayerTypes.None) {
                    return false;
                }
            }
        }

        return true;
    }

    function nextPlayer(Game storage _game) private {
        if (_game.playerTurn == PlayerTypes.PlayerOne) {
            _game.playerTurn = PlayerTypes.PlayerTwo;
        } else {
            _game.playerTurn = PlayerTypes.PlayerOne;
        }
    }
}
