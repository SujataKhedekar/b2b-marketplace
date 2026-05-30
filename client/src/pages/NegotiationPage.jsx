import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api.js';
import { getSocket } from '../services/socket.js';

export default function NegotiationPage() {
  const { id } = useParams();
  const { user } = useSelector((s) => s.auth);
  const [neg, setNeg] = useState(null);
  const [text, setText] = useState('');
  const [offer, setOffer] = useState({ pricePerUnit: '', deliveryDays: '' });
  const endRef = useRef(null);

  const load = () => api.get(`/negotiations/${id}`).then(({ data }) => setNeg(data));
  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('negotiation:join', id);
    const onMsg = (msg) => setNeg((prev) => prev ? { ...prev, messages: [...prev.messages, msg] } : prev);
    socket.on('negotiation:message', onMsg);
    return () => { socket.emit('negotiation:leave', id); socket.off('negotiation:message', onMsg); };
  }, [id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [neg?.messages?.length]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    await api.post(`/negotiations/${id}/messages`, { type: 'message', text });
    setText('');
  };

  const sendOffer = async () => {
    if (!offer.pricePerUnit) return;
    await api.post(`/negotiations/${id}/messages`, {
      type: 'counter_offer',
      text: `Counter-offer: ${offer.pricePerUnit}/unit, ${offer.deliveryDays} days`,
      offer: { pricePerUnit: Number(offer.pricePerUnit), deliveryDays: Number(offer.deliveryDays) },
    });
    setOffer({ pricePerUnit: '', deliveryDays: '' });
  };

  if (!neg) return <p>Loading…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Negotiation</h1>
      <p className="text-gray-500 mb-4">{neg.buyer?.company} ↔ {neg.seller?.company}</p>

      <div className="card h-80 overflow-y-auto space-y-2 mb-4">
        {neg.messages.map((m) => {
          const mine = (m.sender?._id || m.sender) === user._id;
          return (
            <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                m.type === 'counter_offer' ? 'bg-yellow-100' : mine ? 'bg-brand text-white' : 'bg-gray-100'}`}>
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2 mb-3">
        <input className="input" placeholder="Type a message…" value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
        <button onClick={sendMessage} className="btn-primary">Send</button>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-2">Make a counter-offer</h2>
        <div className="flex gap-2">
          <input className="input" type="number" placeholder="Price/unit" value={offer.pricePerUnit}
            onChange={(e) => setOffer({ ...offer, pricePerUnit: e.target.value })} />
          <input className="input" type="number" placeholder="Delivery days" value={offer.deliveryDays}
            onChange={(e) => setOffer({ ...offer, deliveryDays: e.target.value })} />
          <button onClick={sendOffer} className="btn-outline whitespace-nowrap">Send offer</button>
        </div>
      </div>
    </div>
  );
}
