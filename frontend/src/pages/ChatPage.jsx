import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import socketService from '../services/socket';

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="chat-toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`chat-toast chat-toast-${t.type}`}>
          {t.type === 'success' ? '✓' : '✕'} {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="chat-modal-overlay" onClick={onCancel}>
      <div className="chat-modal" onClick={e => e.stopPropagation()}>
        <p className="chat-modal-message">{message}</p>
        <div className="chat-modal-actions">
          <button className="chat-btn-back" onClick={onCancel}>Cancel</button>
          <button className="chat-btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Request Modal (designer only) ────────────────────────────────────
function PaymentRequestModal({ conversationId, designerName, onClose, onSent }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSend = () => {
    const num = Number(amount);
    if (!num || num <= 0) { setError('Please enter a valid amount greater than 0'); return; }
    if (num < 0) { setError('Amount cannot be negative'); return; }
    setSending(true);
    setError('');
    socketService.sendPaymentRequest(conversationId, num, description.trim() || 'Custom order payment');
    setTimeout(() => {
      setSending(false);
      onSent();
      onClose();
    }, 500);
  };

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={e => e.stopPropagation()}>
        <div className="chat-modal-header">
          <h3>📋 Generate Quote</h3>
          <button className="dd-modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ fontSize: 13, color: '#888', margin: '0 0 16px' }}>
          The customer will see a Pay Now button in the chat
        </p>

        <div className="chat-payment-form">
          <label className="chat-payment-label">Amount (₦) *</label>
          <input
            type="number"
            className="chat-payment-input"
            placeholder="e.g. 25000"
            value={amount}
            onChange={e => { setAmount(e.target.value); setError(''); }}
            min="1"
          />

          <label className="chat-payment-label" style={{ marginTop: 12 }}>
            Description (optional)
          </label>
          <input
            type="text"
            className="chat-payment-input"
            placeholder="e.g. Custom agbada - deposit"
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={200}
          />

          {amount && Number(amount) > 0 && (
            <div className="chat-payment-preview">
              Customer will pay: <strong>₦{Number(amount).toLocaleString()}</strong>
              <span style={{ fontSize: 11, color: '#888', display: 'block', marginTop: 2 }}>
                + platform service fee at checkout
              </span>
            </div>
          )}

          {error && <p style={{ color: '#e53e3e', fontSize: 13, marginTop: 8 }}>{error}</p>}
        </div>

        <div className="chat-modal-actions" style={{ marginTop: 20 }}>
          <button className="chat-btn-back" onClick={onClose}>Cancel</button>
          <button
            className="chat-btn-primary"
            onClick={handleSend}
            disabled={sending || !amount}
          >
            {sending ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Request Message Card ─────────────────────────────────────────────
function PaymentRequestCard({ msg, currentUserId, otherParticipant, conversationId, navigate }) {
  const isOwn = msg.sender === currentUserId || msg.sender?._id === currentUserId;
  const pr = msg.paymentRequest;
  const isPaid = pr?.status === 'paid';
  const isCancelled = pr?.status === 'cancelled';

  const handlePayNow = () => {
    if (!pr?.quoteId) return;

    navigate(`/checkout?quoteId=${pr.quoteId}`);
  };

  return (
    <div className={`message ${isOwn ? 'own' : 'other'}`}>
      <div className="message-content" style={{ maxWidth: 300 }}>
        <div className="payment-request-card">
          <div className="payment-request-header">
            <span className="payment-request-icon">💳</span>
            <span className="payment-request-label">Payment Request</span>
          </div>
          <div className="payment-request-amount">₦{pr?.amount?.toLocaleString()}</div>
          {pr?.description && (
            <p className="payment-request-desc">{pr.description}</p>
          )}
          <div className="payment-request-status">
            {isPaid ? (
              <span className="payment-status-paid">✓ Paid</span>
            ) : isCancelled ? (
              <span className="payment-status-cancelled">✕ Cancelled</span>
            ) : isOwn ? (
              <span className="payment-status-pending">⏳ Awaiting payment</span>
            ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="payment-pay-now-btn" onClick={handlePayNow}>
                ✓ Accept & Pay →
            </button>
            <button
                className="payment-reject-btn"
                onClick={() => {
                socketService.sendMessage(conversationId, 
                    `I'd like to negotiate the price of ₦${pr?.amount?.toLocaleString()}. Can we discuss?`
                );
                }}
            >
                ✕ Reject & Negotiate
            </button>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
// ─── Main ChatPage ────────────────────────────────────────────────────────────
function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const designerId = searchParams.get('designerId');

  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null); // track role
  const [startingConversation, setStartingConversation] = useState(false);
  const [startError, setStartError] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false); // 

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const conversationIdRef = useRef(conversationId);

  useEffect(() => { conversationIdRef.current = conversationId; }, [conversationId]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const askConfirm = (message) => new Promise(resolve => {
    setConfirmModal({
      message,
      onConfirm: () => { setConfirmModal(null); resolve(true); },
      onCancel:  () => { setConfirmModal(null); resolve(false); }
    });
  });

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  // Get current user + role
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('mygarb_user'));
    if (user) {
      setCurrentUserId(user._id);
      setCurrentUserRole(user.role); //  'designer' or 'customer'
    }
  }, []);

  useEffect(() => { if (designerId) startConversationWithDesigner(designerId); }, [designerId]);
  useEffect(() => { setShowSidebar(!conversationId); }, [conversationId]);

  // Socket — connect once
  useEffect(() => {
    socketService.connect();

    socketService.onNewMessage(({ conversationId: convId, message }) => {
      if (convId === conversationIdRef.current) {
        setMessages(prev => [...prev, message]);
        setTimeout(scrollToBottom, 100);
      }
      fetchConversations();
    });

    socketService.onUserTyping(({ conversationId: convId, userName }) => {
      if (convId === conversationIdRef.current) setTyping(userName);
    });

    socketService.onUserStoppedTyping(({ conversationId: convId }) => {
      if (convId === conversationIdRef.current) setTyping(false);
    });

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, []);

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (conversationId) {
      fetchConversation();
      socketService.joinConversation(conversationId);
      socketService.markAsRead(conversationId);
    } else {
      setLoading(false);
    }
  }, [conversationId]);

  const startConversationWithDesigner = async (targetDesignerId) => {
    try {
      setStartingConversation(true);
      setStartError('');
      const { data } = await api.post('/chat/conversations/start', { designerId: targetDesignerId });
      if (data.success) navigate(`/chat/${data.data._id}`, { replace: true });
      else setStartError('Could not start conversation. Please try again.');
    } catch (err) {
      setStartError(err.message || 'Failed to start conversation.');
    } finally {
      setStartingConversation(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/chat/conversations');
      setConversations(data.data || []);
    } catch (err) { console.error('Fetch conversations error:', err); }
  };

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/chat/conversations/${conversationId}`);
      setCurrentConversation(data.data);
      setMessages(data.data.messages || []);
      setTimeout(scrollToBottom, 100);
    } catch (err) { console.error('Fetch conversation error:', err); }
    finally { setLoading(false); }
  };

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    const confirmed = await askConfirm('Delete this conversation? This cannot be undone.');
    if (!confirmed) return;
    setDeletingId(convId);
    try {
      const { data } = await api.delete(`/chat/conversations/${convId}`);
      if (data.success) {
        setConversations(prev => prev.filter(c => c._id !== convId));
        if (convId === conversationId) { setMessages([]); setCurrentConversation(null); navigate('/chat'); }
        showToast('Conversation deleted');
      }
    } catch (err) { showToast('Failed to delete conversation', 'error'); }
    finally { setDeletingId(null); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      socketService.sendMessage(conversationId, newMessage.trim());
      setNewMessage('');
      socketService.stopTyping(conversationId);
    } catch (err) { showToast('Failed to send message', 'error'); }
    finally { setSending(false); }
  };

  const handleTyping = () => {
    socketService.startTyping(conversationId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socketService.stopTyping(conversationId), 3000);
  };

  const handleSelectConversation = (convId) => {
    if (convId === conversationId) return;
    setMessages([]); setCurrentConversation(null);
    navigate(`/chat/${convId}`);
  };

  const handleBackToSidebar = () => { setShowSidebar(true); navigate('/chat'); };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    if (diffInHours < 24) return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (diffInHours < 168) return date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getOtherParticipant = () => {
    if (!currentConversation || !currentUserId) return null;
    return currentConversation.participants.find(p => p.userId._id !== currentUserId);
  };

  const otherParticipant = getOtherParticipant();

  if (startingConversation) return (
    <div className="chat-page"><div className="chat-starting-state"><div className="spinner"></div><p>Starting conversation...</p></div></div>
  );

  if (startError) return (
    <div className="chat-page"><div className="chat-starting-state">
      <p className="chat-start-error">{startError}</p>
      <button className="chat-btn-primary" onClick={() => navigate('/ourdesigners')}>← Back to Designers</button>
    </div></div>
  );

  return (
    <div className="chat-page">
      <Toast toasts={toasts} />
      {confirmModal && <ConfirmModal {...confirmModal} />}

      {/*  Payment request modal — shown to designer only */}
      {showPaymentModal && currentUserRole === 'designer' && (
        <PaymentRequestModal
          conversationId={conversationId}
          designerName={currentConversation?.participants?.find(p => p.userId._id === currentUserId)?.name}
          onClose={() => setShowPaymentModal(false)}
          onSent={() => showToast('Payment request sent!')}
        />
      )}

      <div className="chat-container">

        {/* SIDEBAR */}
        <div className={`chat-sidebar ${showSidebar ? 'sidebar-visible' : 'sidebar-hidden'}`}>
          <div className="chat-sidebar-header">
            <h2 className="chat-sidebar-title">Messages</h2>
            <button className="chat-btn-primary" onClick={() => navigate('/ourdesigners')}> New Chat</button>
          </div>

          <div className="conversations-list">
            {conversations.length === 0 ? (
              <div className="no-conversations">
                <p>No conversations yet</p>
                <button className="chat-btn-primary" onClick={() => navigate('/ourdesigners')}>Find Designers</button>
              </div>
            ) : (
              conversations.map((conv) => {
                const participant = conv.participants.find(p => p.userId._id !== currentUserId);
                const isActive = conv._id === conversationId;
                const unreadCount = conv.unreadCount?.[currentUserId] || 0;
                const isDeleting = deletingId === conv._id;

                return (
                  <div
                    key={conv._id}
                    className={`conversation-item ${isActive ? 'active' : ''} ${isDeleting ? 'deleting' : ''}`}
                    onClick={() => handleSelectConversation(conv._id)}
                  >
                    <div className="conv-avatar">{participant?.name?.charAt(0)?.toUpperCase() || 'D'}</div>
                    <div className="conv-info">
                      <div className="conv-top">
                        <h4>{participant?.name || 'Designer'}</h4>
                        {conv.lastMessage && <span className="conv-time">{formatTime(conv.lastMessage.timestamp)}</span>}
                      </div>
                      <div className="conv-bottom">
                        <p className="last-message">{conv.lastMessage?.text || 'No messages yet'}</p>
                        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                      </div>
                    </div>
                    <button className="conv-delete-btn" onClick={(e) => handleDeleteConversation(e, conv._id)} disabled={isDeleting}>
                      {isDeleting ? '...' : '🗑'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* MAIN CHAT */}
        <div className={`chat-main ${!showSidebar ? 'chat-main-visible' : ''}`}>
          {!conversationId ? (
            <div className="no-conversation-selected">
              <div className="chat-empty-state">
                <div className="chat-empty-icon">💬</div>
                <h2>Your Messages</h2>
                <p>Select a conversation or start a new one</p>
                <button className="chat-btn-primary" onClick={() => navigate('/ourdesigners')}>Start New Chat</button>
              </div>
            </div>
          ) : loading ? (
            <div className="loading-chat"><div className="spinner"></div><p>Loading conversation...</p></div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <button className="chat-btn-back" onClick={handleBackToSidebar}>← Back</button>
                <div className="chat-header-info">
                  <div className="chat-header-avatar">{otherParticipant?.name?.charAt(0)?.toUpperCase() || 'D'}</div>
                  <div className="chat-header-details">
                    <h3>{otherParticipant?.name || 'Designer'}</h3>
                    <p>{otherParticipant?.role || 'Designer'}</p>
                  </div>
                </div>

                {/* Request Payment button — only visible to designer */}
                {currentUserRole === 'designer' && (
                  <button
                    className="chat-btn-request-payment"
                    onClick={() => setShowPaymentModal(true)}
                    title="Send a payment request to the customer"
                  >
                   📋 Generate Quote
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="no-messages"><p>No messages yet. Say hello! 👋</p></div>
                ) : (
                  messages.map((msg, idx) => {
                    //  Render payment request messages differently
                    if (msg.type === 'payment_request') {
                      return (
                        <PaymentRequestCard
                          key={msg._id || idx}
                          msg={msg}
                          currentUserId={currentUserId}
                          otherParticipant={otherParticipant}
                          conversationId={conversationId}
                          navigate={navigate}
                        />
                      );
                    }

                    // Regular text message
                    const isOwn = msg.sender === currentUserId;
                    const showAvatar = idx === 0 || messages[idx - 1].sender !== msg.sender;
                    return (
                      <div key={msg._id || idx} className={`message ${isOwn ? 'own' : 'other'}`}>
                        {!isOwn && showAvatar && (
                          <div className="message-avatar">{msg.senderName?.charAt(0)?.toUpperCase() || 'D'}</div>
                        )}
                        <div className="message-content">
                          {!isOwn && showAvatar && <div className="message-sender">{msg.senderName}</div>}
                          <div className={`message-bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`}>
                            <p>{msg.text}</p>
                          </div>
                          <div className="message-time">
                            {formatTime(msg.timestamp)}
                            {isOwn && msg.read && <span className="read-indicator">✓✓</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {typing && (
                  <div className="typing-indicator">
                    <div className="typing-avatar">{typing.charAt(0)}</div>
                    <div className="typing-bubble"><div className="typing-dots"><span></span><span></span><span></span></div></div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form className="message-input-container" onSubmit={handleSendMessage}>
                <div className="message-input-wrapper">
                  <input
                    type="text"
                    className="message-input"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                    disabled={sending}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className={`chat-btn-send ${(!newMessage.trim() || sending) ? 'chat-btn-send-disabled' : ''}`}
                    disabled={!newMessage.trim() || sending}
                  >
                    {sending ? '...' : '➤'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
