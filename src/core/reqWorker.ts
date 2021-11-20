const ctx: Worker = self as any;

ctx.addEventListener("message", (event) => {
  const { url, params, id } = event.data;
  fetch(url, params)
    .then((res) => res.json())
    .then((res) => {
      ctx.postMessage({
        id,
        res,
      });
    });
});
