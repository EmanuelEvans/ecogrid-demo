import { lazy, Suspense, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Activity, ArrowLeft, ArrowRight, ArrowUp, Award, BatteryCharging, Bell, BookOpen, BriefcaseBusiness,
  Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Clock3, Flame, Gift,
  Globe2, Heart, Leaf, Lock, MapPinned, Megaphone, MessageCircle, MoreHorizontal,
  PackageCheck, Plus, Recycle, Search, Send, Settings, ShieldCheck, ShoppingBag, Sparkles, Sprout,
  Sun, Ticket, Trash2, Users, Vote, X, Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { BrandOrb, EcoGridLogo, GreenToken, TabEmblem } from './Brand';
import {
  brands, citizenTabs, corporateTabs, lessonsByUnit, municipalTabs, sectionTwoTitles,
  unitTitles, type Account, type Report, type ReportKind,
} from './data';
import { RULES, formatDenar, formatTokens } from './rules';
import { useDemoStore } from './store';
import './App.css';

type SheetType = 'energy' | 'streak' | 'tokens' | 'premium' | 'wallet' | 'listing' | 'sponsor' | 'report' | 'archive' | 'institution' | 'business' | null;
type ToastMessage = { id: number; text: string };
const MapScreen = lazy(async () => {
  const { EcoMap } = await import('./MapScreen');
  return { default: EcoMap };
});
const ImpactChart = lazy(async () => {
  const { ImpactChart: Chart } = await import('./AnalyticsCharts');
  return { default: Chart };
});
const VoucherChart = lazy(async () => {
  const { VoucherChart: Chart } = await import('./AnalyticsCharts');
  return { default: Chart };
});
const MunicipalLocationChart = lazy(async () => {
  const { MunicipalLocationChart: Chart } = await import('./AnalyticsCharts');
  return { default: Chart };
});
const MunicipalWasteChart = lazy(async () => {
  const { MunicipalWasteChart: Chart } = await import('./AnalyticsCharts');
  return { default: Chart };
});
const matchDescriptionsByTopic = [
  ['Стаклото може да дејствува како лупа', 'Распадот создава топлина и гасови', 'Се распаѓа многу бавно', 'Може да испушта штетни материи'],
  ['Избегнувај оган при силен ветер', 'Отстрани ја сувата трева од огнот', 'Изгаси целосно пред да заминеш', 'Однеси го во соодветен сад'],
  ['Може да запали сува трева', 'Може да повреди луѓе и животни', 'Се распаѓа многу бавно', 'Може повторно да се разгори'],
  ['Сад за хартија', 'Сад за стакло', 'Сад за пластика', 'Сад за био-отпад'],
] as const;

const accountNames: Record<Account, string> = { citizen: 'Граѓанин', municipal: 'Општина / ЈКП', corporate: 'Компанија' };
const tabIcons = {
  citizen: [<BookOpen key="academy" />, <ShoppingBag key="market" />, <Vote key="voice" />, <MapPinned key="map" />, <MessageCircle key="chat" />, <Users key="profile" />],
  municipal: [<MapPinned key="map" />, <PackageCheck key="orders" />, <Vote key="voice" />, <Sprout key="actions" />, <Megaphone key="notices" />, <ShieldCheck key="profile" />],
  corporate: [<Activity key="esg" />, <Ticket key="vouchers" />, <Gift key="sponsorships" />, <Sparkles key="campaigns" />, <Globe2 key="network" />, <BriefcaseBusiness key="profile" />],
};
const tabAccents = {
  citizen: [<Leaf key="academy" />, <Recycle key="market" />, <Check key="voice" />, <Flame key="map" />, <Leaf key="chat" />, <Flame key="profile" />],
  municipal: [<Flame key="map" />, <Check key="orders" />, <Leaf key="voice" />, <Sprout key="actions" />, <Bell key="notices" />, <Check key="profile" />],
  corporate: [<Leaf key="esg" />, <Ticket key="vouchers" />, <Leaf key="sponsorships" />, <Sparkles key="campaigns" />, <MessageCircle key="network" />, <Check key="profile" />],
};
const tabTints = {
  citizen: ['lime', 'emerald', 'blue', 'fire', 'mint', 'lime'],
  municipal: ['fire', 'emerald', 'blue', 'lime', 'fire', 'emerald'],
  corporate: ['lime', 'blue', 'emerald', 'epic', 'mint', 'gold'],
};

function pause(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function fireConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  confetti({ particleCount: 70, spread: 72, origin: { y: 0.72 }, colors: ['#d4ff4f', '#12c27a', '#ffffff', '#ffc93c'], gravity: 1 });
}

function DemoCaption() {
  return <span className="demo-caption">Демо податоци</span>;
}

function PrimaryButton({ children, onClick, disabled = false, secondary = false, className = '', type = 'button' }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; secondary?: boolean; className?: string; type?: 'button' | 'submit';
}) {
  return <motion.button type={type} whileTap={{ scale: 0.96 }} className={`button ${secondary ? 'button-secondary' : 'button-primary'} ${className}`} onClick={onClick} disabled={disabled}>{children}</motion.button>;
}

