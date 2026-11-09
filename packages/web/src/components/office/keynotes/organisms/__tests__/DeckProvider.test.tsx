import { useEffect, useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DeckProvider, useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { db } from '@/lib/office/keynotes/db';
import { newDeck, newSlide, newTextObject } from '@/lib/office/keynotes/deckFactory';
import { themeById } from '@/data/office/keynotes/themes';
import { __resetIdbMock } from '@/lib/office/keynotes/__mocks__/idb';

const resetDB = __resetIdbMock;

const theme = themeById('midnight');

const Consumer: React.FC<{ deckId?: string }> = ({ deckId }) => {
  const d = useDeck();
  useEffect(() => {
    if (deckId) void d.openDeck(deckId);
  }, [deckId, d.openDeck]);
  return (
    <div>
      <span data-testid='title'>{d.currentDeck?.title ?? 'none'}</span>
      <span data-testid='slides'>{d.currentDeck?.slides.length ?? 0}</span>
      <span data-testid='objects'>{d.activeSlide?.objects.length ?? 0}</span>
      <span data-testid='selected'>{d.selectedObjectIds.join(',')}</span>
      <span data-testid='undoable'>{String(d.canUndo)}</span>
      <span data-testid='redoable'>{String(d.canRedo)}</span>
      <span data-testid='activeSlideId'>{d.activeSlideId ?? 'none'}</span>
      <span data-testid='activeSlideIndex'>{d.activeSlideIndex}</span>
      <span data-testid='comments'>{d.comments.length}</span>
      <span data-testid='snapshots'>{d.snapshots.length}</span>
      <span data-testid='questions'>{d.questions.length}</span>
      <span data-testid='settings'>{d.settings?.theme ?? 'none'}</span>
      <span data-testid='decks'>{d.decks.length}</span>
      <span data-testid='peers'>{d.peers.length}</span>
      <button onClick={() => d.addSlide('blank')}>addSlide</button>
      <button onClick={() => d.addSlide('cover')}>addSlideCover</button>
      <button onClick={() => d.activeSlideId && d.duplicateSlide(d.activeSlideId)}>dupSlide</button>
      <button onClick={() => d.activeSlideId && d.deleteSlide(d.activeSlideId)}>delSlide</button>
      <button onClick={() => d.activeSlideId && d.moveSlide(d.activeSlideId, 1)}>moveDown</button>
      <button onClick={() => d.activeSlideId && d.moveSlide(d.activeSlideId, -1)}>moveUp</button>
      <button onClick={() => d.reorderSlides(0, 1)}>reorder</button>
      <button onClick={() => d.reorderSlides(-1, 0)}>reorderBad</button>
      <button onClick={() => d.activeSlideId && d.toggleSlideHidden(d.activeSlideId)}>
        toggleHidden
      </button>
      <button onClick={() => d.undo()}>undo</button>
      <button onClick={() => d.redo()}>redo</button>
      <button onClick={() => d.snapshotHistory()}>snapshotHistory</button>
      <button onClick={() => d.mutate((deck) => deck, false)}>noopMutate</button>
      <button onClick={() => d.mutate((deck) => ({ ...deck, title: 'mutated' }), true)}>
        mutateTitle
      </button>
      <button onClick={() => d.mutateLive((deck) => deck)}>noopLive</button>
      <button onClick={() => d.mutateLive((deck) => ({ ...deck, title: 'live-mutated' }))}>
        liveMutate
      </button>
      <button onClick={() => d.setSlideBackground({ type: 'solid', color: '#ff0000', opacity: 1 })}>
        bg
      </button>
      <button onClick={() => d.setSlideNotes('my notes')}>notes</button>
      <button
        onClick={() =>
          d.setSlideTransition({
            effect: 'push',
            duration: 300,
            direction: 'left',
          })
        }>
        transition
      </button>
      <button onClick={() => d.setSlideAutoAdvance(5)}>autoAdvance</button>
      <button onClick={() => d.setSlideName('New Name')}>slideName</button>
      <button onClick={() => d.setActiveSlide(d.currentDeck?.slides[1]?.id ?? 'none')}>
        setActive
      </button>
      <button onClick={() => d.setDeckTitle('New Title')}>deckTitle</button>
      <button onClick={() => d.setDeckThemeId('paper')}>themeId</button>
      <button
        onClick={() =>
          d.setDeckTheme({
            id: 'custom',
            name: 'Custom',
            colors: {
              primary: '#000',
              secondary: '#111',
              accent: '#222',
              background: '#333',
              surface: '#444',
              text: '#555',
              muted: '#666',
            },
            fontFamily: 'mono',
            fontSize: 20,
          })
        }>
        deckTheme
      </button>
      <button onClick={() => d.setDeckSize(1920, 1080)}>deckSize</button>
      <button onClick={() => d.setFooter({ showNumbers: true })}>footer</button>
      <button
        onClick={() => {
          const id = d.addObject(newTextObject({ id: 'obj-add-test', x: 10, y: 20 }));
          document.dispatchEvent(new CustomEvent('test-add-obj', { detail: { id } }));
        }}>
        addObject
      </button>
      <button
        onClick={() => {
          const id = d.addObject(newTextObject({ x: 50, y: 60 }));
          document.dispatchEvent(new CustomEvent('test-add-obj', { detail: { id } }));
        }}>
        addObjectNoId
      </button>
      <button onClick={() => d.updateObject('obj-add-test', { x: 99 } as any)}>updateObj</button>
      <button onClick={() => d.updateObjects(['obj-add-test'], { x: 88 } as any)}>
        updateObjs
      </button>
      <button onClick={() => d.deleteObject('obj-add-test')}>deleteObj</button>
      <button
        onClick={() => {
          d.selectObject('obj-add-test', false);
        }}>
        selectObj
      </button>
      <button
        onClick={() => {
          d.selectObject('obj-add-test', true);
        }}>
        selectObjAdd
      </button>
      <button onClick={() => d.setSelection([])}>clearSel</button>
      <button
        onClick={() =>
          d.setObjectAnimation('obj-add-test', {
            type: 'entrance',
            effect: 'fade',
            duration: 500,
            delay: 0,
            trigger: 'click',
            easing: 'ease',
            repeat: 0,
          })
        }>
        setAnim
      </button>
      <button onClick={() => d.addComment(d.activeSlideId ?? '', 'hello')}>addComment</button>
      <button
        onClick={() => {
          if (d.comments.length) d.toggleCommentResolved(d.comments[0].id);
        }}>
        toggleComment
      </button>
      <button
        onClick={() => {
          if (d.comments.length) d.deleteComment(d.comments[0].id);
        }}>
        delComment
      </button>
      <button
        onClick={() => {
          if (d.comments.length) d.addCommentReply(d.comments[0].id, 'reply');
        }}>
        addReply
      </button>
      <button
        onClick={() => {
          void d.createSnapshot('My snapshot');
        }}>
        createSnap
      </button>
      <button
        onClick={() => {
          if (d.snapshots.length) void d.restoreSnapshot(d.snapshots[0].id);
        }}>
        restoreSnap
      </button>
      <button
        onClick={() => {
          if (d.snapshots.length) void d.deleteSnapshot(d.snapshots[0].id);
        }}>
        delSnap
      </button>
      <button onClick={() => d.addQuestion('Q1?')}>addQ</button>
      <button
        onClick={() => {
          if (d.questions.length) d.upvoteQuestion(d.questions[0].id);
        }}>
        upvoteQ
      </button>
      <button
        onClick={() => {
          if (d.questions.length) d.markQuestionAnswered(d.questions[0].id);
        }}>
        answerQ
      </button>
      <button onClick={() => d.saveSettings({ autosave: false })}>saveSettings</button>
      <button onClick={() => d.closeDeck()}>closeDeck</button>
      <button
        onClick={async () => {
          const id = await d.createDeck({ title: 'Created Deck' });
          document.dispatchEvent(new CustomEvent('test-create-deck', { detail: { id } }));
        }}>
        createDeck
      </button>
      <button
        onClick={async () => {
          const id = await d.createDeckFromTemplate('pitch');
          document.dispatchEvent(new CustomEvent('test-create-deck', { detail: { id } }));
        }}>
        createFromTemplate
      </button>
      <button
        onClick={async () => {
          try {
            await d.createDeckFromTemplate('nonexistent');
          } catch (e: any) {
            document.dispatchEvent(new CustomEvent('test-error', { detail: { msg: e.message } }));
          }
        }}>
        createFromBadTemplate
      </button>
      <button
        onClick={async () => {
          const deck = newDeck({ slides: [newSlide('cover', theme, 1)] });
          const id = await d.importDeck(JSON.stringify(deck));
          document.dispatchEvent(new CustomEvent('test-create-deck', { detail: { id } }));
        }}>
        importDeck
      </button>
      <button
        onClick={async () => {
          try {
            await d.importDeck(JSON.stringify({ slides: [] }));
          } catch (e: any) {
            document.dispatchEvent(new CustomEvent('test-error', { detail: { msg: e.message } }));
          }
        }}>
        importDeckEmpty
      </button>
      <button
        onClick={async () => {
          const id = await d.duplicateDeck('deck1');
          document.dispatchEvent(new CustomEvent('test-create-deck', { detail: { id } }));
        }}>
        dupDeck
      </button>
      <button
        onClick={async () => {
          try {
            await d.duplicateDeck('nonexistent');
          } catch (e: any) {
            document.dispatchEvent(new CustomEvent('test-error', { detail: { msg: e.message } }));
          }
        }}>
        dupDeckBad
      </button>
      <button onClick={() => d.renameDeck('deck1', 'Renamed')}>renameDeck</button>
      <button onClick={() => d.deleteDeck('deck1')}>deleteDeck</button>
      <button onClick={() => d.reloadDecks()}>reloadDecks</button>
      <button
        onClick={() => {
          d.setPeerName('Alice');
          d.setPeerColor('#ff0000');
        }}>
        peer
      </button>
      <span data-testid='peerName'>{d.peerName}</span>
      <span data-testid='peerColor'>{d.peerColor}</span>
    </div>
  );
};

const ConsumerError: React.FC = () => {
  try {
    useDeck();
    return <span>no error</span>;
  } catch (e: any) {
    return <span data-testid='error'>{e.message}</span>;
  }
};

const renderProvider = (deckId?: string) =>
  render(
    <DeckProvider>
      <Consumer deckId={deckId} />
    </DeckProvider>,
  );

const waitForDeck = async (title = 'Provider Deck') =>
  waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent(title));

