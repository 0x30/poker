import localforage from "localforage";

const db = localforage.createInstance({
  driver: localforage.LOCALSTORAGE,
  name: "players",
  storeName: "players",
});
