import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Account, Ballot, Report, ReportStatus, Voucher } from './data';
import { seedBallots, seedReports } from './data';
import { RULES } from './rules';

export type Listing = { id: string; title: string; category: 'Донација' | 'Продажба'; place: string; price: string; icon: string; seller: string };
export type Order = { id: string; reportId: string; place: string; team: string; status: 'Примено' | 'Во процес' | 'Завршено'; proof: boolean };
export type EcoAction = { id: string; title: string; place: string; date: string; reward: number; organiser: 'Општина' | 'TerraPulse' | 'Компанија' };
export type Notice = { id: string; title: string; text: string; source: string; time: string; kind: 'alert' | 'update' | 'action' };

type DemoState = {
  account: Account;
  activeTab: number;
  tokens: number;
  xp: number;
  energy: number;
  streak: number;
  reputation: number;
  premium: boolean;
  xpMultiplierUntil: number;
  savedBoosts: number;
  theme: 'dark' | 'light';
  completedUnits: number[];
  reports: Report[];
  orders: Order[];
  ballots: Ballot[];
  vouchers: Voucher[];
  listings: Listing[];
  actions: EcoAction[];
  notices: Notice[];
  messages: { id: string; author: string; text: string; time: string; mine: boolean }[];
  issuedVouchers: number;
  usedVouchers: number;
  adReadyAt: number;
  setAccount: (account: Account) => void;
  setTab: (tab: number) => void;
  toggleTheme: () => void;
  setPremium: () => void;
  activateBoost: (consumeSaved?: boolean) => boolean;
  saveBoost: () => void;
  earnXp: (amount: number) => void;
  loseEnergy: () => void;
  addEnergy: (amount: number) => void;
  addTokens: (amount: number) => void;
  watchAd: () => boolean;
  vote: (ballotId: string, option: number) => void;
  addBallot: (ballot: Omit<Ballot, 'id' | 'votes' | 'deadline' | 'voted' | 'closed'>) => void;
  redeemVoucher: (brand: string, value: number) => boolean;
  markVoucherUsed: (voucherId: string) => void;
  addListing: (listing: Omit<Listing, 'id'>) => void;
  addReport: (report: Omit<Report, 'id' | 'time' | 'status' | 'confirmations'>) => void;
  confirmReport: (reportId: string) => void;
  createOrder: (reportId: string) => void;
  advanceOrder: (orderId: string, proof?: boolean) => void;
  addAction: (action: Omit<EcoAction, 'id'>) => void;
  sendAlert: (district: string, kind: string) => void;
  sendMessage: (text: string) => void;
  resetDemo: () => void;
};

