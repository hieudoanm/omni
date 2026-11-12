'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { db } from '@/lib/office/keynotes/db';
import { templateById } from '@/data/office/keynotes/templates';
import { themeById } from '@/data/office/keynotes/themes';
import { cloneDeck, newDeck, newSlide } from '@/lib/office/keynotes/deckFactory';
import { generateId } from '@/lib/office/keynotes/id';
import { alignObjects, type AlignAction } from '@/lib/office/keynotes/geometry';
import type {
  Deck,
  DeckSnapshot,
  DeckSummary,
  DeckTheme,
  FillStyle,
  QaQuestion,
  Slide,
  SlideComment,
  SlideLayoutId,
  SlideObject,
  SlideTransition,
  AppSettings,
} from '@/types/keynotes/deck';

interface Peer {
  id: string;
  name: string;
  color: string;
  deckId: string;
  lastSeen: number;
}

interface RealtimeMessage {
  type: 'deck' | 'presence';
  deckId?: string;
  deck?: Deck;
  peer?: Peer;
}

interface DeckContextType {
  decks: DeckSummary[];
  loadingDecks: boolean;
  reloadDecks: () => void;
  createDeck: (partial?: Partial<Deck>) => Promise<string>;
  createDeckFromTemplate: (templateId: string) => Promise<string>;
  importDeck: (text: string) => Promise<string>;
  deleteDeck: (id: string) => Promise<void>;
  duplicateDeck: (id: string) => Promise<string>;
  renameDeck: (id: string, title: string) => Promise<void>;

  currentDeck: Deck | null;
  openDeck: (id: string) => Promise<void>;
  closeDeck: () => void;
  saveDeck: () => Promise<void>;
  mutate: (fn: (deck: Deck) => Deck, record?: boolean) => void;
  mutateLive: (fn: (deck: Deck) => Deck) => void;
  snapshotHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  activeSlide: Slide | null;
  activeSlideId: string | null;
  activeSlideIndex: number;
  setActiveSlide: (id: string) => void;
  addSlide: (layout: SlideLayoutId) => void;
  duplicateSlide: (id: string) => void;
  deleteSlide: (id: string) => void;
  moveSlide: (id: string, dir: -1 | 1) => void;
  reorderSlides: (from: number, to: number) => void;
  toggleSlideHidden: (id: string) => void;
  setSlideBackground: (fill: FillStyle) => void;
  setSlideNotes: (notes: string) => void;
  setSlideTransition: (transition: SlideTransition) => void;
  setSlideAutoAdvance: (seconds?: number) => void;
  setSlideName: (name: string) => void;

  selectedObjectIds: string[];
  setSelection: (ids: string[]) => void;
  selectObject: (id: string, additive?: boolean) => void;
  addObject: (obj: SlideObject) => string;
  updateObject: (id: string, patch: Partial<SlideObject>) => void;
  updateObjects: (ids: string[], patch: Partial<SlideObject>) => void;
  deleteObject: (id: string) => void;
  duplicateObject: (id: string) => void;
  duplicateSelected: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  alignSelected: (action: AlignAction) => void;
  groupSelected: () => void;
  ungroup: (groupId: string) => void;
  setObjectAnimation: (id: string, animation: SlideObject['animation']) => void;

  setDeckTitle: (title: string) => void;
  setDeckThemeId: (themeId: string) => void;
  setDeckTheme: (theme: DeckTheme) => void;
  setDeckSize: (w: number, h: number) => void;
  setFooter: (patch: Partial<Deck['footer']>) => void;

  comments: SlideComment[];
  addComment: (slideId: string, text: string) => void;
  toggleCommentResolved: (id: string) => void;
  deleteComment: (id: string) => void;
  addCommentReply: (commentId: string, text: string) => void;

  snapshots: DeckSnapshot[];
  createSnapshot: (label?: string) => Promise<void>;
  restoreSnapshot: (snapshotId: string) => Promise<void>;
  deleteSnapshot: (id: string) => Promise<void>;

  peers: Peer[];
  questions: QaQuestion[];
  addQuestion: (text: string) => void;
  upvoteQuestion: (id: string) => void;
  markQuestionAnswered: (id: string) => void;

