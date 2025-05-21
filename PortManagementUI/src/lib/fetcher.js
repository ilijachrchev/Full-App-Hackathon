export const fetcher = (url) =>
  fetch(url, {
    headers: { "Content-Type": "application/json" },
  }).then((res) => {
    if (!res.ok) throw new Error("Network response was not ok");
    return res.json();
  });
