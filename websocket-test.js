const wsUri = "wss://streaming.usw2.pure.cloud/channels/streaming-2-ugupru5g23l16256et5urvni7a";
const websocket = new WebSocket(wsUri);
let pingInterval;

websocket.addEventListener("message", (e) => {
    const message = extractTranscripts(e.data);
    if (message) {
        console.log(message);
    }
});

websocket.addEventListener("open", () => {
    console.log("CONNECTED");
    pingInterval = setInterval(() => {
        websocket.send({ "message": "ping" });
    }, 1000);
});

websocket.addEventListener("error", (e) => {
    console.log(`ERROR`);
});

websocket.addEventListener("close", () => {
    console.log("DISCONNECTED");
    clearInterval(pingInterval);
});

function extractTranscripts(data) {
    let message;
    try {
        message = JSON.parse(data)?.eventBody;
    } catch {
        message = data?.eventBody;
    }
    return message?.transcripts?.flatMap(t => `${t.channel}: ${t.alternatives[0].transcript}`)
        .join('\n');
}