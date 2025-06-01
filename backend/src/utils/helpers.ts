import "dotenv/config";

const SERVER_LINK = process.env.SERVER_LINK;
let timeoutId: NodeJS.Timeout;

export const pingBot = () => {
  if (!SERVER_LINK) return;

  const attemptPing = () => {
    fetch(SERVER_LINK)
      .then((res) => res.text())
      .then((text) => console.log(`Ping successful: ${text}`))
      .catch((err) => {
        clearTimeout(timeoutId);
        console.log(`Ping failed, retrying: ${err}`);
        timeoutId = setTimeout(attemptPing, 5000);
      });
  };

  attemptPing();
};
