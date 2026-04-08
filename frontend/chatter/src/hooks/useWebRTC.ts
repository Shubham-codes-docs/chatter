import { useEffect, useRef } from 'react';
import SimplePeer from 'simple-peer/simplepeer.min.js';
import type { CallType } from '../types/api.types';
import { useCallStore } from '../store/callStore';
import { getSocket } from '../socket/socketClient';
import { SOCKET_EVENTS } from '../socket/events';
import type { SignalData } from 'simple-peer';

interface UseWebRTCParams {
  isInitiator: boolean;
  recipientId: string;
  callType: CallType;
}

export const useWebRTC = ({
  isInitiator,
  recipientId,
  callType,
}: UseWebRTCParams) => {
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const isInitiatorRef = useRef(isInitiator);
  const recipientIdRef = useRef(recipientId);
  const callTypeRef = useRef(callType);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const startCall = async () => {
      const { setLocalStream, setRemoteStream, resetCall } =
        useCallStore.getState();
      try {
        // get access to camera and microphone of user
        const stream = await navigator.mediaDevices.getUserMedia({
          video: callTypeRef.current === 'video',
          audio: true,
        });
        setLocalStream(stream);

        // create a new peer
        const peer = new SimplePeer({
          initiator: isInitiatorRef.current,
          trickle: true,
          stream,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
              { urls: 'stun:stun3.l.google.com:19302' },
            ],
          },
        });

        peerRef.current = peer;

        // when peer generates a signal, send it to the other user via socket
        peer.on('signal', (data: SignalData) => {
          if (data.type === 'offer') {
            socket.emit(SOCKET_EVENTS.WEBRTC_OFFER, {
              offer: data,
              recipientId: recipientIdRef.current,
            });
          } else if (data.type === 'answer') {
            socket.emit(SOCKET_EVENTS.WEBRTC_ANSWER, {
              answer: data,
              callerId: recipientIdRef.current,
            });
          } else {
            socket.emit(SOCKET_EVENTS.ICE_CANDIDATE, {
              candidate: data,
              recipientId: recipientIdRef.current,
            });
          }
        });

        // when peer receives a stream from the other user, set it as remote stream
        peer.on('stream', (stream: MediaStream) => {
          setRemoteStream(stream);
        });

        // handle peer connection errors
        peer.on('error', (err: Error) => {
          console.error('WebRTC error:', err);
          document.title = `PEER ERROR: ${err.message}`;
          resetCall();
        });

        // handle peer connection close
        peer.on('close', () => {
          resetCall();
        });

        // listen for incoming signals from the other user via socket
        socket.on(
          SOCKET_EVENTS.WEBRTC_OFFER,
          ({ offer }: { offer: SimplePeer.SignalData }) => {
            peer.signal(offer);
          }
        );

        socket.on(
          SOCKET_EVENTS.WEBRTC_ANSWER,
          ({ answer }: { answer: SimplePeer.SignalData }) => {
            peer.signal(answer);
          }
        );

        socket.on(
          SOCKET_EVENTS.ICE_CANDIDATE,
          ({ candidate }: { candidate: SimplePeer.SignalData }) => {
            peer.signal(candidate);
          }
        );

        // if recipient tell the server all the listeners are setup and we are ready to connect
        if (!isInitiatorRef.current) {
          socket.emit(SOCKET_EVENTS.CALL_READY, {
            callerId: recipientIdRef.current,
          });
        }

        // if is initiator, wait for the recipient to be ready to accept the offer
        if (isInitiatorRef.current) {
          // destroy the old peer and recreate when the recipient is ready
          socket.once(SOCKET_EVENTS.RECIPIENT_READY, () => {
            // destroy current peer and create new one to trigger fresh offer
            socket.off(SOCKET_EVENTS.WEBRTC_ANSWER);
            socket.off(SOCKET_EVENTS.WEBRTC_OFFER);
            socket.off(SOCKET_EVENTS.ICE_CANDIDATE);
            peer.removeAllListeners();
            peer.destroy();
            const freshPeer = new SimplePeer({
              initiator: true,
              trickle: true,
              stream,
              config: {
                iceServers: [
                  { urls: 'stun:stun.l.google.com:19302' },
                  { urls: 'stun:stun1.l.google.com:19302' },
                  { urls: 'stun:stun2.l.google.com:19302' },
                  { urls: 'stun:stun3.l.google.com:19302' },
                ],
              },
            });

            peerRef.current = freshPeer;

            freshPeer.on('signal', (data: SignalData) => {
              if (data.type === 'offer') {
                socket.emit(SOCKET_EVENTS.WEBRTC_OFFER, {
                  offer: data,
                  recipientId: recipientIdRef.current,
                });
              } else if (data.type === 'answer') {
                socket.emit(SOCKET_EVENTS.WEBRTC_ANSWER, {
                  answer: data,
                  callerId: recipientIdRef.current,
                });
              } else {
                socket.emit(SOCKET_EVENTS.ICE_CANDIDATE, {
                  candidate: data,
                  recipientId: recipientIdRef.current,
                });
              }
            });

            freshPeer.on('stream', (remoteStream: MediaStream) => {
              setRemoteStream(remoteStream);
            });

            freshPeer.on('error', (err: Error) => {
              console.error('peer error:', err);
              document.title = `FRESHPEER ERROR: ${err.message}`;
              useCallStore.getState().resetCall();
            });

            freshPeer.on('close', () => {
              useCallStore.getState().resetCall();
            });

            socket.on(SOCKET_EVENTS.WEBRTC_ANSWER, ({ answer }) => {
              freshPeer.signal(answer);
            });

            socket.on(SOCKET_EVENTS.ICE_CANDIDATE, ({ candidate }) => {
              freshPeer.signal(candidate);
            });
          });
        }
      } catch (err) {
        console.error('Error accessing media devices:', err);
        document.title = `ERROR: ${err}`;
        resetCall();
      }
    };

    startCall();

    // cleanup function to close peer connection and stop media tracks when component unmounts
    return () => {
      peerRef.current?.destroy();
      peerRef.current = null;
      socket.off(SOCKET_EVENTS.WEBRTC_OFFER);
      socket.off(SOCKET_EVENTS.WEBRTC_ANSWER);
      socket.off(SOCKET_EVENTS.ICE_CANDIDATE);
    };
  }, []);

  return { peerRef };
};
