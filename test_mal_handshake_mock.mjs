import express from 'express';
const app = express();

app.get('/v2/users/@me', (req, res) => {
    console.log("Mock MAL received request!");
    res.json({ name: "MockUser" });
});

app.listen(8080, () => {
    console.log("Mock MAL server running on 8080");
});
