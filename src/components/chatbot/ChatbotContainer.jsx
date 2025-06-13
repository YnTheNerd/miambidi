/**
 * Chatbot Container Component for MiamBidi
 * Main container that combines button and panel with error boundary
 */

import React from 'react';
import { useChatbot } from '../../hooks/useChatbot';
import ChatbotButton from './ChatbotButton';
import ChatbotPanel from './ChatbotPanel';
import ChatbotErrorBoundary from './ChatbotErrorBoundary';

function ChatbotContainer() {
  const {
    // State
    isOpen,
    messages,
    isTyping,
    inputValue,
    error,
    isLoading,

    // Actions
    handleInputChange,
    handleSubmit,
    toggleChatbot,
    closeChatbot,
    clearConversation,

    // Utilities
    getQuickActions,
    messagesEndRef,
    chatContainerRef
  } = useChatbot();

  const quickActions = getQuickActions();

  return (
    <ChatbotErrorBoundary>
      {/* Floating Chat Button */}
      <ChatbotButton
        isOpen={isOpen}
        onClick={toggleChatbot}
        isTyping={isTyping}
        disabled={isLoading}
      />

      {/* Chat Panel */}
      {isOpen && (
        <ChatbotPanel
          isOpen={isOpen}
          onClose={closeChatbot}
          messages={messages}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          isTyping={isTyping}
          isLoading={isLoading}
          error={error}
          messagesEndRef={messagesEndRef}
          chatContainerRef={chatContainerRef}
          quickActions={quickActions}
          onClearConversation={clearConversation}
        />
      )}
    </ChatbotErrorBoundary>
  );
}

export default ChatbotContainer;
