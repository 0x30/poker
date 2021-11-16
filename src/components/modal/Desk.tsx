import {
  defineComponent,
  onMounted,
  onUnmounted,
  PropType,
  ref,
  unref,
  watch,
  watchEffect,
} from "@vue/runtime-core";
import { computed } from "vue";
import { debugCard, equal, getCardAssets } from "../../core/Card";
import {
  getGameCurrentPlayer,
  getGamePlayers,
  getNeedHandleTrick,
  useGame,
} from "../../core/Game";
import { Card, Game } from "../../core/model";
import { gameTips } from "../../core/Tips";

export const DeskMenu = defineComponent({
  props: {
    isPlaying: Boolean,
    isFinish: Boolean,
    onToggle: Function as PropType<() => void>,
    onNext: Function as PropType<() => Promise<void>>,
  },
  setup: (props) => {
    const onNextIsLoading = ref(false);

    return () => {
      return (
        <ul class="menu px-3 shadow-lg bg-base-100 rounded-box horizontal fixed bottom-4 right-2">
          <li>
            <button>
              <i class="gg-play-button"></i>
            </button>
          </li>
          <li>
            <a
              class={onNextIsLoading.value ? "loading" : ""}
              onClick={async () => {
                onNextIsLoading.value = true;
                await props.onNext?.();
                onNextIsLoading.value = false;
              }}
            >
              <i class="gg-play-track-next"></i>
            </a>
          </li>
          <li>
            <button>
              <i class="gg-close"></i>
            </button>
          </li>
        </ul>
      );
    };
  },
});

export const CardComp = defineComponent({
  props: {
    card: {
      required: true,
      type: Object as PropType<Card>,
    },
  },
  setup: (props) => {
    return () => {
      return (
        <div class="absolute" style="aspect-ratio: 3/4">
          <img
            style="border: 1px solid rgba(0,0,0,0.5)"
            class="rounded bordered absolute top-0 left-0 right-0 bottom-0 h-full pointer-events-none select-none"
            src={getCardAssets(props.card)}
          />
        </div>
      );
    };
  },
});

enum CardGroupSize {
  small,
  big,
}

const useHand = (
  cards: Card[],
  isHand: boolean,
  select?: (idx: number[]) => void
) => {
  console.log("???", isHand);

  if (isHand !== true) return { destory: () => {} };

  const startCardIdxRef = ref<number>();
  const overCardIdxRef = ref<number>();

  const onCardMouseDown = (idx: number) => {
    startCardIdxRef.value = idx;
    overCardIdxRef.value = idx;
  };
  const onCardMouseOver = (idx: number) => (overCardIdxRef.value = idx);

  const overSelectIds = computed(() => {
    const over = overCardIdxRef.value;
    const start = startCardIdxRef.value;
    if (over == undefined || start === undefined) return [];
    return [...cards.keys()].slice(
      Math.min(over, start),
      Math.max(over, start) + 1
    );
  });

  const onMouseUp = () => {
    select?.(overSelectIds.value);
    startCardIdxRef.value = undefined;
    overCardIdxRef.value = undefined;
  };

  document.addEventListener("mouseup", onMouseUp);

  return {
    overSelectIds,
    onCardMouseDown,
    onCardMouseOver,
    destory: () => document.removeEventListener("mouseup", onMouseUp),
  };
};

const CardGroup = defineComponent({
  props: {
    ishand: Boolean,
    selectIdxs: Set as PropType<Set<number>>,
    onSelectIdxs: Function as PropType<(idxs: number[]) => void>,
    size: Number as PropType<CardGroupSize>,
    cards: Array as PropType<Card[]>,
  },
  setup: (props) => {
    const { overSelectIds, onCardMouseDown, onCardMouseOver, destory } =
      useHand(props.cards!, props.ishand, props.onSelectIdxs);

    onUnmounted(destory);

    return () => {
      if (props.cards === undefined) return <div>PASS!</div>;
      const cardId = (card: Card) => `${card.color}${card.number}`;
      return (
        <div class="flex pointer-events-auto visible opacity-100 pr-14 overflow-visible">
          <span>..{props.ishand ? "true" : "false"}..</span>
          {props.cards
            .sort((a, b) => b.number - a.number)
            .map((card, idx) => (
              <div
                onMousedown={() => onCardMouseDown?.(idx)}
                onMousemove={() => onCardMouseOver?.(idx)}
                key={cardId(card)}
                class={
                  props.size === CardGroupSize.small
                    ? "w-3 h-20 relative"
                    : "w-4 h-28 relative"
                }
              >
                <CardComp
                  card={card}
                  class={`absolute left-0 top-0 bottom-0 select-none transform ${
                    overSelectIds?.value.includes(idx) ? "scale-95" : ""
                  } ${props.selectIdxs?.has(idx) ? " -translate-y-2" : ""}`}
                />
              </div>
            ))}
        </div>
      );
    };
  },
});

