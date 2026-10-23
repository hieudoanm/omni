import { Tool } from '@/components/atoms';
import type { IconType } from 'react-icons';
import {
  PiAirplane,
  PiAlien,
  PiArrowsClockwise,
  PiBook,
  PiBookOpen,
  PiBooks,
  PiBrain,
  PiBriefcase,
  PiBuilding,
  PiBuildings,
  PiCalendar,
  PiCamera,
  PiChartBar,
  PiChartLine,
  PiChatCircle,
  PiCheckCircle,
  PiClock,
  PiClockAfternoon,
  PiCloudArrowUp,
  PiCodeSimple,
  PiCurrencyDollar,
  PiDatabase,
  PiDivide,
  PiDotsNine,
  PiDrop,
  PiEnvelope,
  PiEnvelopeSimple,
  PiEyes,
  PiFacebookLogo,
  PiFileDoc,
  PiFileText,
  PiFilmStrip,
  PiFirstAidKit,
  PiFlag,
  PiFolder,
  PiGameController,
  PiGauge,
  PiGithubLogo,
  PiGlobe,
  PiHandPeace,
  PiHeart,
  PiHeartStraight,
  PiHourglass,
  PiInfinity,
  PiKey,
  PiLamp,
  PiLifebuoy,
  PiLightning,
  PiLink,
  PiMagnifyingGlass,
  PiMapPin,
  PiMoney,
  PiMoon,
  PiMusicNote,
  PiNewspaper,
  PiNotePencil,
  PiNotebook,
  PiNumberSquareOne,
  PiPackage,
  PiReceipt,
  PiPianoKeys,
  PiPlay,
  PiPresentation,
  PiPresentationChart,
  PiQuestion,
  PiRepeat,
  PiRobot,
  PiRocket,
  PiRocketLaunch,
  PiScissors,
  PiSmiley,
  PiSmileyMelting,
  PiSmileyNervous,
  PiSnowflake,
  PiSparkle,
  PiSpiral,
  PiStarFour,
  PiTextAa,
  PiThreadsLogo,
  PiTimer,
  PiTrendDown,
  PiTwitterLogo,
  PiUsersThree,
  PiWatch,
  PiWaveSine,
  PiWaveform,
  PiWind,
  PiWindowsLogo,
  PiWrench,
} from 'react-icons/pi';
import appsJson from './apps.json';

export interface AppItem {
  label: string;
  description: string;
  icon: IconType;
  toolId: string;
  type: string;
  typeId: string;
}

export interface AppSection {
  id: string;
  label: string;
  items: AppItem[];
}

interface BookmarkJsonItem {
  label: string;
  description: string;
  icon: string;
  badge?: string;
  type: string;
  typeId: string;
  href: string;
}

interface AppJsonItem {
  label: string;
  description: string;
  icon: string;
  sectionId: string;
  toolId: string;
  type: string;
  typeId: string;
}

type JsonItem = BookmarkJsonItem | AppJsonItem;
type JsonSection = (typeof appsJson)[number];

const isAppItem = (item: JsonItem): item is AppJsonItem =>
  (item as AppJsonItem).sectionId !== undefined && (item as AppJsonItem).toolId !== undefined;

const toTypeFields = (item: {
  type: string;
  typeId: string;
}): { type: string; typeId: string } => ({
  type: item.typeId,
  typeId: item.type,
});

const ICON_BY_NAME: Record<string, IconType> = {
  PiAirplane,
  PiAlien,
  PiArrowsClockwise,
  PiBook,
  PiBookOpen,
  PiBooks,
  PiBrain,
  PiBriefcase,
  PiBuilding,
  PiBuildings,
  PiCalendar,
  PiCamera,
  PiChartBar,
  PiChartLine,
  PiChatCircle,
  PiCheckCircle,
  PiClock,
  PiClockAfternoon,
  PiCloudArrowUp,
  PiCodeSimple,
  PiCurrencyDollar,
  PiDatabase,
  PiDivide,
  PiDotsNine,
  PiDrop,
  PiEnvelope,
  PiEnvelopeSimple,
  PiEyes,
  PiFacebookLogo,
  PiFileDoc,
  PiFileText,
  PiFilmStrip,
  PiFirstAidKit,
  PiFlag,
  PiFolder,
  PiGameController,
  PiGauge,
  PiGithubLogo,
  PiGlobe,
  PiHandPeace,
  PiHeart,
  PiHeartStraight,
  PiHourglass,
  PiInfinity,
  PiKey,
  PiLamp,
  PiLifebuoy,
  PiLightning,
  PiLink,
  PiMagnifyingGlass,
  PiMapPin,
  PiMoney,
  PiMoon,
  PiMusicNote,
  PiNewspaper,
  PiNotePencil,
  PiNotebook,
  PiNumberSquareOne,
  PiPackage,
  PiReceipt,
  PiPianoKeys,
  PiPlay,
  PiPresentation,
  PiPresentationChart,
  PiQuestion,
  PiRepeat,
  PiRobot,
  PiRocket,
  PiRocketLaunch,
  PiScissors,
  PiSmiley,
  PiSmileyMelting,
  PiSmileyNervous,
  PiSnowflake,
  PiSparkle,
  PiSpiral,
  PiStarFour,
  PiTextAa,
  PiThreadsLogo,
  PiTimer,
  PiTrendDown,
  PiTwitterLogo,
  PiUsersThree,
  PiWatch,
  PiWaveSine,
  PiWaveform,
  PiWind,
  PiWindowsLogo,
  PiWrench,
};

const resolveIcon = (name: string): IconType => {
  const icon = ICON_BY_NAME[name];
  if (!icon) {
    throw new Error(`Unknown icon: ${name}`);
  }
  return icon;
};

const toBookmarkTool = (item: BookmarkJsonItem): Tool => ({
  label: item.label,
  description: item.description,
  href: item.href,
  icon: resolveIcon(item.icon),
  ...(item.badge ? { badge: item.badge } : {}),
  ...toTypeFields(item),
});

export const APP_SECTIONS: AppSection[] = appsJson
  .filter((section) => section.id)
  .map((section) => ({
    id: section.id as string,
    label: section.label,
    items: section.items.filter(isAppItem).map((t) => ({
      label: t.label,
      description: t.description,
      icon: resolveIcon(t.icon),
      toolId: t.toolId,
      ...toTypeFields(t),
    })),
  }));

export const getAppSections = (): {
  id: string;
  label: string;
  items: Tool[];
}[] =>
  APP_SECTIONS.map(({ id, label, items }) => ({
    id,
    label,
    items: items.map((t) => ({
      label: t.label,
      description: t.description,
      icon: t.icon,
      href: `/apps/${id}/${t.toolId}`,
      type: t.type,
      typeId: t.typeId,
    })),
  }));

export const getHomeSections = (): {
  label: string;
  items: Tool[];
}[] =>
  appsJson.map((section: JsonSection) => ({
    label: section.label,
    items: section.items.map((item) =>
      isAppItem(item)
        ? {
            label: item.label,
            description: item.description,
            icon: resolveIcon(item.icon),
            href: `/apps/${item.sectionId}/${item.toolId}`,
            ...toTypeFields(item),
          }
        : toBookmarkTool(item),
    ),
  }));