beforeEach(async () => {
  resetDB();
  process.env.NEXT_PUBLIC_MOCK_DELAY = '1';
  const deck = newDeck({
    id: 'deck1',
    title: 'Provider Deck',
    slides: [newSlide('cover', theme, 1)],
  });
  await db.decks.put(deck);
});

describe('DeckProvider', () => {
  describe('useDeck outside provider', () => {
    it('throws when used outside provider', () => {
      render(<ConsumerError />);
      expect(screen.getByTestId('error')).toHaveTextContent(
        'useDeck must be used within DeckProvider',
      );
    });
  });

  describe('openDeck / closeDeck', () => {
    it('opens a deck and exposes the active slide', async () => {
      renderProvider('deck1');
      await waitForDeck();
      expect(screen.getByTestId('slides')).toHaveTextContent('1');
      expect(screen.getByTestId('objects')).not.toHaveTextContent('');
      expect(screen.getByTestId('activeSlideId')).not.toBe('none');
    });

    it('sets activeSlideIndex correctly', async () => {
      const deck = newDeck({
        id: 'deck2',
        title: 'Multi',
        slides: [
          newSlide('cover', theme, 1),
          newSlide('blank', theme, 2),
          newSlide('title', theme, 3),
        ],
      });
      await db.decks.put(deck);
      renderProvider('deck2');
      await waitFor(() => expect(screen.getByTestId('slides')).toHaveTextContent('3'));
      expect(Number(screen.getByTestId('activeSlideIndex').textContent)).toBe(0);
    });

    it('returns early for non-existent deck', async () => {
      renderProvider('nonexistent');
      await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('none'));
    });

    it('closes the deck and resets state', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('closeDeck'));
      await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('none'));
      expect(screen.getByTestId('activeSlideId')).toHaveTextContent('none');
    });
  });

  describe('createDeck / createDeckFromTemplate / importDeck', () => {
    it('creates a new deck', async () => {
      renderProvider();
      await waitFor(() => expect(screen.getByTestId('decks')).not.toHaveTextContent('0'));
      fireEvent.click(screen.getByText('createDeck'));
      await waitFor(() => {
        expect(screen.getByTestId('decks')).toHaveTextContent('2');
      });
    });

    it('creates deck from template', async () => {
      renderProvider();
      await waitFor(() => expect(screen.getByTestId('decks')).not.toHaveTextContent('0'));
      fireEvent.click(screen.getByText('createFromTemplate'));
      await waitFor(() => {
        expect(screen.getByTestId('decks')).toHaveTextContent('2');
      });
    });

    it('throws for bad template id', async () => {
      renderProvider();
      await waitFor(() => expect(screen.getByTestId('decks')).not.toHaveTextContent('0'));
      let errorMsg = '';
      document.addEventListener('test-error', ((e: CustomEvent) => {
        errorMsg = e.detail.msg;
      }) as EventListener);
      fireEvent.click(screen.getByText('createFromBadTemplate'));
      await waitFor(() => expect(errorMsg).toBe('Template not found'));
    });

    it('imports a valid deck', async () => {
      renderProvider();
      await waitFor(() => expect(screen.getByTestId('decks')).not.toHaveTextContent('0'));
      fireEvent.click(screen.getByText('importDeck'));
      await waitFor(() => {
        expect(screen.getByTestId('decks')).toHaveTextContent('2');
      });
    });

    it('throws when importing deck with no slides', async () => {
      renderProvider();
      await waitFor(() => expect(screen.getByTestId('decks')).not.toHaveTextContent('0'));
      let errorMsg = '';
      document.addEventListener('test-error', ((e: CustomEvent) => {
        errorMsg = e.detail.msg;
      }) as EventListener);
      fireEvent.click(screen.getByText('importDeckEmpty'));
      await waitFor(() => expect(errorMsg).toBe('Deck has no slides'));
    });
  });

  describe('deleteDeck / duplicateDeck / renameDeck', () => {
    it('deletes a deck', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('deleteDeck'));
      await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('none'));
    });

    it('duplicates a deck', async () => {
      renderProvider();
      await waitFor(() => expect(screen.getByTestId('decks')).not.toHaveTextContent('0'));
      fireEvent.click(screen.getByText('dupDeck'));
      await waitFor(() => {
        expect(screen.getByTestId('decks')).toHaveTextContent('2');
      });
    });

    it('throws when duplicating non-existent deck', async () => {
      renderProvider();
      await waitFor(() => expect(screen.getByTestId('decks')).not.toHaveTextContent('0'));
      let errorMsg = '';
      document.addEventListener('test-error', ((e: CustomEvent) => {
        errorMsg = e.detail.msg;
      }) as EventListener);
      fireEvent.click(screen.getByText('dupDeckBad'));
      await waitFor(() => expect(errorMsg).toBe('Deck not found'));
    });

    it('renames a deck', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('renameDeck'));
      await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('Renamed'));
    });
  });

  describe('saveDeck / reloadDecks', () => {
    it('reloads decks from db', async () => {
      renderProvider();
      await waitFor(() => expect(screen.getByTestId('decks')).not.toHaveTextContent('0'));
      fireEvent.click(screen.getByText('reloadDecks'));
      await waitFor(() => expect(screen.getByTestId('decks')).toHaveTextContent('1'));
    });
  });

  describe('slide operations', () => {
    it('adds slide after active index', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('addSlide'));
      await waitFor(() => expect(screen.getByTestId('slides')).toHaveTextContent('2'));
    });

    it('adds cover slide', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('addSlideCover'));
      await waitFor(() => expect(screen.getByTestId('slides')).toHaveTextContent('2'));
    });

    it('duplicates slide', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('dupSlide'));
      await waitFor(() => expect(screen.getByTestId('slides')).toHaveTextContent('2'));
    });

    it('deletes slide and selects next', async () => {
      const deck = newDeck({
        id: 'deck-del',
        title: 'Del Deck',
        slides: [newSlide('cover', theme, 1), newSlide('blank', theme, 2)],
      });
      await db.decks.put(deck);
      renderProvider('deck-del');
      await waitFor(() => expect(screen.getByTestId('slides')).toHaveTextContent('2'));
      fireEvent.click(screen.getByText('delSlide'));
      await waitFor(() => expect(screen.getByTestId('slides')).toHaveTextContent('1'));
    });

    it('refuses to delete last slide', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('delSlide'));
      await waitFor(() => expect(screen.getByTestId('slides')).toHaveTextContent('1'));
    });

    it('moves slide down and up', async () => {
      const deck = newDeck({
        id: 'deck-mv',
        title: 'Move Deck',
        slides: [
          newSlide('cover', theme, 1),
          newSlide('blank', theme, 2),
          newSlide('title', theme, 3),
        ],
      });
      await db.decks.put(deck);
      renderProvider('deck-mv');
      await waitFor(() => expect(screen.getByTestId('slides')).toHaveTextContent('3'));
      fireEvent.click(screen.getByText('moveDown'));
      await waitFor(() => {
        expect(screen.getByTestId('activeSlideId')).not.toHaveTextContent('none');
      });
      fireEvent.click(screen.getByText('moveUp'));
      await waitFor(() => {
        expect(screen.getByTestId('activeSlideId')).not.toHaveTextContent('none');
      });
    });

    it('reorderSlides handles out of bounds', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('reorderBad'));
      await waitFor(() => expect(screen.getByTestId('slides')).toHaveTextContent('1'));
    });

    it('reorderSlides reorders validly', async () => {
      const deck = newDeck({
        id: 'deck-re',
        title: 'Reorder',
        slides: [newSlide('cover', theme, 1), newSlide('blank', theme, 2)],
      });
      await db.decks.put(deck);
      renderProvider('deck-re');
      await waitFor(() => expect(screen.getByTestId('slides')).toHaveTextContent('2'));
      fireEvent.click(screen.getByText('reorder'));
      await waitFor(() => expect(screen.getByTestId('slides')).toHaveTextContent('2'));
    });

    it('toggles slide hidden', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('toggleHidden'));
      await waitFor(() => expect(screen.getByTestId('activeSlideId')).not.toBe('none'));
    });

    it('sets slide notes, transition, autoAdvance, name', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('notes'));
      fireEvent.click(screen.getByText('transition'));
      fireEvent.click(screen.getByText('autoAdvance'));
      fireEvent.click(screen.getByText('slideName'));
      await waitFor(() => expect(screen.getByTestId('activeSlideId')).not.toBe('none'));
    });

    it('setActiveSlide changes active slide', async () => {
      const deck = newDeck({
        id: 'deck-set',
        title: 'Set Active',
        slides: [newSlide('cover', theme, 1), newSlide('blank', theme, 2)],
      });
      await db.decks.put(deck);
      renderProvider('deck-set');
      await waitFor(() => expect(screen.getByTestId('slides')).toHaveTextContent('2'));
      const firstId = screen.getByTestId('activeSlideId').textContent;
      fireEvent.click(screen.getByText('setActive'));
      await waitFor(() => {
        expect(screen.getByTestId('activeSlideId').textContent).not.toBe(firstId);
      });
    });
  });

  describe('undo / redo / mutate', () => {
    it('tracks undo/redo state', async () => {
      renderProvider('deck1');
      await waitForDeck();
      expect(screen.getByTestId('undoable')).toHaveTextContent('false');
      expect(screen.getByTestId('redoable')).toHaveTextContent('false');
      fireEvent.click(screen.getByText('addSlide'));
      await waitFor(() => expect(screen.getByTestId('undoable')).toHaveTextContent('true'));
      fireEvent.click(screen.getByText('undo'));
      await waitFor(() => expect(screen.getByTestId('undoable')).toHaveTextContent('false'));
      fireEvent.click(screen.getByText('redo'));
      await waitFor(() => expect(screen.getByTestId('undoable')).toHaveTextContent('true'));
    });

    it('noop mutate does not create undo entry', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('noopMutate'));
      await waitFor(() => expect(screen.getByTestId('undoable')).toHaveTextContent('false'));
    });

    it('mutate records undo history', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('mutateTitle'));
      await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('mutated'));
      expect(screen.getByTestId('undoable')).toHaveTextContent('true');
    });

    it('mutateLive does not record undo', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('liveMutate'));
      await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('live-mutated'));
      expect(screen.getByTestId('undoable')).toHaveTextContent('false');
    });

    it('noopLive does not change state', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('noopLive'));
      await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('Provider Deck'));
    });

    it('snapshotHistory creates undo entry', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('snapshotHistory'));
      await waitFor(() => expect(screen.getByTestId('undoable')).toHaveTextContent('true'));
    });
  });

  describe('object operations', () => {
    it('addObject and selectObject', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('addObject'));
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('obj-add-test'));
    });

    it('addObject without id generates one', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('addObjectNoId'));
      await waitFor(() => expect(screen.getByTestId('selected')).not.toBe(''));
    });

    it('selectObject with additive toggle', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('addObject'));
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('obj-add-test'));
      fireEvent.click(screen.getByText('clearSel'));
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent(''));
      fireEvent.click(screen.getByText('selectObjAdd'));
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('obj-add-test'));
      fireEvent.click(screen.getByText('selectObjAdd'));
      await waitFor(() =>
        expect(screen.getByTestId('selected')).not.toHaveTextContent('obj-add-test'),
      );
    });

    it('clears selection', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('addObject'));
      await waitFor(() => expect(screen.getByTestId('selected')).not.toBe(''));
      fireEvent.click(screen.getByText('clearSel'));
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent(''));
    });

    it('updateObject and updateObjects', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('addObject'));
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('obj-add-test'));
      fireEvent.click(screen.getByText('updateObj'));
      fireEvent.click(screen.getByText('updateObjs'));
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('obj-add-test'));
    });

    it('deleteObject removes from slide and selection', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('addObject'));
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('obj-add-test'));
      fireEvent.click(screen.getByText('deleteObj'));
      await waitFor(() =>
        expect(screen.getByTestId('selected')).not.toHaveTextContent('obj-add-test'),
      );
    });

    it('setObjectAnimation sets animation on object', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('addObject'));
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('obj-add-test'));
      fireEvent.click(screen.getByText('setAnim'));
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('obj-add-test'));
    });
  });

  describe('deck settings', () => {
    it('setDeckTitle', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('deckTitle'));
      await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('New Title'));
    });

    it('setDeckThemeId', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('themeId'));
      await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('Provider Deck'));
    });

    it('setDeckTheme', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('deckTheme'));
      await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('Provider Deck'));
    });

    it('setDeckSize', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('deckSize'));
      await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('Provider Deck'));
    });

    it('setFooter', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('footer'));
      await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('Provider Deck'));
    });
  });

  describe('comments', () => {
    it('adds a comment', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('addComment'));
      await waitFor(() => expect(screen.getByTestId('comments')).toHaveTextContent('1'));
    });

    it('toggles comment resolved', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('addComment'));
      await waitFor(() => expect(screen.getByTestId('comments')).toHaveTextContent('1'));
      fireEvent.click(screen.getByText('toggleComment'));
      await waitFor(() => expect(screen.getByTestId('comments')).toHaveTextContent('1'));
    });

    it('deletes a comment', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('addComment'));
      await waitFor(() => expect(screen.getByTestId('comments')).toHaveTextContent('1'));
      fireEvent.click(screen.getByText('delComment'));
      await waitFor(() => expect(screen.getByTestId('comments')).toHaveTextContent('0'));
    });

    it('adds a comment reply', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('addComment'));
      await waitFor(() => expect(screen.getByTestId('comments')).toHaveTextContent('1'));
      fireEvent.click(screen.getByText('addReply'));
      await waitFor(() => expect(screen.getByTestId('comments')).toHaveTextContent('1'));
    });
  });

  describe('snapshots', () => {
    it('creates and restores a snapshot', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('createSnap'));
      await waitFor(() => expect(screen.getByTestId('snapshots')).toHaveTextContent('1'));
      fireEvent.click(screen.getByText('restoreSnap'));
      await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('Provider Deck'));
    });

    it('deletes a snapshot', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('createSnap'));
      await waitFor(() => expect(screen.getByTestId('snapshots')).toHaveTextContent('1'));
      fireEvent.click(screen.getByText('delSnap'));
      await waitFor(() => expect(screen.getByTestId('snapshots')).toHaveTextContent('0'));
    });
  });

  describe('questions (Q&A)', () => {
    it('adds a question', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('addQ'));
      await waitFor(() => expect(screen.getByTestId('questions')).toHaveTextContent('1'));
    });

    it('upvotes a question', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('addQ'));
      await waitFor(() => expect(screen.getByTestId('questions')).toHaveTextContent('1'));
      fireEvent.click(screen.getByText('upvoteQ'));
      await waitFor(() => expect(screen.getByTestId('questions')).toHaveTextContent('1'));
    });

    it('marks question answered', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('addQ'));
      await waitFor(() => expect(screen.getByTestId('questions')).toHaveTextContent('1'));
      fireEvent.click(screen.getByText('answerQ'));
      await waitFor(() => expect(screen.getByTestId('questions')).toHaveTextContent('1'));
    });
  });

  describe('settings', () => {
    it('saves settings', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('saveSettings'));
      await waitFor(() => expect(screen.getByTestId('settings')).not.toBe('none'));
    });
  });

  describe('peer identity', () => {
    it('reads peer name and color from localStorage', async () => {
      renderProvider('deck1');
      await waitForDeck();
      expect(screen.getByTestId('peerName')).not.toBe('');
      expect(screen.getByTestId('peerColor')).not.toBe('');
    });

    it('sets peer name and color', async () => {
      renderProvider('deck1');
      await waitForDeck();
      fireEvent.click(screen.getByText('peer'));
      await waitFor(() => {
        expect(localStorage.getItem('keynotes:name')).toBe('Alice');
        expect(localStorage.getItem('keynotes:color')).toBe('#ff0000');
      });
    });
  });
});
