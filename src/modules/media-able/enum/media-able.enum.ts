export enum MediaAbleTypeEnum {
  USER = 'user',
  TEAM = 'team',
  PROJECT = 'project',
  WORKFLOW = 'workflow',
  WORKFLOWSTEP = 'workflowStep',
  DOCUMENT = 'document',
  DOCUMENTITEM = 'documentItem',
  ASSISTANT = 'assistant',
}

export enum MediaAbleTypeMapEnum {
  USER = 1,
  TEAM = 2,
  PROJECT = 3,
  WORKFLOW = 4,
  WORKFLOWSTEP = 5,
  DOCUMENT = 6,
  DOCUMENTITEM = 7,
  ASSISTANT = 8,
}

export function getMediaAbleTypeEnumValue(key: string): number {
  if (typeof key !== 'string') {
    throw new Error(`Expected key to be a string, but received ${typeof key}`);
  }
  const res =
    MediaAbleTypeMapEnum[key.toUpperCase() as keyof typeof MediaAbleTypeEnum];

  if (!res) {
    throw new Error(`Invalid mediaAble type: ${key}`);
  }

  return res;
}
