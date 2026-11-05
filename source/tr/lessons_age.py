# Age-graded lessons for the three sample courses. Writes supabase/age-lessons.sql (safe to run again).
import json
C = {"Seeds": "ex-seeds", "Sprouts": "ex-sprouts", "Blooms": "ex-blooms"}
LESSONS = [
 # ---- Seeds (3.5–6): short, sing-along, point and say ----
 ("ex-s4", "Seeds", 4, "song", 10, "Animal friends",
  "Pip is visiting the farm and the zoo! Can you make each animal's sound?\n\nSay the animal's name, then make its sound. Moo like a cow, quack like a duck, roar like a lion!",
  [("cow", "a farm animal that says moo"), ("duck", "a bird that says quack"), ("lion", "a big cat that roars"), ("monkey", "an animal that swings in trees"), ("elephant", "a very big animal with a long trunk")]),
 ("ex-s5", "Seeds", 5, "song", 10, "Touch your nose!",
  "Bloom says: touch your head! Touch your nose! Clap your hands! Blink your eyes!\n\nPlay with a grown-up. They say a body part, you touch it and say the word.",
  [("head", "the top part of your body"), ("hand", "you wave and clap with it"), ("nose", "you smell with it"), ("eyes", "you see with them")]),
 ("ex-s6", "Seeds", 6, "story", 10, "Pip's family",
  "Pip lives in the garden with Mother, Father, Baby and Grandma. Grandma tells the best stories!\n\nPoint to a photo of your family and say who each person is.",
  [("mother", "your mum"), ("father", "your dad"), ("baby", "a very little child"), ("grandma", "your mum's or dad's mother")]),
 ("ex-s7", "Seeds", 7, "game", 15, "Shapes all around",
  "The sun is a circle. A window can be a square. A slice of pizza is a triangle!\n\nFind one circle, one square and one triangle at home. Point and say the shape.",
  [("circle", "a round shape"), ("square", "a shape with four equal sides"), ("triangle", "a shape with three sides"), ("star", "a shape with five points")]),
 ("ex-s8", "Seeds", 8, "game", 10, "Yummy food",
  "Buzz is hungry! What does Buzz want? A mango? Some bread? A glass of water?\n\nAt lunch, name the food on your plate in English.",
  [("mango", "a sweet yellow fruit"), ("bread", "food made from flour"), ("water", "what you drink when you are thirsty"), ("milk", "a white drink from cows")]),
 # ---- Sprouts (7–10): read, build sentences, grammar ----
 ("ex-p3", "Sprouts", 3, "speak", 15, "How do you feel?",
  "Buzz was excited about the race. Drizzle was worried it might rain. When Buzz won, everyone was proud, and nobody was angry. Pip was surprised by the big cake!\n\nSay three sentences: \"I feel … when …\". Example: \"I feel proud when I finish my homework.\"",
  [("excited", "very happy about something that will happen"), ("worried", "thinking something bad might happen"), ("proud", "happy about something you did well"), ("angry", "very cross"), ("surprised", "feeling something you did not expect")]),
 ("ex-p4", "Sprouts", 4, "story", 20, "Weather watch",
  "Drizzle read the forecast: \"Cloudy in the morning, a cool breeze at lunch, and a stormy evening with thunder.\" Pip packed an umbrella.\n\nLook outside and write a weather report for today in two sentences.",
  [("cloudy", "when clouds cover the sky"), ("breeze", "a soft, gentle wind"), ("stormy", "with strong wind and rain"), ("thunder", "the loud sound in a storm"), ("forecast", "what the weather will be like later")]),
 ("ex-p5", "Sprouts", 5, "game", 15, "Opposites race",
  "A rock is heavy, a feather is light. The early bird gets up at 5 o'clock, the late bird at 10! A lion is loud, a mouse is quiet.\n\nWrite the opposite of each word: heavy, early, quiet, hot, happy.",
  [("heavy", "hard to lift"), ("light", "easy to lift, not heavy"), ("early", "before the usual time"), ("late", "after the usual time"), ("quiet", "making very little sound")]),
 ("ex-p6", "Sprouts", 6, "story", 20, "At the market",
  "Pip went to the market with a basket and some coins. The vendor said the mangoes were ₹60. Pip tried to bargain: \"₹50, please?\" The vendor smiled and gave Pip a receipt.\n\nAct it out with a grown-up: one of you is the vendor, one is the buyer.",
  [("vendor", "a person who sells things"), ("basket", "a bag made of woven sticks"), ("coins", "round pieces of money"), ("bargain", "to ask for a lower price"), ("receipt", "a paper that shows what you paid")]),
 ("ex-p7", "Sprouts", 7, "game", 15, "Yesterday's adventure",
  "Yesterday Buzz ran to the pond, swam with the fish, ate a sandwich, wrote a letter and caught a ball!\n\nTell a grown-up five things you did yesterday. Use words like ran, ate and wrote.",
  [("ran", "the past of run"), ("swam", "the past of swim"), ("ate", "the past of eat"), ("wrote", "the past of write"), ("caught", "the past of catch")]),
 # ---- Blooms (11–15): argue, report, write formally, idioms, big ideas ----
 ("ex-b3", "Blooms", 3, "speak", 25, "Persuade like a pro",
  "A strong argument has a clear claim, a credible reason and an example. Know your audience, emphasise your best point, and conclude by repeating your claim.\n\nRecord a 90-second talk: \"Schools should start at 9 a.m.\" Convince a listener who disagrees.",
  [("argument", "a reason or set of reasons for an idea"), ("convince", "to make someone believe something"), ("audience", "the people listening or watching"), ("credible", "easy to believe and trust"), ("emphasise", "to show something is important"), ("conclude", "to end, or to decide after thinking")]),
 ("ex-b4", "Blooms", 4, "story", 25, "Be a news reporter",
  "A good reporter writes a short headline, checks every fact with a second source, and keeps bias out of the story.\n\nWrite a 100-word news report about something that happened at your school this week. Verify one fact, then summarise the story in one sentence.",
  [("headline", "the title of a news story"), ("fact", "something that is true and can be checked"), ("source", "where information comes from"), ("verify", "to check that something is true"), ("bias", "favouring one side unfairly"), ("summarise", "to give the main points in a few words")]),
 ("ex-b5", "Blooms", 5, "game", 25, "Write a formal email",
  "Formal emails are polite and clear. Start with \"Dear Ms Rao,\", say why you are writing (\"I am writing regarding…\"), make your request, mention any deadline, and end with \"Yours sincerely\".\n\nWrite a formal email to your teacher asking for one extra day for a project. Say what you will attach.",
  [("formal", "polite and serious, for school or work"), ("request", "to ask for something politely"), ("regarding", "about"), ("attach", "to add a file to an email"), ("deadline", "the last day to finish something"), ("sincerely", "used to end a formal letter")]),
 ("ex-b6", "Blooms", 6, "speak", 20, "Idioms that bloom",
  "Idioms say one thing but mean another. The test was a piece of cake. A joke can break the ice. I'm under the weather today. I eat pizza once in a blue moon. Exams are coming, time to hit the books!\n\nUse three idioms in a short story about your week, then say it aloud.",
  [("piece of cake", "very easy"), ("break the ice", "to help people start talking"), ("under the weather", "feeling a little ill"), ("once in a blue moon", "very rarely"), ("hit the books", "to study hard")]),
 ("ex-b7", "Blooms", 7, "story", 25, "Big ideas: our planet",
  "Our climate is changing. Pollution from cars and factories has a big impact, and one consequence is hotter summers. Renewable energy, like sun and wind, can help, and so can choices we make to conserve water and power.\n\nWrite a speech of 150 words: three things your family can do this month to help the planet. Give a reason for each.",
  [("climate", "the usual weather of a place over many years"), ("pollution", "dirty or harmful things in air, water or land"), ("impact", "a strong effect"), ("consequence", "a result of an action"), ("renewable", "can be used again and never runs out"), ("conserve", "to use carefully so it lasts")]),
]
rows = []
for lid, stage, order, kind, mins, title, body, vocab in LESSONS:
    d = {"body": body, "courseId": C[stage], "kind": kind, "mediaUrl": "", "minutes": mins, "order": order, "title": title,
         "vocab": "\n".join(f"{w} = {m}" for w, m in vocab), "level": stage, "sample": True, "createdAt": 1793000000000 + len(rows)}
    rows.append("  ('lessons/%s', '%s'::jsonb)" % (lid, json.dumps(d, ensure_ascii=False).replace("'", "''")))
