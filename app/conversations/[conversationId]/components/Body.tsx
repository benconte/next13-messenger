'use client';

import { useEffect, useRef, useState } from "react";
import MessageBox from "./MessageBox";
import { Message, User } from "@prisma/client";
import { pusherClient } from "@/app/libs/pusher";
import { useParams } from "next/navigation";
import axios from "axios";

interface BodyProps {
  initialMessages: (Message & { sender: User })[];
}

const Body: React.FC<BodyProps> = ({ initialMessages = [] }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState(initialMessages);
  const params = useParams();
  const { conversationId } = params;

  useEffect(() => {
    pusherClient.subscribe(conversationId)
    bottomRef?.current?.scrollIntoView();

    const messageHandler = (message: Message & { sender: User }) => {
      axios.post(`/api/conversations/${conversationId}/seen`);
      setMessages((current) => [...current, message]);
      bottomRef?.current?.scrollIntoView();
    }

    pusherClient.bind('conversation-message', messageHandler)

    return () => {
      pusherClient.unsubscribe(conversationId)
      pusherClient.unbind('conversation-message', messageHandler)
    }
  }, [conversationId]);


  return ( 
    <div className="flex-1 overflow-y-auto">
      {messages.map((message) => (
        <MessageBox key={message.id} data={message} />
      ))}
      <div className="pt-24" ref={bottomRef} />
    </div>
  );
}
 
export default Body;