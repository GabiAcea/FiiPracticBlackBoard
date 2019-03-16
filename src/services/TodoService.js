import firebaseProvider from "../config/FireConfig";

export default class TodoService {
    getTodoList = () => {
        return firebaseProvider
            .database()
            .ref("todos")
            .once("value")
            .then(snapshot => {
                const todoList = [];
                const completedItems = [];
                snapshot.forEach(child => {
                    todoList.push({ ...child.val(), id: child.key });
                    child.val().completed && completedItems.push(child.key);
                });
                return { todoList, completedItems };
            });
    };

    addTodo = payload => {
        return new Promise((resolve, reject) => {
            const newTodoKey = firebaseProvider
                .database()
                .ref("todos")
                .push(payload).key;
            resolve(newTodoKey);
        });
    };

    completeTodo = payload => {
        return firebaseProvider
            .database()
            .ref("todos")
            .child(payload.id)
            .update({ completed: payload.value });
    };

    removeTodo = id => {
        return firebaseProvider
            .database()
            .ref("todos")
            .child(id)
            .remove();
    };

    removeCompletedItems = completedItems => {
        const promises = [];
        completedItems.forEach(id => {
            promises.push(
                firebaseProvider
                    .database()
                    .ref("todos")
                    .child(id)
                    .remove()
            );
        });
        return Promise.all(promises);
    };
}
