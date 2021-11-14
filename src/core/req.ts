import { Game, Player } from "./model";

const url = (player: Player, path: string) => {
  return `http://${player.host}${path}`;
};

export const ready = async (game: Game) => {
  const req = (p: Player) => {
    return new Promise<boolean>((resolve) => {
      fetch(url(p, "/ready"))
        .then((res) => res.json())
        .then((res) => resolve(res.data))
        .catch(() => resolve(false));
    });
  };
  const res = await Promise.all(game.players.map(req));
  return res.every((v) => v);
};

export const deal = (game: Game) => {
  return Promise.all(
    game.players.map((p) =>
      fetch(url(p, "/deal"), {
        body: JSON.stringify({
          gameId: game.id,
          cards: p.cards,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
    )
  );
};

export const getCards = () => {};
