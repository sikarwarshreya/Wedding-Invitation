import React, { useEffect, useRef, useState } from 'react';
import { wedding } from '../config/wedding';

function useLocale() {
  const [locale, setLocale] = useState('hi');
  useEffect(() => {
    const update = (event) => setLocale(event.detail === 'en' ? 'en' : 'hi');
    window.addEventListener('invitation:language', update);
    return () => window.removeEventListener('invitation:language', update);
  }, []);
  return locale;
}

export function WeddingCountdown() {
  const locale = useLocale();
  const copy = locale === 'hi'
    ? { kicker: 'हमारे शुभ दिवस तक', title: 'मंगल उत्सव की प्रतीक्षा', complete: 'हमारा नवजीवन आरंभ हो चुका है। हमारे साथ उत्सव मनाने के लिए धन्यवाद।', labels: ['दिन', 'घंटे', 'मिनट', 'सेकंड'] }
    : { kicker: 'Until forever begins', title: 'Our Celebration Awaits', complete: 'Our forever has begun. Thank you for celebrating with us.', labels: ['Days', 'Hours', 'Minutes', 'Seconds'] };
  const calculate = () => {
    const remaining = new Date(wedding.dateTime).getTime() - Date.now();
    if (remaining <= 0) return null;
    return {
      Days: Math.floor(remaining / 86400000),
      Hours: Math.floor(remaining / 3600000) % 24,
      Minutes: Math.floor(remaining / 60000) % 60,
      Seconds: Math.floor(remaining / 1000) % 60,
    };
  };
  const [time, setTime] = useState(calculate);

  useEffect(() => {
    const timer = window.setInterval(() => setTime(calculate()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="countdown-section section-shell" id="countdown">
      <div className="section-heading reveal">
        <span className="kicker">{copy.kicker}</span>
        <h2>{copy.title}</h2>
      </div>
      {time ? (
        <div className="countdown" aria-label={locale === 'hi' ? `${wedding.displayDateHi} तक शेष समय` : `Countdown to ${wedding.displayDate}`}>
          {Object.entries(time).map(([label, value], index) => (
            <div className="countdown-item reveal" key={label}>
              <strong>{String(value).padStart(2, '0')}</strong>
              <span>{copy.labels[index]}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="wedding-begun reveal">{copy.complete}</p>
      )}
    </section>
  );
}

export function PhotoGallery() {
  const locale = useLocale();
  const copy = locale === 'hi'
    ? { kicker: 'पल एवं स्मृतियाँ', title: 'उत्सव की सुंदर झलकियाँ', intro: 'यहाँ सगाई, परिवार और विवाह के वास्तविक चित्र जोड़े जा सकते हैं।', expand: 'चित्र बड़ा करें', gallery: 'चित्र दीर्घा', close: 'चित्र दीर्घा बंद करें', previous: 'पिछला चित्र', next: 'अगला चित्र' }
    : { kicker: 'Moments & memories', title: 'Portraits of Celebration', intro: 'Editorial placeholders for your engagement, family, and wedding photographs.', expand: 'Expand', gallery: 'Photo gallery', close: 'Close gallery', previous: 'Previous photograph', next: 'Next photograph' };
  const [active, setActive] = useState(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (active === null) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setActive(null);
      if (event.key === 'ArrowRight') setActive((value) => (value + 1) % wedding.gallery.length);
      if (event.key === 'ArrowLeft') setActive((value) => (value - 1 + wedding.gallery.length) % wedding.gallery.length);
    };
    document.body.classList.add('dialog-open');
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.classList.remove('dialog-open');
      window.removeEventListener('keydown', onKey);
    };
  }, [active]);

  return (
    <section className="gallery-section section-shell" id="gallery">
      <div className="section-heading reveal">
        <span className="kicker">{copy.kicker}</span>
        <h2>{copy.title}</h2>
        <p>{copy.intro}</p>
      </div>
      <div className="gallery-grid">
        {wedding.gallery.map((image, index) => (
          <button className="gallery-card reveal" key={image.src} onClick={() => setActive(index)} aria-label={`${copy.expand} ${locale === 'hi' ? image.labelHi : image.label}`}>
            <img src={image.src} alt={locale === 'hi' ? image.altHi : image.alt} loading="lazy" decoding="async" />
            <span>{locale === 'hi' ? image.labelHi : image.label}</span>
          </button>
        ))}
      </div>
      {active !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={copy.gallery}>
          <button ref={closeRef} className="lightbox-close" onClick={() => setActive(null)} aria-label={copy.close}>×</button>
          <button className="lightbox-nav previous" onClick={() => setActive((active - 1 + wedding.gallery.length) % wedding.gallery.length)} aria-label={copy.previous}>←</button>
          <figure>
            <img src={wedding.gallery[active].src} alt={locale === 'hi' ? wedding.gallery[active].altHi : wedding.gallery[active].alt} />
            <figcaption>{locale === 'hi' ? wedding.gallery[active].labelHi : wedding.gallery[active].label}</figcaption>
          </figure>
          <button className="lightbox-nav next" onClick={() => setActive((active + 1) % wedding.gallery.length)} aria-label={copy.next}>→</button>
        </div>
      )}
    </section>
  );
}

export function RSVPForm() {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (!data.get('name') || !data.get('response')) {
      setStatus('error');
      setMessage('Please share your name and attendance response.');
      return;
    }

    setStatus('loading');
    setMessage('');
    if (!wedding.rsvp.endpoint) {
      window.setTimeout(() => {
        setStatus('demo');
        setMessage(wedding.rsvp.note);
      }, 700);
      return;
    }

    try {
      const response = await fetch(wedding.rsvp.endpoint, { method: 'POST', body: data });
      if (!response.ok) throw new Error('The RSVP service could not accept your response.');
      setStatus('success');
      setMessage('Thank you. Your response has been received.');
      form.reset();
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Please try again.');
    }
  }

  return (
    <section className="rsvp-section section-shell" id="rsvp">
      <div className="rsvp-frame reveal">
        <div className="section-heading">
          <span className="kicker">Répondez s’il vous plaît</span>
          <h2>We Would Be Honoured<br />by Your Presence</h2>
          <p>Please respond when your plans are known.</p>
        </div>
        <form onSubmit={submit} noValidate>
          <label>Guest name<input name="name" autoComplete="name" required placeholder="Your full name" /></label>
          <label>Contact information<input name="contact" autoComplete="email" placeholder="Email or phone" /></label>
          <label>Number of attendees<select name="guests" defaultValue="1"><option>1</option><option>2</option><option>3</option><option>4</option><option>5+</option></select></label>
          <fieldset>
            <legend>Your response</legend>
            <label><input type="radio" name="response" value="accept" /> Joyfully accept</label>
            <label><input type="radio" name="response" value="decline" /> Regretfully decline</label>
          </fieldset>
          <fieldset className="events-fieldset">
            <legend>Celebrations you plan to attend</legend>
            {wedding.events.map((item) => <label key={item.name}><input type="checkbox" name="events" value={item.name} /> {item.name}</label>)}
          </fieldset>
          <label className="full-field">Dietary preferences<input name="dietary" placeholder="Optional" /></label>
          <label className="full-field">A message for the couple<textarea name="message" rows="4" placeholder="Share your blessings" /></label>
          {message && <p className={`form-message ${status}`} role="status">{message}</p>}
          <button className="royal-button submit-button" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Preparing your response…' : 'Send RSVP'}
          </button>
        </form>
      </div>
    </section>
  );
}

export function BackgroundMusic() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  if (!wedding.music.enabled || !wedding.music.src) return null;

  async function toggle() {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else await audioRef.current.play();
    setPlaying(!playing);
  }

  return (
    <>
      <audio ref={audioRef} src={wedding.music.src} loop preload="none" />
      <button className="music-toggle" type="button" onClick={toggle} aria-pressed={playing}>
        {playing ? 'Mute music' : 'Play music'}
      </button>
    </>
  );
}

export default function InteractiveExperience() {
  return (
    <>
      <WeddingCountdown />
      <PhotoGallery />
      <RSVPForm />
      <BackgroundMusic />
    </>
  );
}
