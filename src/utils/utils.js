export const handleEnterKeypres = (event, action) => {
    const ENTER_KEY = 13;
    switch (event.keyCode) {
        case ENTER_KEY:
            action();
            break;
        default:
            break;
    }
};
