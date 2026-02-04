import { useEffect } from 'react';
import { useChatStore } from '../store/chat-store';
import * as messageRepo from '../services/storage/message-repo';
import type { NewMessage } from '../types/models';

/**
 * Hook to manage messages for a campaign
 */
export function useMessages(campaignId: string | null) {
  const { messages, setMessages, addMessage, setAIResponding, setStreamedContent, appendStreamedContent, setError, setPendingRoll, setMessagesLoaded } = useChatStore();

  // Load messages when campaign changes
  useEffect(() => {
    // Reset messagesLoaded immediately when campaign changes
    setMessagesLoaded(false, 0);

    if (!campaignId) {
      setMessages([]);
      setMessagesLoaded(true, 0);
      return;
    }

    const loadMessages = async () => {
      try {
        const campaignMessages = await messageRepo.getMessagesByCampaign(campaignId, 20);
        setMessages(campaignMessages);
        setMessagesLoaded(true, campaignMessages.length);
      } catch (err) {
        setError((err as Error).message);
        setMessagesLoaded(true, 0);
      }
    };

    loadMessages();
  }, [campaignId, setMessages, setError, setMessagesLoaded]);

  /**
   * Send a user message and get AI response (mocked for now)
   */
  const sendMessage = async (content: string) => {
    if (!campaignId) {
      throw new Error('No active campaign');
    }

    // Create and save user message
    const userMessage: NewMessage = {
      campaignId,
      role: 'user',
      content,
    };

    const savedUserMessage = await messageRepo.createMessage(userMessage);
    addMessage(savedUserMessage);

    // Simulate AI response (Phase 4 will replace this with actual Claude API)
    setAIResponding(true);
    setStreamedContent('');

    // Simulate streaming delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock AI responses - some with roll requests
    const mockResponses = [
      {
        text: "You step forward cautiously, your footsteps echoing through the ancient stone corridor. The floor suddenly shifts beneath you!\n\nRoll to maintain your balance.",
        rollRequest: "d20"
      },
      {
        text: "The creature turns to face you, its eyes glowing in the dim light. It doesn't seem immediately hostile, but it's clearly aware of your presence.\n\nWhat do you do?",
        rollRequest: null
      },
      {
        text: "You carefully examine the object. It appears to be an old medallion with strange symbols etched into its surface. As you touch it, you feel a slight warmth spreading through your fingers.\n\nRoll to see if you can decipher the symbols.",
        rollRequest: "d20"
      },
      {
        text: "The door creaks open slowly, revealing a vast chamber beyond. The air is thick with dust and the scent of ages past. You can make out shapes in the darkness.\n\nWhat do you do?",
        rollRequest: null
      },
      {
        text: "You attempt to climb the crumbling wall. The stones are loose and covered in moss.\n\nRoll to see if you can make it to the top.",
        rollRequest: "d20"
      },
    ];

    const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];

    // Simulate streaming character by character
    for (let i = 0; i < response.text.length; i++) {
      appendStreamedContent(response.text[i]);
      await new Promise(resolve => setTimeout(resolve, 20));
    }

    // Save AI message
    const aiMessage: NewMessage = {
      campaignId,
      role: 'ai',
      content: response.text,
    };

    const savedAIMessage = await messageRepo.createMessage(aiMessage);
    addMessage(savedAIMessage);

    setAIResponding(false);
    setStreamedContent('');

    // If AI requested a roll, set it as pending
    if (response.rollRequest) {
      setPendingRoll(response.rollRequest);
    }
  };

  return {
    messages,
    sendMessage,
  };
}
