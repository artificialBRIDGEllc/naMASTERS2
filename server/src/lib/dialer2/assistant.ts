import type { AssistantMessage, ViewKey } from './types';

export function replyToAssistant(input: string, view: ViewKey): AssistantMessage {
  const text = input.trim().toLowerCase();
  const intro = view === 'phase-1'
    ? 'For Phase 1, simplify setup first:'
    : view === 'phase-2'
      ? 'For Phase 2, automate supervision by exception:'
      : view === 'phase-3'
        ? 'For Phase 3, optimize the full revenue journey:'
        : 'Across the full 2.0 stack:';

  let guidance = 'Use typed adapter seams so the host dialer stays in control of live telephony and policy data.';

  if (text.includes('workflow') || text.includes('routing')) {
    guidance = 'Translate the prompt into nodes and rules, then save only the generated JSON definition back to your dialer config service.';
  } else if (text.includes('complaint')) {
    guidance = 'Auto-create complaint cases from critical transcripts and pre-link evidence so managers review one packet, not four disconnected screens.';
  } else if (text.includes('retention') || text.includes('ltv')) {
    guidance = 'Start with persistence and commission signals to prioritize rescue efforts before adding more aggressive save tactics.';
  } else if (text.includes('onboard') || text.includes('agent')) {
    guidance = 'Provision the identity, queue, number, voicemail, scripts, and QA bundle from one template so readiness becomes a checklist, not a scavenger hunt.';
  }

  return { author: 'assistant', text: `${intro} ${guidance}` };
}
