import React from "react";

export default function ReusableField(props) {
    const {
        inputName,
        inputType,
        inputValue,
        handleInputChange,
        handleAddButtonClick
    } = props;
    return (
        <div className="ui huge action input">
            <input
                name={inputName}
                type={inputType}
                value={inputValue}
                onChange={handleInputChange}
            />
            <button
                className="ui orange right labeled icon button"
                onClick={handleAddButtonClick}
            >
                <i className="plus icon" />
                Add
            </button>
        </div>
    );
}
