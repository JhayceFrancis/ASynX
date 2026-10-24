async function run() {
    const res = await fetch('http://localhost:3000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            mal: {
                accessToken: 'some_fake_token',
                connected: false
            }
        })
    });
    console.log(res.status);
    console.log(await res.text());
}
run();
