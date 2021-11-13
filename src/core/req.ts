const ready = (hostname: string): Promise<boolean> => {
  return fetch(`http://${hostname}/ready`)
    .then((res) => res.json())
    .then((res) => res.data);
};
