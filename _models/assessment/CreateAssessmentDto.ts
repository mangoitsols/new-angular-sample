export enum CreateMode {
  Blank = 'blank',
  Default = 'default',
  Copy = 'copy'
}


export type CreateAssessmentDto =
  {
    method: CreateMode.Blank | CreateMode.Default
  } |
  {
    method: CreateMode.Copy;
    copyFrom: string;
  }