function GlassCard({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return <motion.div whileHover={onClick ? { y: -2 } : undefined} className={`glass-card ${className}`} onClick={onClick}>{children}</motion.div>;
}

function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  return <div className="progress-track"><motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (value / max) * 100)}%` }} /></div>;
}

function Avatar({ name, size = 38 }: { name: string; size?: number }) {
  const initials = name.replace('@', '').split(/[._\s]/).map((part) => part[0] ?? '').join('').slice(0, 2).toUpperCase();
  return <div className="avatar" style={{ width: size, height: size, fontSize: Math.max(12, size * 0.34) }} aria-label={`Аватар ${name}`}>{initials}</div>;
}

function StatusPill({ text }: { text: string }) {
  const cls = text === 'Завршено' || text === 'Исчистено' || text === 'Активно' ? 'positive' : text === 'Критично' || text === 'Пожар' ? 'negative' : text === 'Во процес' ? 'warning' : 'neutral';
  return <span className={`status-pill ${cls}`}>{text}</span>;
}

function Reputation({ value, label = false }: { value: number; label?: boolean }) {
  return <div className="reputation" aria-label={`Репутација ${value} од 5`}><span className="rep-label">{label ? 'Репутација' : ''}</span><div className="rep-bars">{[1, 2, 3, 4, 5].map((step) => <i key={step} className={step <= value ? 'filled' : ''} />)}</div>{label && <b>{value}/5</b>}</div>;
}

function ScreenHeader({ account, tab, index }: { account: Account; tab: string; index: number }) {
  const icon = tabIcons[account][index];
  const accent = tabAccents[account][index];
  const tint = tabTints[account][index] ?? 'lime';
  return <div className="screen-heading">
    <TabEmblem icon={icon} accent={accent} tint={tint} />
    <div><h1>{tab}</h1><p>{account === 'citizen' ? 'Заедно за почиста Македонија' : account === 'municipal' ? 'Оперативен преглед на заедницата' : 'Партнерство со видливо влијание'}</p></div>
  </div>;
}

function Welcome({ onEnter, onRegister, onLogin }: { onEnter: () => void; onRegister: () => void; onLogin: () => void }) {
  return <motion.div className="welcome-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }}>
    <div className="welcome-top"><EcoGridLogo size={50} /></div>
    <motion.div className="welcome-orb" animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}><BrandOrb size={150} /></motion.div>
    <span className="eyebrow"><Sprout size={14} /> МАЛ ЧЕКОР. ГОЛЕМА ПРОМЕНА.</span>
    <h1>Пријави,<br />учи, награди се.</h1>
    <p>Паметни еко-навики, заедница што реагира и награди за секој добар чекор.</p>
    <div className="welcome-chips"><span><BookOpen size={15} /> Учи</span><span><MapPinned size={15} /> Пријави</span><span><GreenToken size={16} /> Освојувај токени</span></div>
    <PrimaryButton onClick={onRegister}>Креирај профил <ArrowRight size={17} /></PrimaryButton>
    <PrimaryButton secondary onClick={onLogin}>Веќе имам профил</PrimaryButton>
    <button className="text-button" onClick={onEnter}>Продолжи како демо-корисник</button>
    <motion.a
      className="instagram-qr-card"
      href="https://www.instagram.com/terrapulse_innovations/"
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.45 }}
    >
      <img src={`${import.meta.env.BASE_URL}instagram-qr.png`} alt="QR-код за Instagram профилот на TerraPulse Innovations" />
      <span><b>Следете нè на Instagram</b><small>@terrapulse_innovations</small></span>
      <ArrowRight size={16} aria-hidden="true" />
    </motion.a>
    <div className="welcome-foot"><ShieldCheck size={14} /> Демонстрациска апликација · TerraPulse Innovations</div>
  </motion.div>;
}

function AuthForm({ mode, onBack, onDone, onInstitution }: { mode: 'register' | 'login'; onBack: () => void; onDone: () => void; onInstitution: () => void }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || password.length < 8 || (mode === 'register' && !username.trim())) {
      setError('Внеси валидна е-пошта, лозинка од најмалку 8 знаци и корисничко име.');
      return;
    }
    onDone();
  };
  return <motion.div className="auth-screen" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
    <button className="back-button" onClick={onBack} aria-label="Назад"><ArrowLeft /></button>
    <EcoGridLogo size={44} />
    <h1>{mode === 'register' ? 'Креирај профил' : 'Добредојде назад'}</h1>
    <p className="muted-copy">{mode === 'register' ? 'Започни со мал чекор кон почиста средина.' : 'Најавата е демонстрациска. Секој внесен профил продолжува.'}</p>
    <form onSubmit={submit} className="auth-form">
      <label className="field"><span>Е-пошта</span><input type="email" placeholder="ime@primer.mk" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      {mode === 'register' && <label className="field"><span>Корисничко име</span><input placeholder="@ime_prezime" value={username} onChange={(event) => setUsername(event.target.value)} /></label>}
      <label className="field"><span>Лозинка</span><input type={visible ? 'text' : 'password'} placeholder="Најмалку 8 знаци" value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" className="field-eye" onClick={() => setVisible(!visible)}>{visible ? 'Сокриј' : 'Прикажи'}</button></label>
      {mode === 'register' && <div className="strength-meter"><i className={password.length > 0 ? 'on' : ''} /><i className={password.length >= 5 ? 'on' : ''} /><i className={password.length >= 8 ? 'on' : ''} /><i className={password.length >= 12 ? 'on' : ''} /></div>}
      {error && <p className="error-copy" role="alert">{error}</p>}
      <PrimaryButton type="submit">{mode === 'register' ? 'Продолжи' : 'Најави се'}</PrimaryButton>
    </form>
    <button className="text-button auth-business" onClick={onInstitution}>Институција или компанија?</button>
  </motion.div>;
}

function VerificationScreen({ account, onDone }: { account: Account; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const checks = ['Проверка на податоците', 'Потврда на институцијата', 'Активирање на демо-профилот'];
  useEffect(() => {
    const timer = window.setInterval(() => setStep((current) => Math.min(checks.length, current + 1)), 650);
    return () => window.clearInterval(timer);
  }, [checks.length]);
  useEffect(() => {
    if (step < checks.length) return;
    const timer = window.setTimeout(onDone, 650);
    return () => window.clearTimeout(timer);
  }, [step, checks.length, onDone]);
  return <motion.div className="verification-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <BrandOrb size={74} /><span className="eyebrow">ДЕМО-ВЕРИФИКАЦИЈА</span><h1>{account === 'municipal' ? 'Општински профил' : 'Корпоративен профил'}</h1>
    <p>Ова е симулирана проверка; нема вистинска наплата или проверка на документи.</p>
    <div className="verification-steps">{checks.map((check, index) => <div key={check} className={step > index ? 'complete' : step === index ? 'active' : ''}>{step > index ? <CheckCircle2 /> : <span>{index + 1}</span>}{check}{step === index && <i />}</div>)}</div>
    <DemoCaption />
  </motion.div>;
}

function LessonPlayer({ unit, premium, energy, onClose, onMistake, onFinish }: {
  unit: number; premium: boolean; energy: number; onClose: () => void; onMistake: () => void; onFinish: () => void;
}) {
  const lesson = lessonsByUnit(unit);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [matchLeft, setMatchLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const question = lesson.questions[step]!;
  const verify = () => {
    const correct = question.type === 'order'
      ? order.length === options.length && order.every((item, index) => item === options[index])
      : question.type === 'match'
        ? Object.keys(matches).length === options.length && options.every((_, index) => matches[index] === index)
        : selected === question.answer;
    setFeedback(correct ? 'correct' : 'wrong');
    if (!correct) onMistake();
  };
  const next = () => {
    setFeedback(null); setSelected(null); setOrder([]); setMatches({}); setMatchLeft(null);
    if (energy <= 0 && step < 4) { onClose(); return; }
    if (step === 4) onFinish();
    else setStep((value) => value + 1);
  };
  const options = question.options;
  const matchDescriptions = matchDescriptionsByTopic[(unit - 1) % matchDescriptionsByTopic.length]!;
  const ready = question.type === 'order' ? order.length > 0 : question.type === 'match' ? Object.keys(matches).length === options.length : selected !== null;
  const move = (index: number, direction: -1 | 1) => {
    const arranged = order.length ? [...order] : [...options];
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= arranged.length) return;
    [arranged[index], arranged[nextIndex]] = [arranged[nextIndex]!, arranged[index]!];
    setOrder(arranged);
  };
  return <motion.div className="lesson-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="lesson-top"><button onClick={onClose} className="icon-button" aria-label="Затвори лекција"><X /></button><ProgressBar value={step + 1} max={5} /><span className="energy-mini"><BatteryCharging size={16} /> {energy}/{premium ? 50 : 25}</span></div>
    <div className="lesson-body">
      <span className="eyebrow">ЛЕКЦИЈА {step + 1} ОД 5</span>
      <h2>{question.question}</h2>
      {question.type === 'order' ? <div className="answer-list">{(order.length ? order : options).map((option, index) => <div className="order-option" key={option}><span className="order-num">{index + 1}</span><span>{option}</span><div><button onClick={() => move(index, -1)} aria-label="Помести нагоре"><ArrowLeft size={15} /></button><button onClick={() => move(index, 1)} aria-label="Помести надолу"><ArrowRight size={15} /></button></div></div>)}</div>
        : question.type === 'match' ? <div className="match-list"><div className="match-columns"><div>{options.map((option, index) => <button key={option} className={`match-choice ${matchLeft === index ? 'selected' : matches[index] !== undefined ? 'paired' : ''}`} onClick={() => setMatchLeft(index)}><span>{String.fromCharCode(65 + index)}</span>{option}{matches[index] !== undefined && <Check size={13} />}</button>)}</div><div>{matchDescriptions.map((description, index) => <button key={description} className={`match-choice ${Object.values(matches).includes(index) ? 'paired' : ''}`} onClick={() => { if (matchLeft !== null) { setMatches((current) => ({ ...current, [matchLeft]: index })); setMatchLeft(null); } }}><span>{index + 1}</span>{description}{Object.values(matches).includes(index) && <Check size={13} />}</button>)}</div></div><small className="muted-copy">Избери по еден поим од секоја колона.</small></div>
          : <div className="answer-list">{options.map((option, index) => <button key={option} className={`answer-option ${selected === index ? 'selected' : ''} ${question.type === 'boolean' ? 'boolean-option' : ''}`} onClick={() => setSelected(index)}><span className="option-letter">{question.type === 'boolean' ? (index === 0 ? '✓' : '×') : String.fromCharCode(65 + index)}</span>{option}</button>)}</div>}
      <p className="lesson-tip"><Sparkles size={15} /> Секој точен одговор те носи поблиску до еколошка промена.</p>
    </div>
    {!feedback ? <div className="lesson-actions"><PrimaryButton onClick={verify} disabled={!ready}>Провери</PrimaryButton></div> : <motion.div className={`lesson-feedback ${feedback}`} initial={{ y: 80 }} animate={{ y: 0 }}>
      <div className="feedback-icon">{feedback === 'correct' ? <CheckCircle2 /> : <CircleHelp />}</div><div><b>{feedback === 'correct' ? 'Точно!' : 'Обиди се повторно'}</b><p>{question.explanation}</p></div><PrimaryButton onClick={next}>{step === 4 ? 'Заврши лекција' : 'Продолжи'} <ArrowRight size={16} /></PrimaryButton>
    </motion.div>}
  </motion.div>;
}

function Academy({ completedUnits, premium, onStart, onSwitch }: {
  completedUnits: number[]; premium: boolean; onStart: (unit: number) => void; onSwitch: (tab: string) => void;
}) {
  const [section, setSection] = useState<'Патека' | 'Арена' | 'Фид'>('Патека');
  const totalDone = completedUnits.length;
  const titles = [...unitTitles, ...sectionTwoTitles];
  return <div className="screen-body">
    <div className="segmented">{(['Патека', 'Арена', 'Фид'] as const).map((item) => <button key={item} className={section === item ? 'selected' : ''} onClick={() => setSection(item)}>{item}</button>)}</div>
    {section === 'Патека' ? <>
      {[0, 1].map((part) => <section key={part} className="academy-section">
        <div className={`section-banner banner-${part}`}><div><span className="eyebrow">СЕКЦИЈА {part + 1} · 25 ЕДИНИЦИ</span><h2>{part === 0 ? 'Превенција на пожари и отворени простори' : 'Граѓанско еколошко образование'}</h2><p>{Math.max(0, Math.min(25, totalDone - part * 25))}/25 завршени</p><ProgressBar value={Math.max(0, Math.min(25, totalDone - part * 25))} max={25} /></div><div className="section-illustration"><BrandOrb size={70} /></div></div>
        <div className="unit-path">{Array.from({ length: 25 }, (_, index) => {
          const unit = part * 25 + index + 1;
          const done = completedUnits.includes(unit);
          const current = unit === Math.max(1, totalDone + 1);
          const offset = [0, 46, 0, -46][index % 4]!;
          return <div className="path-row" key={unit} style={{ transform: `translateX(${offset}px)` }}>
            <button className={`unit-node ${done ? 'done' : current ? 'current' : 'locked'}`} onClick={() => !done && !current ? undefined : onStart(unit)} aria-label={`Единица ${unit}: ${titles[unit - 1]}`}>
              {done ? <Check /> : current ? <Leaf /> : <Lock size={19} />}
              {current && <span className="node-pulse" />}
              {current && <span className="node-tip">Почни</span>}
            </button>
            <div className="unit-copy"><span>ЕДИНИЦА {String(unit).padStart(2, '0')}</span><b>{titles[unit - 1] ?? `Еко-лекција ${unit}`}</b><small>{done ? 'Завршено · +25 XP' : current ? `${premium ? '+50' : '+25'} XP · 5 кратки прашања` : 'Отклучи со претходната лекција'}</small></div>
            {unit % 5 === 0 && <button className="chest-node" aria-label="Еко-ковчег" onClick={() => onSwitch('Еко-ковчег')}>🎁</button>}
          </div>;
        })}</div>
      </section>)}
      <div className="list-foot"><DemoCaption /></div>
    </> : section === 'Арена' ? <Arena completedUnits={completedUnits} /> : <SocialFeed />}
  </div>;
}

const leagueNames = ['Семе Арена', 'Никулец Арена', 'Фиданка Арена', 'Млада Шума Арена', 'Зелена Шума Арена', 'Сребрена Крошна Арена', 'Планинска Арена', 'Терра Мастер Арена'];
const leaderboard = [
  ['Ана Петрова', '@ana_p', 685], ['Марија Костова', '@marija_k', 620], ['Димитар Стојанов', '@dimitar.s', 584], ['Елена Иванова', '@eco_elena', 542], ['Бојан Трајков', '@bojan.green', 498],
  ['Сара Наумова', '@sara_n', 465], ['Петар Николов', '@petar.mk', 431], ['Мила Јованова', '@mila_p', 396], ['Ивана Стојчева', '@ivana.e', 372], ['Александар Ристев', '@alex.r', 350],
];

function Arena({ completedUnits }: { completedUnits: number[] }) {
  return <div className="stack">
    <GlassCard className="arena-hero"><div className="league-orb"><Award size={40} /></div><div><span className="eyebrow">НЕДЕЛНА ЛИГА</span><h2>{leagueNames[Math.min(7, Math.floor(completedUnits.length / 6))]}</h2><p>Твој пласман <b>#3</b> · 420 XP оваа недела</p></div><div className="arena-timer"><Clock3 size={15} /> 3д 14ч</div></GlassCard>
    <GlassCard className="reward-banner"><GreenToken size={24} /><div><b>Топ 5 напредуваат</b><span>и добиваат Зелени Токени</span></div><strong>+5 <GreenToken size={18} /></strong></GlassCard>
    <h2 className="section-title">Рангирање оваа недела</h2>
    <GlassCard className="leaderboard">{leaderboard.map(([name, user, xp], index) => <div className={`leader-row ${index < 5 ? 'promoted' : ''} ${user === '@marija_k' ? 'leader-me' : ''}`} key={user}><b className="leader-rank">{index + 1}</b><Avatar name={String(user)} size={34} /><div className="leader-name"><b>{name}</b><small>{user}</small></div><strong>{xp} XP</strong>{index < 5 && <ArrowUp className="rank-up" size={15} />}</div>)}</GlassCard>
    <div className="league-list">{leagueNames.map((name, index) => <div className={`league-badge ${index === 1 ? 'current' : ''}`} key={name}><span>{index < 2 ? '🌱' : <Lock size={13} />}</span><small>{name.split(' ')[0]}</small></div>)}</div>
    <DemoCaption />
  </div>;
}

function SocialFeed() {
  const [liked, setLiked] = useState<number[]>([]);
  const posts = [
    { user: '@marija_k', text: 'Уште еден ден во низата — малите навики прават голема разлика. 🌱', badge: '12 дена низа', icon: '🔥' },
    { user: '@eko_skopje', text: 'Денес собравме 18 вреќи отпад од кејот. Благодарност до сите што дојдоа!', badge: 'Еко-акција', icon: '🌿' },
    { user: '@dimitar.s', text: 'Нов беџ отклучен! Продолжувам да учам за побезбедни излети.', badge: 'Нов беџ', icon: '🏅' },
  ];
  return <div className="stack">{posts.map((post, index) => <GlassCard key={post.user} className="feed-post"><div className="feed-head"><Avatar name={post.user} /><div><b>{post.user}</b><small>пред {index + 1} ч. · Скопје</small></div><MoreHorizontal size={19} /></div><p>{post.text}</p><div className="feed-art"><span>{post.icon}</span><b>{post.badge}</b><span className="photo-tag">ФОТО</span></div><div className="feed-actions"><button onClick={() => setLiked((items) => items.includes(index) ? items.filter((item) => item !== index) : [...items, index])} className={liked.includes(index) ? 'liked' : ''}><Heart size={18} fill={liked.includes(index) ? 'currentColor' : 'none'} /> {liked.includes(index) ? 25 : 24 + index}</button><button><MessageCircle size={18} /> {index + 2}</button><button><ArrowRight size={18} /> Сподели</button></div></GlassCard>)}<DemoCaption /></div>;
}

function Marketplace({ onSheet, onRedeem, balance }: { onSheet: (sheet: SheetType) => void; onRedeem: (brand: string, value: number) => void; balance: number }) {
  const [category, setCategory] = useState('Сите');
  const [kind, setKind] = useState('Сѐ');
  const [search, setSearch] = useState('');
  const { listings } = useDemoStore();
  const visibleListings = listings.filter((listing) => (kind === 'Сѐ' || listing.category === kind) && listing.title.toLowerCase().includes(search.toLowerCase()));
  return <div className="screen-body">
    <label className="search-field"><Search size={17} /><input placeholder="Пребарај предмети" value={search} onChange={(event) => setSearch(event.target.value)} /><button onClick={() => setCategory(category === 'Сите категории' ? 'Категории' : 'Сите категории')}>{category}<ChevronDown size={14} /></button></label>
    <div className="horizontal-chips">{['Сѐ', 'Донација', 'Продажба', 'Еко ваучери'].map((item) => <button key={item} className={kind === item ? 'selected' : ''} onClick={() => { setKind(item === 'Еко ваучери' ? 'Сѐ' : item); if (item === 'Еко ваучери') document.getElementById('vouchers')?.scrollIntoView({ behavior: 'smooth' }); }}>{item}</button>)}</div>
    {kind !== 'Еко ваучери' && <><div className="section-inline"><div><h2>Корисни предмети</h2><p>Пронајди нова намена за добри работи.</p></div><DemoCaption /></div>
      {visibleListings.length ? <div className="listing-grid">{visibleListings.map((item, index) => <GlassCard className="listing-card" key={item.id}>
        <div className={`listing-art art-${index % 6}`}><span>{item.icon}</span><small>ФОТО</small></div><div className="listing-content"><div className="listing-tag-row"><StatusPill text={item.category === 'Донација' ? 'Бесплатно' : item.price} /><span>Добра состојба</span></div><b>{item.title}</b><p><MapPinned size={13} /> {item.place} · пред {index + 1} ч.</p><div className="seller-row"><Avatar name={item.seller} size={22} />{item.seller}<Reputation value={4} /></div></div>
      </GlassCard>)}</div> : <EmptyState title="Нема вакви огласи" text="Обиди се со друга категорија или пребарување." />}
    </>}
    <section className="voucher-section" id="vouchers">
      <div className="section-inline"><div><h2>Еко ваучери</h2><p>Награда за секој добар чекор.</p></div><Ticket size={19} /></div>
      <GlassCard className="balance-banner"><GreenToken size={40} /><div><span>ТВОЈ БАЛАНС</span><b>{formatTokens(balance)} <small>токени</small></b><small>= {formatDenar(Math.floor(balance / RULES.tokensPerDenar))}</small></div><button onClick={() => onSheet('tokens')} aria-label="Историја на токени"><ArrowRight /></button></GlassCard>
      <div className="brand-grid">{brands.map((brand, index) => <button className="brand-tile" key={brand} onClick={() => onRedeem(brand, RULES.vouchers[0]!.value)}><span className={`brand-monogram tone-${index % 5}`}>{brand.split(/[\s&]/).filter(Boolean).map((word) => word[0]).join('').slice(0, 2).toUpperCase()}</span><small>{brand}</small></button>)}</div>
      <GlassCard className="voucher-rule"><span>2 токени = 1 денар</span><span>Важи 3 месеци од подигнувањето</span></GlassCard>
    </section>
  </div>;
}

function VoiceScreen({ ballots, onVote, onPublish }: { ballots: ReturnType<typeof useDemoStore.getState>['ballots']; onVote: (id: string, option: number) => void; onPublish: () => void }) {
  const [active, setActive] = useState<string | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const selected = ballots.find((ballot) => ballot.id === active);
  return <div className="screen-body">
    <div className="voice-intro"><span><Vote size={20} /></span><div><b>Твојот глас ја менува средината</b><p>Поддржи локални еко-иницијативи и одлуки.</p></div></div>
    <div className="section-inline"><h2>Отворени анкети</h2><DemoCaption /></div>
    <div className="stack">{ballots.map((ballot) => <GlassCard className="ballot-card" key={ballot.id} onClick={() => { setActive(ballot.id); setChoice(null); }}>
      <div className="ballot-top"><span><Vote size={14} /> Општина (демо)</span><StatusPill text={ballot.closed ? 'Завршено' : ballot.voted !== undefined ? 'Гласано' : 'Активно'} /></div>
      <h3>{ballot.question}</h3><p>{ballot.description}</p><div className="ballot-meta"><span><Users size={14} /> {ballot.votes.reduce((sum, item) => sum + item, 0)} гласа</span><span><Clock3 size={14} /> {ballot.deadline}</span></div>
      {(ballot.voted !== undefined || ballot.closed) && <div className="result-bars">{ballot.options.map((option, index) => <div className="result-row" key={option}><div><span>{option} {ballot.voted === index ? '✓' : ''}</span><b>{Math.round((ballot.votes[index]! / ballot.votes.reduce((sum, item) => sum + item, 0)) * 100)}%</b></div><ProgressBar value={ballot.votes[index]!} max={ballot.votes.reduce((sum, item) => sum + item, 0)} /></div>)}</div>}
      {!ballot.closed && ballot.voted === undefined && <span className="ballot-cta">Отвори гласање <ArrowRight size={15} /></span>}
    </GlassCard>)}</div>
    <PrimaryButton secondary onClick={onPublish}><Plus size={17} /> Предложи еко-идеја</PrimaryButton>
    {selected && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setActive(null); }}><motion.div className="modal-sheet" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}><div className="sheet-handle" /><button className="sheet-close" onClick={() => setActive(null)} aria-label="Затвори"><X /></button><span className="eyebrow">ОПШТИНА (ДЕМО)</span><h2>{selected.question}</h2><p>{selected.description}</p>{selected.options.map((option, index) => <button key={option} className={`answer-option ${choice === index ? 'selected' : ''}`} onClick={() => setChoice(index)}><span className="option-letter">{String.fromCharCode(65 + index)}</span>{option}</button>)}<PrimaryButton disabled={choice === null || selected.voted !== undefined || selected.closed} onClick={() => { if (choice !== null) { onVote(selected.id, choice); setActive(null); fireConfetti(); } }}>Гласај <ArrowRight size={16} /></PrimaryButton></motion.div></div>}
  </div>;
}

function EcoChat({ notices, messages, initialSection, onSend }: { notices: ReturnType<typeof useDemoStore.getState>['notices']; messages: ReturnType<typeof useDemoStore.getState>['messages']; initialSection: string; onSend: (text: string) => void }) {
  const [section, setSection] = useState(initialSection);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  return <div className="screen-body">
    <div className="followers-card"><div className="avatar-stack"><Avatar name="@marija_k" size={30} /><Avatar name="@dimitar.s" size={30} /><Avatar name="@eco_skopje" size={30} /></div><div><b>128 Следбеници · 94 Следам</b><small>Луѓе што ја чуваат природата заедно.</small></div><button aria-label="Пријатели"><Users size={18} /></button></div>
    <div className="horizontal-chips chat-tabs">{['Општо', 'Информации', 'Официјални акции', 'Граѓански акции'].map((item) => <button key={item} className={section === item ? 'selected' : ''} onClick={() => setSection(item)}>{item}</button>)}</div>
    {section === 'Општо' ? <><div className="chat-messages">{messages.map((message) => <div className={`chat-message ${message.mine ? 'mine' : ''}`} key={message.id}>{!message.mine && <Avatar name={message.author} size={28} />}<div className="bubble"><b>{message.mine ? 'Ти' : message.author}</b><p>{message.text}</p><small>{message.time}</small></div></div>)}{typing && <div className="typing-indicator"><i /><i /><i /></div>}</div><form className="chat-composer" onSubmit={(event) => { event.preventDefault(); if (!draft.trim()) return; onSend(draft); setDraft(''); setTyping(true); window.setTimeout(() => setTyping(false), 1_500); }}><input placeholder="Напиши порака..." value={draft} onChange={(event) => setDraft(event.target.value)} /><button aria-label="Испрати порака"><Send size={18} /></button></form></>
      : <div className="stack">{(section === 'Информации' ? notices.filter((item) => item.kind !== 'action') : notices.filter((item) => item.kind === 'action')).map((notice) => <GlassCard key={notice.id} className={`notice-card ${notice.kind}`}><div className="notice-source"><span>{notice.kind === 'alert' ? <Flame size={15} /> : notice.kind === 'action' ? <Sprout size={15} /> : <Bell size={15} />}{notice.source}</span><small>{notice.time}</small></div><h3>{notice.title}</h3><p>{notice.text}</p></GlassCard>)}{section === 'Граѓански акции' && <GlassCard className="notice-card"><span className="eyebrow">ЗАЕДНИЧКА ИНИЦИЈАТИВА</span><h3>Чисто маало, чист почеток</h3><p>Соседска средба за собирање отпад во паркот. Пријави се кај организаторот.</p><PrimaryButton secondary>Приклучи се</PrimaryButton></GlassCard>}</div>}
    <DemoCaption />
  </div>;
}

function Profile({ onSheet, premium, tokens, xp, streak, reputation, vouchers, savedBoosts, boostRemaining, onActivateBoost, onTheme, theme, onReset, completedUnits }: {
  onSheet: (sheet: SheetType) => void; premium: boolean; tokens: number; xp: number; streak: number; reputation: number; vouchers: ReturnType<typeof useDemoStore.getState>['vouchers']; savedBoosts: number; boostRemaining: number; onActivateBoost: () => void; onTheme: () => void; theme: string; onReset: () => void; completedUnits: number[];
}) {
  const [showSettings, setShowSettings] = useState(false);
  return <div className="screen-body profile-screen">
    <GlassCard className="profile-hero"><button className="profile-more" onClick={() => setShowSettings(!showSettings)} aria-label="Поставки"><MoreHorizontal /></button><button className="wallet-shortcut" onClick={() => onSheet('wallet')} aria-label="Отвори паричник"><Ticket size={20} />{vouchers.length > 0 && <i>{vouchers.length}</i>}</button>
      <div className="profile-avatar"><Avatar name="@marija_k" size={82} /><span><Check size={13} /></span></div><h2>@marija_k {premium && <StatusPill text="Премиум" />}</h2><p>Мали чекори, почиста Македонија 🌿</p><div className="profile-joined">Член од март 2025 · Скопје</div><Reputation value={reputation} label />
      <div className="profile-stats"><div><Flame /><b>{streak}</b><small>дена низа</small></div><div><Zap /><b>{formatTokens(xp)}</b><small>вкупно XP</small></div><div><Users /><b>128</b><small>пријатели</small></div></div><div className="xp-line"><div className="xp-line-label"><span>Ниво 4 · Зелено листо</span><span>1.250 / 2.000 XP</span></div><ProgressBar value={xp % 2_000} max={2_000} /></div><DemoCaption />
    </GlassCard>
    <div className="profile-row"><h2>Мои беџови</h2><button className="text-button">Прикажи сѐ <ArrowRight size={15} /></button></div>
    <div className="badges-grid">{[['🌱', 'Новак истражувач', 'x2'], ['🔥', 'Стодневник', ''], ['📘', 'Еко ученик', ''], ['♻️', 'Чувар на природата', '']].map(([icon, title, multiplier]) => <GlassCard className="badge-card" key={title}><span className="badge-icon">{icon}</span>{multiplier && <b className="badge-multiplier">{multiplier}</b>}<small>{title}</small></GlassCard>)}</div>
    <GlassCard className="premium-card"><div><span className="eyebrow">ПОВЕЌЕ ЗА ПЛАНЕТАТА</span><h3>{premium ? 'Твојот Premium е активен' : 'Премини на Премиум'}</h3><p>Побрзо учење, повеќе енергија и без присилни реклами.</p></div><PrimaryButton onClick={() => onSheet('premium')}>{premium ? 'Прегледај' : '300 ден./мес.'}</PrimaryButton></GlassCard>
    {boostRemaining > 0 && <GlassCard className="boost-card boost-active"><div><span className="eyebrow">АКТИВЕН БУСТЕР</span><h3>2× XP · уште {Math.floor(boostRemaining / 60)}:{String(boostRemaining % 60).padStart(2, '0')}</h3></div><Sparkles /></GlassCard>}
    {savedBoosts > 0 && <GlassCard className="boost-card"><div><span className="eyebrow">ЗАЧУВАНА НАГРАДА</span><h3>{savedBoosts} × XP бустер</h3><p>Двојно XP во следните 10 минути.</p></div><PrimaryButton onClick={onActivateBoost}>Активирај бустер</PrimaryButton></GlassCard>}
    {showSettings && <GlassCard className="settings-card"><h3>Подесувања</h3><button className="settings-row" onClick={onTheme}><span><Sun /> Светла тема</span><i className={`switch ${theme === 'light' ? 'on' : ''}`} /></button><button className="settings-row" onClick={() => onSheet('streak')}><span><Flame /> Низа и календар</span><ChevronRight /></button><button className="settings-row" onClick={() => onSheet('energy')}><span><BatteryCharging /> Енергија</span><ChevronRight /></button><button className="settings-row" onClick={onReset}><span><Settings /> Ресетирај демо</span><ChevronRight /></button></GlassCard>}
    <GlassCard className="small-card token-summary" onClick={() => onSheet('tokens')}><GreenToken size={26} /><span><b>{formatTokens(tokens)} Зелени Токени</b><small>Погледни ја историјата на награди</small></span><ChevronRight /></GlassCard>
    <span className="screen-footnote">{completedUnits.length} лекции завршени · <DemoCaption /></span>
  </div>;
}

function VoucherCard({ voucher, onUse }: { voucher: ReturnType<typeof useDemoStore.getState>['vouchers'][number]; onUse: () => void }) {
  const [showQr, setShowQr] = useState(false);
  const qrPattern = Array.from({ length: 49 }, (_, index) => (voucher.code.charCodeAt(index % voucher.code.length) * (index + 3)) % 7 < 3);
  return <GlassCard className="ticket-card">
    <div className="ticket-left"><span className="brand-monogram tone-2">{voucher.brand.slice(0, 2).toUpperCase()}</span><div><b>{voucher.brand}</b><span>{formatDenar(voucher.value)}</span><small>Важи до {voucher.expires}</small></div></div>
    {showQr && <div className="voucher-qr"><div className="qr-pattern" aria-label="Демонстрациски QR-код">{qrPattern.map((filled, index) => <i className={filled ? 'filled' : ''} key={index} />)}</div><b>{voucher.code}</b><small>Демо QR-код · не е за вистинско плаќање</small></div>}
    <button className="ticket-use" disabled={voucher.used} onClick={() => voucher.used ? undefined : showQr ? onUse() : setShowQr(true)}>{voucher.used ? 'Искористен' : showQr ? 'Означи како искористен' : 'Прикажи QR-код'}</button>
  </GlassCard>;
}

function MunicipalScreen({ tab, reports, orders, ballots, actions, onCreateOrder, onAdvanceOrder, onPublishAction, onPublishPoll, onSheet, onAlarm, onReportSelect }: {
  tab: number; reports: ReturnType<typeof useDemoStore.getState>['reports']; orders: ReturnType<typeof useDemoStore.getState>['orders']; ballots: ReturnType<typeof useDemoStore.getState>['ballots']; actions: ReturnType<typeof useDemoStore.getState>['actions']; onCreateOrder: (id: string) => void; onAdvanceOrder: (id: string, proof?: boolean) => void; onPublishAction: (action: { title: string; place: string; date: string; reward: number; organiser: 'Општина' }) => void; onPublishPoll: (poll: { question: string; description: string; options: string[] }) => void; onSheet: (sheet: SheetType) => void; onAlarm: (district: string, kind: string) => void; onReportSelect: (report: Report) => void;
}) {
  const [district, setDistrict] = useState('Стајковци');
  const [alarmKind, setAlarmKind] = useState('Пожар');
  const [actionTitle, setActionTitle] = useState('');
  const [actionPlace, setActionPlace] = useState('');
  const [reward, setReward] = useState(60);
  const [proofId, setProofId] = useState<string | null>(null);
  const [proofAdded, setProofAdded] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('Каде да се постави нова зелена зона?');
  const [pollOptions, setPollOptions] = useState(['Карпош 4', 'Тафталиџе', 'Дебар Маало']);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const timer = window.setTimeout(() => setLoading(false), 550); return () => window.clearTimeout(timer); }, [tab]);
  if (tab === 0) return <div className="screen-body"><div className="map-dashboard"><Suspense fallback={<div className="map-skeleton" />}>
    <MapScreen reports={reports} onSelect={onReportSelect} />
  </Suspense><div className="map-dashboard-title"><span className="live-dot" /> Живи пријави</div></div>
    <div className="counter-grid"><Metric label="Нови" value={reports.filter((report) => report.status === 'Пријавено').length} icon={<Bell />} /><Metric label="Во обработка" value={reports.filter((report) => report.status === 'Примено' || report.status === 'Во процес').length} icon={<Activity />} /><Metric label="Критични" value={reports.filter((report) => report.priority === 'Критично').length} icon={<Flame />} /></div>
    <div className="section-inline"><div><h2>Пријави што бараат внимание</h2><p>Приоритетот е означен со боја и текст.</p></div><DemoCaption /></div>
    {loading ? <SkeletonRows /> : <div className="stack">{reports.slice(0, 8).map((report) => <ReportCard key={report.id} report={report} onCreateOrder={onCreateOrder} onClick={() => onReportSelect(report)} />)}</div>}
  </div>;
  if (tab === 1) return <div className="screen-body"><div className="order-stepper"><span className="active">Примено</span><i /><span>Во процес</span><i /><span>Завршено</span></div><div className="section-inline"><h2>Дигитални налози</h2><DemoCaption /></div><div className="stack">{orders.map((order) => <GlassCard key={order.id} className="order-card"><div className="order-head"><span className="eyebrow">{order.id}</span><StatusPill text={order.status} /></div><h3>{order.place}</h3><p><Users size={14} /> {order.team} · Пријава {order.reportId}</p>{order.status !== 'Завршено' ? <PrimaryButton secondary onClick={() => order.status === 'Примено' ? onAdvanceOrder(order.id) : (setProofAdded(false), setProofId(order.id))}>{order.status === 'Примено' ? 'Започни работа' : 'Заврши со фото-доказ'}</PrimaryButton> : <div className="proof-complete"><CheckCircle2 /> Завршено со фото-доказ</div>}</GlassCard>)}</div>{proofId && <div className="modal-backdrop"><div className="modal-sheet"><div className="sheet-handle" /><button className="sheet-close" onClick={() => setProofId(null)} aria-label="Затвори"><X /></button><h2>Додај фото-доказ</h2><p>Прикачи демонстрациска фотографија од исчистената локација.</p><button className={`photo-placeholder ${proofAdded ? 'added' : ''}`} onClick={() => setProofAdded((added) => !added)}><Plus /><span>{proofAdded ? 'Демонстрациска фотографија е додадена' : 'Додај фотографија'}</span></button><PrimaryButton disabled={!proofAdded} onClick={() => { onAdvanceOrder(proofId, true); setProofId(null); setProofAdded(false); }}>Потврди завршување</PrimaryButton></div></div>}<DemoCaption /></div>;
  if (tab === 2) return <div className="screen-body"><GlassCard className="form-card"><span className="eyebrow">НОВА АНКЕТА</span><h2>Прашај ја заедницата</h2><input placeholder="Прашање за жителите" value={pollQuestion} onChange={(event) => setPollQuestion(event.target.value)} /><div className="poll-options">{pollOptions.map((option, index) => <input aria-label={`Опција ${index + 1}`} key={index} value={option} onChange={(event) => setPollOptions((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} />)}</div><PrimaryButton disabled={!pollQuestion.trim() || pollOptions.some((option) => !option.trim())} onClick={() => { onPublishPoll({ question: pollQuestion.trim(), description: 'Гласај за приоритетот на твојата општина.', options: pollOptions.map((option) => option.trim()) }); setPollQuestion(''); setPollOptions(['', '', '']); }}><Plus size={16} /> Објави анкета</PrimaryButton></GlassCard><div className="section-inline"><h2>Резултати во живо</h2><DemoCaption /></div><div className="stack">{ballots.map((ballot) => <GlassCard className="ballot-card" key={ballot.id}><span className="eyebrow">ОПШТИНСКИ ЕКО ГЛАС</span><h3>{ballot.question}</h3>{ballot.options.map((option, index) => { const total = ballot.votes.reduce((a, b) => a + b, 0); return <div className="result-row" key={option}><div><span>{option}</span><b>{total ? Math.round(ballot.votes[index]! / total * 100) : 0}%</b></div><ProgressBar value={ballot.votes[index]!} max={total || 1} /></div>; })}</GlassCard>)}</div></div>;
  if (tab === 3) return <div className="screen-body"><GlassCard className="form-card"><span className="eyebrow">КРЕИРАЈ ЕКО-АКЦИЈА</span><h2>Повикај ја заедницата</h2><input placeholder="Име на активност" value={actionTitle} onChange={(event) => setActionTitle(event.target.value)} /><input placeholder="Локација" value={actionPlace} onChange={(event) => setActionPlace(event.target.value)} /><label className="range-label">Награда <b>+{reward} токени</b></label><input type="range" min="20" max="100" step="10" value={reward} onChange={(event) => setReward(Number(event.target.value))} /><small className="muted-copy">Максимум 100 токени, зависно од обемот и траењето.</small><PrimaryButton onClick={() => { onPublishAction({ title: actionTitle || 'Нова еко-акција во соседството', place: actionPlace || 'Скопје', date: 'Сабота, 09:00', reward: Math.min(100, reward), organiser: 'Општина' }); setActionTitle(''); setActionPlace(''); }}>Објави активност</PrimaryButton></GlassCard><div className="section-inline"><h2>Претстојни активности</h2><DemoCaption /></div><div className="stack">{actions.map((action) => <ActionCard action={action} key={action.id} />)}</div></div>;
  if (tab === 4) return <div className="screen-body"><GlassCard className="form-card alarm-composer"><span className="eyebrow">БОТ-АЛАРМ · ДЕМО</span><h2>Извести ги жителите</h2><div className="horizontal-chips">{['Стајковци', 'Центар', 'Аеродром'].map((place) => <button className={district === place ? 'selected' : ''} key={place} onClick={() => setDistrict(place)}>{place}</button>)}</div><div className="horizontal-chips">{['Пожар', 'Чад', 'Диви депонии'].map((kind) => <button className={alarmKind === kind ? 'selected' : ''} key={kind} onClick={() => setAlarmKind(kind)}>{kind}</button>)}</div><div className="alert-preview"><span className="live-dot" /> <b>Аларм за {alarmKind.toLowerCase()} во близина на {district}</b><p>Бидете подготвени и внимателни. Следете ги насоките од надлежните служби.</p></div><PrimaryButton onClick={() => onAlarm(district, alarmKind)}>Испрати до жителите <Send size={16} /></PrimaryButton></GlassCard><div className="section-inline"><h2>Службена комуникација</h2><DemoCaption /></div><div className="stack">{['ЈКП „Комунална хигиена“', 'Иницијатива „Чисто Водно“', 'Еко-служба Аеродром'].map((name, i) => <GlassCard className="thread-row" key={name}><Avatar name={name} /><div><b>{name}</b><small>{['Потврда за утрешната екипа', 'Пријавена локација за проверка', 'Извештајот е подготвен'][i]}</small></div><span className="unread-count">{i + 1}</span></GlassCard>)}</div></div>;
  return <MunicipalProfile onSheet={onSheet} />;
}

function CorporateScreen({ tab, actions, issuedVouchers, usedVouchers, onSheet, onPublishAction, onSponsor }: {
  tab: number; actions: ReturnType<typeof useDemoStore.getState>['actions']; issuedVouchers: number; usedVouchers: number; onSheet: (sheet: SheetType) => void; onPublishAction: (action: { title: string; place: string; date: string; reward: number; organiser: 'Компанија' }) => void; onSponsor: (action: string) => void;
}) {
  const [reportBusy, setReportBusy] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [campaign, setCampaign] = useState('');
  const [reward, setReward] = useState(60);
  const [showPartner, setShowPartner] = useState(false);
  const [chartShift, setChartShift] = useState(0);
  useEffect(() => {
    if (tab !== 0) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setChartShift((value) => value + 1);
    }, 5_000);
    return () => window.clearInterval(timer);
  }, [tab]);
  if (tab === 0) {
    const data = Array.from({ length: 8 }, (_, index) => ({ name: ['Јан', 'Фев', 'Мар', 'Апр', 'Мај', 'Јун', 'Јул', 'Авг'][index]!, value: 42 + index * 6 + (chartShift && index === 7 ? chartShift * 2 : 0) }));
    return <div className="screen-body">
      <div className="counter-grid corporate-metrics"><Metric label="Рециклиран отпад" value={12840} suffix="кг" icon={<Recycle />} /><Metric label="Намален јаглероден отпечаток" value={3.8} suffix="т" icon={<Leaf />} /><Metric label="Вклучени учесници" value={1240} icon={<Users />} /></div>
      <DemoCaption />
      <GlassCard className="chart-card"><div className="section-inline"><div><span className="eyebrow">МЕСЕЧЕН ПРИДОНЕС</span><h2>Влијание што расте</h2></div><span className="chart-live"><i /> Во живо</span></div><div className="chart-wrap"><Suspense fallback={<div className="chart-skeleton" />}><ImpactChart data={data} /></Suspense></div><small>Индикатор за еколошко влијание · демонстрациски податоци</small></GlassCard>
      <GlassCard className="report-card"><div className="report-icon"><Activity /></div><div><span className="eyebrow">ESG ИЗВЕШТАЈ</span><h3>Месечен извештај за влијание</h3><p>Сумиран придонес за тековниот месец.</p></div><PrimaryButton secondary onClick={() => { setReportBusy(true); window.setTimeout(() => { setReportBusy(false); setReportReady(true); onSheet('archive'); }, 900); }}>{reportBusy ? 'Се подготвува…' : 'Генерирај извештај'}</PrimaryButton>{reportReady && <StatusPill text="Завршено" />}</GlassCard>
    </div>;
  }
  if (tab === 1) return <div className="screen-body"><div className="counter-grid"><Metric label="Издадени" value={issuedVouchers} icon={<Ticket />} /><Metric label="Искористени" value={usedVouchers} icon={<CheckCircle2 />} /><Metric label="Истечени" value={12} icon={<Clock3 />} /></div><DemoCaption /><GlassCard className="chart-card"><span className="eyebrow">ИСКОРИСТЕНИ ВАУЧЕРИ</span><h2>По номинална вредност</h2><div className="chart-wrap"><Suspense fallback={<div className="chart-skeleton" />}><VoucherChart /></Suspense></div></GlassCard><GlassCard className="voucher-rule"><span>2 токени = 1 денар</span><span>Ваучерот важи 3 месеци</span></GlassCard><div className="section-inline"><h2>Активни кампањи</h2><DemoCaption /></div>{brands.slice(0, 3).map((brand) => <GlassCard className="thread-row" key={brand}><span className="brand-monogram tone-1">{brand.slice(0, 2).toUpperCase()}</span><div><b>{brand} · Еко награда</b><small>Ваучери од 300, 500 и 1.000 денари</small></div><StatusPill text="Активно" /></GlassCard>)}</div>;
  if (tab === 2) return <div className="screen-body"><GlassCard className="sponsor-hero"><span className="eyebrow">ПОДДРЖИ БОДАР ЧЕКОР</span><h2>Спонзорирај еко-акција</h2><p>Видлив придонес во локалната средина.</p></GlassCard><div className="section-inline"><h2>Следни акции на TerraPulse</h2><DemoCaption /></div>{actions.map((action) => <GlassCard className="action-card" key={action.id}><div className="action-art"><Sprout size={26} /></div><div className="action-info"><span className="eyebrow">{action.date}</span><h3>{action.title}</h3><p>{action.place} · Награда +{action.reward} токени</p></div><PrimaryButton secondary onClick={() => onSponsor(action.title)}>Спонзорирај</PrimaryButton></GlassCard>)}<GlassCard className="form-card"><span className="eyebrow">СОПСТВЕНА АКЦИЈА</span><h2>Нова корпоративна акција</h2><input placeholder="Име на акцијата" value={campaign} onChange={(event) => setCampaign(event.target.value)} /><label className="range-label">Награда за учесници <b>+{reward} токени</b></label><input type="range" min="20" max="100" step="10" value={reward} onChange={(event) => setReward(Math.min(100, Number(event.target.value)))} /><small className="muted-copy">Најмногу 100 токени за корпоративна акција.</small><PrimaryButton onClick={() => { onPublishAction({ title: campaign || 'Нова корпоративна еко-акција', place: 'Скопје', date: 'Сабота, 10:00', reward: Math.min(100, reward), organiser: 'Компанија' }); setCampaign(''); }}>Објави акција</PrimaryButton></GlassCard></div>;
  if (tab === 3) return <div className="screen-body"><GlassCard className="campaign-feature"><span className="eyebrow">КАМПАЊИ ШТО ИНСПИРИРААТ</span><h2>Поврзи го брендот со вистинска промена.</h2><p>Избери формат што ја поддржува еко-заедницата.</p></GlassCard>{[['🌱', 'Промоција на зелени производи', 'Поддржи производи што траат подолго.'], ['♻️', 'Брендиран еко-предизвик', 'Покани ги луѓето да направат одржлива промена.'], ['📘', 'Спонзориран квиз', 'Сподели корисно знаење во Академијата.']].map(([icon, title, text]) => <GlassCard className="campaign-card" key={title}><span>{icon}</span><div><h3>{title}</h3><p>{text}</p></div><PrimaryButton secondary onClick={() => setShowPartner(!showPartner)}>Постави</PrimaryButton></GlassCard>)}{showPartner && <GlassCard className="quiz-preview"><span className="sponsored-label">СПОНЗОРИРАНО ОД КОМПАНИЈА (ДЕМО)</span><h3>Кој е најдобриот прв чекор за повторна употреба?</h3><div className="answer-option">Поправи го предметот кога е можно</div><PrimaryButton onClick={() => onSheet('sponsor')}>Објави предизвик</PrimaryButton></GlassCard>}</div>;
  if (tab === 4) return <div className="screen-body"><div className="section-inline"><h2>Партнерска мрежа</h2><DemoCaption /></div><GlassCard className="network-post"><div className="feed-head"><Avatar name="TerraPulse" /><div><b>TerraPulse Innovations</b><small>Пред 2 часа · Еко-партнерство</small></div><StatusPill text="Потврдено" /></div><p>Заедно со локалните служби го поддржуваме чистењето на зелените површини во Скопје.</p><div className="feed-actions"><button><Heart size={17} /> 42</button><button><MessageCircle size={17} /> 8</button><button><ArrowRight size={17} /> Сподели</button></div></GlassCard><GlassCard className="form-card"><h3>Објави одговорна иницијатива</h3><textarea placeholder="Сподели со што се гордее твојот тим..." /><PrimaryButton onClick={() => onSheet('sponsor')}>Објави во мрежата</PrimaryButton></GlassCard><div className="section-inline"><h2>Партнери</h2><span>Заедно градиме доверба</span></div><div className="brand-grid">{brands.map((brand, index) => <div className="brand-tile" key={brand}><span className={`brand-monogram tone-${index % 5}`}>{brand.slice(0, 2).toUpperCase()}</span><small>{brand}</small></div>)}</div><DemoCaption /></div>;
  return <CorporateProfile onSheet={onSheet} />;
}

function Metric({ label, value, suffix = '', icon }: { label: string; value: number; suffix?: string; icon: React.ReactNode }) {
  return <GlassCard className="metric-card"><span>{icon}</span><b>{value.toLocaleString('de-DE')}{suffix && <small>{suffix}</small>}</b><p>{label}</p><DemoCaption /></GlassCard>;
}

function ReportCard({ report, onCreateOrder, onClick }: { report: Report; onCreateOrder: (id: string) => void; onClick: () => void }) {
  return <GlassCard className="report-list-card"><button className="report-card-main" onClick={onClick}><div className={`report-icon ${report.kind === 'Пожар' ? 'fire' : ''}`}>{report.kind === 'Пожар' ? <Flame /> : <Trash2 />}</div><div className="report-main-copy"><div className="report-labels"><StatusPill text={report.priority} /><small>{report.id}</small></div><h3>{report.place}</h3><p>{report.kind} · {report.time}</p><div className="report-owner"><span>{report.user}</span><Reputation value={report.reputation} /></div></div><ChevronRight /></button><div className="report-card-actions"><StatusPill text={report.status} />{report.status === 'Пријавено' && <PrimaryButton secondary onClick={() => onCreateOrder(report.id)}>Креирај налог <ArrowRight size={14} /></PrimaryButton>}</div></GlassCard>;
}

function ActionCard({ action }: { action: ReturnType<typeof useDemoStore.getState>['actions'][number] }) {
  return <GlassCard className="action-card"><div className="action-art"><Sprout size={25} /></div><div className="action-info"><span className="eyebrow">{action.organiser} · {action.date}</span><h3>{action.title}</h3><p><MapPinned size={13} /> {action.place}</p><span className="reward-chip">+{action.reward} токени</span></div><button className="join-button">Приклучи се</button></GlassCard>;
}

function MunicipalProfile({ onSheet }: { onSheet: (sheet: SheetType) => void }) {
  const chart = [{ m: 'Јан', locations: 18, waste: 240 }, { m: 'Фев', locations: 24, waste: 310 }, { m: 'Мар', locations: 19, waste: 280 }, { m: 'Апр', locations: 32, waste: 420 }, { m: 'Мај', locations: 38, waste: 515 }];
  return <div className="screen-body"><GlassCard className="org-profile"><span className="org-seal"><ShieldCheck /></span><span className="eyebrow">ВЕРИФИКУВАНА ИНСТИТУЦИЈА</span><h2>Општина Скопје (демо)</h2><p>Служба за животна средина · kontakt@skopje.demo</p><div className="counter-grid"><Metric label="Исчистени локации" value={86} icon={<CheckCircle2 />} /><Metric label="Рециклиран отпад" value={12840} suffix="кг" icon={<Recycle />} /></div><DemoCaption /></GlassCard><GlassCard className="chart-card"><h3>Исчистени локации по месец</h3><div className="chart-wrap"><Suspense fallback={<div className="chart-skeleton" />}><MunicipalLocationChart data={chart} /></Suspense></div></GlassCard><GlassCard className="chart-card"><h3>Рециклиран отпад</h3><div className="chart-wrap"><Suspense fallback={<div className="chart-skeleton" />}><MunicipalWasteChart data={chart} /></Suspense></div></GlassCard><PrimaryButton secondary onClick={() => onSheet('archive')}>Отвори дигитален архив <ArrowRight size={16} /></PrimaryButton></div>;
}

function CorporateProfile({ onSheet }: { onSheet: (sheet: SheetType) => void }) {
  return <div className="screen-body"><GlassCard className="org-profile corporate-profile"><span className="verified-stamp"><Check /></span><span className="brand-monogram tone-3 large-monogram">TP</span><span className="eyebrow">ПОТВРДЕН БРЕНД-ПАРТНЕР</span><h2>Компанија (демо)</h2><p>Поддржуваме зелени иницијативи и одговорни избори во заедницата.</p><a href="https://terrapulse.example" onClick={(event) => event.preventDefault()}>terrapulse.example</a><div className="profile-stats"><div><Gift /><b>12</b><small>спонзорирани акции</small></div><div><Ticket /><b>248</b><small>издадени ваучери</small></div><div><Leaf /><b>3,8 т</b><small>заштеден CO₂</small></div></div><DemoCaption /></GlassCard><PrimaryButton secondary onClick={() => onSheet('archive')}>Архива на трансакции <ArrowRight size={16} /></PrimaryButton></div>;
}

function ChestSheet({ onClose, addEnergy, addTokens, earnXp, activateBoost, saveBoost }: {
  onClose: (sheet: SheetType) => void; addEnergy: (amount: number) => void; addTokens: (amount: number) => void; earnXp: (amount: number) => void; activateBoost: () => void; saveBoost: () => void;
}) {
  const [opened, setOpened] = useState(false);
  const [rarity] = useState(() => {
    const roll = Math.random() * 100;
    const [common, uncommon, epic] = RULES.chestWeights;
    return roll < common ? 'Вообичаен' : roll < common + uncommon ? 'Невообичаен' : roll < common + uncommon + epic ? 'Епски' : 'Легендарен';
  });
  const reward = rarity === 'Вообичаен' ? '+3 енергија' : rarity === 'Невообичаен' ? '+15 XP' : rarity === 'Епски' ? '2× XP за 10 минути' : '+5 Зелени Токени';
  const claim = () => {
    if (rarity === 'Вообичаен') addEnergy(3);
    if (rarity === 'Невообичаен') earnXp(15);
    if (rarity === 'Легендарен') addTokens(5);
    onClose(null);
  };
  return <div className="chest-sheet">
    <div className={`chest-illustration ${rarity.toLowerCase()}`}>{opened ? '✨' : '🎁'}</div>
    <span className="eyebrow">ЕКО-КОВЧЕГ</span>
    <h2>{opened ? rarity : 'Мало изненадување те чека.'}</h2>
    <p>{opened ? `Награда: ${reward}` : 'Ковчегот содржи една од четири можни награди.'}</p>
    {!opened ? <PrimaryButton onClick={() => { setOpened(true); fireConfetti(); }}>Отвори ковчег <Sparkles size={16} /></PrimaryButton>
      : rarity === 'Епски' ? <div className="chest-reward-actions"><PrimaryButton onClick={() => { activateBoost(); onClose(null); }}>Активирај сега</PrimaryButton><PrimaryButton secondary onClick={() => { saveBoost(); onClose(null); }}>Зачувај за подоцна</PrimaryButton></div>
        : <PrimaryButton onClick={() => { claim(); if (rarity === 'Легендарен') fireConfetti(); }}>Супер! <Check size={16} /></PrimaryButton>}
    <DemoCaption />
  </div>;
}

function SkeletonRows() {
  return <div className="stack" aria-label="Се вчитуваат пријавите">{[0, 1, 2].map((item) => <div className="skeleton-row" key={item}><i /><div><b /><span /></div></div>)}</div>;
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="empty-state"><BrandOrb size={70} /><h3>{title}</h3><p>{text}</p></div>;
}

function BottomSheet({ sheet, onClose, children }: { sheet: SheetType; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);
  return <AnimatePresence>{sheet && <motion.div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.div className="modal-sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 380, damping: 32 }} drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.1} onDragEnd={(_, info) => { if (info.offset.y > 120 || info.velocity.y > 600) onClose(); }}>
      <div className="sheet-handle" /><button className="sheet-close" onClick={onClose} aria-label="Затвори"><X /></button>{children}
    </motion.div>
  </motion.div>}</AnimatePresence>;
}

function App() {
  const {
    account, activeTab, tokens, xp, energy, streak, reputation, premium, theme, completedUnits, savedBoosts, xpMultiplierUntil,
    reports, orders, ballots, vouchers, actions, notices, messages, issuedVouchers, usedVouchers,
    setAccount, setTab, toggleTheme, setPremium, activateBoost, saveBoost, earnXp, loseEnergy, addEnergy, addTokens, watchAd, vote, addBallot, redeemVoucher,
    markVoucherUsed, addListing, addReport, confirmReport, createOrder, advanceOrder, addAction, sendAlert,
    sendMessage, resetDemo,
  } = useDemoStore();
  const [onboarding, setOnboarding] = useState<'splash' | 'welcome' | 'register' | 'login' | 'verification' | 'app'>('splash');
  const [verificationAccount, setVerificationAccount] = useState<Account>('municipal');
  const [sheet, setSheet] = useState<SheetType>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [lessonUnit, setLessonUnit] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedBrand, setSelectedBrand] = useState('Anhoch');
  const [selectedValue, setSelectedValue] = useState(300);
  const [reportStep, setReportStep] = useState(0);
  const [reportKind, setReportKind] = useState<ReportKind>('Дива депонија');
  const [reportPlace, setReportPlace] = useState('Парк во близина на мојата населба');
  const [reportNote, setReportNote] = useState('');
  const [listingKind, setListingKind] = useState<'Донација' | 'Продажба'>('Донација');
  const [listingTitle, setListingTitle] = useState('');
  const [listingPrice, setListingPrice] = useState('');
  const [fakeAd, setFakeAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [premiumBusy, setPremiumBusy] = useState(false);
  const [chatAlert, setChatAlert] = useState('');
  const [chatAlertVersion, setChatAlertVersion] = useState(0);
  const [mobileSwitcher, setMobileSwitcher] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const tabs = account === 'citizen' ? citizenTabs : account === 'municipal' ? municipalTabs : corporateTabs;
  const currentTab = tabs[activeTab] ?? tabs[0];
  const adRemaining = Math.max(0, Math.ceil((useDemoStore.getState().adReadyAt - now) / 1_000));
  const boostRemaining = Math.max(0, Math.ceil((xpMultiplierUntil - now) / 1_000));
  const selectedReportStatus = selectedReport ? reports.find((report) => report.id === selectedReport.id) : null;

  useEffect(() => {
    if (onboarding !== 'splash') return;
    const timer = window.setTimeout(() => setOnboarding('welcome'), 1_800);
    return () => window.clearTimeout(timer);
  }, [onboarding]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2_800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden) setNow(Date.now());
    }, 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!fakeAd) return;
    if (adCountdown === 0) {
      const timer = window.setTimeout(() => {
        const earned = watchAd();
        setToast({ id: Date.now(), text: earned ? '+5 енергија е додадена' : 'Рекламата не е достапна во овој момент' });
      }, 0);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setInterval(() => {
      if (!document.hidden) setAdCountdown((value) => Math.max(0, value - 1));
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [fakeAd, adCountdown, watchAd]);

  const popToast = (text: string) => setToast({ id: Date.now(), text });
  const showBrandVoucher = (brand: string, value: number) => { setSelectedBrand(brand); setSelectedValue(value); setSheet('sponsor'); };
  const purchaseVoucher = (brand: string, value: number) => {
    const success = redeemVoucher(brand, value);
    if (success) {
      setSheet(null); fireConfetti(); popToast('Ваучерот е додаден во паричникот');
    } else popToast('Немаш доволно Зелени Токени за овој ваучер');
  };
  const completeLesson = () => {
    const reward = premium ? RULES.premiumLessonXp : RULES.lessonXp;
    earnXp(reward);
    const unit = lessonUnit ?? 1;
    const existing = useDemoStore.getState().completedUnits;
    useDemoStore.setState({ completedUnits: existing.includes(unit) ? existing : [...existing, unit].sort((a, b) => a - b), streak: useDemoStore.getState().streak + 1 });
    setLessonUnit(null); fireConfetti(); popToast(`Лекцијата е завршена · +${reward} XP`);
  };
  const selectAccount = (next: Account) => { setAccount(next); setOnboarding('app'); setSheet(null); setLessonUnit(null); };
  const startVerification = (next: Account) => { setVerificationAccount(next); setSheet(null); setOnboarding('verification'); };
  const publishPoll = (poll: { question: string; description: string; options: string[] }) => {
    addBallot(poll); popToast('Анкетата е објавена и е достапна за граѓаните');
    setAccount('citizen'); setTab(2);
  };
  const publishReport = () => {
    addReport({ kind: reportKind, place: reportPlace, user: '@marija_k', reputation, priority: reportKind === 'Пожар' ? 'Критично' : reportKind === 'Дива депонија' ? 'Високо' : 'Средно' });
    setSheet(null); setReportStep(0); setReportNote(''); popToast('Пријавата е испратена'); setAccount('citizen'); setTab(3);
  };
  const createListing = () => {
    if (!listingTitle.trim()) { popToast('Внеси име на предметот'); return; }
    addListing({ title: listingTitle, category: listingKind, place: 'Центар', price: listingKind === 'Донација' ? 'Бесплатно' : `${listingPrice || '300'} ден.`, icon: listingKind === 'Донација' ? '🌿' : '♻️', seller: '@marija_k' });
    setListingTitle(''); setListingPrice(''); setSheet(null); popToast('Огласот е објавен');
  };
  const sendDemoAlert = (district: string, kind: string) => { sendAlert(district, kind); setAccount('citizen'); setTab(4); setChatAlert('Информации'); setChatAlertVersion((version) => version + 1); popToast(`Алармот е испратен до жителите на ${district}`); };
  const publishAction = (action: { title: string; place: string; date: string; reward: number; organiser: 'Општина' | 'Компанија' }) => {
    addAction(action); popToast('Еко-акцијата е објавена'); setAccount('citizen'); setTab(4); setChatAlert('Официјални акции'); setChatAlertVersion((version) => version + 1);
  };
  const onSheetClose = () => setSheet(null);

  return <main className="app-world">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <div className="demo-layout">
      <aside className="presenter-panel">
        <EcoGridLogo size={50} /><span className="presenter-label">ДЕМО ЗА ПРЕЗЕНТАЦИЈА</span>
        <h1>Една мрежа.<br /><span>Заедничка промена.</span></h1>
        <p>EcoGrid ги поврзува граѓаните, институциите и компаниите во една еколошка приказна.</p>
        <div className="presenter-rule"><span><Users size={17} /> Граѓани</span><i /><span><ShieldCheck size={17} /> Општини</span><i /><span><BriefcaseBusiness size={17} /> Компании</span></div>
        <GlassCard className="demo-switcher"><div className="demo-switcher-head"><span>ПРЕКЛУЧИ ДЕМО-АКАУНТ</span><span className="live-dot" /></div>{(['citizen', 'municipal', 'corporate'] as const).map((item) => <button key={item} className={`switcher-option ${account === item ? 'active' : ''}`} onClick={() => selectAccount(item)}><span className={`switcher-icon ${item}`}><AccountGlyph account={item} /></span><span><b>{accountNames[item]}</b><small>{item === 'citizen' ? 'Учи, пријавувај и освојувај' : item === 'municipal' ? 'Пријави, налози и известувања' : 'ESG, ваучери и спонзорства'}</small></span>{account === item ? <CheckCircle2 /> : <ChevronRight />}</button>)}<button className="reset-demo" onClick={() => { resetDemo(); popToast('Демото е вратено на почетните податоци'); }}><Recycle size={16} /> Ресетирај демо</button></GlassCard>
        <div className="presenter-foot"><span>ПРЕЗЕНТАЦИЈА НА ПРОИЗВОД</span><span>Македонија · 2026</span></div>
      </aside>

      <section className="phone-frame" aria-label="EcoGrid демо-апликација">
        <div className="phone-bezel"><div className="phone-screen">
          <div className="status-bar"><span>9:41</span><span className="status-icons"><span>●●●</span><span>◔</span><span className="battery-shape" /></span></div>
          <AnimatePresence mode="wait">
            {onboarding === 'splash' && <motion.div className="splash-screen" key="splash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -30 }}><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 18 }}><BrandOrb size={110} /></motion.div><motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}><EcoGridLogo size={44} /></motion.div><motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>Заедно за почиста Македонија</motion.p><span className="splash-loader" /></motion.div>}
            {onboarding === 'welcome' && <Welcome key="welcome" onEnter={() => setOnboarding('app')} onRegister={() => setOnboarding('register')} onLogin={() => setOnboarding('login')} />}
            {(onboarding === 'register' || onboarding === 'login') && <AuthForm key={onboarding} mode={onboarding} onBack={() => setOnboarding('welcome')} onDone={() => { setOnboarding('app'); popToast('Добредојде во EcoGrid'); }} onInstitution={() => setSheet('business')} />}
            {onboarding === 'verification' && <VerificationScreen account={verificationAccount} onDone={() => { selectAccount(verificationAccount); popToast('Демо-профилот е верификуван'); }} />}
            {onboarding === 'app' && <motion.div key="app" className="app-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <header className="app-topbar">
                <div className="mobile-brand"><EcoGridLogo size={34} compact /><b>Eco<span>Grid</span></b></div>
                <button className="mobile-switch-trigger" onClick={() => setMobileSwitcher(!mobileSwitcher)} aria-label="Преклопи демо-акаунт"><MoreHorizontal size={18} /></button>
                {account === 'citizen' ? <>
                  <button className="top-chip flame-chip" onClick={() => setSheet('streak')} aria-label="Отвори ја низата"><Flame size={16} /><b>{streak}</b></button>
                  <button className="top-chip token-chip" onClick={() => setSheet('tokens')} aria-label="Отвори токени"><GreenToken size={20} /><b>{formatTokens(tokens)}</b></button>
                  <button className="top-chip energy-chip" onClick={() => setSheet('energy')} aria-label="Отвори енергија"><BatteryCharging size={17} /><b>{energy}/{premium ? 50 : 25}</b><Plus size={12} /></button>
                </> : <div className="org-topline"><span className={`org-top-icon ${account}`}><AccountGlyph account={account} /></span><div><b>{account === 'municipal' ? 'Општина Скопје' : 'Компанија (демо)'}</b><small><ShieldCheck size={12} /> Верификуван профил</small></div></div>}
              </header>
              {mobileSwitcher && <div className="mobile-switch-menu">{(['citizen', 'municipal', 'corporate'] as const).map((item) => <button key={item} onClick={() => { selectAccount(item); setMobileSwitcher(false); }} className={account === item ? 'active' : ''}><AccountGlyph account={item} />{accountNames[item]}</button>)}<button onClick={() => { resetDemo(); setMobileSwitcher(false); popToast('Демото е ресетирано'); }}><Recycle />Ресетирај демо</button></div>}
              <div className="screen-heading-wrap"><ScreenHeader account={account} tab={currentTab} index={activeTab} /></div>
              <AnimatePresence mode="wait">
                <motion.section className="active-screen" key={`${account}-${activeTab}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.24 }}>
                  {account === 'citizen' && activeTab === 0 && <Academy completedUnits={completedUnits} premium={premium} onStart={(unit) => { if (energy <= 0) setSheet('energy'); else setLessonUnit(unit); }} onSwitch={(value) => value === 'Еко-ковчег' ? (setSelectedBrand('Еко-ковчег'), setSheet('sponsor')) : undefined} />}
                  {account === 'citizen' && activeTab === 1 && <Marketplace onSheet={setSheet} onRedeem={showBrandVoucher} balance={tokens} />}
                  {account === 'citizen' && activeTab === 2 && <VoiceScreen ballots={ballots} onVote={(id, choice) => { vote(id, choice); popToast('Твојот глас е забележан'); }} onPublish={() => setSheet('institution')} />}
                  {account === 'citizen' && activeTab === 3 && <CitizenMap reports={reports} onReport={() => { setReportStep(0); setSheet('report'); }} onSelect={setSelectedReport} onConfirm={(id) => { confirmReport(id); popToast('Ја потврди пријавата'); }} />}
                  {account === 'citizen' && activeTab === 4 && <EcoChat key={`${chatAlert}-${chatAlertVersion}`} notices={notices} messages={messages} initialSection={chatAlert || 'Информации'} onSend={(text) => sendMessage(text)} />}
                  {account === 'citizen' && activeTab === 5 && <Profile onSheet={setSheet} premium={premium} tokens={tokens} xp={xp} streak={streak} reputation={reputation} vouchers={vouchers} savedBoosts={savedBoosts} boostRemaining={boostRemaining} onActivateBoost={() => { if (activateBoost(true)) popToast('2× XP бустерот е активен 10 минути'); }} onTheme={toggleTheme} theme={theme} onReset={() => { resetDemo(); popToast('Демото е вратено на почеток'); }} completedUnits={completedUnits} />}
                  {account === 'municipal' && <MunicipalScreen tab={activeTab} reports={reports} orders={orders} ballots={ballots} actions={actions} onCreateOrder={(id) => { createOrder(id); popToast('Дигиталниот налог е креиран'); }} onAdvanceOrder={(id, proof) => { advanceOrder(id, proof); popToast(proof ? 'Граѓаните се известени во Информации' : 'Статусот на налогот е ажуриран'); }} onPublishAction={publishAction} onPublishPoll={publishPoll} onSheet={setSheet} onAlarm={sendDemoAlert} onReportSelect={setSelectedReport} />}
                  {account === 'corporate' && <CorporateScreen tab={activeTab} actions={actions} issuedVouchers={issuedVouchers} usedVouchers={usedVouchers} onSheet={setSheet} onPublishAction={(action) => publishAction({ ...action, organiser: 'Компанија' })} onSponsor={(action) => { setSelectedBrand(action); setSheet('sponsor'); }} />}
                </motion.section>
              </AnimatePresence>
              <nav className="bottom-nav" aria-label="Главна навигација">{tabs.map((tab, index) => <button key={tab} onClick={() => setTab(index)} className={`nav-item ${activeTab === index ? 'active' : ''}`} aria-current={activeTab === index ? 'page' : undefined}><span className="nav-indicator">{activeTab === index && <motion.i layoutId="nav-indicator" />}</span><span className="nav-icon">{tabIcons[account][index]}</span><small>{tab}</small>{account === 'citizen' && index === 4 && notices.some((notice) => notice.kind === 'alert') && <i className="nav-dot" />}</button>)}</nav>
            </motion.div>}
          </AnimatePresence>
          <AnimatePresence>{toast && <motion.div className="toast-message" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}><CheckCircle2 size={17} />{toast.text}<button onClick={() => setToast(null)} aria-label="Затвори известување"><X size={15} /></button></motion.div>}</AnimatePresence>
          <AnimatePresence>{lessonUnit !== null && <LessonPlayer unit={lessonUnit} premium={premium} energy={energy} onClose={() => { setLessonUnit(null); if (energy <= 0) setSheet('energy'); }} onMistake={loseEnergy} onFinish={completeLesson} />}</AnimatePresence>
          {selectedReport && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedReport(null); }}><motion.div className="modal-sheet report-detail" initial={{ y: 80 }} animate={{ y: 0 }}><div className="sheet-handle" /><button className="sheet-close" onClick={() => setSelectedReport(null)} aria-label="Затвори"><X /></button><span className="eyebrow">{selectedReport.id} · {selectedReportStatus?.status}</span><h2>{selectedReport.kind}</h2><p><MapPinned size={15} /> {selectedReport.place}</p><div className="report-detail-photo"><Recycle size={34} /><span>ФОТО · ДЕМО ПРИКАЗ</span></div><div className="report-owner"><Avatar name={selectedReport.user} /><span>{selectedReport.user}<small>Пријавувач</small></span><Reputation value={selectedReport.reputation} /></div><p>{selectedReport.time} · {selectedReport.confirmations} потврди</p><PrimaryButton onClick={() => { confirmReport(selectedReport.id); popToast('Ја потврди пријавата'); setSelectedReport(null); }}>Потврди пријава <Check size={17} /></PrimaryButton></motion.div></div>}
          <BottomSheet sheet={sheet} onClose={onSheetClose}>
            {sheet === 'energy' && <><span className="sheet-icon energy"><BatteryCharging /></span><span className="eyebrow">ЕНЕРГИЈА</span><h2>Продолжи со учење</h2><p>Грешките трошат енергија. Една демонстрациска реклама додава 5 единици.</p><div className="energy-large"><BatteryCharging size={30} /><b>{energy} / {premium ? 50 : 25}</b></div><ProgressBar value={energy} max={premium ? 50 : 25} /><PrimaryButton disabled={premium || energy >= (premium ? 50 : 25) || adRemaining > 0} onClick={() => { if (premium) return; setAdCountdown(5); setFakeAd(true); setSheet(null); }}>{adRemaining > 0 ? `Почекај ${adRemaining} сек.` : 'Гледај реклама · +5'} <ArrowRight size={16} /></PrimaryButton>{!premium && <PrimaryButton secondary onClick={() => setSheet('premium')}>Земи Премиум · 300 ден./мес.</PrimaryButton>}</>}
            {sheet === 'business' && <><span className="eyebrow">СЛУЖБЕН ДЕМО-ПРОФИЛ</span><h2>Избери тип на профил</h2><p>Избери организација за да поминеш низ демонстрациска верификација. Нема реално плаќање или проверка на документи.</p><div className="business-options"><button onClick={() => startVerification('municipal')}><ShieldCheck /><span><b>Општина / ЈКП</b><small>План: {formatDenar(RULES.municipalPrice)} · симулирана проверка</small></span><ChevronRight /></button><button onClick={() => startVerification('corporate')}><BriefcaseBusiness /><span><b>Компанија</b><small>План: {formatDenar(RULES.corporatePrice)} · симулирана проверка</small></span><ChevronRight /></button></div><DemoCaption /></>}
            {sheet === 'streak' && <><span className="sheet-icon streak"><Flame /></span><span className="eyebrow">ТВОЈАТА НИЗА</span><h2>{streak} дена по ред</h2><p>Врати се утре за да ја продолжиш еко-низата.</p><div className="calendar-grid">{['П', 'В', 'С', 'Ч', 'П', 'С', 'Н'].map((day, index) => <span className="calendar-day-label" key={`${day}-${index}`}>{day}</span>)}{Array.from({ length: 35 }, (_, index) => <i className={index > 28 ? 'empty' : index < 17 ? 'complete' : index === 17 ? 'today' : ''} key={index}>{index <= 28 ? index + 1 : ''}</i>)}</div><div className="freeze-line"><ShieldCheck size={18} /> Преостанати Streak Freeze: {premium ? '2' : '1'} · овој месец</div><DemoCaption /></>}
            {sheet === 'tokens' && <><span className="sheet-icon"><GreenToken size={36} /></span><span className="eyebrow">ЗЕЛЕНИ ТОКЕНИ</span><h2>{formatTokens(tokens)} токени</h2><p>2 токени = 1 денар · Најголемата награда доаѓа од вистински еко-акции.</p><div className="earning-list">{[['Еко-акција во Водно', '+200'], ['Завршена лекција', '+25 XP'], ['Награда од неделната лига', '+5']].map(([item, gain]) => <div key={item}><span><Sprout size={16} />{item}</span><b>{gain}</b></div>)}</div><PrimaryButton onClick={() => { setSheet(null); setTab(1); }}>Оди во ваучери <ArrowRight size={16} /></PrimaryButton><DemoCaption /></>}
            {sheet === 'premium' && <><span className="sheet-icon premium"><Sparkles /></span><span className="eyebrow">ЕКОГРИД ПРЕМИУМ</span><h2>Повеќе за планетата.</h2><p className="price-line">300 ден. <small>/ месечно</small></p><div className="benefit-list">{[['2×', 'Траен 2x XP бустер'], ['⚡', '50 енергија наместо 25'], ['❄', '2 Streak Freeze месечно'], ['✓', 'Без присилни реклами']].map(([symbol, text]) => <div key={text}><span>{symbol}</span>{text}</div>)}</div><PrimaryButton disabled={premium || premiumBusy} onClick={async () => { setPremiumBusy(true); await pause(1_200); setPremium(); setPremiumBusy(false); setSheet(null); fireConfetti(); popToast('EcoGrid Премиум е активиран'); }}>{premiumBusy ? 'Се активира…' : premium ? 'Премиум е активен' : 'Активирај Премиум'}</PrimaryButton></>}
            {sheet === 'wallet' && <><span className="sheet-icon"><Ticket /></span><span className="eyebrow">ДИГИТАЛЕН ПАРИЧНИК</span><h2>Мои ваучери</h2><p>Секој ваучер важи 3 месеци од подигнувањето.</p>{vouchers.length ? <div className="wallet-list">{vouchers.map((voucher) => <VoucherCard key={voucher.id} voucher={voucher} onUse={() => { markVoucherUsed(voucher.id); popToast('Ваучерот е означен како искористен'); }} />)}</div> : <EmptyState title="Паричникот е празен" text="Подигни ваучер во маркетплејсот и зачувај го тука." />}<PrimaryButton secondary onClick={() => { setSheet(null); setTab(1); }}>Оди во маркетплејс</PrimaryButton></>}
            {sheet === 'sponsor' && <>{selectedBrand === 'Еко-ковчег' ? <ChestSheet onClose={setSheet} addEnergy={addEnergy} addTokens={addTokens} earnXp={earnXp} activateBoost={() => { activateBoost(); popToast('2× XP бустерот е активен 10 минути'); }} saveBoost={() => { saveBoost(); popToast('Бустерот е зачуван во профилот'); }} /> : <><span className="eyebrow">{account === 'corporate' ? 'СПОНЗОРСТВО' : 'ПАРТНЕРСКИ ВАУЧЕР'}</span><h2>{brands.includes(selectedBrand) ? selectedBrand : 'Поддржи еко-акција'}</h2>{brands.includes(selectedBrand) ? <><p>Избери вредност за ваучерот што го поддржува твојот еко-придонес.</p><div className="denomination-list">{RULES.vouchers.map((voucher) => <button key={voucher.value} className={`denomination ${selectedValue === voucher.value ? 'selected' : ''}`} onClick={() => setSelectedValue(voucher.value)}><div><b>{formatDenar(voucher.value)}</b><span>{formatTokens(voucher.tokens)} токени</span></div><span>{tokens >= voucher.tokens ? <CheckCircle2 /> : `Недостасуваат ${formatTokens(voucher.tokens - tokens)}`}</span><ProgressBar value={tokens} max={voucher.tokens} /></button>)}</div><small className="muted-copy">Важи 3 месеци од подигнувањето.</small><PrimaryButton disabled={tokens < selectedValue * RULES.tokensPerDenar} onClick={() => purchaseVoucher(selectedBrand, selectedValue)}>Подигни ваучер · {formatTokens(selectedValue * RULES.tokensPerDenar)} <GreenToken size={18} /></PrimaryButton></> : <><p>Придонеси за акцијата „{selectedBrand}“ и поддржи учесници.</p><label className="field"><span>Износ за поддршка</span><input type="number" placeholder="Износ во денари" /></label><label className="settings-row"><span>Прикажи го партнерството</span><i className="switch on" /></label><PrimaryButton onClick={() => { setSheet(null); popToast('Спонзорството е потврдено во демо'); }}>Потврди спонзорство</PrimaryButton></>}</>}</>}
            {sheet === 'listing' && <><span className="eyebrow">ЗЕЛЕН ПЛУС</span><h2>Објави корисен предмет</h2><div className="horizontal-chips">{(['Донација', 'Продажба'] as const).map((item) => <button key={item} className={listingKind === item ? 'selected' : ''} onClick={() => setListingKind(item)}>{item}</button>)}</div><button className="photo-placeholder" onClick={(event) => event.currentTarget.classList.toggle('added')}><Plus /><span>Додај фотографија</span></button><label className="field"><span>Име на предметот</span><input placeholder="На пример: Книги за природа" value={listingTitle} onChange={(event) => setListingTitle(event.target.value)} /></label><label className="field"><span>Категорија</span><select defaultValue="Дом и градина"><option>Дом и градина</option><option>Облека</option><option>Електроника</option><option>Книги</option><option>Играчки</option></select></label>{listingKind === 'Продажба' && <label className="field"><span>Цена во денари</span><input type="number" placeholder="300" value={listingPrice} onChange={(event) => setListingPrice(event.target.value)} /></label>}<label className="field"><span>Опис и локација</span><textarea placeholder="Опиши ја состојбата и местото за преземање" /></label><PrimaryButton onClick={createListing}>Објави оглас <ArrowRight size={16} /></PrimaryButton></>}
            {sheet === 'report' && <><span className="eyebrow">ПРИЈАВА · ЧЕКОР {reportStep + 1} ОД 4</span><ProgressBar value={reportStep + 1} max={4} /><h2>{['Што забележа?', 'Означи ја локацијата', 'Додај детали', 'Провери и испрати'][reportStep]}</h2>{reportStep === 0 ? <div className="report-kind-list">{(['Пожар', 'Дива депонија', 'Сомнителен чад'] as const).map((kind) => <button className={`report-kind ${reportKind === kind ? 'selected' : ''}`} key={kind} onClick={() => setReportKind(kind)}>{kind === 'Пожар' ? <Flame /> : kind === 'Дива депонија' ? <Trash2 /> : <Activity />}{kind}<ChevronRight /></button>)}</div> : reportStep === 1 ? <><div className="report-location-preview"><MapPinned size={28} /><span>Пин-позиција на картата</span></div><label className="field"><span>Место или населба</span><input value={reportPlace} onChange={(event) => setReportPlace(event.target.value)} /></label></> : reportStep === 2 ? <><button className="photo-placeholder" onClick={(event) => event.currentTarget.classList.toggle('added')}><Plus /><span>Додај фотографија (по избор)</span></button><label className="field"><span>Кратка белешка</span><textarea placeholder="Што треба да знае општината?" value={reportNote} onChange={(event) => setReportNote(event.target.value)} /></label></> : <><GlassCard className="report-summary"><StatusPill text={reportKind} /><h3>{reportPlace}</h3><p>{reportNote || 'Пријава поднесена од Еко Карта.'}</p><div className="report-owner"><Avatar name="@marija_k" /><span>@marija_k<small>Твојот профил</small></span><Reputation value={reputation} /></div></GlassCard><p className="privacy-note"><ShieldCheck size={16} /> Пријавата ќе се прикаже како @marija_k со репутација {reputation}/5.</p></>}<div className="sheet-step-actions">{reportStep > 0 && <PrimaryButton secondary onClick={() => setReportStep((value) => value - 1)}><ArrowLeft size={16} /> Назад</PrimaryButton>}<PrimaryButton onClick={() => reportStep === 3 ? publishReport() : setReportStep((value) => value + 1)}>{reportStep === 3 ? 'Испрати пријава' : 'Продолжи'} <ArrowRight size={16} /></PrimaryButton></div></>}
            {sheet === 'archive' && <><span className="sheet-icon"><PackageCheck /></span><span className="eyebrow">ДИГИТАЛЕН АРХИВ</span><h2>{account === 'corporate' ? 'Трансакции и ESG' : 'Општински извештаи'}</h2><p>Демонстрациски документи за тековниот период.</p>{['Месечен еко-извештај · мај', 'Преглед на активни ваучери', 'Извештај за спроведени акции'].map((item) => <GlassCard key={item} className="archive-row"><span><PackageCheck />{item}</span><button onClick={(event) => { event.currentTarget.innerHTML = '✓'; }}>Преземи</button></GlassCard>)}</>}
            {sheet === 'institution' && <><span className="sheet-icon"><Vote /></span><span className="eyebrow">ЗАЕДНИЧКА ИНИЦИЈАТИВА</span><h2>Твојот предлог е важен</h2><p>Во оваа демонстрација, предлозите и анкетите се објавуваат од верификуван општински профил.</p><PrimaryButton onClick={() => { setSheet(null); setAccount('municipal'); setTab(2); }}>Отвори општинско демо <ArrowRight size={16} /></PrimaryButton></>}
          </BottomSheet>
          {fakeAd && <div className="ad-overlay"><div className="ad-scene"><span className="ad-label">РЕКЛАМА · ДЕМО</span><BrandOrb size={86} /><span className="ad-shape">ECO</span><h2>Избери навика што остава помал отпечаток.</h2><p>Ова е симулирана реклама. Нема реални огласи или плаќања.</p><div className="ad-countdown">{adCountdown > 0 ? adCountdown : <Check />}</div>{adCountdown <= 0 && <PrimaryButton onClick={() => setFakeAd(false)}>Затвори</PrimaryButton>}</div></div>}
          {account === 'citizen' && activeTab === 1 && onboarding === 'app' && <button className="green-plus" aria-label="Објави оглас" onClick={() => { setListingKind('Донација'); setSheet('listing'); }}><Plus /></button>}
        </div></div>
      </section>
    </div>
  </main>;
}

