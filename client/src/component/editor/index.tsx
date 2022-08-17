import React, { useEffect } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

// import Chat from '../chat';

import './App.scss';

interface IProps {
  interviewId: string;
}

function App({ interviewId }: IProps) {
  useEffect(() => {
    if (!interviewId) {
      return;
    }
    console.log('========>', window.MonacoEnvironment);
    const doc = new Y.Doc();
    const type = doc.getText('monaco');
    const wsProvider = new WebsocketProvider(
      'ws://192.168.1.4:3000/',
      `room?${interviewId}`,
      doc,
    );
    wsProvider.on('status', (event: any) => {
      console.log(event.status); // logs "connected" or "disconnected"
    });

    const editor = monaco.editor.create(
      document.getElementById('monaco-container')!,
      {
        value: '',
        language: 'javascript',
        theme: 'vs-dark',
      },
    );

    const monacoBinding = new MonacoBinding(
      type,
      editor.getModel()!,
      new Set([editor]),
      wsProvider.awareness,
    );

    return () => {
      editor.dispose();
      monacoBinding.destroy();
    };
  }, [interviewId]);

  const playVideoFromCamera = async () => {
    try {
      const constraints = { video: true, audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const videoElement = document.querySelector(
        'video#localVideo',
      ) as HTMLVideoElement;
      videoElement.srcObject = stream;
    } catch (error) {
      console.error('Error opening video camera.', error);
    }
  };

  const stopVideo = async () => {
    try {
      const videoElement = document.querySelector(
        'video#localVideo',
      ) as HTMLVideoElement;
      videoElement.srcObject = null;
    } catch (error) {
      console.error('Error opening video camera.', error);
    }
  };

  return (
    <div className="App">
      <button onClick={playVideoFromCamera}>click</button>
      <button onClick={stopVideo}>stop</button>

      <div
        style={{ height: '500px', width: '900px' }}
        id="monaco-container"
      ></div>
      <div>
        <video id="localVideo" autoPlay playsInline controls={false} />
        {/* <Chat /> */}
      </div>
    </div>
  );
}

export default App;
