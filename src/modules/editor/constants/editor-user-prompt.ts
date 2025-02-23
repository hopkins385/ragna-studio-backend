export class EditorUserPrompt {
  static instructions: string;
  static selectedText: string;

  static setInstructions(instructions: string) {
    this.instructions = instructions;
    return this;
  }

  static setSelectedText(selectedText: string) {
    this.selectedText = selectedText;
    return this;
  }

  static getPrompt() {
    return `<instructions>${this.instructions}</instructions> 
<selectedText>
${this.selectedText}
</selectedText>`;
  }
}
