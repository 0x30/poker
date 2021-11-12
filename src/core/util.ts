export const randomStr = () => Math.random().toString(32).slice(2);
export const currentTime = () => new Date().getTime().toString(32);
export const generateId = () => `${currentTime()}${randomStr()}`;
