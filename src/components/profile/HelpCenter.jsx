import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Search, ChevronRight, Clock, CheckCircle2,
  LifeBuoy, Send, ArrowLeft, ChevronDown, Loader2, AlertCircle, XCircle, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createTicket, getMyTickets, getTicketMessages, addMessage } from '../../supabase/services/support.service';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'billing', label: 'Payments & Billing' },
  { value: 'maintenance', label: 'Maintenance Request' },
  { value: 'noise', label: 'Noise Complaint' },
  { value: 'access', label: 'Access Issue' },
  { value: 'documents', label: 'Documents' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const STATUS_STYLES = {
  open: { label: 'Open', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  in_progress: { label: 'In Progress', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  resolved: { label: 'Resolved', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
  closed: { label: 'Closed', bg: 'bg-[#f2f2f2]', text: 'text-[#9ca3af]', border: 'border-[#e5e7eb]' },
};

const HelpCenter = () => {
  const { user } = useAuth();
  const [view, setView] = useState('list'); // 'list', 'raise', 'detail'
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  // Form state
  const [form, setForm] = useState({ subject: '', category: 'general', priority: 'medium', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const catRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch tickets
  useEffect(() => {
    if (!user) return;
    getMyTickets(user.id)
      .then(setTickets)
      .catch(() => toast.error('Failed to load tickets'))
      .finally(() => setLoading(false));
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (catRef.current && !catRef.current.contains(e.target)) setCatDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchTickets = async () => {
    const data = await getMyTickets(user.id);
    setTickets(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;
    setSubmitting(true);
    try {
      await createTicket({
        userId: user.id,
        category: form.category,
        subject: form.subject.trim(),
        message: form.message.trim(),
        priority: form.priority,
      });
      toast.success('Ticket submitted!');
      setForm({ subject: '', category: 'general', priority: 'medium', message: '' });
      await fetchTickets();
      setView('list');
    } catch {
      toast.error('Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const openTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setView('detail');
    setMessagesLoading(true);
    try {
      const msgs = await getTicketMessages(ticket.id);
      setMessages(msgs);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setReplying(true);
    try {
      await addMessage({ ticketId: selectedTicket.id, userId: user.id, message: replyText.trim() });
      setReplyText('');
      const msgs = await getTicketMessages(selectedTicket.id);
      setMessages(msgs);
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  const filteredTickets = tickets.filter(t =>
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCatLabel = (val) => CATEGORIES.find(c => c.value === val)?.label || val;
  const getStatus = (s) => STATUS_STYLES[s] || STATUS_STYLES.open;

  // ─── TICKET DETAIL VIEW ──────────────────────────────────
  if (view === 'detail' && selectedTicket) {
    const status = getStatus(selectedTicket.status);
    const isClosed = ['resolved', 'closed'].includes(selectedTicket.status);

    return (
      <div className="space-y-5">
        <button onClick={() => { setView('list'); setSelectedTicket(null); }} className="flex items-center gap-1.5 text-xs font-bold text-[#6b7280] hover:text-[#111827] transition-colors uppercase tracking-widest">
          <ArrowLeft size={14} /> Back to tickets
        </button>

        {/* Ticket Header */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${status.bg} ${status.text} ${status.border}`}>
              {status.label}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af]">
              {getCatLabel(selectedTicket.category)}
            </span>
          </div>
          <h3 className="text-lg font-serif text-[#111827]">{selectedTicket.subject}</h3>
          <p className="text-[10px] text-[#9ca3af] mt-1">
            Opened {new Date(selectedTicket.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            {selectedTicket.resolved_at && ` · Resolved ${new Date(selectedTicket.resolved_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`}
          </p>
        </div>

        {/* Messages Thread */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
          {messagesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={20} className="animate-spin text-[#9ca3af]" />
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => {
                const isTenant = msg.sender_type === 'tenant';
                return (
                  <div key={msg.id} className={`flex ${isTenant ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${isTenant ? 'order-1' : 'order-2'}`}>
                      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        isTenant
                          ? 'bg-[#0f4c3a] text-white rounded-br-md'
                          : 'bg-[#f7f7f7] text-[#111827] rounded-bl-md'
                      }`}>
                        {msg.message}
                      </div>
                      <div className={`flex items-center gap-1 mt-1 ${isTenant ? 'justify-end' : 'justify-start'}`}>
                        {!isTenant && <User size={9} className="text-[#9ca3af]" />}
                        <span className="text-[9px] text-[#9ca3af]">
                          {isTenant ? 'You' : 'Support'}
                          {' · '}
                          {new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          {', '}
                          {new Date(msg.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Reply Input */}
          {!isClosed ? (
            <div className="border-t border-[#e5e7eb] p-4 flex gap-2">
              <input
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                placeholder="Type a reply..."
                className="flex-1 bg-[#f7f7f7] border border-[#e5e7eb] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0f4c3a]/30 transition-colors"
              />
              <button
                onClick={handleReply}
                disabled={replying || !replyText.trim()}
                className="px-4 py-2.5 bg-[#0f4c3a] hover:bg-[#0a3a2b] text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {replying ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          ) : (
            <div className="border-t border-[#e5e7eb] p-4 text-center">
              <p className="text-xs text-[#9ca3af]">This ticket has been {selectedTicket.status}. Open a new ticket if you need further help.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── RAISE TICKET VIEW ───────────────────────────────────
  if (view === 'raise') {
    return (
      <div className="space-y-5">
        <button onClick={() => setView('list')} className="flex items-center gap-1.5 text-xs font-bold text-[#6b7280] hover:text-[#111827] transition-colors uppercase tracking-widest">
          <ArrowLeft size={14} /> Back to tickets
        </button>

        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6">
          <h3 className="text-lg font-serif text-[#111827] mb-1">Need assistance?</h3>
          <p className="text-xs text-[#6b7280] mb-6">Our support team typically responds within 4-6 hours.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Subject */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#374151] mb-1.5 block">Subject</label>
              <input
                required
                type="text"
                placeholder="e.g. Broken faucet in main bathroom"
                className="w-full bg-[#f7f7f7] border border-[#e5e7eb] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#0f4c3a]/30 transition-colors"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
              />
            </div>

            {/* Category + Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Dropdown */}
              <div className="relative" ref={catRef}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#374151] mb-1.5 block">Category</label>
                <button
                  type="button"
                  onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                  className="w-full bg-[#f7f7f7] border border-[#e5e7eb] rounded-xl py-3 px-4 text-sm text-left flex items-center justify-between focus:outline-none focus:border-[#0f4c3a]/30 transition-colors"
                >
                  <span className="text-[#111827]">{getCatLabel(form.category)}</span>
                  <ChevronDown size={16} className={`text-[#9ca3af] transition-transform ${catDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {catDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-[#e5e7eb] rounded-xl shadow-lg overflow-hidden py-1"
                    >
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => { setForm({ ...form, category: cat.value }); setCatDropdownOpen(false); }}
                          className={`w-full px-4 py-2.5 text-sm text-left transition-colors flex items-center justify-between ${
                            form.category === cat.value ? 'bg-[#0f4c3a] text-white' : 'text-[#374151] hover:bg-[#f7f7f7]'
                          }`}
                        >
                          {cat.label}
                          {form.category === cat.value && <CheckCircle2 size={13} />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Priority */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#374151] mb-1.5 block">Priority</label>
                <div className="flex gap-2">
                  {PRIORITIES.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setForm({ ...form, priority: p.value })}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors border ${
                        form.priority === p.value
                          ? 'bg-[#0f4c3a] text-white border-[#0f4c3a]'
                          : 'bg-[#f7f7f7] text-[#374151] border-[#e5e7eb] hover:border-[#0f4c3a]/30'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#374151] mb-1.5 block">Message</label>
              <textarea
                required
                rows={5}
                placeholder="Describe your issue in detail..."
                className="w-full bg-[#f7f7f7] border border-[#e5e7eb] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#0f4c3a]/30 resize-none transition-colors"
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto px-8 py-3 bg-[#0f4c3a] hover:bg-[#0a3a2b] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Submit Ticket
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── TICKET LIST VIEW (default) ──────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button
          onClick={() => setView('raise')}
          className="px-5 py-2.5 bg-[#0f4c3a] hover:bg-[#0a3a2b] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 w-fit"
        >
          <MessageSquare size={13} /> New Ticket
        </button>

        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-white border border-[#e5e7eb] rounded-xl py-2.5 pl-10 pr-4 text-sm w-full md:w-60 focus:outline-none focus:border-[#0f4c3a]/30 transition-colors"
          />
        </div>
      </div>

      {/* Ticket List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-[#9ca3af]" />
        </div>
      ) : filteredTickets.length > 0 ? (
        <div className="space-y-3">
          {filteredTickets.map((ticket, i) => {
            const status = getStatus(ticket.status);
            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => openTicket(ticket)}
                className="group bg-white border border-[#e5e7eb] rounded-2xl p-5 hover:border-[#0f4c3a]/20 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${status.bg} ${status.text} ${status.border}`}>
                        {status.label}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af]">
                        {getCatLabel(ticket.category)}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#111827] truncate">{ticket.subject}</h3>
                    <p className="text-[10px] text-[#9ca3af] mt-1">
                      {new Date(ticket.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#f2f2f2] group-hover:bg-[#0f4c3a] group-hover:text-white flex items-center justify-center text-[#9ca3af] transition-all shrink-0">
                    <ChevronRight size={15} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e5e7eb]">
          <div className="w-14 h-14 rounded-full bg-[#0f4c3a]/5 flex items-center justify-center mx-auto mb-4">
            <LifeBuoy size={24} className="text-[#9ca3af]" />
          </div>
          <h3 className="text-sm font-bold text-[#111827] mb-1">
            {searchQuery ? 'No tickets found' : 'No support tickets yet'}
          </h3>
          <p className="text-xs text-[#6b7280] mb-4 max-w-xs mx-auto">
            {searchQuery ? 'Try a different search term.' : 'If you need help, raise a new ticket and our team will respond within hours.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setView('raise')}
              className="px-5 py-2.5 bg-[#0f4c3a] hover:bg-[#0a3a2b] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
            >
              Raise a ticket
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default HelpCenter;
