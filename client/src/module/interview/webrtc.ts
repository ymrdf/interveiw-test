import { Interview } from './store';
import { ACCESS_TOKEN } from '../../constants';

// const mediaConstraints = {
//   audio: true, // We want an audio track
//   video: true, // And we want a video track
// };

// const desc = new RTCSessionDescription(sdp);

// pc.setRemoteDescription(desc)
//   .then(() => navigator.mediaDevices.getUserMedia(mediaConstraints))
//   .then((stream) => {
//     previewElement.srcObject = stream;

//     stream.getTracks().forEach((track) => pc.addTrack(track, stream));
//   });

class WebrtcManager {
  interview: Interview;

  onlineStatus: string = 'Offline';

  get socket() {
    return this.interview.socket;
  }

  setOnlineStatus(v: string) {
    this.onlineStatus = v;
  }

  connection: RTCPeerConnection | null = null;

  send(data: any = {}) {
    const token = localStorage.getItem(ACCESS_TOKEN);
    this.socket?.send(
      JSON.stringify({
        event: 'webrtc',
        data: {
          token: token,
          scope: this.interview.currentInterview?.id,
          data,
        },
      }),
    );
  }

  callRemote = async () => {
    await this.initRtc();
    this.connection!.createOffer().then((offer: RTCSessionDescriptionInit) => {
      this.connection!.setLocalDescription(offer);
      console.log('rtc send');
      this.send({ offer: offer });
    });
  };

  /**
   * 初始化RTCPeerConnection实例connection;
   */
  async initRtc(isOncall: boolean = false) {
    if (!this.connection) {
      this.connection = new RTCPeerConnection({
        iceServers: [
          {
            urls: 'turn:43.142.118.202:3479?transport=tcp', // turn服务
            username: 'ymrdf', // 服务的用户名
            credential: 'aa123456', // 服务的密码
          },
        ],
      });

      // 监听icecandidate事件把icecandidate传给面试对端
      this.connection.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
          if (event.candidate.candidate === '') {
            return;
          }
          this.send({
            iceCandidate: event.candidate,
          });
        }
      });

      const remoteVideo: HTMLVideoElement =
        document.querySelector('#remoteVideo')!;

      // 监听connection的track事件，设置传入的视频流显示到页面上的video标签上。
      this.connection.addEventListener('track', async (event) => {
        console.log('listen track');
        const [remoteStream] = event.streams;
        if (remoteVideo) {
          remoteVideo.srcObject = remoteStream;
        }
      });
    }

    if (!isOncall) {
      await navigator.mediaDevices
        .getUserMedia({
          video: true,
        })
        .then((localStream: MediaStream) => {
          // alert('media');
          console.log('add tracks');
          // localStream.getTracks().forEach((track) => {
          //   this.connection?.addTrack(track, localStream);
          // });

          // @ts-ignore
          window.localStream = localStream;

          // @ts-ignore
          this.connection?.addStream(window.localStream);

          const localVideo: HTMLVideoElement =
            document.querySelector('#localVideo')!;
          if (localVideo) {
            localVideo.srcObject = localStream;
          }
        })
        .catch((error) => {
          // alert('Error accessing media devices.');
          console.error('Error accessing media devices.', error);
        });
    }

    // this.connection.addEventListener('connectionstatechange', (event) => {
    //   console.log('connectionstatechange', this.connection?.connectionState);

    //   if (this.connection?.connectionState === 'connected') {
    //     navigator.mediaDevices
    //       .getUserMedia({
    //         video: {
    //           deviceId: {
    //             exact:
    //               'db765945ff40a136e50f590ab0d2c7545a57cedce7b73ef429e2f26d6355ae79',
    //           },
    //         },
    //       })
    //       .then((localStream: MediaStream) => {
    //         // alert('media');
    //         console.log('add tracks');
    //         // localStream.getTracks().forEach((track) => {
    //         //   this.connection?.addTrack(track, localStream);
    //         // });

    //         // @ts-ignore
    //         this.connection?.addStream(localStream);

    //         const localVideo: HTMLVideoElement =
    //           document.querySelector('#localVideo')!;
    //         if (localVideo) {
    //           localVideo.srcObject = localStream;
    //         }
    //       })
    //       .catch((error) => {
    //         // alert('Error accessing media devices.');
    //         console.error('Error accessing media devices.', error);
    //       });
    //   }
    // });
    // this.connection.createDataChannel('ourcodeworld-rocks');
  }

  init() {
    // 监听websocket传来的webrtc 相关信息，
    this.socket!.addEventListener('message', async (ev: MessageEvent) => {
      const message = JSON.parse(ev.data);

      const { event, data } = message;

      if (event !== 'webrtc') return;

      // 如里是answer信息则保存对端answer
      if (data.answer) {
        const remoteDesc = new RTCSessionDescription(data.answer);
        await this.connection!.setRemoteDescription(remoteDesc);
      }
      // 如里是offer信息则保存对端offer则返回给对端answer，
      if (data.offer) {
        if (!this.connection) {
          await this.initRtc(true);
        }
        this.connection!.setRemoteDescription(
          new RTCSessionDescription(data.offer),
        );
        const answer = await this.connection!.createAnswer();
        await this.connection!.setLocalDescription(answer);
        this.send({ answer: answer });
      }

      // 如果是icecandidate信息则设置对端icecandidate。
      if (data.iceCandidate) {
        try {
          console.log('add iceCANDIDATE', data.iceCandidate);
          await this.connection!.addIceCandidate(data.iceCandidate);
        } catch (e) {
          console.error('Error adding received ice candidate', e);
        }
      }
    });
  }

  constructor(interview: Interview) {
    this.interview = interview;
  }
}

export default WebrtcManager;
