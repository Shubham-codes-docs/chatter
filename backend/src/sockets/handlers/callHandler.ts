import { Server, Socket } from "socket.io";
import prisma from "../../config/db.js";

export const registerCallHandler = (io: Server, socket: Socket) => {
  const userId = socket.data.userId;

  // initiate a call
  socket.on(
    "call_initiate",
    async ({
      conversationId,
      recipientId,
      callType,
    }: {
      conversationId: string;
      recipientId: string;
      callType: "audio" | "video";
    }) => {
      // create a call entry in the database
      const call = await prisma.call.create({
        data: {
          conversationId,
          initiatorId: userId,
          type: callType,
          status: "ongoing",
          participants: {
            create: { userId },
          },
        },
        include: {
          Initiator: {
            select: {
              id: true,
              fullName: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      // notify the caller with the call id as well
      socket.emit("call_initiated", { callId: call.id });
      // emit the call invitation to the recipient
      io.to(`user:${recipientId}`).emit("call_incoming", {
        callId: call.id,
        callType,
        conversationId,
        caller: call.Initiator,
      });
    },
  );

  // accept a call
  socket.on(
    "call_accept",
    async ({ callId, callerId }: { callId: string; callerId: string }) => {
      // add recipient as participant in the call
      await prisma.callParticipant.create({
        data: {
          callId,
          userId,
        },
      });
      // notify the caller that the call has been accepted
      io.to(`user:${callerId}`).emit("call_accepted", {
        callId,
      });
    },
  );

  // reject a call
  socket.on(
    "call_reject",
    async ({ callId, callerId }: { callId: string; callerId: string }) => {
      // update call status to rejected
      await prisma.call.update({
        where: { id: callId },
        data: { status: "rejected", endedAt: new Date(), duration: 0 },
      });

      // notify the caller that the call has been rejected
      io.to(`user:${callerId}`).emit("call_rejected", {
        callId,
      });
    },
  );

  // end a call
  socket.on(
    "call_end",
    async ({
      callId,
      recipientId,
    }: {
      callId: string;
      recipientId: string;
    }) => {
      // find the call
      const callData = await prisma.call.findUnique({
        where: { id: callId },
        select: {
          startedAt: true,
        },
      });

      // calculate call duration
      const duration = callData?.startedAt
        ? Math.floor(
            (Date.now() - new Date(callData.startedAt).getTime()) / 1000,
          )
        : 0;

      // update call status to ended
      await prisma.call.update({
        where: { id: callId },
        data: { status: "ended", endedAt: new Date(), duration },
      });

      // notify the recipient that the call has ended
      io.to(`user:${recipientId}`).emit("call_ended", {
        callId,
        duration,
      });
    },
  );

  // relay sdp offer from caller to recipient
  socket.on(
    "webrtc_offer",
    ({ offer, recipientId }: { offer: unknown; recipientId: string }) => {
      console.log("webrtc_offer received, relaying to:", `user:${recipientId}`);
      io.to(`user:${recipientId}`).emit("webrtc_offer", {
        offer,
        senderId: userId,
      });
    },
  );

  // recipient ready to answer call
  socket.on("call_ready", ({ callerId }: { callerId: string }) => {
    console.log("recipient ready, notifying caller:", callerId);
    io.to(`user:${callerId}`).emit("recipient_ready");
  });

  // relay sdp answer from recipient to caller
  socket.on(
    "webrtc_answer",
    ({ answer, callerId }: { answer: unknown; callerId: string }) => {
      io.to(`user:${callerId}`).emit("webrtc_answer", {
        answer,
        recipientId: userId,
      });
    },
  );

  // relay ice candidates between participants
  socket.on(
    "webrtc_ice_candidate",
    ({
      candidate,
      recipientId,
    }: {
      candidate: unknown;
      recipientId: string;
    }) => {
      io.to(`user:${recipientId}`).emit("webrtc_ice_candidate", {
        candidate,
        senderId: userId,
      });
    },
  );
};
