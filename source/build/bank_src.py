# Little Lingos open activity bank: original homework activities and questions.
# Each item: (stage, skill, title, minutes, instructions, [questions])
# Stages: Seeds (3.5-6), Sprouts (7-10), Blooms (11-15)
import json, re

S, P, B = "Seeds", "Sprouts", "Blooms"
ITEMS = [
# ---------------- SEEDS (3.5-6) ----------------
(S,"phonics","Sound hunt: the letter S",10,"Walk around your home with a grown-up. Find 3 things that start with the 'sss' sound, like a snake. Say each word out loud and point to it.",["What did you find first?","Can you hiss like a snake: sssss?","Say your three words again, slowly."]),
(S,"phonics","Sound hunt: the letter M",10,"Find 3 things that start with the 'mmm' sound, like 'mmm, yummy!'. Touch each one and say its name.",["Rub your tummy and say 'mmm'.","Which thing was the biggest?"]),
(S,"phonics","Clap the syllables",10,"Say each word and clap once for every beat: cat (1), apple (2), banana (3), butterfly (3), elephant (3). Then clap your own name!",["How many claps in your name?","Which word had the most claps?"]),
(S,"phonics","Rhyme time",10,"Say these pairs. Do they rhyme? Thumbs up for yes, thumbs down for no: cat-hat, sun-run, dog-cup, bee-tree, fish-dish, ball-sock.",["Can you think of a word that rhymes with 'cat'?","Can you think of a word that rhymes with 'bee'?"]),
(S,"phonics","First sound match",10,"Look at these pictures with a grown-up (or real things at home): a ball, a bag, a cup, a car. Which two start with 'b'? Which two start with 'c'?",["Say 'b-b-ball'.","Say 'c-c-cup'."]),
(S,"vocabulary","My body words",10,"Touch and say: head, eyes, ears, nose, mouth, hands, knees, feet. Then play 'Pip says': a grown-up says 'Pip says touch your nose!'",["What do you use to see?","What do you use to hear?","What do you use to walk?"]),
(S,"vocabulary","Colour hunt",10,"Find something red, something blue, something yellow and something green at home. Say: 'This is a red ___.'",["What is your favourite colour?","What colour is the sky today?"]),
(S,"vocabulary","Fruit basket",10,"Name the fruits you can find at home or in a picture book: apple, banana, mango, orange, grapes. Say which ones you like: 'I like ___.'",["Which fruit is yellow?","Which fruit is your favourite?"]),
(S,"vocabulary","Animal sounds",10,"Say the animal and make its sound: cow (moo), dog (woof), cat (meow), duck (quack), lion (roar). Ask a grown-up to guess the animal from your sound!",["Which animal says 'quack'?","Which animal is the biggest?"]),
(S,"vocabulary","Counting garden",10,"Count 1 to 10 out loud. Then count real things: spoons, shoes or toys. Say: 'I have five toys.'",["How many shoes are at your door?","Can you count backwards from 5?"]),
(S,"speaking","Hello, my name is…",5,"Stand tall and say to a grown-up: 'Hello! My name is ___. I am ___ years old.' Then wave goodbye: 'Bye-bye!'",["Can you say it in a big voice and a tiny voice?"]),
(S,"speaking","Show and tell",10,"Pick your favourite toy. Tell a grown-up 3 things about it: 'This is my ___. It is ___ (colour). I like it because ___.'",["What is your toy's name?","Where do you keep it?"]),
(S,"speaking","How do you feel today?",5,"Show a happy face, a sad face, a sleepy face and a surprised face. Say: 'I feel happy today!'",["How do you feel right now?","What makes you happy?"]),
(S,"speaking","Sing a song",10,"Sing 'Twinkle, Twinkle, Little Star' or 'Head, Shoulders, Knees and Toes' with a grown-up. Do the actions too!",["Which song did you sing?","Can you sing it once more, a little faster?"]),
(S,"listening","Simon (Pip) says",10,"A grown-up gives instructions starting with 'Pip says': 'Pip says jump!', 'Pip says sit down!'. Only move when you hear 'Pip says'!",["How many did you get right?"]),
(S,"listening","Listen and draw",10,"A grown-up says: 'Draw a big sun. Draw a small house. Draw a red flower.' Listen carefully and draw each thing.",["Show your picture. Can you name everything in it?"]),
(S,"listening","What's that sound?",10,"Close your eyes. A grown-up makes sounds at home: clapping, a door, water, a spoon on a cup. Guess each sound in English.",["Which sound was the loudest?"]),
(S,"reading","Picture book walk",10,"Look at a picture book with a grown-up. Point to things you know and say their names in English.",["What was in the first picture?","How many animals did you see?"]),
(S,"reading","My name in letters",10,"Look at your name written down. Point to each letter and say it. Find the first letter of your name in a book or on a box at home.",["What is the first letter of your name?"]),
(S,"writing","Trace and draw lines",10,"Draw lines across the page: straight lines like rain, zig-zag lines like mountains and curly lines like snails. Use a crayon!",["Which line was the hardest?"]),
(S,"writing","Draw your family",15,"Draw your family. A grown-up writes the names under each person. Say: 'This is my mum. This is my dad.'",["Who is in your picture?","Who is the tallest?"]),
(S,"grammar","Big and small",10,"Find a big spoon and a small spoon, a big shoe and a small shoe. Say: 'This is big. This is small.'",["Is an elephant big or small?","Is an ant big or small?"]),
(S,"grammar","In, on, under",10,"Put a toy in a box, on a box and under a box. Each time say where it is: 'The teddy is under the box.'",["Where is your toy now?"]),
# ---------------- SPROUTS (7-10) ----------------
(P,"phonics","Magic e",15,"Read each pair and hear how the silent 'e' changes the vowel: cap/cape, kit/kite, hop/hope, cub/cube, tap/tape. Write two more pairs you know.",["Read 'pin' and 'pine'. What changed?","Write a sentence using 'kite'."]),
(P,"phonics","Digraph detective: sh, ch, th",15,"Find and write 3 words for each sound: sh (ship…), ch (chair…), th (three…). Underline the two letters that make one sound.",["Which sound is in 'fish'?","Which sound is in 'lunch'?","Which sound is in 'bath'?"]),
(P,"phonics","Tongue twister challenge",10,"Read this three times, faster each time: 'She sells seashells by the seashore.' Then make up your own tongue twister with your name.",["Write your own tongue twister."]),
(P,"vocabulary","Word of the day",10,"Learn today's word with your trainer's word list. For each word write: what it means, a picture, and your own sentence.",["Use the word in a question.","Find a word that means the opposite."]),
(P,"vocabulary","Opposites match",10,"Write the opposite of each word: hot, happy, open, fast, full, early, loud, heavy.",["Pick two pairs and use them in one sentence each."]),
(P,"vocabulary","Category sort",15,"Sort these words into Animals, Food and Places: tiger, bread, school, rabbit, rice, park, eagle, cheese, market. Add one more word to each group.",["Which group was easiest?","Can you think of a new category?"]),
(P,"vocabulary","Describe it in 3 words",10,"Choose 3 things at home. Describe each one using 3 adjectives, e.g. 'My bag is blue, heavy and soft.'",["Which adjectives did you use most?"]),
(P,"speaking","My favourite day",10,"Talk for one minute about your favourite day of the week. Say what you do, who you are with and why you like it. Record it if you can.",["What is your least favourite day? Why?"]),
(P,"speaking","Interview a family member",15,"Ask someone at home 5 questions in English: What is your favourite food? What did you like at school? … Write down their answers.",["What was the most surprising answer?"]),
(P,"speaking","Picture talk",10,"Look at any photo at home. Say 5 sentences about it: who is there, where they are, what they are doing, the weather and how they feel.",["Can you guess what happened next?"]),
(P,"listening","Story listening",15,"Listen to a short story read by a grown-up or audio. Then answer the questions.",["Who was in the story?","Where did it happen?","What was the problem?","How did it end?"]),
(P,"listening","Dictation: 5 sentences",10,"A grown-up reads 5 short sentences slowly. Write them down. Check your spelling together afterwards.",["How many words did you spell correctly?"]),
(P,"reading","Read and answer: Pip's garden",15,"Read: 'Pip planted three seeds on Monday. He watered them every day. On Friday, a little green sprout came up. Pip was so happy that he danced in the sun.' Answer the questions.",["How many seeds did Pip plant?","What did Pip do every day?","When did the sprout come up?","How did Pip feel? How do you know?"]),
(P,"reading","Read aloud practice",10,"Choose a page from a book you like. Read it aloud twice: once slowly, once with expression, like a storyteller.",["Which word was hardest to read?","What was the page about?"]),
(P,"reading","Find the main idea",15,"Read a short paragraph from your book or newspaper for kids. Write the main idea in one sentence and two details that support it.",["Give your paragraph a new title."]),
(P,"writing","Write a postcard",15,"Imagine you are on holiday. Write a postcard to a friend: where you are, the weather, what you did and what you ate. Start with 'Dear ___,' and end with 'Love, ___'.",["Draw a picture for the front of your postcard."]),
(P,"writing","Five-sentence story",20,"Write a story in 5 sentences: 1) who and where, 2) what they wanted, 3) the problem, 4) how they solved it, 5) how it ended.",["Give your story a title.","Underline all the action words."]),
(P,"writing","My weekend diary",15,"Write about your weekend using 'First, … Then, … After that, … Finally, …'",["What was the best part of your weekend?"]),
(P,"grammar","Past tense switch",15,"Change these to the past: I play → I played. Now try: walk, jump, eat, go, see, have, run, write. Watch out for tricky ones!",["Which words did not add -ed?","Write two sentences about yesterday."]),
(P,"grammar","Plurals",10,"Write the plural: cat, box, baby, child, mouse, leaf, bus, tooth.",["Which plurals are irregular?"]),
(P,"grammar","Question words",15,"Write one question using each word: who, what, where, when, why, how. Ask someone at home and write their answers.",["Which question got the longest answer?"]),
(P,"grammar","Capital letters and full stops",10,"Fix these sentences: 'my name is riya i live in delhi' / 'on sunday we went to the park'.",["Write 3 sentences about your town with correct capitals and full stops."]),
# ---------------- BLOOMS (11-15) ----------------
(B,"vocabulary","Word roots",20,"Learn these roots: 'bio' (life), 'graph' (write), 'tele' (far), 'port' (carry). Make and define 2 words for each, e.g. biography, telephone.",["Guess the meaning of 'portable'.","Invent a new word using two roots and define it."]),
(B,"vocabulary","Synonyms ladder",15,"Arrange from weakest to strongest: warm/hot/boiling; like/love/adore; tired/exhausted/sleepy; big/huge/enormous. Use the strongest word of each in a sentence.",["Why do writers choose stronger words?"]),
(B,"vocabulary","Idioms in context",20,"Find the meaning of: 'break the ice', 'piece of cake', 'under the weather', 'hit the books'. Write a short dialogue using at least two.",["Which idiom would you use before an exam?"]),
(B,"vocabulary","Collocations",15,"Match verbs and nouns that go together: make / do / take / have + a decision, homework, a photo, a break, a mistake, fun. Write one sentence for each.",["Which ones surprised you?"]),
(B,"speaking","One-minute speech",20,"Prepare and record a one-minute speech on: 'Should students have homework every day?' Use an opening, two reasons with examples and a conclusion.",["What was your strongest reason?","What would someone who disagrees say?"]),
(B,"speaking","Debate prep",25,"Topic: 'Technology makes us more connected.' Write 3 points FOR and 3 points AGAINST. Choose a side and practise a 90-second argument.",["Which side was easier to argue? Why?"]),
(B,"speaking","Describe and persuade",15,"Choose a book, film or game you love. In 2 minutes, describe it and persuade a friend to try it. Use phrases like 'What I love most is…' and 'You should definitely…'.",["What makes a recommendation convincing?"]),
(B,"speaking","Elevator pitch",15,"Invent a product that solves a problem at school. Pitch it in 45 seconds: the problem, your solution, why it is better.",["What question might an investor ask?"]),
(B,"listening","Podcast notes",20,"Listen to a 5-minute English podcast or news clip for students. Take notes: topic, 3 key points, one new word, your opinion.",["Summarise it in two sentences.","Did you agree with the speaker? Why?"]),
(B,"listening","Listen for opinion vs fact",15,"Listen to a short talk or advert. Write down 3 facts and 3 opinions you heard.",["How did the speaker show opinions? (I think, best, should…)"]),
(B,"reading","Article analysis",25,"Read a news article for young readers. Answer: What happened? Who is involved? Why does it matter? What is the writer's tone?",["Find two words that show the writer's tone.","Write a new headline."]),
(B,"reading","Inference questions",20,"Read: 'Maya slammed her bag on the table, grabbed her phone and stared at the screen without saying a word. Her brother quietly left the room.' Answer the questions.",["How is Maya feeling? Give evidence.","Why did her brother leave?","What might have happened before this?"]),
(B,"reading","Poem response",20,"Read a short poem your trainer shares. Identify the theme, one simile or metaphor and how the poem makes you feel.",["Rewrite one line in your own words.","Which line is the most powerful? Why?"]),
(B,"writing","Opinion paragraph (PEEL)",25,"Write a paragraph on 'Should mobile phones be allowed in class?' using PEEL: Point, Evidence, Explain, Link.",["Underline each part of PEEL in a different colour."]),
(B,"writing","Formal email",20,"Write an email to your school principal suggesting a new club. Include a greeting, the purpose, two reasons, a polite request and a sign-off.",["Which phrases made it sound formal?"]),
(B,"writing","Story from a first line",30,"Continue this story in 200–250 words: 'The message on my phone said only three words: Don't open it.'",["Give your story a twist ending.","Check: did you use dialogue correctly?"]),
(B,"writing","Summary in 50 words",20,"Read a short article or chapter and summarise it in exactly 50 words. Keep only the most important ideas.",["What did you leave out and why?"]),
(B,"grammar","Tense review",20,"Rewrite this paragraph in the past tense: 'Every morning I wake up at six. I eat breakfast and walk to school. My friends are waiting at the gate.' Then write it in the future tense.",["Which verbs were irregular?"]),
(B,"grammar","Active and passive",20,"Change to passive: 'The chef cooked the meal.' 'Students wrote the report.' 'The storm damaged the roof.' Then change two passive sentences back to active.",["When is the passive voice useful?"]),
(B,"grammar","Conditionals",20,"Complete: 'If it rains tomorrow, …' (first conditional) and 'If I were the Prime Minister, …' (second conditional). Write 3 of each.",["What is the difference in meaning between the two types?"]),
(B,"grammar","Reported speech",20,"Change to reported speech: 'I am tired,' she said. / 'We will win,' they said. / 'Did you finish?' the teacher asked.",["What happens to the tense in reported speech?"]),
]

STAGE_ORDER = {S:0,P:1,B:2}
out=[]
for i,(st,sk,ti,mn,ins,qs) in enumerate(ITEMS):
    slug=re.sub(r'[^a-z0-9]+','-',(st[:2]+'-'+sk[:3]+'-'+ti).lower()).strip('-')[:48]
    out.append({"id":slug,"stage":st,"skill":sk,"title":ti,"minutes":mn,"instructions":ins,"questions":qs})
ids=[o["id"] for o in out]; assert len(ids)==len(set(ids))
js=("/* Little Lingos open activity bank. Original homework activities for Seeds (3.5-6), Sprouts (7-10) and Blooms (11-15).\n"
    "   Free to use and adapt. Trainers can add their academy's own activities in the app. */\n"
    "window.LL_BANK = " + json.dumps(out, ensure_ascii=False, separators=(",",":")) + ";\n")
open("site/bank.js","w").write(js)
from collections import Counter
print(len(out), Counter((o["stage"],o["skill"]) for o in out))