const TrickList = defineComponent({
  props: {
    game: {
      type: Object as PropType<Game>,
      required: true,
    },
  },
  setup: (props) => {
    const { gameRef } = useGame(props.game);

    return () => {
      const tricks = gameRef.value.tricks.sort((a, b) => a.idx - b.idx);

      console.log("绘制");

      return (
        <div class="mockup-code w-1/3 gap-2 flex flex-col m-3 shadow-xl overflow-auto">
          {tricks.map((r) => (
            <>
              <pre key={r.idx} data-prefix="$" class="bg-success text-neutral">
                <code>第{r.idx + 1}回合</code>
              </pre>

              {r.tricks
                .slice()
                .sort((a, b) => a.createTime - b.createTime)
                .map((cs) => (
                  <pre key={cs.createTime} data-prefix={cs.player.nikeName}>
                    <span class="float-right mr-3 text-base-300 opacity-40">
                      {new Date(cs.createTime).toLocaleString()}
                    </span>
                    <CardGroup size={CardGroupSize.small} cards={cs.cards} />
                  </pre>
                ))}
            </>
          ))}
        </div>
      );
    };
  },
});

const DeskPlayer = defineComponent({
  props: {
    game: {
      type: Object as PropType<Game>,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  setup: (props) => {
    const selectIdxRef = ref<Set<number>>(new Set());

    const { gameRef, moveCursor, manualPlay } = useGame(props.game);
    const player = computed(() => getGamePlayers(gameRef.value)[props.index]);
    const isCurrentPlayer = computed(() => {
      return getGameCurrentPlayer(gameRef.value).id === player.value.id;
    });

    const onSelectIdxs = (idxs: number[]) => {
      for (const id of idxs) {
        if (selectIdxRef.value.has(id)) selectIdxRef.value.delete(id);
        else selectIdxRef.value.add(id);
      }
    };

    const isCanSkip = computed(
      () => getNeedHandleTrick(gameRef.value) !== undefined
    );

    const isCanTip = computed(() => tipCards.value.length > 0);
    const tipCards = computed(() =>
      gameTips(gameRef.value).sort((a, b) => a.weight - b.weight)
    );

    let tipIndex = 0;
    const tip = () => {
      if (tipCards.value.length === 0) return;
      selectIdxRef.value.clear();
      const res = tipCards.value[tipIndex % tipCards.value.length].cards.map(
        (c) => player.value.leftCards.findIndex((lc) => equal(c, lc))
      );
      onSelectIdxs(res);
      tipIndex++;
    };

    const manual = () => {
      const cards = [...selectIdxRef.value].map(
        (i) => player.value.leftCards[i]
      );
      try {
        manualPlay(player.value, cards);
      } catch (error) {
        alert(error);
      }
    };

    return () => {
      const lastCards = () => {
        const tricks = player.value.lastTrick;
        if (tricks && isCurrentPlayer.value === false) {
          if (tricks) {
            return (
              <CardGroup cards={tricks.cards} size={CardGroupSize.small} />
            );
          } else return <span>要不起</span>;
        } else return null;
      };

      return (
        <div
          class={`flex items-center justify-center ${
            props.index === 2 ? "flex-col-reverse" : "flex-col"
          }`}
        >
          <div
            class={`space-x-2 ${
              isCurrentPlayer.value ? "opacity-1" : "opacity-0"
            }`}
          >
            <span>{player.value.nikeName}</span>
            <button
              class="btn btn-sm"
              disabled={selectIdxRef.value.size === 0}
              onClick={manual}
            >
              手动出牌
            </button>
            <button
              class="btn btn-sm"
              disabled={!isCanSkip.value}
              onClick={() => manualPlay(player.value)}
            >
              过
            </button>
            <button class="btn btn-sm" disabled={!isCanTip.value} onClick={tip}>
              提示
            </button>
            <button class="btn btn-sm" onClick={moveCursor}>
              自动出牌
            </button>
          </div>
          <CardGroup
            class="my-8 h-2/5"
            onSelectIdxs={onSelectIdxs}
            selectIdxs={selectIdxRef.value}
            cards={player.value.leftCards}
            ishand={isCurrentPlayer.value}
          />
          <div class="h-1/4">{lastCards()}</div>
        </div>
      );
    };
  },
});

export const Desk = defineComponent({
  props: {
    game: {
      type: Object as PropType<Game>,
      required: true,
    },
  },
  setup: (props) => {
    const { gameRef, moveCursor } = useGame(unref(props.game));

    return () => {
      return (
        <div class="modal visible opacity-100 pointer-events-auto">
          <div
            class="absolute top-0 right-0 bottom-0 w-3/4 flex"
            style="background-color: #45a173;"
          >
            {/* <TrickList game={gameRef.value} /> */}
            <div class="grid grid-cols-2 grid-rows-2 flex-1">
              {gameRef.value.players.map((p, i) => (
                <DeskPlayer
                  key={p.id}
                  game={gameRef.value}
                  index={i}
                  class={`${i == 2 ? "col-span-2" : ""}`}
                />
              ))}
            </div>
            <DeskMenu onNext={moveCursor} />
          </div>
        </div>
      );
    };
  },
});
