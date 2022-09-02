/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/jsx-key */
import React from 'react';
import ReactDOM from 'react-dom';
import { captureInternetComputerMessageFromNetworkEvent } from '../../services/capture';
import { logstore, MessageId } from '../../services/logging';
import { useStore } from 'zustand';
import { Root } from '../../ui/root';

(window as any).global = window;

function App() {
    const { messages, log, focusedMessage, clear, focus } = useStore(logstore);
    const [capturing, setCapturing] = React.useState<boolean>(true);

    const captureRequest = React.useMemo(() => {
        return (request: chrome.devtools.network.Request) => {
            captureInternetComputerMessageFromNetworkEvent(request).then(
                (r) => r && log(r.request, r.response),
            );
        };
    }, []);

    React.useEffect(() => {
        if (capturing) {
            chrome.devtools.network.onRequestFinished.addListener(
                captureRequest,
            );
        } else {
            chrome.devtools.network.onRequestFinished.removeListener(
                captureRequest,
            );
        }
    }, [capturing]);

    return (
        <Root
            messages={messages}
            focusedMessage={focusedMessage}
            capturing={capturing}
            handleCaptureToggle={() => setCapturing(!capturing)}
            handleClear={clear}
            handleFocus={(m?: MessageId) => focus(m)}
        />
    );
}

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root'),
);
