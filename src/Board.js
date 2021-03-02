import React, { Component } from 'react';
import Tile from './Tile.js';

const generateBoard = (height, width, mines) => {
    let board = [];

    // Generate empty board.
    for (let x = 0; x < height; x++) {
        let row = [];
        for (let y = 0; y < width; y++) {
            let tile = {
                x,
                y,
                count: 0,
                isRevealed: false,
                isMine: false,
                isFlagged: false,
                isExploded: false
            }

            row.push(tile);
        }
        board.push(row);
    }

    // Plant mines.
    let mineCount = 0
    while (mineCount < mines) {
        const random = Math.floor(Math.random() * 64);
        let row = Math.floor(random / width);
        let col = random % width;

        if (!board[row][col].isMine) {
            board[row][col].isMine = true;
            mineCount++;
        }
    }

    // Set neighbor values.
    board.forEach((row) => {
        row.forEach((item) => {
            let { x, y, isMine } = item;
            if (isMine) {
                return;
            }

            let neighborMineCount = 0;
            for (let i = x - 1; i <= x + 1; i++) {
                for (let j = y - 1; j <= y + 1; j++) {
                    if (i < 0 || j < 0 || i >= board.length || j >= row.length || (x === i && y === j)) {
                        continue;
                    }

                    if (board[i][j].isMine) {
                        neighborMineCount++;
                    }
                }
            }

            item.count = neighborMineCount;
        })
    })

    return board;
}

class Board extends Component {
    state = {
        board: generateBoard(this.props.settings.height, this.props.settings.width, this.props.settings.mines),
        isGameOver: false,
    }

    onTileClick = (e, dataitem) => {
        if (dataitem.isRevealed || dataitem.isFlagged || this.state.isGameOver) {
            return;
        }

        const newBoard = this.state.board.map((row) => row.slice());
        if (dataitem.isMine) {
            this.revealMines(newBoard, { x: dataitem.x, y: dataitem.y });
            this.setState({ board: newBoard, isGameOver: true }, () => {
                this.loseGame();
            });
            return;
        }

        newBoard[dataitem.x][dataitem.y].isRevealed = true;
        if (dataitem.count === 0) {
            this.revealEmptyTiles(newBoard, { x: dataitem.x, y: dataitem.y });
        }

        if (this.getHidden() === this.props.settings.mines) {
            this.revealMines(newBoard);
            this.setState({ isGameOver: true }, () => {
                this.winGame();
            });
            return;
        }

        this.setState({ board: newBoard });
    }

    onTileRightClick = (e, dataitem) => {
        e.preventDefault();
        const newBoard = this.state.board.map((row) => row.map((item) => {
            if (item.x === dataitem.x && item.y === dataitem.y) {
                item.isFlagged = !item.isFlagged;
            }
            return item;
        }));
        this.setState({ board: newBoard });
    }

    onTileMouseDown = (e, dataitem) => {
        if (e.button !== 1 || !dataitem.isRevealed || this.state.isGameOver) {
            return;
        }

        const newBoard = this.state.board.map((row) => row.slice());
        let steppedOnMine = this.revealKnownTiles(newBoard, { x: dataitem.x, y: dataitem.y });

        if (steppedOnMine) {
            this.revealMines(newBoard);
            this.setState({ board: newBoard, isGameOver: true }, () => {
                this.loseGame();
            });
            return;
        }
        if (this.getHidden() === this.props.settings.mines) {
            this.revealMines(newBoard);
            this.setState({ isGameOver: true }, () => {
                this.winGame();
            });
            return;
        }

        this.setState({ board: newBoard });
    }

    getHidden = () => {
        let hidden = 0;
        this.state.board.forEach((row) => row.forEach((item) => {
            if (!item.isRevealed) {
                hidden++;
            }
        }));
        return hidden;
    }

    winGame = () => {
        alert('You win the game!');
    }

    loseGame = () => {
        alert('You lost the game.');
    }

    revealKnownTiles = (board, { x, y }) => {
        let flagged = 0;
        for (let i = x - 1; i <= x + 1; i++) {
            for (let j = y - 1; j <= y + 1; j++) {
                if (i < 0 || j < 0 || i >= board.length || j >= board[0].length || (x === i && y === j)) {
                    continue;
                }

                if (board[i][j].isFlagged) {
                    flagged++;
                }
            }
        }

        if (flagged < board[x][y].count) {
            return;
        }

        let steppedOnMine = false;
        for (let i = x - 1; i <= x + 1; i++) {
            for (let j = y - 1; j <= y + 1; j++) {
                if (i < 0 || j < 0 || i >= board.length || j >= board[0].length || (x === i && y === j)) {
                    continue;
                }

                if (board[i][j].isFlagged) {
                    continue;
                }

                board[i][j].isRevealed = true;
                if (board[i][j].isMine) {
                    board[i][j].isExploded = true;
                    steppedOnMine = true;
                }

                if (!steppedOnMine && board[i][j].count === 0) {
                    this.revealEmptyTiles(board, { x: i, y: j });
                }
            }
        }

        return steppedOnMine;
    }

    revealEmptyTiles = (board, { x, y }) => {
        for (let i = x - 1; i <= x + 1; i++) {
            for (let j = y - 1; j <= y + 1; j++) {
                if (i < 0 || j < 0 || i >= board.length || j >= board[0].length || (x === i && y === j)) {
                    continue;
                }

                if (!board[i][j].isRevealed && !board[i][j].isMine) {
                    board[i][j].isRevealed = true;

                    if (board[i][j].count === 0) {
                        this.revealEmptyTiles(board, { x: i, y: j });
                    }
                }
            }
        }
    }

    revealMines = (board, exploded) => {
        const newBoard = this.state.board.map((row) => row.map((item) => {
            if (item.isMine) {
                item.isRevealed = true;
            }
            if (exploded && item.x === exploded.x && item.y === exploded.y) {
                item.isExploded = true;
            }
            return item;
        }))
        this.setState({ board: newBoard });
    }

    renderBoardTiles = (data) => {
        return data.map((datarow) => datarow.map((dataitem) => {
            return (
                <Tile key={dataitem.x * datarow.length + dataitem.y} {...dataitem}
                    onClick={(e) => this.onTileClick(e, dataitem)}
                    onContextMenu={(e) => this.onTileRightClick(e, dataitem)}
                    onMouseDown={(e) => this.onTileMouseDown(e, dataitem)}></Tile>
            )
        }));
    }

    resetBoard = () => {
        this.setState({
            board: generateBoard(this.props.settings.height, this.props.settings.width, this.props.settings.mines),
            isGameOver: false,
        });
    }

    render() {
        return (
            <div className="board-container">
                <div className="header">
                    <div>Minesweeper!</div>
                    <div><button onClick={this.resetBoard}>New Game</button></div>
                </div>
                <div className="board">
                    {this.renderBoardTiles(this.state.board)}
                </div>
            </div>
        )
    }
}

export default Board;