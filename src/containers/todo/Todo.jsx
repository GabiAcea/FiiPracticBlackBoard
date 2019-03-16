import React, { Component } from "react";

//reusabe components
import ReusableField from "./reusableField";
import ReusableListItem from "./reusableListItem";

//services
import TodoService from "../../services/TodoService";
import { handleEnterKeypres } from "../../utils/utils";

export default class Todo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            todoInputValue: "",
            todoList: [],
            completedItems: []
        };

        this.todoService = new TodoService();
    }

    componentDidMount = () => {
        document.addEventListener("keydown", this.handleEnterKeypresWrapper);
        this.getTodoList();
    };

    componentWillUnmount = () => {
        document.removeEventListener("keydown", this.handleEnterKeypresWrapper);
    };

    getTodoList = () => {
        this.todoService.getTodoList().then(rsp => {
            this.setState({
                todoList: rsp.todoList,
                completedItems: rsp.completedItems
            });
        });
    };

    handleEnterKeypresWrapper = event => {
        handleEnterKeypres(event, this.handleAddButtonClick);
    };

    handleInputChange = ev => {
        this.setState({
            todoInputValue: ev.target.value
        });
    };

    handleAddButtonClick = () => {
        const { todoInputValue, todoList } = this.state;
        const payload = {
            todo: todoInputValue,
            completed: false
        };
        if (todoInputValue !== "") {
            this.todoService.addTodo(payload).then(id => {
                payload["id"] = id;
                this.setState({
                    todoList: [...todoList, payload]
                });
            });
        }
    };

    handleCheckboxChange = (index, id, value) => {
        const { todoList, completedItems } = this.state;
        todoList[index].completed = value;
        value
            ? completedItems.push(id)
            : completedItems.splice(completedItems.indexOf(id), 1);
        this.todoService.completeTodo({ id, value }).then(() => {
            this.setState({
                todoList: todoList,
                completedItems: completedItems
            });
        });
    };

    handleDeleteButtonClick = (index, id) => {
        const { todoList, completedItems } = this.state;
        todoList.splice(index, 1);
        completedItems.indexOf(id) !== -1 &&
            completedItems.splice(completedItems.indexOf(id), 1);
        this.todoService.removeTodo(id).then(() => {
            this.setState({
                todoList: todoList,
                completedItems: completedItems
            });
        });
    };

    handleDeleteAllButtonClick = () => {
        const { todoList, completedItems } = this.state;
        const newTodoList = todoList.filter(
            item => completedItems.indexOf(item.id) === -1
        );
        this.todoService.removeCompletedItems(completedItems).then(() => {
            this.setState({
                todoList: newTodoList,
                completedItems: []
            });
        });
    };

    getItemsLeft = () => {
        const { todoList, completedItems } = this.state;
        return todoList.length - completedItems.length;
    };

    render() {
        const { todoInputValue, todoList, completedItems } = this.state;
        return (
            <div className="todo__container">
                <div className="todo__container-title">todos</div>
                <div className="todo__container-form">
                    <ReusableField
                        inputName="todo"
                        inputType="text"
                        inputValue={todoInputValue}
                        handleInputChange={this.handleInputChange}
                        handleAddButtonClick={this.handleAddButtonClick}
                    />
                </div>
                <div className="todo__container-list">
                    {todoList.map((item, index) => (
                        <ReusableListItem
                            key={index}
                            todo={item.todo}
                            completed={item.completed}
                            handleCheckboxChange={() => {
                                this.handleCheckboxChange(
                                    index,
                                    item.id,
                                    !item.completed
                                );
                            }}
                            handleDeleteButtonClick={() =>
                                this.handleDeleteButtonClick(index, item.id)
                            }
                        />
                    ))}
                </div>
                {todoList.length > 0 ? (
                    <div className="todo__container-footer">
                        <div className="items-left">
                            {this.getItemsLeft() === 1
                                ? this.getItemsLeft()
                                      .toString()
                                      .concat(" item left")
                                : this.getItemsLeft()
                                      .toString()
                                      .concat(" items left")}
                        </div>
                        {completedItems.length > 0 ? (
                            <div
                                className="action"
                                onClick={this.handleDeleteAllButtonClick}
                            >
                                <span className="action-clear">
                                    Clear completed
                                </span>
                            </div>
                        ) : (
                            ""
                        )}
                    </div>
                ) : (
                    ""
                )}
            </div>
        );
    }
}
