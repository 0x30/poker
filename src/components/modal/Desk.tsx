import {
  defineComponent,
  onMounted,
  onUnmounted,
  PropType,
  ref,
  unref,
} from "@vue/runtime-core";
import { getCardAssets } from "../../core/Card";
import { useGame } from "../../core/Game";
import { Card, Game } from "../../core/model";

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
            class="rounded bordered absolute top-0 left-0 right-0 bottom-0 h-full pointer-events-none select-disabled"
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
    size: Number as PropType<CardGroupSize>,
    cards: Array as PropType<Card[]>,
  },
  setup: (props) => {
    return () => {
      if (props.cards === undefined) return <div>PASS!</div>;
      const cardId = (card: Card) => `${card.color}${card.number}`;
      return (
        <div class="flex pointer-events-auto visible opacity-100 pr-14 overflow-visible">
          {props.cards
            .sort((a, b) => b.number - a.number)
            .map((card, idx) => (
              <div
                key={cardId(card)}
                class={
                  props.size === CardGroupSize.small
                    ? "w-3 h-20 relative"
                    : "w-4 h-28 relative"
                }
              >
                <CardComp card={card} class="absolute left-0 top-0 bottom-0" />
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
    return () => {
      const tricks = props.game.tricks.sort((a, b) => a.idx - b.idx);

      return (
        <div class="mockup-code w-1/3 gap-2 flex flex-col m-3 shadow-xl overflow-auto">
          {tricks.map((r) => (
            <>
              <pre data-prefix="$" class="bg-success text-neutral">
                <code>第{r.idx}回合</code>
              </pre>
              {r.tricks
                .sort((a, b) => a.createTime - b.createTime)
                .map((cs) => (
                  <pre data-prefix={cs.player.nikeName}>
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

export const Desk = defineComponent({
  props: {
    game: {
      type: Object as PropType<Game>,
      required: true,
    },
  },
  setup: (props) => {
    const { gameRef, moveCursor, isPlaying, toggle } = useGame(
      unref(props.game)
    );

    onMounted(() => document.body.style.setProperty("overflow", "hidden"));
    onUnmounted(() => document.body.style.removeProperty("overflow"));

    return () => {
      return (
        <div class="modal visible opacity-100 pointer-events-auto">
          <div
            class="absolute top-0 right-0 bottom-0 w-3/4 flex"
            style="background-color: #45a173;"
          >
            <TrickList game={gameRef.value} />
            <div class="grid grid-cols-2 grid-rows-2 flex-1">
              <div class="flex items-center justify-center">
                <div class="flex">
                  <CardGroup cards={props.game.players[0].cards} />
                </div>
              </div>
              <div class="flex items-center justify-center">
                <div class="flex">
                  <CardGroup cards={props.game.players[1].cards} />
                </div>
              </div>
              <div class="col-span-2 flex items-center justify-center">
                <div class="flex">
                  <CardGroup cards={props.game.players[2].cards} />
                </div>
              </div>
            </div>
            <DeskMenu onNext={moveCursor} />
          </div>
        </div>
      );
    };
  },
});
