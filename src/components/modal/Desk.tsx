import {
  defineComponent,
  onMounted,
  onUnmounted,
  onUpdated,
  PropType,
  ref,
  unref,
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
import { Card, Game, isWoodMan } from "../../core/model";
import { playerNameCode } from "../../core/Player";
import { gameTips } from "../../core/Tips";
import { useMountComponentAndAnimed } from "../../core/useMountComponentAndAnimed";
import { GameMenu } from "../GameMenu";

const CardComp = defineComponent({
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

const CardGroup = defineComponent({
  props: {
    ishand: Boolean,
    selectIdxs: Set as PropType<Set<number>>,
    onSelectIdxs: Function as PropType<(idxs: number[]) => void>,
    size: Number as PropType<CardGroupSize>,
    cards: {
      type: Array as PropType<Card[]>,
      required: true,
    },
  },
  setup: (props) => {
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
      return [...props.cards.keys()].slice(
        Math.min(over, start),
        Math.max(over, start) + 1
      );
    });

    const onMouseUp = () => {
      props.onSelectIdxs?.(overSelectIds.value);
      startCardIdxRef.value = undefined;
      overCardIdxRef.value = undefined;
    };

    document.addEventListener("mouseup", onMouseUp);
    onUnmounted(() => document.removeEventListener("mouseup", onMouseUp));

    return () => {
      const cardClass = () => {
        const ccs: string[] = [];
        if (props.size === CardGroupSize.small) ccs.push("w-3 h-20 relative");
        else ccs.push("w-4 h-28 relative");
        if (props.ishand) ccs.push("pointer-events-auto");
        else ccs.push("pointer-events-none");
        return ccs;
      };

      if (props.cards === undefined) return <div>PASS!</div>;
      return (
        <div class="flex pointer-events-auto visible opacity-100 pr-14 overflow-visible">
          {props.cards
            .sort((a, b) => b.number - a.number)
            .map((card, idx) => (
              <div
                onMousedown={() => onCardMouseDown?.(idx)}
                onMousemove={() => onCardMouseOver?.(idx)}
                key={debugCard(card)}
                class={cardClass()}
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

    const listRef = ref<HTMLElement>();

    const scrollToBottom = () => {
      if (listRef.value) {
        listRef.value.scrollTo({
          top: listRef.value.scrollHeight,
          behavior: "smooth",
        });
      }
    };

    onMounted(scrollToBottom);
    onUpdated(scrollToBottom);

    return () => {
      const tricks = gameRef.value.tricks.sort((a, b) => a.idx - b.idx);
      return (
        <div
          ref={listRef}
          class="mockup-code w-1/3 gap-2 flex flex-col m-3 overflow-auto relative"
        >
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
                    {cs.cards ? (
                      <CardGroup size={CardGroupSize.small} cards={cs.cards} />
                    ) : (
                      <span>过</span>
                    )}
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

    const { gameRef, moveCursor, manualPlay, isAsking } = useGame(props.game);
    const player = computed(() => getGamePlayers(gameRef.value)[props.index]);
    const isCurrentPlayer = computed(() => {
      const isCurrent =
        getGameCurrentPlayer(gameRef.value).id === player.value.id;
      if (isCurrent === false) selectIdxRef.value.clear();
      return isCurrent;
    });

    watchEffect(() => {
      if (isCurrentPlayer.value === true && isWoodMan(player.value))
        manualPlay(player.value);
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

    /// 当前用户是否是冠军
    const isChampioner = computed(
      () => gameRef.value.championer?.id === player.value.id
    );

    /// 游戏是否完毕
    const isFinished = computed(() => gameRef.value.championer !== undefined);

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
      } catch (error) {}
    };

    return () => {
      const lastCards = () => {
        if (isFinished.value === true) return null;
        const tricks = player.value.lastTrick;
        if (tricks && isCurrentPlayer.value === false) {
          if (tricks.cards)
            return (
              <CardGroup cards={tricks.cards} size={CardGroupSize.small} />
            );
          else return <span>要不起</span>;
        } else return null;
      };

      const btns = () => {
        if (isFinished.value === true) {
          if (isChampioner.value === true)
            return <span class="text-3xl">🎉🎉获胜🎉🎉</span>;
          return null;
        }

        if (gameRef.value.autoStart === true) {
          if (isCurrentPlayer.value === true) return <span>等待出牌...</span>;
          else return null;
        }

        if (isCurrentPlayer.value) {
          return (
            <>
              <button
                data-tip="替换原有用户逻辑出牌"
                class="btn btn-sm tooltip"
                disabled={selectIdxRef.value.size === 0}
                onClick={manual}
              >
                手动出牌
              </button>
              <button
                data-tip="不出牌。必须出牌时按钮不可用"
                class="btn btn-sm tooltip"
                disabled={!isCanSkip.value}
                onClick={() => manualPlay(player.value)}
              >
                过
              </button>
              <button
                data-tip="提示当前可以出的卡组，多次点击可切换提示。如此时无可用牌，按钮不可用"
                class="btn btn-sm tooltip"
                disabled={!isCanTip.value}
                onClick={tip}
              >
                提示
              </button>
              <button
                data-tip="按照用户有逻辑出牌"
                class={`btn btn-sm tooltip ${isAsking.value ? "loading" : ""}`}
                onClick={moveCursor}
              >
                自动出牌
              </button>
            </>
          );
        } else null;
      };

      /// 如果是第三个试图的话，出牌和控制器 颠倒顺序
      const flexdri = props.index === 2 ? "flex-col-reverse" : "flex-col";

      const avatar = () => {
        let avatarCss = "";
        if (props.index === 0) avatarCss = "top-20 left-16";
        else if (props.index === 1) avatarCss = "top-20 right-16";
        else avatarCss = "bottom-20 left-16";

        return (
          <div
            class={`absolute transform ${avatarCss} flex flex-col items-center space-y-2 tooltip`}
            data-tip={player.value.nikeName}
          >
            <div class="avatar placeholder">
              <div class="bg-neutral-focus text-neutral-content rounded-full w-16 h-16">
                <span>{playerNameCode(player.value)}</span>
              </div>
            </div>
          </div>
        );
      };

      return (
        <div class={`flex items-center relative justify-center ${flexdri}`}>
          {avatar()}
          <div class={`space-x-2 h-1/3 flex items-center`}>{btns()}</div>
          <div class="h-1/3 flex items-center">
            <CardGroup
              onSelectIdxs={onSelectIdxs}
              selectIdxs={selectIdxRef.value}
              cards={
                isFinished.value ? player.value.cards : player.value.leftCards
              }
              ishand={isCurrentPlayer.value}
            />
          </div>
          <div class="h-1/3 flex items-center">{lastCards()}</div>
        </div>
      );
    };
  },
});

const Desk = defineComponent({
  props: {
    onClose: Function as PropType<() => void>,
    game: {
      type: Object as PropType<Game>,
      required: true,
    },
  },
  setup: (props) => {
    const isShowDetail = ref(false);

    const { gameRef, moveCursor, toggle, isAsking, trashTricks, cancelTrick } =
      useGame(unref(props.game));
    /// 游戏是否完毕
    const isFinish = computed(() => gameRef.value.championer !== undefined);
    const isCanCancel = computed(() => gameRef.value.tricks.length > 0);

    return () => {
      return (
        <div class="modal visible opacity-100 pointer-events-auto">
          <div
            class="absolute top-0 right-0 bottom-0 w-3/4 flex"
            style="background-color: #45a173;"
          >
            {isShowDetail.value ? <TrickList game={gameRef.value} /> : null}
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
            <GameMenu
              isCanCancel={isCanCancel.value}
              onCancel={cancelTrick}
              onTrash={trashTricks}
              onClose={props.onClose}
              isAsking={isAsking.value}
              class="absolute bottom-4 right-2"
              isFinish={isFinish.value}
              isPlaying={gameRef.value.autoStart}
              onToggle={toggle}
              onNext={moveCursor}
            />
            <button
              class="btn btn-circle btn absolute right-3 top-10"
              onClick={() => (isShowDetail.value = !isShowDetail.value)}
            >
              <i class="gg-menu-boxed"></i>
            </button>
          </div>
        </div>
      );
    };
  },
});

export const useDeskDrawer = (game: Game) => {
  const close = useMountComponentAndAnimed({
    component: <Desk game={game} onClose={() => close()} />,
  });
};