const initialState = {
  account: 'citizen' as Account,
  activeTab: 0,
  tokens: 1_240,
  xp: 1_250,
  energy: 25,
  streak: 12,
  reputation: 4,
  premium: false,
  xpMultiplierUntil: 0,
  savedBoosts: 0,
  theme: 'dark' as const,
  completedUnits: [1, 2, 3, 4, 5, 6, 7],
  reports: seedReports,
  orders: [
    { id: 'НАЛ-0142', reportId: 'EG-2041', place: 'Пат кон Водно, Центар', team: 'Екипа 2', status: 'Примено' as const, proof: false },
    { id: 'НАЛ-0141', reportId: 'EG-2040', place: 'Стајковци, Скопје', team: 'Екипа 1', status: 'Во процес' as const, proof: false },
    { id: 'НАЛ-0140', reportId: 'EG-2037', place: 'Тетово, покрај реката', team: 'Екипа 3', status: 'Завршено' as const, proof: true },
  ],
  ballots: seedBallots,
  vouchers: [] as Voucher[],
  listings: [
    { id: 'L-1', title: 'Саксија од теракота', category: 'Донација' as const, place: 'Центар', price: 'Бесплатно', icon: '🪴', seller: '@marija_k' },
    { id: 'L-2', title: 'Детска сликовница', category: 'Донација' as const, place: 'Карпош', price: 'Бесплатно', icon: '📚', seller: '@ana_n' },
    { id: 'L-3', title: 'Дрвена столица', category: 'Донација' as const, place: 'Аеродром', price: 'Бесплатно', icon: '🪑', seller: '@petar.mk' },
    { id: 'L-4', title: 'Планинарски ранец', category: 'Донација' as const, place: 'Чаир', price: 'Бесплатно', icon: '🎒', seller: '@ekoana' },
    { id: 'L-5', title: 'Керамички сет', category: 'Продажба' as const, place: 'Кисела Вода', price: '400 ден.', icon: '🍵', seller: '@dimitar.s' },
    { id: 'L-6', title: 'Книги за природа', category: 'Продажба' as const, place: 'Центар', price: '250 ден.', icon: '📗', seller: '@mila_p' },
    { id: 'L-7', title: 'Полица од дрво', category: 'Продажба' as const, place: 'Карпош', price: '900 ден.', icon: '🪵', seller: '@zelena_vida' },
    { id: 'L-8', title: 'Настолна ламба', category: 'Продажба' as const, place: 'Гази Баба', price: '600 ден.', icon: '💡', seller: '@eko_tetovo' },
    { id: 'L-9', title: 'Детски велосипед', category: 'Продажба' as const, place: 'Аеродром', price: '1.800 ден.', icon: '🚲', seller: '@ana_n' },
    { id: 'L-10', title: 'Зимска јакна', category: 'Продажба' as const, place: 'Ѓорче Петров', price: '700 ден.', icon: '🧥', seller: '@petar.mk' },
    { id: 'L-11', title: 'Саксиско цвеќе', category: 'Продажба' as const, place: 'Центар', price: '180 ден.', icon: '🌿', seller: '@ekoana' },
    { id: 'L-12', title: 'Метален термос', category: 'Продажба' as const, place: 'Капиштец', price: '350 ден.', icon: '🥤', seller: '@dimitar.s' },
  ],
  actions: [
    { id: 'A-1', title: 'Чистење на кејот на Вардар', place: 'Кеј на Вардар', date: 'Сабота, 09:00', reward: 100, organiser: 'Општина' as const },
    { id: 'A-2', title: 'Зелено Водно — месечна акција', place: 'Средно Водно', date: 'Недела, 10:00', reward: 200, organiser: 'TerraPulse' as const },
    { id: 'A-3', title: 'Соседска акција во Аеродром', place: 'Парк Аеродром', date: '20 јуни, 09:30', reward: 80, organiser: 'Општина' as const },
  ],
  notices: [
    { id: 'N-1', title: 'Локален аларм за пожар во близина на Стајковци', text: 'Бидете подготвени и внимателни. Следете ги насоките од надлежните служби.', source: 'ЦУК · АВТОМАТСКИ', time: 'пред 2 мин.', kind: 'alert' as const },
    { id: 'N-2', title: 'Пријавата EG-2041 е примена', text: 'Екипа ќе ја провери локацијата кај патот кон Водно.', source: 'Општина (демо)', time: 'пред 8 мин.', kind: 'update' as const },
    { id: 'N-3', title: 'Чистење на кејот на Вардар', text: 'Приклучи се на следната официјална еко-акција.', source: 'Официјална еко-акција', time: 'вчера', kind: 'action' as const },
    { id: 'N-4', title: 'Известување за чад во Аеродром', text: 'Службите ја проверуваат пријавата. Избегнувај го просторот додека не добиеш потврда дека е безбеден.', source: 'ЦУК · ИЗВЕСТУВАЊЕ', time: 'пред 12 мин.', kind: 'alert' as const },
    { id: 'N-5', title: 'Екипата пристигна кај патот кон Водно', text: 'Пријавата EG-2041 е преземена од комуналната екипа. Следи го статусот во Еко Картата.', source: 'Општина (демо)', time: 'пред 18 мин.', kind: 'update' as const },
    { id: 'N-6', title: 'Акција за чистење во Аеродром', text: 'Соседите се собираат во сабота во 09:30 кај паркот. Понеси ракавици и шише за вода.', source: 'Општина (демо)', time: 'пред 30 мин.', kind: 'action' as const },
  ],
  messages: [
    { id: 'M-1', author: '@eko_skopje', text: 'Во сабота се гледаме на кејот! Ќе донесам вреќи за селекција.', time: '09:18', mine: false },
    { id: 'M-2', author: '@marija_k', text: 'Одлично, јас ќе понесам ракавици 🌱', time: '09:21', mine: true },
    { id: 'M-3', author: '@dimitar.s', text: 'Има ли место за уште двајца?', time: '09:24', mine: false },
    { id: 'M-4', author: '@eko_skopje', text: 'Секако! Ќе имаме дополнителни ракавици и вреќи за селекција.', time: '09:26', mine: false },
    { id: 'M-5', author: '@zelena_vida', text: 'Пријавата кај Водно е преземена од екипата. Ви благодарам за брзата реакција!', time: '09:31', mine: false },
  ],
  issuedVouchers: 248,
  usedVouchers: 172,
  adReadyAt: 0,
};

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setAccount: (account) => set({ account, activeTab: 0 }),
      setTab: (activeTab) => set({ activeTab }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setPremium: () => set({ premium: true, energy: Math.min(50, get().energy + 25) }),
      activateBoost: (consumeSaved = false) => {
        const state = get();
        if (consumeSaved && state.savedBoosts < 1) return false;
        set((current) => ({ xpMultiplierUntil: Date.now() + 10 * 60 * 1_000, savedBoosts: consumeSaved ? current.savedBoosts - 1 : current.savedBoosts }));
        return true;
      },
      saveBoost: () => set((state) => ({ savedBoosts: state.savedBoosts + 1 })),
      earnXp: (amount) => set((state) => ({ xp: state.xp + (Date.now() < state.xpMultiplierUntil ? amount * 2 : amount) })),
      loseEnergy: () => set((state) => ({ energy: Math.max(0, state.energy - 1) })),
      addEnergy: (amount) => set((state) => ({ energy: Math.min(state.premium ? RULES.premiumEnergyCap : RULES.energyCap, state.energy + amount) })),
      addTokens: (amount) => set((state) => ({ tokens: state.tokens + amount })),
      watchAd: () => {
        if (get().premium || Date.now() < get().adReadyAt) return false;
        set((state) => ({ energy: Math.min(RULES.energyCap, state.energy + RULES.adEnergy), adReadyAt: Date.now() + RULES.adCooldownSeconds * 1_000 }));
        return true;
      },
      vote: (ballotId, option) => set((state) => ({
        ballots: state.ballots.map((ballot) => ballot.id === ballotId && ballot.voted === undefined && !ballot.closed
          ? { ...ballot, votes: ballot.votes.map((count, index) => count + (index === option ? 1 : 0)), voted: option }
          : ballot),
      })),
      addBallot: (ballot) => set((state) => ({
        ballots: [{ ...ballot, id: `V-${Date.now()}`, votes: ballot.options.map(() => 0), deadline: 'Завршува за 7 дена' }, ...state.ballots],
      })),
      redeemVoucher: (brand, value) => {
        const cost = value * RULES.tokensPerDenar;
        if (get().tokens < cost) return false;
        const expires = new Date();
        expires.setMonth(expires.getMonth() + RULES.voucherValidityMonths);
        const code = `ECO-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        set((state) => ({
          tokens: state.tokens - cost,
          issuedVouchers: state.issuedVouchers + 1,
          vouchers: [{ id: `W-${Date.now()}`, brand, value, code, expires: expires.toLocaleDateString('mk-MK'), used: false }, ...state.vouchers],
        }));
        return true;
      },
      markVoucherUsed: (voucherId) => set((state) => ({
        vouchers: state.vouchers.map((voucher) => voucher.id === voucherId ? { ...voucher, used: true } : voucher),
        usedVouchers: state.usedVouchers + 1,
      })),
      addListing: (listing) => set((state) => ({ listings: [{ ...listing, id: `L-${Date.now()}` }, ...state.listings] })),
      addReport: (report) => set((state) => {
        const id = `EG-${2042 + state.reports.length - seedReports.length}`;
        return {
          reports: [{ ...report, id, time: 'токму сега', status: 'Пријавено', confirmations: 0 }, ...state.reports],
          notices: [{ id: `N-${Date.now()}`, title: `Новата пријава ${id} е испратена`, text: `Пријавата за „${report.kind}“ кај ${report.place} е доставена до надлежната служба.`, source: 'Општина (демо)', time: 'токму сега', kind: 'update' }, ...state.notices],
        };
      }),
      confirmReport: (reportId) => set((state) => ({ reports: state.reports.map((report) => report.id === reportId ? { ...report, confirmations: report.confirmations + 1 } : report) })),
      createOrder: (reportId) => set((state) => {
        const report = state.reports.find((item) => item.id === reportId);
        if (!report || state.orders.some((order) => order.reportId === reportId)) return state;
        const order: Order = { id: `НАЛ-${String(140 + state.orders.length).padStart(4, '0')}`, reportId, place: report.place, team: 'Екипа 2', status: 'Примено', proof: false };
        return {
          orders: [order, ...state.orders],
          reports: state.reports.map((item) => item.id === reportId ? { ...item, status: 'Примено' } : item),
          notices: [{ id: `N-${Date.now()}`, title: `Пријавата ${reportId} е примена`, text: `Отворен е дигитален налог ${order.id} за локацијата ${report.place}.`, source: 'Општина (демо)', time: 'токму сега', kind: 'update' }, ...state.notices],
        };
      }),
      advanceOrder: (orderId, proof = false) => set((state) => {
        const order = state.orders.find((item) => item.id === orderId);
        if (!order) return state;
        const nextStatus: Order['status'] = order.status === 'Примено' ? 'Во процес' : 'Завршено';
        if (nextStatus === 'Завршено' && !proof) return state;
        const nextOrder = { ...order, status: nextStatus, proof: nextStatus === 'Завршено' || order.proof };
        const report = state.reports.find((item) => item.id === order.reportId);
        return {
          orders: state.orders.map((item) => item.id === orderId ? nextOrder : item),
          reports: state.reports.map((item) => item.id === order.reportId ? { ...item, status: nextStatus === 'Завршено' ? 'Исчистено' : nextStatus } as Report : item),
          notices: [{ id: `N-${Date.now()}`, title: `${order.id}: ${nextStatus === 'Завршено' ? 'Локацијата е исчистена' : nextStatus}`, text: `${report?.place ?? order.place} · ${nextStatus === 'Завршено' ? 'Фотографски доказ е доставен.' : 'Статусот на налогот е ажуриран.'}`, source: 'Општина (демо)', time: 'токму сега', kind: 'update' }, ...state.notices],
        };
      }),
      addAction: (action) => set((state) => ({ actions: [{ ...action, id: `A-${Date.now()}` }, ...state.actions], notices: [{ id: `N-${Date.now()}`, title: action.title, text: `${action.place} · Награда +${action.reward} токени`, source: 'Официјална еко-акција', time: 'токму сега', kind: 'action' }, ...state.notices] })),
      sendAlert: (district, kind) => set((state) => ({ notices: [{ id: `N-${Date.now()}`, title: `Аларм за ${kind.toLowerCase()} во близина на ${district}`, text: 'Бидете подготвени и внимателни. Следете ги насоките од надлежните служби.', source: 'ЦУК · АВТОМАТСКИ', time: 'токму сега', kind: 'alert' }, ...state.notices] })),
      sendMessage: (text) => set((state) => ({ messages: [...state.messages, { id: `M-${Date.now()}`, author: '@marija_k', text, time: new Date().toLocaleTimeString('mk-MK', { hour: '2-digit', minute: '2-digit' }), mine: true }] })),
      resetDemo: () => set({ ...initialState }),
    }),
    { name: 'ecogrid-demo-v1', storage: createJSONStorage(() => localStorage) },
  ),
);

export type { ReportStatus };