  settings: AppSettings | null;
  saveSettings: (patch: Partial<AppSettings>) => Promise<void>;
  peerName: string;
  peerColor: string;
  setPeerName: (name: string) => void;
  setPeerColor: (color: string) => void;
}

const DeckContext = createContext<DeckContextType | null>(null);
export const useDeck = (): DeckContextType => {
  const ctx = useContext(DeckContext);
  if (!ctx) throw new Error('useDeck must be used within DeckProvider');
  return ctx;
};

const HISTORY_LIMIT = 100;

const cloneSlide = (slide: Slide): Slide => JSON.parse(JSON.stringify(slide)) as Slide;
const cloneObject = (obj: SlideObject): SlideObject =>
  JSON.parse(JSON.stringify(obj)) as SlideObject;

const toSummary = (deck: Deck): DeckSummary => ({
  id: deck.id,
  title: deck.title,
  description: deck.description,
  updatedAt: deck.updatedAt,
  createdAt: deck.createdAt,
  slideCount: deck.slides.length,
  themeId: deck.themeId,
});

export const DeckProvider = ({ children }: { children: ReactNode }) => {
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  const [undoStack, setUndoStack] = useState<Deck[]>([]);
  const [redoStack, setRedoStack] = useState<Deck[]>([]);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
  const setSelection = setSelectedObjectIds;
  const [snapshots, setSnapshots] = useState<DeckSnapshot[]>([]);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const deckRef = useRef<Deck | null>(null);
  const [questions, setQuestions] = useState<QaQuestion[]>([]);
  const peerRef = useRef<Peer | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const peerName =
    typeof window !== 'undefined' ? (localStorage.getItem('keynotes:name') ?? 'Guest') : 'Guest';
  const peerColor =
    typeof window !== 'undefined'
      ? (localStorage.getItem('keynotes:color') ?? '#6366f1')
      : '#6366f1';

  const setPeerName = useCallback((name: string) => {
    if (typeof window !== 'undefined') localStorage.setItem('keynotes:name', name);
    if (peerRef.current) peerRef.current = { ...peerRef.current, name };
  }, []);
  const setPeerColor = useCallback((color: string) => {
    if (typeof window !== 'undefined') localStorage.setItem('keynotes:color', color);
    if (peerRef.current) peerRef.current = { ...peerRef.current, color };
  }, []);

  const reloadDecks = useCallback(async () => {
    setLoadingDecks(true);
    const all = await db.decks.getAll();
    setDecks(all.map(toSummary).sort((a, b) => b.updatedAt - a.updatedAt));
    setLoadingDecks(false);
  }, []);

  useEffect(() => {
    reloadDecks();
    db.settings.get().then((s) => {
      setSettings(
        s ?? {
          id: 'app',
          theme: 'dark',
          defaultSlideSize: '16-9',
          defaultTheme: 'midnight',
          autosave: true,
        },
      );
    });
  }, [reloadDecks]);

  const persist = useCallback(async (deck: Deck) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    const debounce = Number(process.env.NEXT_PUBLIC_AUTOSAVE_DEBOUNCE_MS ?? 500);
    saveTimerRef.current = setTimeout(async () => {
      await db.decks.put(deck);
    }, debounce);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    deckRef.current = currentDeck;
    if (currentDeck) {
      persist(currentDeck);
      const current = deckRef.current;
      if (current) {
        channelRef.current?.postMessage({
          type: 'deck',
          deckId: current.id,
          deck: current,
        } satisfies RealtimeMessage);
      }
    }
  }, [currentDeck, persist]);

  useEffect(() => {
    if (!currentDeck) return;
    db.versions.getAll(currentDeck.id).then(setSnapshots);
  }, [currentDeck]);

  // Realtime (mock via BroadcastChannel)
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('keynotes-realtime');
    channelRef.current = channel;
    const peer: Peer = {
      id: generateId('peer'),
      name: peerName,
      color: peerColor,
      deckId: '',
      lastSeen: Date.now(),
    };
    peerRef.current = peer;

    const onMessage = (event: MessageEvent<RealtimeMessage>) => {
      const msg = event.data;
      if (msg.type === 'presence') {
        setPeers((p) => {
          const others = p.filter((x) => x.id !== msg.peer?.id);
          if (!msg.peer) return others;
          const now = Date.now();
          const fresh = { ...msg.peer, lastSeen: now };
          return [...others.filter((x) => x.id !== fresh.id), fresh];
        });
      } else if (msg.type === 'deck' && msg.deck && msg.deckId) {
        setCurrentDeck((cur) => {
          if (!cur || cur.id !== msg.deckId) return cur;
          if (JSON.stringify(cur) === JSON.stringify(msg.deck)) return cur;
          return msg.deck as Deck;
        });
      }
    };
    channel.addEventListener('message', onMessage);

    const heartbeat = setInterval(() => {
      channel.postMessage({
        type: 'presence',
        peer: {
          ...peerRef.current!,
          deckId: deckRef.current?.id ?? '',
          lastSeen: Date.now(),
        },
      } satisfies RealtimeMessage);
      setPeers((p) => p.filter((x) => Date.now() - x.lastSeen < 5000));
    }, 2000);

    channel.postMessage({
      type: 'presence',
      peer: {
        ...peer,
        deckId: deckRef.current?.id ?? '',
        lastSeen: Date.now(),
      },
    } satisfies RealtimeMessage);

    return () => {
      clearInterval(heartbeat);
      channel.removeEventListener('message', onMessage);
      channel.close();
      channelRef.current = null;
    };
  }, []);

  const mutate = useCallback((fn: (deck: Deck) => Deck, record = true) => {
    setCurrentDeck((cur) => {
      if (!cur) return cur;
      const next = fn(cloneDeck(cur));
      if (JSON.stringify(next) === JSON.stringify(cur)) return cur;
      if (record) {
        setUndoStack((u) => [...u.slice(-(HISTORY_LIMIT - 1)), cur]);
        setRedoStack([]);
      }
      return next;
    });
  }, []);

  const mutateLive = useCallback((fn: (deck: Deck) => Deck) => {
    setCurrentDeck((cur) => (cur ? fn(cloneDeck(cur)) : cur));
  }, []);

  const snapshotHistory = useCallback(() => {
    setCurrentDeck((cur) => {
      if (cur) setUndoStack((u) => [...u.slice(-(HISTORY_LIMIT - 1)), cur]);
      return cur;
    });
  }, []);

  const undo = useCallback(() => {
    setUndoStack((u) => {
      if (u.length === 0) return u;
      const prev = u[u.length - 1];
      setRedoStack((r) => [...r, deckRef.current as Deck]);
      setCurrentDeck(cloneDeck(prev));
      return u.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack((r) => {
      if (r.length === 0) return r;
      const next = r[r.length - 1];
      setUndoStack((u) => [...u, deckRef.current as Deck]);
      setCurrentDeck(cloneDeck(next));
      return r.slice(0, -1);
    });
  }, []);

  const openDeck = useCallback(async (id: string) => {
    const deck = await db.decks.get(id);
    if (!deck) return;
    setCurrentDeck(cloneDeck(deck));
    setUndoStack([]);
    setRedoStack([]);
    setSelectedObjectIds([]);
    const first = deck.slides.find((s) => !s.hidden);
    setActiveSlideId(first?.id ?? deck.slides[0]?.id ?? null);
  }, []);

  const closeDeck = useCallback(() => {
    setCurrentDeck(null);
    setUndoStack([]);
    setRedoStack([]);
    setSelectedObjectIds([]);
    setActiveSlideId(null);
  }, []);

  const saveDeck = useCallback(async () => {
    if (!deckRef.current) return;
    const deck = { ...deckRef.current, updatedAt: Date.now() };
    await db.decks.put(deck);
    setCurrentDeck(deck);
    setDecks((all) => {
      const rest = all.filter((d) => d.id !== deck.id);
      return [toSummary(deck), ...rest].sort((a, b) => b.updatedAt - a.updatedAt);
    });
  }, []);

  const createDeck = useCallback(
    async (partial?: Partial<Deck>): Promise<string> => {
      const deck = newDeck(partial);
      if (deck.slides.length === 0) {
        deck.slides = [newSlide('cover', deck.theme, 1)];
      }
      deck.updatedAt = Date.now();
      await db.decks.put(deck);
      await reloadDecks();
      return deck.id;
    },
    [reloadDecks],
  );

  const createDeckFromTemplate = useCallback(
    async (templateId: string): Promise<string> => {
      const template = templateById(templateId);
      if (!template) throw new Error('Template not found');
      const deck = template.build();
      deck.title = template.name;
      await db.decks.put(deck);
      await reloadDecks();
      return deck.id;
    },
    [reloadDecks],
  );

  const importDeck = useCallback(
    async (text: string): Promise<string> => {
      const parsed = JSON.parse(text) as Deck;
      const deck = newDeck(parsed);
      if (deck.slides.length === 0) throw new Error('Deck has no slides');
      await db.decks.put(deck);
      await reloadDecks();
      return deck.id;
    },
    [reloadDecks],
  );

  const deleteDeck = useCallback(
    async (id: string) => {
      await db.decks.delete(id);
      if (currentDeck?.id === id) closeDeck();
      await reloadDecks();
    },
    [currentDeck, closeDeck, reloadDecks],
  );

  const duplicateDeck = useCallback(
    async (id: string): Promise<string> => {
      const deck = await db.decks.get(id);
      if (!deck) throw new Error('Deck not found');
      const copy = cloneDeck(deck);
      copy.id = generateId('deck');
      copy.title = `${deck.title} copy`;
      copy.createdAt = Date.now();
      copy.updatedAt = Date.now();
      await db.decks.put(copy);
      await reloadDecks();
      return copy.id;
    },
    [reloadDecks],
  );

  const renameDeck = useCallback(
    async (deckId: string, title: string) => {
      if (currentDeck?.id === deckId) {
        mutate((d) => ({ ...d, title }), false);
      }
      const deck = await db.decks.get(deckId);
      if (deck) {
        deck.title = title;
        await db.decks.put(deck);
      }
      await reloadDecks();
    },
    [currentDeck, mutate, reloadDecks],
  );

  const activeSlide = currentDeck?.slides.find((s) => s.id === activeSlideId) ?? null;
  const activeSlideIndex = activeSlideId
    ? (currentDeck?.slides.findIndex((s) => s.id === activeSlideId) ?? -1)
    : -1;

  const setActiveSlide = useCallback((id: string) => {
    setActiveSlideId(id);
    setSelectedObjectIds([]);
  }, []);

  const mutateActiveSlide = useCallback(
    (fn: (slide: Slide) => Slide, record = true) => {
      mutate(
        (deck) => ({
          ...deck,
          slides: deck.slides.map((s) => (s.id === activeSlideId ? fn(cloneSlide(s)) : s)),
        }),
        record,
      );
    },
    [activeSlideId, mutate],
  );

  const addSlide = useCallback(
    (layout: SlideLayoutId) => {
      if (!currentDeck) return;
      const index = activeSlideIndex >= 0 ? activeSlideIndex + 1 : currentDeck.slides.length;
      const slide = newSlide(layout, currentDeck.theme, index + 1);
      mutate((deck) => {
        const slides = [...deck.slides];
        slides.splice(index, 0, slide);
        return { ...deck, slides };
      });
      setActiveSlideId(slide.id);
      setSelectedObjectIds([]);
    },
    [currentDeck, activeSlideIndex, mutate],
  );

  const duplicateSlide = useCallback(
    (id: string) => {
      mutate((deck) => {
        const index = deck.slides.findIndex((s) => s.id === id);
        if (index < 0) return deck;
        const copy = cloneSlide(deck.slides[index]);
        copy.id = generateId('sld');
        copy.name = `${copy.name} copy`;
        const slides = [...deck.slides];
        slides.splice(index + 1, 0, copy);
        return { ...deck, slides };
      });
    },
    [mutate],
  );

  const deleteSlide = useCallback(
    (id: string) => {
      mutate((deck) => {
        if (deck.slides.length <= 1) return deck;
        const slides = deck.slides.filter((s) => s.id !== id);
        const nextId = slides.find((s) => !s.hidden)?.id ?? slides[0].id;
        setActiveSlideId(nextId);
        setSelectedObjectIds([]);
        return { ...deck, slides };
      });
    },
    [mutate],
  );

  const moveSlide = useCallback(
    (id: string, dir: -1 | 1) => {
      mutate((deck) => {
        const index = deck.slides.findIndex((s) => s.id === id);
        const to = index + dir;
        if (index < 0 || to < 0 || to >= deck.slides.length) return deck;
        const slides = [...deck.slides];
        const [item] = slides.splice(index, 1);
        slides.splice(to, 0, item);
        return { ...deck, slides };
      });
    },
    [mutate],
  );

  const reorderSlides = useCallback(
    (from: number, to: number) => {
      mutate((deck) => {
        if (from < 0 || to < 0 || from >= deck.slides.length || to >= deck.slides.length) {
          return deck;
        }
        const slides = [...deck.slides];
        const [item] = slides.splice(from, 1);
        slides.splice(to, 0, item);
        return { ...deck, slides };
      });
    },
    [mutate],
  );

  const toggleSlideHidden = useCallback(
    (id: string) => {
      mutate((deck) => ({
        ...deck,
        slides: deck.slides.map((s) => (s.id === id ? { ...s, hidden: !s.hidden } : s)),
      }));
    },
    [mutate],
  );

  const setSlideBackground = useCallback(
    (fill: FillStyle) => mutateActiveSlide((s) => ({ ...s, background: fill })),
    [mutateActiveSlide],
  );

  const setSlideNotes = useCallback(
    (notes: string) => mutateActiveSlide((s) => ({ ...s, notes })),
    [mutateActiveSlide],
  );

  const setSlideTransition = useCallback(
    (transition: SlideTransition) => mutateActiveSlide((s) => ({ ...s, transition })),
    [mutateActiveSlide],
  );

  const setSlideAutoAdvance = useCallback(
    (seconds?: number) => mutateActiveSlide((s) => ({ ...s, autoAdvance: seconds })),
    [mutateActiveSlide],
  );

  const setSlideName = useCallback(
    (name: string) => mutateActiveSlide((s) => ({ ...s, name }), false),
    [mutateActiveSlide],
  );

  const updateObject = useCallback(
    (id: string, patch: Partial<SlideObject>) => {
      mutateActiveSlide((s) => ({
        ...s,
        objects: s.objects.map((o) => (o.id === id ? ({ ...o, ...patch } as SlideObject) : o)),
      }));
    },
    [mutateActiveSlide],
  );

  const updateObjects = useCallback(
    (ids: string[], patch: Partial<SlideObject>) => {
      const set = new Set(ids);
      mutateActiveSlide((s) => ({
        ...s,
        objects: s.objects.map((o) => (set.has(o.id) ? ({ ...o, ...patch } as SlideObject) : o)),
      }));
    },
    [mutateActiveSlide],
  );

  const addObject = useCallback(
    (obj: SlideObject): string => {
      const id = obj.id ?? generateId('obj');
      const withId = { ...obj, id } as SlideObject;
      mutateActiveSlide((s) => ({
        ...s,
        objects: [...s.objects.map((o) => ({ ...o, z: o.z + 1 })), { ...withId, z: 0 }],
      }));
      setSelectedObjectIds([id]);
      return id;
    },
    [mutateActiveSlide],
  );

  const selectObject = useCallback((id: string, additive = false) => {
    setSelectedObjectIds((ids) => {
      if (additive) {
        return ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id];
      }
      return [id];
    });
  }, []);

  const deleteObject = useCallback(
    (id: string) => {
      mutateActiveSlide((s) => {
        const groupId = s.objects.find((o) => o.id === id)?.group;
        return {
          ...s,
          objects: s.objects
            .filter((o) => o.id !== id && !(o.kind === 'group' && o.children.includes(id)))
            .map((o) => (groupId && o.group === groupId ? { ...o, group: undefined } : o)),
        };
      });
      setSelectedObjectIds((ids) => ids.filter((i) => i !== id));
    },
    [mutateActiveSlide],
  );

  const duplicateObject = useCallback(
    (id: string) => {
      mutateActiveSlide((s) => {
        const obj = s.objects.find((o) => o.id === id);
        if (!obj) return s;
        const copy = cloneObject(obj);
        copy.id = generateId('obj');
        copy.x += 24;
        copy.y += 24;
        copy.name = `${obj.name} copy`;
        return { ...s, objects: [...s.objects, copy] };
      });
    },
    [mutateActiveSlide],
  );

  const duplicateSelected = useCallback(() => {
    if (selectedObjectIds.length === 0) return;
    mutateActiveSlide((s) => {
      const copies = selectedObjectIds
        .map((id) => s.objects.find((o) => o.id === id))
        .filter((o): o is SlideObject => Boolean(o))
        .map((o) => {
          const copy = cloneObject(o);
          copy.id = generateId('obj');
          copy.x += 24;
          copy.y += 24;
          copy.name = `${o.name} copy`;
          return copy;
        });
      return { ...s, objects: [...s.objects, ...copies] };
    });
  }, [selectedObjectIds, mutateActiveSlide]);

  const bringToFront = useCallback(() => {
    mutateActiveSlide((s) => {
      const set = new Set(selectedObjectIds);
      const ordered = [...s.objects].sort((a, b) => a.z - b.z);
      const maxZ = Math.max(...ordered.map((o) => o.z), 0);
      let next = maxZ;
      return {
        ...s,
        objects: ordered.map((o) => (set.has(o.id) ? { ...o, z: next++ } : o)),
      };
    });
  }, [selectedObjectIds, mutateActiveSlide]);

  const sendToBack = useCallback(() => {
    mutateActiveSlide((s) => {
      const set = new Set(selectedObjectIds);
      const ordered = [...s.objects].sort((a, b) => a.z - b.z);
      const minZ = Math.min(...ordered.map((o) => o.z), 0);
      let next = minZ - 1;
      return {
        ...s,
        objects: ordered.map((o) => (set.has(o.id) ? { ...o, z: next-- } : o)),
      };
    });
  }, [selectedObjectIds, mutateActiveSlide]);

  const bringForward = useCallback(() => {
    mutateActiveSlide((s) => {
      const set = new Set(selectedObjectIds);
      const ordered = [...s.objects].sort((a, b) => a.z - b.z);
      for (let i = ordered.length - 2; i >= 0; i--) {
        if (!set.has(ordered[i].id)) continue;
        for (let j = i + 1; j < ordered.length; j++) {
          if (!set.has(ordered[j].id)) {
            const tmp = ordered[i].z;
            ordered[i].z = ordered[j].z;
            ordered[j].z = tmp;
            break;
          }
        }
      }
      return { ...s, objects: ordered };
    });
  }, [selectedObjectIds, mutateActiveSlide]);

  const sendBackward = useCallback(() => {
    mutateActiveSlide((s) => {
      const set = new Set(selectedObjectIds);
      const ordered = [...s.objects].sort((a, b) => a.z - b.z);
      for (let i = 1; i < ordered.length; i++) {
        if (!set.has(ordered[i].id)) continue;
        for (let j = i - 1; j >= 0; j--) {
          if (!set.has(ordered[j].id)) {
            const tmp = ordered[i].z;
            ordered[i].z = ordered[j].z;
            ordered[j].z = tmp;
            break;
          }
        }
      }
      return { ...s, objects: ordered };
    });
  }, [selectedObjectIds, mutateActiveSlide]);

  const alignSelected = useCallback(
    (action: AlignAction) => {
      if (!currentDeck) return;
      mutateActiveSlide((s) => {
        const set = new Set(selectedObjectIds);
        const selected = s.objects.filter((o) => set.has(o.id));
        const aligned = alignObjects(selected, action, currentDeck.width, currentDeck.height);
        const byId = new Map(aligned.map((o) => [o.id, o]));
        return {
          ...s,
          objects: s.objects.map((o) => byId.get(o.id) ?? o),
        };
      });
    },
    [selectedObjectIds, currentDeck, mutateActiveSlide],
  );

  const groupSelected = useCallback(() => {
    if (selectedObjectIds.length < 2) return;
    mutateActiveSlide((s) => {
      const set = new Set(selectedObjectIds);
      const selected = s.objects.filter((o) => set.has(o.id));
      const minX = Math.min(...selected.map((o) => o.x));
      const minY = Math.min(...selected.map((o) => o.y));
      const maxX = Math.max(...selected.map((o) => o.x + o.w));
      const maxY = Math.max(...selected.map((o) => o.y + o.h));
      const group: SlideObject = {
        id: generateId('grp'),
        name: 'Group',
        kind: 'group',
        x: minX,
        y: minY,
        w: maxX - minX,
        h: maxY - minY,
        rotation: 0,
        opacity: 1,
        flipH: false,
        flipV: false,
        locked: false,
        hidden: false,
        z: Math.min(...selected.map((o) => o.z)),
        children: selected.map((o) => o.id),
      };
      return {
        ...s,
        objects: [...s.objects.map((o) => (set.has(o.id) ? { ...o, group: group.id } : o)), group],
      };
    });
    setSelectedObjectIds([]);
  }, [selectedObjectIds, mutateActiveSlide]);

  const ungroup = useCallback(
    (groupId: string) => {
      mutateActiveSlide((s) => ({
        ...s,
        objects: s.objects
          .filter((o) => o.id !== groupId)
          .map((o) => (o.group === groupId ? { ...o, group: undefined } : o)),
      }));
    },
    [mutateActiveSlide],
  );

  const setObjectAnimation = useCallback(
    (id: string, animation: SlideObject['animation']) => {
      mutateActiveSlide((s) => ({
        ...s,
        objects: s.objects.map((o) => (o.id === id ? { ...o, animation } : o)),
      }));
    },
    [mutateActiveSlide],
  );

  const setDeckTitle = useCallback(
    (title: string) => mutate((d) => ({ ...d, title }), false),
    [mutate],
  );

  const setDeckThemeId = useCallback(
    (themeId: string) => {
      const theme = themeById(themeId);
      mutate((d) => ({ ...d, themeId, theme }));
    },
    [mutate],
  );

  const setDeckTheme = useCallback(
    (theme: DeckTheme) => mutate((d) => ({ ...d, themeId: theme.id, theme })),
    [mutate],
  );

  const setDeckSize = useCallback(
    (w: number, h: number) => mutate((d) => ({ ...d, width: w, height: h })),
    [mutate],
  );

  const setFooter = useCallback(
    (patch: Partial<Deck['footer']>) =>
      mutate((d) => ({ ...d, footer: { ...d.footer, ...patch } })),
    [mutate],
  );

  const comments = currentDeck?.comments ?? [];

  const addComment = useCallback(
    (slideId: string, text: string) => {
      mutate((d) => ({
        ...d,
        comments: [
          ...d.comments,
          {
            id: generateId('cmt'),
            slideId,
            author: peerName,
            text,
            resolved: false,
            createdAt: Date.now(),
            replies: [],
          },
        ],
      }));
    },
    [mutate, peerName],
  );

  const toggleCommentResolved = useCallback(
    (id: string) => {
      mutate((d) => ({
        ...d,
        comments: d.comments.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c)),
      }));
    },
    [mutate],
  );

  const deleteComment = useCallback(
    (id: string) => {
      mutate((d) => ({
        ...d,
        comments: d.comments.filter((c) => c.id !== id),
      }));
    },
    [mutate],
  );

  const addCommentReply = useCallback(
    (commentId: string, text: string) => {
      mutate((d) => ({
        ...d,
        comments: d.comments.map((c) =>
          c.id === commentId
            ? {
                ...c,
                replies: [
                  ...c.replies,
                  {
                    id: generateId('rep'),
                    author: peerName,
                    text,
                    createdAt: Date.now(),
                  },
                ],
              }
            : c,
        ),
      }));
    },
    [mutate, peerName],
  );

  const createSnapshot = useCallback(
    async (label?: string) => {
      if (!currentDeck) return;
      const snapshot: DeckSnapshot = {
        id: generateId('ver'),
        deckId: currentDeck.id,
        deck: cloneDeck(currentDeck),
        label: label ?? `Version ${snapshots.length + 1}`,
        createdAt: Date.now(),
      };
      await db.versions.put(snapshot);
      setSnapshots((s) => [snapshot, ...s]);
    },
    [currentDeck, snapshots.length],
  );

  const restoreSnapshot = useCallback(
    async (snapshotId: string) => {
      const all = await db.versions.getAll(currentDeck?.id ?? '');
      const snapshot = all.find((v) => v.id === snapshotId);
      if (!snapshot) return;
      setCurrentDeck(cloneDeck(snapshot.deck));
      setUndoStack([]);
      setRedoStack([]);
      const first = snapshot.deck.slides.find((s) => !s.hidden);
      setActiveSlideId(first?.id ?? snapshot.deck.slides[0]?.id ?? null);
    },
    [currentDeck],
  );

  const deleteSnapshot = useCallback(async (id: string) => {
    await db.versions.delete(id);
    setSnapshots((s) => s.filter((v) => v.id !== id));
  }, []);

  const addQuestion = useCallback(
    (text: string) => {
      setQuestions((q) => [
        {
          id: generateId('qa'),
          text,
          author: peerName,
          upvotes: 0,
          answered: false,
          createdAt: Date.now(),
        },
        ...q,
      ]);
    },
    [peerName],
  );

  const upvoteQuestion = useCallback((id: string) => {
    setQuestions((q) => q.map((x) => (x.id === id ? { ...x, upvotes: x.upvotes + 1 } : x)));
  }, []);

  const markQuestionAnswered = useCallback((id: string) => {
    setQuestions((q) => q.map((x) => (x.id === id ? { ...x, answered: !x.answered } : x)));
  }, []);

  const saveSettings = useCallback(
    async (patch: Partial<AppSettings>) => {
      const next = { ...(settings ?? defaultSettings), ...patch, id: 'app' };
      setSettings(next);
      await db.settings.put(next);
    },
    [settings],
  );

  return (
    <DeckContext.Provider
      value={{
        decks,
        loadingDecks,
        reloadDecks,
        createDeck,
        createDeckFromTemplate,
        importDeck,
        deleteDeck,
        duplicateDeck,
        renameDeck,
        currentDeck,
        openDeck,
        closeDeck,
        saveDeck,
        mutate,
        mutateLive,
        snapshotHistory,
        undo,
        redo,
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
        activeSlide,
        activeSlideId,
        activeSlideIndex,
        setActiveSlide,
        addSlide,
        duplicateSlide,
        deleteSlide,
        moveSlide,
        reorderSlides,
        toggleSlideHidden,
        setSlideBackground,
        setSlideNotes,
        setSlideTransition,
        setSlideAutoAdvance,
        setSlideName,
        selectedObjectIds,
        setSelection,
        selectObject,
        addObject,
        updateObject,
        updateObjects,
        deleteObject,
        duplicateObject,
        duplicateSelected,
        bringToFront,
        sendToBack,
        bringForward,
        sendBackward,
        alignSelected,
        groupSelected,
        ungroup,
        setObjectAnimation,
        setDeckTitle,
        setDeckThemeId,
        setDeckTheme,
        setDeckSize,
        setFooter,
        comments,
        addComment,
        toggleCommentResolved,
        deleteComment,
        addCommentReply,
        snapshots,
        createSnapshot,
        restoreSnapshot,
        deleteSnapshot,
        peers,
        questions,
        addQuestion,
        upvoteQuestion,
        markQuestionAnswered,
        settings,
        saveSettings,
        peerName,
        peerColor,
        setPeerName,
        setPeerColor,
      }}>
      {children}
    </DeckContext.Provider>
  );
};

const defaultSettings: AppSettings = {
  id: 'app',
  theme: 'dark',
  defaultSlideSize: '16-9',
  defaultTheme: 'midnight',
  autosave: true,
};
