/* ============================================================
   Fear of Falling — Free Introduction: course content
   ------------------------------------------------------------
   Everything you are likely to want to edit lives in this file:
   the upgrade link, the chapter videos and the lesson text.

   - Videos: paste any YouTube link (youtu.be/…, youtube.com/watch?v=…
     or a bare video ID) into `video`.
   - Lesson text: plain HTML. Use <h2> for section headings (they get
     the green bar), <h3> for sub-headings, <blockquote> for the
     shaded callout cards, <hr> for a divider.
   - Chapters 6–21 deliberately have titles only. Their lessons are
     not in the free version at all, so there is nothing to unlock
     by editing the URL.
   ============================================================ */
window.FOF_FREE = {
  upgradeUrl: 'https://expedition-psychology.co.uk/login',
  freeChapters: 5,

  // Workbook tasks, as in the full course. Only A and B are part of the free introduction.
  tasks: [
    { id: 'fear', letter: 'A', title: 'Getting to Know Fear', description: 'Identify your personal triggers and physical responses.', chapter: 3 },
    { id: 'goals', letter: 'B', title: 'Goal Setting', description: 'Define what success looks like for your mental game.', chapter: 4 },
    { id: 'ladder', letter: 'C', title: 'The Exposure Ladder', description: 'Create your hierarchy of fear-inducing exercises.', chapter: 6 },
    { id: 'planning', letter: 'D', title: 'Session Planning', description: 'Map out your next practical training session.', chapter: 8 },
    { id: 'logging', letter: 'E', title: 'Practice Logbook', description: 'The ongoing diary of your exposure sessions.', chapter: 10 },
    { id: 'reevaluate', letter: 'F', title: 'Re-evaluating the Ladder', description: 'Update your exposure ladder based on your progress.', chapter: 14 },
    { id: 'reframing', letter: 'G', title: 'Reframing Thoughts', description: 'Practical tools to shift your automatic fear responses.', chapter: 15 },
    { id: 'reflections', letter: 'H', title: 'Final Reflections', description: 'Reflect on your progress and plan your next steps.', chapter: 21 },
  ],

  chapters: [
    {
      n: 1,
      title: 'Introduction',
      video: 'https://youtu.be/JYaMStKu69Y',
      html: `
<h2>Welcome</h2>
<p>Welcome to <strong>The Fear of Falling Toolkit</strong>.</p>
<p>Thank you for choosing to take part in this course. We’re really pleased to have you here and excited to support you in building confidence and freedom in your climbing.</p>
<h2>Aims of the Course</h2>
<p>This course has two main aims:</p>
<ul>
<li><strong>To reduce your fear of falling</strong></li>
<li><strong>To improve your confidence when climbing at your limit</strong></li>
</ul>
<p>By the end of the programme, you should feel more able to take on new routes and challenges, without fear holding you back.</p>
<hr>
<h2>Disclaimer</h2>
<blockquote>
<p><strong>This course does not teach you how to climb.</strong></p>
<p>All content in this course is in the context of indoor climbing and assumes that you and your belayer already know how to lead climb safely, including:</p>
<ul>
<li>Belaying safely</li>
<li>Clipping correctly</li>
<li>Managing your rope effectively</li>
<li>Identifying and managing risks</li>
</ul>
</blockquote>
<h2>Safety and Responsibility</h2>
<p>This programme is designed to support the psychological side of climbing, particularly confidence and fear of falling. It is not a substitute for in-person, professional climbing instruction.</p>
<p><strong>All practical exercises should only be carried out:</strong></p>
<ul>
<li>In line with the policies and safety guidance of your climbing wall.</li>
<li>With appropriate equipment that is correctly fitted and in good condition.</li>
<li>With a competent and attentive belayer using the recommended technique of the manufacturer of the belay device.</li>
<li>On a suitable route in an appropriate area of the wall.</li>
</ul>
<blockquote>
<p><strong>Important:</strong> Do not practise falling exercises if you are unsure about any aspect of your setup, communication, or technique. If in doubt, seek guidance from a qualified instructor.</p>
</blockquote>
<p>You are responsible for your own safety and decisions. Stop any exercise if you feel unwell, injured, overly fatigued, or unsafe. If fear becomes overwhelming, return to an easier step.</p>
<p>If you have a history of significant trauma, panic, or other mental health difficulties that may be triggered by exposure work, consider completing this programme with support from a qualified professional.</p>
<hr>
<h2>Course Structure</h2>
<p>The course is divided into two parts:</p>
<h3>Part 1: Foundations</h3>
<p>You’ll begin with the theoretical chapters, designed to help you understand fear and prepare for the practical work. We recommend that you complete these chapters at home, at your own pace, with time to reflect.</p>
<h3>Part 2: Practical Application</h3>
<p>You’ll then move into the practical phase, where you’ll apply these skills through structured fall practice at your climbing wall.</p>
<p>All chapters are accompanied by videos, which you can watch either at home or at the wall.</p>
<h2>Your Workbook</h2>
<p>Throughout the course, you’ll use a personal workbook to reflect on your experiences and track your progress. This is a key part of the process. Taking time to write things down will help deepen your learning and make your progress more visible.</p>
<p>Watch the video below to see how to use the workbook effectively.</p>
<h2>Join the Community</h2>
<p>Click the WhatsApp link to <a href="https://chat.whatsapp.com/LF0FGpOdCoDBQooV0wbBWM?mode=gi_t">Join The Fear of Falling Toolkit WhatsApp Community</a>. This is a space where you can:</p>
<ul>
<li>Share your experiences.</li>
<li>Encourage others.</li>
<li>Ask questions and exchange ideas about the exercises.</li>
</ul>
<p>Learning alongside others can make the process more motivating and more enjoyable.</p>
<h2>A Final Note Before You Begin</h2>
<p>Progress is rarely linear. Some days will feel easier than others, and that’s completely normal. What matters is consistency, patience, and a willingness to stay engaged with the process.</p>
<p>This course isn’t about being fearless or forcing fear away. It’s about learning, practising, and gradually building trust in yourself.</p>
`,
    },
    {
      n: 2,
      title: 'What is Fear?',
      video: 'https://youtu.be/pZtDYIWg0kM',
      html: `
<h2>Why This Matters?</h2>
<p>Fear is one of the most misunderstood parts of climbing. Many climbers assume fear means something is wrong; that they’re weak, incapable, or not cut out for certain routes. In reality, fear is a normal and essential survival system. Understanding what fear <strong>is</strong> is the foundation for learning how to work with it.</p>
<blockquote>
<h3>Learning Expectations</h3>
<p>By the end of this chapter, you will understand:</p>
<ul>
<li>What fear <strong>is</strong></li>
<li>How fear shows up for us in climbing</li>
<li>How fear of falling develops in climbing</li>
<li>An exercise to take into your next session</li>
<li>How your relationship with fear will evolve</li>
</ul>
</blockquote>
<h2>Fear is a Protective System</h2>
<p>Fear is a natural survival system that has existed throughout human history. It evolved to keep us alive when facing danger. When early humans encountered a threat, such as a predator, the body and mind rapidly activated the <strong>fight-or-flight response</strong>.</p>
<p>The heart beats faster to pump blood to the muscles, breathing speeds up to increase oxygen, focus narrows onto the threat, and sweating helps regulate body temperature. At the same time, the mind quickly runs through possible future scenarios: <em>Should I run? Hide? Fight?</em> This rapid mental simulation helps us become aware of the risks and decide the best action to stay safe.</p>
<p>The feeling of fear itself is uncomfortable, which pushes us to act, whether that means escaping, defending ourselves, or finding safety. In this way, fear functions as a powerful system designed to protect and preserve our lives.</p>
<hr>
<h2>What does fear look like in climbing?</h2>
<p>The same system exists for us in climbing, where our thoughts, body sensations, and behaviour are all affected.</p>
<h3>Triggers</h3>
<p>Our fear is triggered by situations that usually precede the risk of falling or danger.</p>
<ul>
<li><strong>Examples:</strong> Trying a limit route, throwing for a hold, being pumped, climbing in a new area of the wall, or climbing with someone new.</li>
</ul>
<h3>Thoughts</h3>
<p>Fearful thoughts scan for danger and predict outcomes, often using "what if" scenarios.</p>
<ul>
<li><strong>Examples:</strong> <em>"Did I tie my knot correctly?", "Is my belayer paying attention?", "What if I fall and swing into the wall?"</em></li>
</ul>
<p>Thoughts can support safety, but when repetitive, they pull our attention away from efficient movement and enjoyment of the climb.</p>
<h3>Body</h3>
<p>Just as mentioned before, our body changes in relation to the perceived danger.</p>
<ul>
<li><strong>Sensations:</strong> Increased heart rate, faster/shallower breathing, muscle tension, sweating, and narrowed vision.</li>
</ul>
<p>Tension increases over-gripping and fatigue, shallow breathing limits recovery, sweating reduces friction, and narrowed vision reduces awareness on the route.</p>
<h3>Behaviour</h3>
<p>Fear changes behaviour.</p>
<ul>
<li><strong>Fight:</strong> Forced effort, rushing, shaking, panic clipping.</li>
<li><strong>Flight:</strong> Avoiding hard routes, down-climbing, refusing to commit, asking to take.</li>
</ul>
<p>While fight can look like bravery, the goal is to learn to climb well with fear, not overpower it.</p>
<hr>
<h2>Why Do We Feel Fear of Falling in Climbing?</h2>
<p>Fear of falling often develops through a <strong>lack of safe exposure</strong>. If you rarely experience controlled falls, feeling the rope catch, trusting the belayer, and learning what is and isn’t safe, then your brain has no evidence that falling can be manageable.</p>
<p>In that situation, <strong>avoidance</strong> becomes the default strategy:</p>
<ul>
<li>You down-climb.</li>
<li>You shout “take” early.</li>
<li>You avoid committing above gear or clips.</li>
</ul>
<p>Avoidance reduces anxiety in the short term, but it teaches your brain that avoidance is <strong>necessary</strong>. Over time, the fear becomes more established. <strong>Fear isn’t the problem; lack of experience is.</strong></p>
<blockquote>
<h3>Practical Exercise: Spotting Avoidance</h3>
<p><strong>Purpose:</strong> To begin noticing how fear influences your decisions on the wall.</p>
<p><strong>What to Do:</strong> During your next climbing session, notice:</p>
<ol>
<li>What situations trigger avoidance?</li>
<li>What you do in response to those triggers?</li>
<li>How quickly does avoidance reduce your fear?</li>
</ol>
</blockquote>
<h2>When Fear Can Be Useful</h2>
<p>Fear isn’t the enemy. With enough safe exposure, it can become useful. At manageable levels, fear sharpens focus, increases alertness, and helps you commit to difficult moves. This is often what climbers describe as <strong>nerves</strong> rather than panic.</p>
<p>In terms of safety, it ensures our knot is tied properly, helps us spot any real dangers whilst we're climbing, and manages risks. The aim of this course isn’t to remove fear, but to recalibrate it. Through repeated, safe experience, fear becomes information rather than a stop signal.</p>
`,
    },
    {
      n: 3,
      title: 'Getting To Know Your Fear',
      video: 'https://youtu.be/O4gA5k09qww',
      task: 'fear',
      html: `
<h2>Why This Matters</h2>
<p>Fear often feels overwhelming because it shows up all at once; thoughts, body sensations, and urges all blending together. When fear feels vague or chaotic, it’s much harder to work with.</p>
<p>In this chapter, you’ll begin to <strong>slow fear down</strong> and break it into parts, so it becomes clearer, more predictable, and less controlling. This is a key step in moving from <strong>reacting</strong> to fear, to <strong>working with</strong> it.</p>
<blockquote>
<h3>Learning Expectations</h3>
<p>By the end of this chapter, you will be able to:</p>
<ul>
<li>Identify what triggers your fear while climbing.</li>
<li>Recognise the thoughts that show up when fear is present.</li>
<li>Notice how fear feels in your body.</li>
<li>Understand how you typically respond or avoid.</li>
</ul>
</blockquote>
<hr>
<h2>Fear shows up in patterns</h2>
<p>Although fear feels sudden, it usually follows a pattern. In climbing, fear shows up across four linked areas:</p>
<ol>
<li><strong>Triggers:</strong> When and where the fear appears (e.g. being pumped).</li>
<li><strong>Thoughts:</strong> What your mind predicts or warns you about (e.g. <em>"What if my belayer doesn't catch me?"</em>).</li>
<li><strong>Body sensations:</strong> How your body system responds (e.g. overgripping, narrowed focus, sweating).</li>
<li><strong>Behaviour:</strong> What you do to reduce fear (e.g. asking to take).</li>
</ol>
<p>Learning to notice these patterns doesn’t remove fear, but it makes fear more understandable and workable. <strong>What you can notice, you can work with.</strong></p>
<blockquote>
<h3>Practical Exercise: Getting To Know Fear</h3>
<p>In your workbook, you will consider a time when you were scared of falling and break it down into the above four points.</p>
</blockquote>
`,
    },
    {
      n: 4,
      title: 'Setting Goals',
      video: 'https://youtu.be/LY1NldO1b7w',
      task: 'goals',
      html: `
<h2>Why This Matters</h2>
<p>Confronting fear is not easy. Fear is uncomfortable by design—it exists to protect us, so it makes sense that we try to avoid it. When we choose to face fear intentionally, especially in climbing, we need something strong enough to guide us through that discomfort.</p>
<p>That guide is a <strong>clear, personal goal</strong>. Goals give fear a <strong>direction</strong>. They help you move forward with fear, rather than waiting for it to disappear.</p>
<blockquote>
<h3>Learning Expectations</h3>
<p>By the end of this chapter, you will be able to:</p>
<ul>
<li>Understand why goals matter when working with fear.</li>
<li>Identify a <strong>SMART</strong> climbing goal that motivates you.</li>
<li>Identify the qualities of the climbers that inspire you.</li>
<li>Clarify the kind of climber you want to become.</li>
</ul>
</blockquote>
<hr>
<h2>Why Fear Needs Direction</h2>
<p>Fear focuses your attention on what could go wrong. Goals shift your attention toward what you’re moving toward. Without a goal, fear tends to win—comfort becomes the default. With a goal, we have a reason to endure the discomfort and overcome our fear.</p>
<h2>1. Setting a SMART Goal</h2>
<p>A <strong>SMART goal</strong> helps turn a vague ambition into a clear and achievable objective.</p>
<ul>
<li><strong>Specific:</strong> The goal clearly states what you want to achieve.</li>
<li><strong>Measurable:</strong> You can track your progress (e.g., progressing toward a 6c).</li>
<li><strong>Achievable:</strong> The goal should be realistic and within reach.</li>
<li><strong>Relevant:</strong> The goal needs to matter to <strong>you</strong>.</li>
<li><strong>Time-bound:</strong> The goal has a clear timeframe.</li>
</ul>
<p><strong>Example:</strong> <em>“I want to climb a 6c route before my trip to Kalymnos in October.”</em></p>
<h2>2. Three Qualities of Inspiring Climbers</h2>
<p>Think of three qualities in climbers that inspire you. This is not about their strength, but their <strong>attitude</strong>.</p>
<ul>
<li><strong>Persistence:</strong> Continuing to try after setbacks.</li>
<li><strong>Calmness:</strong> Staying composed when a route feels difficult or committing.</li>
<li><strong>Curiosity:</strong> Enjoying the process of figuring out moves and learning from mistakes.</li>
</ul>
<h2>3. The Climber You Want To Be</h2>
<p>Imagine yourself <strong>one year from now</strong> as the climber you want to become. Think about the energy and attitude you want to bring. How will you respond when a route feels intimidating, when you fall, or when progress feels slow?</p>
<blockquote>
<h3>Practical Exercise: Guiding Yourself Through Fear</h3>
<p>When you reach a difficult moment (e.g., wanting to skip fall practice), pause and ask yourself:
<strong>"Is this decision taking me closer to the climber I want to be, or further away?"</strong></p>
</blockquote>
`,
    },
    {
      n: 5,
      title: 'What is Exposure Therapy',
      video: 'https://youtu.be/8oosk9nv-hc',
      html: `
<h2>Why This Matters</h2>
<p>Fear of falling doesn’t reduce by waiting to feel confidence. It changes through experience. <strong>Exposure therapy</strong> is the process that allows your nervous system to learn through experience that situations which feel dangerous can be safe and manageable.</p>
<blockquote>
<h3>Learning Expectations</h3>
<p>By the end of this chapter, you will understand:</p>
<ul>
<li>Fear rises and falls naturally.</li>
<li>Avoidance makes fear worse.</li>
<li>Exposure to fear allows us to recalibrate it.</li>
<li>The four rules of exposure therapy.</li>
</ul>
</blockquote>
<hr>
<h2>Fear As A Bell-Shaped Curve</h2>
<p>It can be helpful to think about fear as a <strong>bell-shaped curve</strong>. Like all emotions, fear rises, peaks, and eventually falls. Avoidance reduces fear in the moment, but it prevents us from having the experience of staying in the situation long enough for the fear to naturally fade.</p>
<h2>A Helpful Analogy</h2>
<p>A helpful analogy is swimming in cold water. When you first jump in, the cold feels shocking and you want to get out immediately. If you stay in the water, your body gradually adapts and the feeling becomes manageable.</p>
<h2>The 4 Rules Of Exposure</h2>
<ol>
<li><strong>Graded:</strong> Broken into small, manageable steps.</li>
<li><strong>Prolonged:</strong> Staying in the situation long enough for fear to reduce.</li>
<li><strong>Repeated:</strong> So the learning becomes ingrained over time.</li>
<li><strong>Without Distractions:</strong> Relying on crutches (like music) can prevent full learning.</li>
</ol>
`,
    },
    // Full Toolkit only: titles shown as locked chapters, no lesson content.
    { n: 6, title: 'Creating Your Exposure Ladder' },
    { n: 7, title: 'Resilience Skills: Behavioural' },
    { n: 8, title: 'Planning Your Exercises' },
    { n: 9, title: 'Before You Start' },
    { n: 10, title: 'Falling on Top Rope (No Slack)' },
    { n: 11, title: 'Falling on Top Rope (Some Slack)' },
    { n: 12, title: 'Falling on Top Rope (No Warning to Belayer)' },
    { n: 13, title: 'Falling on Lead (Below the Bolt)' },
    { n: 14, title: 'Re-Evaluating Your Ladder' },
    { n: 15, title: 'Resilience Skills: Cognitive' },
    { n: 16, title: 'Falling on Lead (At the Bolt)' },
    { n: 17, title: 'Falling on Lead (Above the Bolt)' },
    { n: 18, title: 'Falling on Lead (At the Next Bolt)' },
    { n: 19, title: 'Resilience Skills: Mindfulness' },
    { n: 20, title: 'Falling on Lead (Climbing at Your Limit)' },
    { n: 21, title: 'Congratulations and Reflections' },
  ],

  // Workbook Task A: option lists copied from the full course.
  fearSections: [
    { key: 'triggers', title: 'Triggers', hint: 'What situations specifically trigger your fear?', options: ['Being above the bolt', 'Climbing with someone new', 'Standing on poor footholds', 'Holding poor holds', 'Moving out of the line of the climb', 'Unbalanced positions', 'Being pumped', 'Clipping', 'Changes of gradient', 'Committing moves', 'High body tension', 'Being high above the ground', 'Being short roped', 'Being rushed', 'Climbing in a busy area'] },
    { key: 'thoughts', title: 'Automatic Thoughts', hint: 'What is your inner monologue saying?', options: ['I’m going to land on my belayer', 'I’m going to hurt myself', 'I’m going to hit a hold', 'I’m going to hit the wall', 'What if I fall dropping the clip?', 'What if I invert whilst falling?', 'What if my belayer isn’t paying attention?', 'What if my knot isn’t tied properly?', 'What if my equipment fails?', 'Is my harness done up properly?', 'What if I fall off something “easy”?', 'What if I have the same bad fall I’ve had before?'] },
    { key: 'bodySymptoms', title: 'Physiological Response', hint: 'How does your body physically react?', options: ['Tense muscles', 'Losing coordination/flow', 'Racing heart', 'Increased breathing rate', 'Shaky legs', '“Butterflies in stomach”', 'Sweaty hands / feet', 'Dry mouth', 'Needing to wee'] },
    { key: 'behaviours', title: 'Safety Behaviours', hint: 'What actions do you take to avoid the fear?', options: ['Ask the belayer to take', 'Avoid the route', 'Grab the rope', 'Grab a quickdraw', 'Grab a jug', 'Change route midway', 'Downclimb', 'Overgrip', 'Climb more statically', 'Climb more hesitantly', 'Overthink next move'] },
  ],
};
