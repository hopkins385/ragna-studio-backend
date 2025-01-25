export const systemPromptTemplate: string = `You are a helpful assistant developed by OpenAI that can efficiently perform tasks as per instruction`;

export const thinkingStyles: string[] = [
  'How could I devise an experiment to help solve that problem?',
  'Make a list of ideas for solving this problem, and apply them one by one to the problem to see if any progress can be made.',
  'How could I measure progress on this problem?',
  'How can I simplify the problem so that it is easier to solve?',
  'What are the key assumptions underlying this problem?',
  'What are the potential risks and drawbacks of each solution?',
  'What are the alternative perspectives or viewpoints on this problem?',
  'What are the long-term implications of this problem and its solutions?',
  'How can I break down this problem into smaller, more manageable parts?',
  'Critical Thinking: This style involves analyzing the problem from different perspectives, questioning assumptions, and evaluating the evidence or information available. It focuses on logical reasoning, evidence-based decision-making, and identifying potential biases or flaws in thinking.',
  'Try creative thinking, generate innovative and out-of-the-box ideas to solve the problem. Explore unconventional solutions, thinking beyond traditional boundaries, and encouraging imagination and originality.',
  'Seek input and collaboration from others to solve the problem. Emphasize teamwork, open communication, and leveraging the diverse perspectives and expertise of a group to come up with effective solutions.',
  'Use systems thinking: Consider the problem as part of a larger system and understanding the interconnectedness of various elements. Focuses on identifying the underlying causes, feedback loops, and interdependencies that influence the problem, and developing holistic solutions that address the system as a whole.',
  'Use Risk Analysis: Evaluate potential risks, uncertainties, and tradeoffs associated with different solutions or approaches to a problem. Emphasize assessing the potential consequences and likelihood of success or failure, and making informed decisions based on a balanced analysis of risks and benefits.',
  'Use Reflective Thinking: Step back from the problem, take the time for introspection and self-reflection. Examine personal biases, assumptions, and mental models that may influence problem-solving, and being open to learning from past experiences to improve future approaches.',
  'What is the core issue or problem that needs to be addressed?',
  'What are the underlying causes or factors contributing to the problem?',
  'Are there any potential solutions or strategies that have been tried before? If yes, what were the outcomes and lessons learned?',
  'What are the potential obstacles or challenges that might arise in solving this problem?',
  'Are there any relevant data or information that can provide insights into the problem? If yes, what data sources are available, and how can they be analyzed?',
  'Are there any stakeholders or individuals who are directly affected by the problem? What are their perspectives and needs?',
  'What resources (financial, human, technological, etc.) are needed to tackle the problem effectively?',
  'How can progress or success in solving the problem be measured or evaluated?',
  'What indicators or metrics can be used?',
  'Is the problem a technical or practical one that requires a specific expertise or skill set? Or is it more of a conceptual or theoretical problem?',
  'Does the problem involve a physical constraint, such as limited resources, infrastructure, or space?',
  'Is the problem related to human behavior, such as a social, cultural, or psychological issue?',
  'Does the problem involve decision-making or planning, where choices need to be made under uncertainty or with competing objectives?',
  'Is the problem an analytical one that requires data analysis, modeling, or optimization techniques?',
  'Is the problem a design challenge that requires creative solutions and innovation?',
  'Does the problem require addressing systemic or structural issues rather than just individual instances?',
  'Is the problem time-sensitive or urgent, requiring immediate attention and action?',
  'What kinds of solution typically are produced for this kind of problem specification?',
  'Given the problem specification and the current best solution, have a guess about other possible solutions.',
  "Let's imagine the current best solution is totally wrong, what other ways are there to think about the problem specification?",
  'What is the best way to modify this current best solution, given what you know about these kinds of problem specification?',
  'Ignoring the current best solution, create an entirely new solution to the problem.',
  "Let's think step by step.",
  "Let's make a step by step plan and implement it with good notion and explanation.",
];

export const critiqueTemplate: string = `I'm trying to write a zero-shot instruction that will help the most capable and suitable agent to solve the task.
My current prompt is: "{instruction}"
But this prompt gets the following examples wrong: {examples}
Provide detail feedback which identifies reasons where the instruction could have gone wrong.
Wrap each reason with <START> and <END>`;

export const positiveCritiqueTemplate: string = `I'm trying to write a prompt for zero-shot instruction task that will help the most capable and suitable agent to solve the task.
My current prompt is:
[CURRENT PROMPT] "{instruction}"
Now this prompt got the following examples correct:
[CORRECT EXAMPLES] {examples}
Since you cant use these examples, analyse and understand characteristics/complexity and diversity of these examples and their reasoning chain and
accordingly provide suggestions to further improve the prompt and make it better as a zero shot instruction task.`;

export const critiqueRefineTemplate: string = `I'm trying to write a zero-shot instruction that will help the most capable and suitable agent to solve the task.
My current prompt is: "{instruction}"
But this prompt gets the following examples wrong: {examples}
On carefully analysing these examples, following are the critiques related to prompt {critique}
Use the critique smartly, refine the current prompt to make sure we dont get these examples wrong.
Based on the above information, Now I want you to write {steps_per_sample} different improved prompts.
Each prompt should be wrapped with <START> and <END>.
[Refined Prompts]:`;

export const basicPromptImprovementTemplate: string = `I'm trying to write a zero-shot instruction that will help the most capable and suitable agent to solve the task.
This is what I want the agent to do: "{inputPrompt}"
On carefully analysing my wishes, following are the critiques related to prompt {critique}
Use the critique smartly, refine the current prompt based on the critique.`;

export const finalzingPromptTemplate: string = `I'm trying to write a zero-shot instruction that will help the most capable and suitable agent to solve the task.
My current prompt is: "{inputPrompt}"
On carefully analysing the prompt, following are the critiques related to prompt {critique}
Use the critique smartly, refine the current prompt based on the critique.
Only provide the final prompt, no need to provide any critique.
Do not use markdown for proper formatting.`;
