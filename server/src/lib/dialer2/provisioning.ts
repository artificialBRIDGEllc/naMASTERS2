import type { ProvisioningPlan, ProvisioningRequest, ProvisioningTask, ProvisioningTemplate } from './types';

export function buildProvisioningPlan(
  request: ProvisioningRequest,
  template: ProvisioningTemplate
): ProvisioningPlan {
  const tasks: ProvisioningTask[] = [
    {
      id: 'license-check',
      label: 'Validate NPN + states',
      detail: `Check ${request.npn} against ${request.states.join(', ')} and activate routing skills.`,
      status: request.npn ? 'done' : 'queued'
    },
    {
      id: 'identity',
      label: 'Create unified identity',
      detail: 'Enable role switching so admin and agent views share one login.',
      status: request.email ? 'done' : 'queued'
    },
    {
      id: 'assets',
      label: 'Auto-attach assets',
      detail: template.autoAssets.join(' · '),
      status: 'ready'
    },
    {
      id: 'compliance',
      label: 'Attach compliance bundle',
      detail: template.complianceBundle.join(' · '),
      status: 'ready'
    },
    {
      id: 'readiness',
      label: 'Publish readiness checklist',
      detail: 'MFA, device, voicemail, training, and call settings in one checklist.',
      status: 'ready'
    }
  ];

  const doneCount = tasks.filter((task) => task.status === 'done').length;
  const readyCount = tasks.filter((task) => task.status === 'ready').length;
  const readiness = Math.round(((doneCount * 1.0 + readyCount * 0.5) / tasks.length) * 100);

  return {
    request,
    readiness: Math.min(100, readiness),
    summary: `${request.fullName} is provisioned with ${template.name} and ${template.autoAssets.length} auto-attached assets.`,
    tasks
  };
}
