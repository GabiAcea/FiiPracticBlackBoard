import React from "react";

export default function ReusableListItem(props) {
    const {
        todo,
        completed,
        handleDeleteButtonClick,
        handleCheckboxChange
    } = props;
    return (
        <div className="todo__container-list-item">
            <div className="content">
                <input
                    className="checkbox"
                    type="checkbox"
                    checked={completed}
                    onChange={handleCheckboxChange}
                />
                <div
                    className={`content-text ${
                        completed ? "cut-content-text" : ""
                    }`}
                >
                    <p>{todo}</p>
                </div>
            </div>
            <div className="action">
                <div
                    className="ui red basic button"
                    onClick={handleDeleteButtonClick}
                >
                    Delete
                </div>
            </div>
        </div>
    );
}
