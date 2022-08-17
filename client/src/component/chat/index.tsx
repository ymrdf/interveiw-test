import React, { useEffect, useRef } from 'react';
import { Button } from 'antd';
//192.168.1.6

const Chat = () => {
  const wsRef = useRef<WebSocket>();
  const connectionRef = useRef<RTCPeerConnection>();

  useEffect(() => {
    wsRef.current = new WebSocket('ws://192.168.1.4:3000/websocket/event');

    wsRef.current.onopen = (ev: Event) => {
      const array = new Float32Array(5);
      for (var i = 0; i < array.length; ++i) {
        array[i] = i / 2;
      }

      wsRef.current?.send(array);
    };

    wsRef.current.addEventListener('message', async (ev: MessageEvent) => {
      const message = JSON.parse(ev.data);
      if (message.answer) {
        const remoteDesc = new RTCSessionDescription(message.answer);
        await connectionRef.current!.setRemoteDescription(remoteDesc);
      }
      if (message.offer) {
        connectionRef.current!.setRemoteDescription(
          new RTCSessionDescription(message.offer),
        );
        const answer = await connectionRef.current!.createAnswer();
        await connectionRef.current!.setLocalDescription(answer);
        wsRef.current!.send(JSON.stringify({ answer: answer }));
      }

      if (message.iceCandidate) {
        try {
          await connectionRef.current!.addIceCandidate(message.iceCandidate);
        } catch (e) {
          console.error('Error adding received ice candidate', e);
        }
      }
    });

    return () => wsRef.current?.close();
  }, []);

  useEffect(() => {
    connectionRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }, // 谷歌的公共服务
        {
          urls: 'turn:***',
          username: 'ymrdf', // 用户名
          credential: 'aa123456', // 密码
        },
      ],
    });
    connectionRef.current.addEventListener('icecandidate', (event) => {
      if (event.candidate) {
        wsRef.current!.send(
          JSON.stringify({ 'new-ice-candidate': event.candidate }),
        );
      }
    });
    // Listen for connectionstatechange on the local RTCPeerConnection
    connectionRef.current.addEventListener('connectionstatechange', (event) => {
      console.log(event);
    });
  }, []);

  const callRemote = () => {
    connectionRef
      .current!.createOffer()
      .then((offer: RTCSessionDescriptionInit) => {
        connectionRef.current!.setLocalDescription(offer);
        wsRef.current!.send(JSON.stringify({ offer: offer }));
      });
  };

  return (
    <div>
      <Button onClick={callRemote}>connect</Button>
      <video id="localVideo" autoPlay playsInline controls={false} />
    </div>
  );
};

export default Chat;
