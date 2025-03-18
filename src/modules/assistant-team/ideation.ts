interface Message {
  role: 'assistant' | 'team';
  content: string;
}

const MAX_ITERATIONS = 5;

async function decideNextCall(messageHistory: Message[]): Promise<string> {
  const nextToCall = Math.random() > 0.5 ? 'assistant' : 'team';
  return nextToCall;
}

async function handleAssistantCall(messageHistory: Message[]) {
  console.log('Calling assistant...');
  // Call assistant logic here
  const historyItem: Message = await new Promise((resolve) => {
    const messageContent: Message = {
      role: 'assistant',
      content: 'Assistant response here',
    };
    setTimeout(() => resolve(messageContent), 1000);
  }); // Simulate async call
  // add to message history
  messageHistory.push(historyItem);
}

async function handleTeamCall(messageHistory: Message[]) {
  console.log('Calling team...');
  // Call team logic here
  const historyItem: Message = await new Promise((resolve) => {
    const teamMessageContent: Message = {
      role: 'team',
      content: 'Team response here',
    };
    setTimeout(() => resolve(teamMessageContent), 1000);
  }); // Simulate async call
  // add to message history
  messageHistory.push(historyItem);
}

async function run() {
  let messageHistory: Message[] = [];

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const nextToCall = await decideNextCall(messageHistory);

    switch (nextToCall) {
      case 'assistant':
        await handleAssistantCall(messageHistory);
        break;
      case 'team':
        await handleTeamCall(messageHistory);
        break;
      default:
        console.error('Unknown call type');
        break;
    }
  }
}
