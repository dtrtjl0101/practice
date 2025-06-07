import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  styled,
  Avatar,
  Stack,
  IconButton,
  Typography,
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ENV } from "../env";
import API_CLIENT from "../api/api";
import { Client } from "@stomp/stompjs";
import { GroupMessage } from "../types/groupMessage";
import { GroupChatResponse } from "../api/api.gen";

export default function GroupChat(props: { groupId: number }) {
  const { groupId } = props;

  const [message, setMessage] = useState("");
  const [newChats, setNewChats] = useState<GroupMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const clientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const {
    data: chatsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingChats,
  } = useInfiniteQuery({
    queryKey: ["groupChats", groupId],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await API_CLIENT.groupChatController.getChats(groupId, {
        page: pageParam,
        size: 25,
        sort: ["createdAt,desc"],
      });
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.currentPage ?? 0;
      const totalPages = lastPage.totalPages ?? 0;
      return currentPage + 1 < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
  });

  const groupedChats = useMemo(() => {
    return [
      ...(newChats as GroupChatResponse[]),
      ...(chatsData?.pages.flatMap((page) => page.content || []) || []),
    ]
      .reduce((acc: GroupChatResponse[], msg) => {
        const existingIndex = acc.findIndex(
          (existingMsg) => existingMsg.chatId === msg.chatId
        );

        if (existingIndex !== -1) {
          return acc;
        } else {
          return [...acc, msg];
        }
      }, [])
      .reverse()
      .reduce((acc: GroupChatResponse[][], msg) => {
        const lastGroup = acc[acc.length - 1];
        if (!lastGroup) {
          return [[msg]];
        }

        const lastMessage = lastGroup[lastGroup.length - 1];
        const isSameAuthor = lastMessage.authorId === msg.authorId;
        const isNearbyTime =
          lastMessage.createdAt &&
          msg.createdAt &&
          Math.abs(
            new Date(lastMessage.createdAt).getTime() -
              new Date(msg.createdAt).getTime()
          ) <
            5 * 60 * 1000; // 5 minutes
        if (isSameAuthor && isNearbyTime) {
          lastGroup.push(msg);
        } else {
          acc.push([msg]);
        }
        return acc;
      }, [] as GroupChatResponse[][]);
  }, [chatsData, newChats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
  };

  const isScrolledToBottom = () => {
    if (!messagesContainerRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 10; // 10px threshold
  };
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const atBottom = isScrolledToBottom();
    setAutoScroll(atBottom);
  }, []);

  const sendMessage = async (content: string) => {
    try {
      const response = await API_CLIENT.groupChatController.createChat(
        groupId,
        { content }
      );
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data;
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  };

  const { data: _client } = useQuery({
    queryKey: ["groupChatClient", groupId],
    queryFn: async () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
      const client = new Client({
        brokerURL: `${ENV.CHAEKIT_API_ENDPOINT}/ws`,
        onConnect: () => {
          client.subscribe(`/topic/group/${groupId}`, (message) => {
            const groupMessage = JSON.parse(message.body) as GroupMessage;
            setNewChats((prev) => {
              if (prev.some((msg) => msg.chatId === groupMessage.chatId)) {
                return prev;
              }
              return [groupMessage, ...prev];
            });
          });
        },
      });
      client.activate();
      clientRef.current = client;
      return client;
    },
  });

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || isSending) {
      return;
    }
    setIsSending(true);
    try {
      await sendMessage(message);
      setMessage(""); // Clear message after successful send
      scrollToBottom();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  }, [message, isSending, sendMessage]);

  useEffect(() => {
    if (!autoScroll) {
      return;
    }
    scrollToBottom();
  }, [groupedChats, autoScroll]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <MessagesContainer ref={messagesContainerRef}>
        {isLoadingChats && (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        )}

        {hasNextPage && (
          <Box display="flex" justifyContent="center" p={1} mb={2}>
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              size="small"
            >
              {isFetchingNextPage ? (
                <CircularProgress />
              ) : (
                "이전 메시지 더 보기"
              )}
            </Button>
          </Box>
        )}

        {groupedChats.map((chatGroup) => {
          const firstMessage = chatGroup[0];
          if (!firstMessage) return null;
          const timeStr = firstMessage.createdAt
            ? new Date(firstMessage.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          return (
            <Stack
              key={`chat-group-${firstMessage.chatId}`}
              spacing={1}
              mb={2}
              direction={"row"}
            >
              <Avatar src={firstMessage.authorProfileImage} />
              <Stack spacing={0.5} sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle2">
                    {firstMessage.authorName}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ flexShrink: 0 }}
                  >
                    {timeStr}
                  </Typography>
                </Stack>
                {chatGroup.map((chat) => (
                  <Typography
                    key={chat.chatId}
                    sx={{ wordBreak: "break-word" }}
                  >
                    {chat.content}
                  </Typography>
                ))}
              </Stack>
            </Stack>
          );
        })}

        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputArea>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="모임 대화방에 메시지 보내기"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <IconButton
          onClick={handleSendMessage}
          disabled={!message.trim() || isSending}
        >
          {isSending ? <CircularProgress size={16} /> : <SendIcon />}
        </IconButton>
      </InputArea>
    </Box>
  );
}

const MessagesContainer = styled(Box)({
  flex: 1,
  overflowY: "auto",
  padding: 16,
  borderRadius: 0,
  marginBottom: 0,
  maxHeight: "400px",
});

const InputArea = styled(Box)({
  display: "flex",
  gap: 1,
  alignItems: "center",
});
