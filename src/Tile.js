import React, { Component } from 'react';

class Tile extends Component {
    getValue() {
        if (this.props.isFlagged) {
            return "🚩";
        }

        if (this.props.isMine) {
            return "💣";
        }
        return this.props.count > 0 ? this.props.count : "";
    }
    render() {
        let className = "tile" + (this.props.isRevealed ? "" : " hidden") + (this.props.isMine ? " mine" : "")
            + (this.props.isExploded ? " exploded" : "");
        return (
            <div className={className} onClick={this.props.onClick} onContextMenu={this.props.onContextMenu}>
                {this.props.isRevealed || this.props.isFlagged ? this.getValue() : ""}
            </div>
        )
    }

}

export default Tile;