sql = "-- Age-graded lessons for Seeds (3.5–6), Sprouts (7–10) and Blooms (11–15). Safe to run again.\ninsert into public.docs(path,data) values\n" + ",\n".join(rows) + "\non conflict (path) do nothing;\n"
open("supabase/age-lessons.sql", "w").write(sql)
tr = json.load(open("tr/tr.json"))
miss = [w for *_, v in LESSONS for w, _ in v if w.lower() not in tr]
print(len(LESSONS), "lessons; untranslated:", miss, "; bytes", len(sql))
# English meanings for the 7 original sample lessons (only if a trainer hasn't edited them; home languages come from the translation list)
EN = {
 "ex-b1": [("confident","sure that you can do something"),("opinion","what you think about something"),("because","gives the reason"),("example","something that shows what you mean")],
 "ex-b2": [("agree","to think the same as someone"),("disagree","to think differently from someone"),("reason","why something is true or happens"),("however","but; used to add a different idea")],
 "ex-p1": [("puddle","a small pool of rainwater"),("jump","to push off the ground with your legs"),("splash","water flying up when something hits it"),("careful","paying attention so nothing goes wrong")],
 "ex-p2": [("jumps","is jumping (he jumps)"),("flies","is moving through the air (a bird flies)"),("reads","is looking at words (she reads)"),("sings","is making music with the voice")],
 "ex-s1": [("hello","what you say when you meet someone"),("goodbye","what you say when you leave"),("thank you","what you say when someone helps you"),("please","the magic word when you ask")],
 "ex-s2": [("red","the colour of a tomato"),("green","the colour of grass and Pip"),("yellow","the colour of the sun"),("blue","the colour of the sky"),("pink","the colour of Bloom")],
 "ex-s3": [("one","1"),("two","2"),("three","3"),("four","4"),("five","5")],
}
import re as _re
orig = {m.group(1): json.loads(m.group(2).replace("''", "'"))["vocab"] for m in _re.finditer(r"\('lessons/([^']+)', '(.*?)'::jsonb\)", open("supabase/starter-content.sql").read())}
q = lambda s: "'" + s.replace("'", "''") + "'"
upd = "\n".join("update public.docs set data = jsonb_set(data,'{vocab}',to_jsonb(%s::text)) where path='lessons/%s' and data->>'vocab'=%s;" % (q("\n".join(f"{w} = {m}" for w, m in v)), lid, q(orig[lid])) for lid, v in EN.items())
open("supabase/age-lessons.sql", "a").write("\n-- English meanings for the original sample lessons (skipped if a trainer has changed them)\n" + upd + "\n")
print("sample updates", len(EN))
