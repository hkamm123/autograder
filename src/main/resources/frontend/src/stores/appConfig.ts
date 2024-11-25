import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import {listOfPhases, Phase, type RubricInfo, type RubricType} from '@/types/types'
import { getConfig } from '@/services/configService'

type ImportMeta = {
    VITE_APP_BACKEND_URL: string
}

export type Config = {
  bannerMessage: string
  bannerLink: string
  bannerColor: string
  bannerExpiration: string

  perDayLatePenalty: number
  gitCommitPenalty: number
  maxLateDaysPenalized: number
  linesChangedPerCommit: number
  clockForgivenessMinutes: number

  shutdownSchedule: string
  shutdownWarningMilliseconds: number

  phases: Array<Phase>
  courseNumber?: number
  assignmentIds?: string // Map<Phase, number>
  rubricInfo?: string // Map<Phase, Map<RubricType, RubricInfo>>
}

// @ts-ignore
const env: ImportMeta = import.meta.env;
export const useAppConfigStore = defineStore('appConfig', () => {

  const parseAssignmentIds = (idsString: string): Map<Phase, number> => {
    const idsObject = JSON.parse(idsString);
    return new Map<Phase, number>(Object.entries(idsObject) as unknown as [Phase, number][]);
  }

  const parseRubricInfo = (idsString: string): Map<Phase, Map<RubricType, RubricInfo>> => {
    const idsObject = JSON.parse(idsString);
    const rubricMap = new Map<Phase, Map<RubricType, RubricInfo>>();
    for (const phase in idsObject) {
      rubricMap.set(
          phase as unknown as Phase,
          new Map(Object.entries(idsObject[phase]) as unknown as [RubricType, RubricInfo][])
      );
    }
    return rubricMap;
  }

  const updateConfig = async () => {
    const latestConfig = await getConfig();
    bannerMessage.value = latestConfig.bannerMessage;
    bannerLink.value = latestConfig.bannerLink;
    bannerColor.value = latestConfig.bannerColor;
    bannerExpiration.value = latestConfig.bannerExpiration;
    if (bannerColor.value.length == 0) {
      bannerColor.value = "#4fa0ff"
    }

    perDayLatePenalty.value = latestConfig.perDayLatePenalty
    gitCommitPenalty.value = latestConfig.gitCommitPenalty
    maxLateDaysPenalized.value = latestConfig.maxLateDaysPenalized
    linesChangedPerCommit.value = latestConfig.linesChangedPerCommit
    clockForgivenessMinutes.value = latestConfig.clockForgivenessMinutes

    shutdownSchedule.value = latestConfig.shutdownSchedule
    shutdownWarningMilliseconds.value = latestConfig.shutdownWarningMilliseconds


    for (const phase of listOfPhases() as Phase[]) {
      activePhaseList.value[phase] = latestConfig.phases.includes(phase);
    }
    if (latestConfig.courseNumber) {
      courseNumber.value = latestConfig.courseNumber;
    }
    if (latestConfig.assignmentIds) {
      assignmentIds.value = parseAssignmentIds(latestConfig.assignmentIds);
    }
    if (latestConfig.rubricInfo) {
      rubricInfo.value = parseRubricInfo(latestConfig.rubricInfo);
    }
  }

  const backendUrl = ref<string>(env.VITE_APP_BACKEND_URL);
  const bannerMessage: Ref<string> = ref<string>("");
  const bannerLink: Ref<string> = ref<string>("");
  const bannerColor: Ref<string> = ref<string>("");
  const bannerExpiration: Ref<string> = ref<string>("");

  const perDayLatePenalty = ref<number>(0)
  const gitCommitPenalty = ref<number>(0)
  const maxLateDaysPenalized = ref<number>(0)
  const linesChangedPerCommit = ref<number>(0)
  const clockForgivenessMinutes = ref<number>(0)

  const shutdownSchedule: Ref<string> = ref<string>("");
  const shutdownWarningMilliseconds: Ref<number> = ref<number>(0);

  // using the enum, if phaseActivationList[phase] == true, then that phase is active
  const activePhaseList: Ref<boolean[]> = ref<Array<boolean>>([]);
  const assignmentIds: Ref<Map<Phase, number>> = ref<Map<Phase, number>>(new Map<Phase, number>);
  const rubricInfo: Ref<Map<Phase, Map<RubricType, RubricInfo>>> =
      ref<Map<Phase, Map<RubricType, RubricInfo>>>(new Map<Phase, Map<RubricType, RubricInfo>>);
  const courseNumber: Ref<number> = ref<number>(-1);

  return {
    updateConfig,
    backendUrl,
    bannerMessage,
    bannerLink,
    bannerColor,
    bannerExpiration,
    shutdownSchedule,
    shutdownWarningMilliseconds,
    phaseActivationList: activePhaseList,
    rubricInfo,
    assignmentIds,
    courseNumber,
    perDayLatePenalty,
    gitCommitPenalty,
    maxLateDaysPenalized,
    linesChangedPerCommit,
    clockForgivenessMinutes
  };
})
