// interfaces/template-engine.interface.ts

export interface ITemplateEngine {
  render(template: string, data: Record<string, any>): Promise<string>;
  renderSubject(template: string, data: Record<string, any>): Promise<string>;
}