function AccountGlyph({ account }: { account: Account }) {
  return account === 'citizen' ? <Leaf size={17} /> : account === 'municipal' ? <ShieldCheck size={17} /> : <BriefcaseBusiness size={17} />;
}

function CitizenMap({ reports, onReport, onSelect, onConfirm }: { reports: ReturnType<typeof useDemoStore.getState>['reports']; onReport: () => void; onSelect: (report: Report) => void; onConfirm: (id: string) => void }) {
  return <div className="citizen-map-screen"><Suspense fallback={<div className="map-skeleton" />}><MapScreen reports={reports} onSelect={onSelect} /></Suspense><div className="map-map-title"><span><MapPinned size={15} /> Еко Карта</span><small>Пожари и диви депонии</small></div><div className="map-report-list"><div className="section-inline"><h2>Пријави во близина</h2><DemoCaption /></div>{reports.slice(0, 3).map((report) => <GlassCard key={report.id} className="map-report-row"><button onClick={() => onSelect(report)}><span className={`mini-map-pin ${report.kind === 'Пожар' ? 'fire' : ''}`}>{report.kind === 'Пожар' ? <Flame /> : <Recycle />}</span><span><b>{report.place}</b><small>{report.kind} · {report.time}</small><Reputation value={report.reputation} /></span><StatusPill text={report.status} /></button><button className="confirm-button" onClick={() => onConfirm(report.id)}><Check size={14} /> Потврди · {report.confirmations}</button></GlassCard>)}</div><button className="map-report-button" onClick={onReport}><Plus size={18} /> Пријави</button></div>;
}

export default App;
