// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract TicTacToe {

    uint256 constant fee = 1 gwei;

    // PlayerTypes enumerates all possible players
    enum PlayerTypes { None, PlayerOne, PlayerTwo }
    // Winners enumerates all possible winner
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

    // games stores all the games.
    // Games that are already over as well as games that are still running.
    // It is possible to iterate over all games, as the keys of the mapping
    // are known to be the integers from `1` to `numberOfGames`.
    mapping(uint256 => Game) private games;
    // numberOfGames stores the total number of games in this contract.
    uint256 public numberOfGames;

    // GameCreated signals that `creator` created a new game with this `gameId`.
    event GameCreated(uint256 gameId, address creator);
    // PlayerJoinedGame signals that `player` joined the game with the id `gameId`.
    // That player has the player number `playerNumber` in that game.
    event PlayerJoinedGame(uint256 gameId, Player player, uint8 playerNumber);
    // PlayerMadeMove signals that `player` filled in the board of the game with
    // the id `gameId`. She did so at the coordinates `xCoordinate`, `yCoordinate`.
    event PlayerMadeMove(uint256 gameId, Player player, uint xCoordinate, uint yCoordinate);
    // GameOver signals that the game with the id `gameId` is over.
    // The winner is indicated by `winner`. No more moves are allowed in this game.
    event GameOver(uint256 gameId, Winners winner);

    // newGame creates a new game and returns the new game's `gameId`.
    // The `gameId` is required in subsequent calls to identify the game.
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

    // joinGame lets the sender of the message join the game with the id `gameId`.
    // It returns `success = true` when joining the game was possible and
    // `false` otherwise.
    // `reason` indicates why a game was joined or not joined.
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

        // Assign the new player to slot 1 if it is still available.
        if (game.playerOne.addr == address(0)) {
            game.playerOne = player;
            game.totalBet += _value - fee;
            emit PlayerJoinedGame(_gameId, player, uint8(PlayerTypes.PlayerOne));

            return (true, "");
        }

        // If slot 1 is taken, assign the new player to slot 2 if it is still available.
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

    // makeMove inserts a player on the game board.
    // The player is identified as the sender of the message.
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
        // Any winner other than `None` means that no more moves are allowed.
        if (game.winner != Winners.None) {
            return (false, "The game has already ended.");
        }

        // Only the player whose turn it is may make a move.
        if (msg.sender != player.addr) {
            return (false, "It is not your turn.");
        }

        // PlayerTypes can only make moves in cells on the board that have not been played before.
        if (game.board[_xCoordinate][_yCoordinate] != PlayerTypes.None) {
            return (false, "There is already a mark at the given coordinates.");
        }

        // Now the move is recorded and the according event emitted.
        game.board[_xCoordinate][_yCoordinate] = game.playerTurn;
        emit PlayerMadeMove(_gameId, player, _xCoordinate, _yCoordinate);

        // Check if there is a winner now that we have a new move.
        Winners winner = calculateWinner(game.board);
        if (winner != Winners.None) {
            // If there is a winner (can be a `Draw`) it must be recorded in the game and
            // the corresponding event must be emitted.
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

        // A move was made and there is no winner yet.
        // The next player should make her move.
        nextPlayer(game);

        return (true, "");
    }

    // getCurrentPlayer returns the address of the player that should make the next move.
    // Returns the `0x0` address if it is no player's turn.
    function getCurrentPlayer(Game storage _game) private view returns (Player memory player) {
        if (_game.playerTurn == PlayerTypes.PlayerOne) {
            return _game.playerOne;
        }

        if (_game.playerTurn == PlayerTypes.PlayerTwo) {
            return _game.playerTwo;
        }

        
        return Player(address(0), 0);
    }

    // calculateWinner returns the winner on the given board.
    // The returned winner can be `None` in which case there is no winner and no draw.
    function calculateWinner(PlayerTypes[3][3] memory _board) private pure returns (Winners winner) {
        // First we check if there is a victory in a row.
        // If so, convert `PlayerTypes` to `Winners`
        // Subsequently we do the same for columns and diagonals.
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

        // If there is no winner and no more space on the board,
        // then it is a draw.
        if (isBoardFull(_board)) {
            return Winners.Draw;
        }

        return Winners.None;
    }

    // winnerInRow returns the player that wins in any row.
    // To win in a row, all cells in the row must belong to the same player
    // and that player must not be the `None` player.
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

    // winnerInColumn returns the player that wins in any column.
    // To win in a column, all cells in the column must belong to the same player
    // and that player must not be the `None` player.
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

    // winnerInDiagoral returns the player that wins in any diagonal.
    // To win in a diagonal, all cells in the diaggonal must belong to the same player
    // and that player must not be the `None` player.
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

    // isBoardFull returns true if all cells of the board belong to a player other
    // than `None`.
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

    // nextPlayer changes whose turn it is for the given `_game`.
    function nextPlayer(Game storage _game) private {
        if (_game.playerTurn == PlayerTypes.PlayerOne) {
            _game.playerTurn = PlayerTypes.PlayerTwo;
        } else {
            _game.playerTurn = PlayerTypes.PlayerOne;
        }
    }
}
