const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const wantsTeaching = (text: string) =>
  /\b(teach|explain|learn|study|what is|how to|solve|help me understand)\b/.test(text);

const isShortTopic = (text: string) => {
  const words = text.split(/\s+/).filter(Boolean);
  return words.length > 0 && words.length <= 5;
};

export const createHelpfulLocalAnswer = (question: string) => {
  const text = question.trim();
  const lower = normalize(text);

  if (!text) {
    return 'Ask me a question and I will give you a direct answer.';
  }

  if (['ok', 'okay', 'yes', 'yeah', 'yep', 'hmm', 'pon'].includes(lower)) {
    return [
      'I am here with you.',
      '',
      'Give me one thing to solve and I will answer directly.',
      '',
      'Try one of these:',
      '- `teach pythagoras`',
      '- `make a Python study plan`',
      '- `fix my Firebase login`',
      '- `create lyrics animation idea`',
    ].join('\n');
  }

  if (
    lower.includes('pythagoras') ||
    lower.includes('puthagoras') ||
    lower.includes('pythagorean') ||
    lower.includes('right triangle')
  ) {
    return [
      'Pythagoras theorem is a rule for right-angled triangles.',
      '',
      'The formula is:',
      '',
      '`a^2 + b^2 = c^2`',
      '',
      'What it means:',
      '- `a` and `b` are the two shorter sides.',
      '- `c` is the longest side, called the hypotenuse.',
      '- It only works when the triangle has one 90 degree angle.',
      '',
      'Example:',
      'If one side is `3` and another side is `4`:',
      '',
      '`3^2 + 4^2 = c^2`',
      '`9 + 16 = c^2`',
      '`25 = c^2`',
      '`c = 5`',
      '',
      'So the missing longest side is `5`.',
      '',
      'Easy memory line: square both short sides, add them, then square-root the answer.',
      '',
      'Practice: if the short sides are `5` and `12`, the longest side is `13`.',
    ].join('\n');
  }

  if (lower.includes('firebase') || lower.includes('login') || lower.includes('deploy')) {
    return [
      'Here is the clean Firebase path:',
      '',
      '1. Keep guest login as the backup door so students are not blocked.',
      '2. Enable the sign-in providers you want in Firebase Authentication.',
      '3. Add your deployed domain to the authorized domains list.',
      '4. Deploy hosting only after every build.',
      '5. Test the public link in a fresh browser window.',
      '',
      'For SEA.RHO7, guest mode should stay useful first. Google login can be polished after the main experience works.',
    ].join('\n');
  }

  if (lower.includes('python')) {
    return [
      'Here is a simple Python learning path:',
      '',
      '1. Learn variables: store small values like names, numbers, and scores.',
      '2. Learn `if` statements: make decisions.',
      '3. Learn loops: repeat work without writing the same line again.',
      '4. Learn functions: put useful steps inside reusable blocks.',
      '5. Build one tiny project: calculator, quiz app, or note saver.',
      '',
      'Mini example:',
      '',
      '```python',
      'name = "Arup"',
      'print("Hello", name)',
      '```',
      '',
      'Best first project for SEA.RHO7: make a Python script that asks a question and prints a helpful answer.',
    ].join('\n');
  }

  if (lower.includes('day plan') || lower.includes('daily plan') || lower.includes('routine') || lower.includes('schedule')) {
    return [
      'Here is a simple day plan you can actually follow:',
      '',
      '1. **First 30 minutes:** choose one main goal for the day.',
      '2. **Deep work block:** study or build for 60-90 minutes with phone away.',
      '3. **Small break:** walk, water, stretch, no scrolling.',
      '4. **Practice block:** solve 3-5 questions or build one tiny feature.',
      '5. **Review block:** write what you learned in 5 bullet points.',
      '6. **Tomorrow setup:** choose the first task for tomorrow before sleeping.',
      '',
      'If you are a student, make the main goal specific, like: `finish Bernoulli examples` or `build one login screen`.',
    ].join('\n');
  }

  if (lower.includes('fluid mechanics') || lower.includes('fluid dynamics') || lower.includes('fluids')) {
    return [
      'Fluid mechanics is the study of how liquids and gases behave when they are still or moving.',
      '',
      'Think of it like this:',
      '- Water flowing through a pipe',
      '- Air moving over an airplane wing',
      '- Blood flowing through veins',
      '- Oil moving through an engine',
      '',
      'The two main parts are:',
      '',
      '1. **Fluid statics**',
      'This studies fluids at rest. Example: pressure at the bottom of a water tank.',
      '',
      '2. **Fluid dynamics**',
      'This studies fluids in motion. Example: water flowing through a pipe or air moving around a car.',
      '',
      'Important ideas:',
      '- **Density**: how much mass is packed into the fluid.',
      '- **Pressure**: force applied by the fluid on a surface.',
      '- **Viscosity**: how thick or sticky the fluid is. Honey has high viscosity; water has low viscosity.',
      '- **Flow rate**: how much fluid passes through a point per second.',
      '',
      'A famous rule: **Bernoulli principle**',
      'When fluid moves faster, its pressure often becomes lower.',
      '',
      'Simple example:',
      'If you squeeze the end of a water pipe, the opening becomes smaller, so water comes out faster.',
      '',
      'Practice question:',
      'Which has higher viscosity: water or honey?',
      '',
      'Answer: honey.',
    ].join('\n');
  }

  if (lower.includes('code') || lower.includes('bug') || lower.includes('app')) {
    return [
      'I would handle this like a coding assistant:',
      '',
      '1. Name the exact result you want.',
      '2. Reproduce the current behavior.',
      '3. Find the smallest file or screen connected to it.',
      '4. Make one focused change.',
      '5. Run the app and check the visible result.',
      '',
      `For your request, I would start with: "${text}" and turn it into one small working change before adding polish.`,
    ].join('\n');
  }

  if (lower.includes('lyrics') || lower.includes('song') || lower.includes('animation') || lower.includes('video')) {
    return [
      'For a lyrics animation, use this structure:',
      '',
      '1. Pick the mood: calm, victory, heartbreak, study, or anthem.',
      '2. Split the lyric into short lines.',
      '3. Give each line a visual motion: fade, rise, pulse, sweep, or glow.',
      '4. Keep the colors consistent: blue base, saffron highlights.',
      '5. Export the first draft, then tighten timing.',
      '',
      'SEA.RHO7 should create a moving preview first, then let you download it as a video.',
    ].join('\n');
  }

  if (lower.includes('student') && lower.includes('help')) {
    return [
      'How students will get help in SEA.RHO7:',
      '',
      '1. They ask one real question in plain language.',
      '2. SEA.RHO7 gives a direct answer, not only a plan.',
      '3. It shows one example so the student can copy the method.',
      '4. It gives one practice step so learning becomes action.',
      '5. If the cloud AI is not ready, the local helper still gives a useful first answer.',
      '',
      'A good lesson should not only give information. It should make the learner able to do the next step alone.',
    ].join('\n');
  }

  if (wantsTeaching(lower) || lower.includes('student') || lower.includes('exam')) {
    return [
      `Let me teach it simply: ${text}`,
      '',
      '1. First, we define the idea in one sentence.',
      '2. Then we show one example.',
      '3. Then you try one small practice question.',
      '4. Then we correct mistakes and make it stronger.',
      '',
      'A good lesson should not only give information. It should make the learner able to do the next step alone.',
    ].join('\n');
  }

  if (isShortTopic(lower)) {
    return [
      `Here is a simple lesson on **${text}**:`,
      '',
      `**Meaning:** ${text} is a topic we can understand by breaking it into definition, key ideas, examples, and practice.`,
      '',
      'How to learn it:',
      '1. Start with the basic definition.',
      '2. Learn the 3-5 most important terms.',
      '3. See one real-life example.',
      '4. Try one small question.',
      '',
      'To make this answer stronger, ask like this:',
      `- "Teach ${text} for a beginner"`,
      `- "Give formulas of ${text}"`,
      `- "Give examples of ${text}"`,
      '',
      'I will answer directly from the topic instead of making you repeat yourself.',
    ].join('\n');
  }

  return [
    'Here is a direct first answer:',
    '',
    `You asked: "${text}"`,
    '',
    'I will treat this as a topic or problem and start with the useful shape:',
    '',
    '1. Simple meaning',
    '2. Key ideas',
    '3. One example',
    '4. One practice step',
    '',
    'Ask the same topic with "teach", "explain", "formula", or "example" and I will go deeper.',
  ].join('\n');
};
