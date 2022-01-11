import React from 'react'
import ReactDOM from 'react-dom'
import capture, { LogEvent } from './capture';

(window as any).global = window;

function App () {
    // TODO: Would be great to start capture earlier.
    const [log, setLog] = React.useState<LogEvent[]>([]);
    chrome.devtools.network.onRequestFinished.addListener((request) => {
        capture(
            request,
            [],
            (event) => {
                setLog(prev => [...prev, event]);
            }
        );
    });
    return <>
        <h1>Dfinity Decoder</h1>
        {log.map((event, i) => <div key={`event${i}`}>
            <pre>Reactive!</pre>
            <pre>{event.request.value.content.request_type.toUpperCase()} {(event.url.match(/\/canister\/(.+)\//) as string[])[1]} {event.request.value.content.method_name}</pre>
            <pre>{JSON.stringify(event.response, undefined, 2)}</pre>
        </div>)}
    </>
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);