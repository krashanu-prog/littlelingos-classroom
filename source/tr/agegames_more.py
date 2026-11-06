# More content for the age-group games so every game has 150+ questions. Exec'd at the end of agegames_src.py.
PIC.update({"zebra":"🦓","giraffe":"🦒","camel":"🐫","snake":"🐍","peacock":"🦚","crocodile":"🐊","deer":"🦌","squirrel":"🐿️","turtle":"🐢","whale":"🐳",
 "shoe":"👟","hat":"🎩","shirt":"👕","umbrella":"☂️","pencil":"✏️","box":"📦","key":"🔑","phone":"📱","boat":"⛵","plane":"✈️","house":"🏠","pen":"🖊️",
 "cry":"😭","laugh":"😂","drink":"🥤","sock":"🧦","bell":"🔔","lemon":"🍋","cherry":"🍒","strawberry":"🍓","watermelon":"🍉","pineapple":"🍍","coconut":"🥥",
 "corn":"🌽","pizza":"🍕","ice cream":"🍦","sandwich":"🥪","cookie":"🍪","honey":"🍯","chocolate":"🍫","candle":"🕯️","gift":"🎁","balloon":"🎈","teddy":"🧸",
 "drum":"🥁","guitar":"🎸","trumpet":"🎺","rocket":"🚀","bicycle":"🚲","truck":"🚚","tractor":"🚜","ship":"🚢","ambulance":"🚑","rainbow":"🌈","snowman":"⛄",
 "leaf":"🍃","mushroom":"🍄","cactus":"🌵","sunflower":"🌻","rose":"🌹","glasses":"👓","crown":"👑","scissors":"✂️","dolphin":"🐬","octopus":"🐙","shark":"🦈",
 "penguin":"🐧","kangaroo":"🦘","panda":"🐼","spider":"🕷️","snail":"🐌","ladybird":"🐞"})
SOUNDS += [("snake","hiss"),("monkey","ooh ooh aah aah"),("dolphin","click click")]
# Animal friends: (question, animal) facts
FACTS = [("Which animal has a long trunk?","elephant"),("Which animal has a very long neck?","giraffe"),("Which animal has black and white stripes?","zebra"),
 ("Which animal has a hump on its back?","camel"),("Which animal has no legs?","snake"),("Which bird has beautiful blue and green tail feathers?","peacock"),
 ("Which animal has a hard shell and swims in the sea?","turtle"),("Which slow animal leaves a slimy trail?","snail"),("Which is the biggest animal in the sea?","whale"),
 ("Which animal has a bushy tail and climbs trees?","squirrel"),("Which animal hops and carries its baby in a pouch?","kangaroo"),("Which animal loves to eat bamboo?","panda"),
 ("Which animal has eight legs and spins a web?","spider"),("Which animal has eight arms and lives in the sea?","octopus"),("Which bird cannot fly but swims in icy water?","penguin"),
 ("Which little insect is red with black spots?","ladybird"),("Which insect makes honey?","bee"),("Which insect has pretty wings and visits flowers?","butterfly"),
 ("Which animal gives us milk?","cow"),("Which animal gives us soft wool?","sheep"),("Which bird lays eggs on the farm?","hen"),("Which animal is called the king of the jungle?","lion"),
 ("Which big cat has orange fur and black stripes?","tiger"),("Which animal loves bananas and swings in trees?","monkey"),("Which animal can you ride?","horse"),
 ("Which animal has long ears and loves carrots?","rabbit"),("Which animal lives in water and has fins?","fish"),("Which green animal hops and says ribbit?","frog"),
 ("Which bird is awake at night and hoots?","owl"),("Which green bird can copy words?","parrot"),("Which big furry animal loves honey?","bear"),
 ("Which tiny animal squeaks and loves cheese?","mouse"),("Which animal has sharp teeth and lives in rivers?","crocodile"),("Which gentle forest animal has antlers?","deer"),
 ("Which clever sea animal jumps and plays?","dolphin"),("Which sea animal has a fin on its back and very sharp teeth?","shark"),("Which tiny insect works hard and carries crumbs?","ant"),
 ("Which bird says quack and swims in ponds?","duck"),("Which animal has a curly tail and rolls in mud?","pig"),("Which animal has horns and says maa?","goat"),
 ("Which pet barks and wags its tail?","dog"),("Which pet purrs and says meow?","cat"),
 ("Which animal starts life as a tadpole?","frog"),("Which animal hides inside its shell when it is scared?","turtle"),("Which bird is India's national bird?","peacock"),
 ("Which animal is India's national animal?","tiger"),("Which desert animal can go for days without water?","camel"),("Which big animal sleeps through winter and loves fish and honey?","bear"),
 ("Which bird has big eyes and can turn its head far around?","owl"),("Which animal with long ears lives in a burrow?","rabbit"),("Which sea animal squirts ink?","octopus"),
 ("Which pet loves to chase mice?","cat"),("Which pet guards the house and wags its tail?","dog"),("Which bird waddles on the ice?","penguin"),
 ("Which animal has a big furry mane?","lion"),("Which sea animal blows water out of a hole on its back?","whale"),("Which animal saves nuts for winter?","squirrel")]
HOMES = {"sea":["fish","whale","dolphin","shark","octopus"],"farm":["cow","sheep","hen","pig","goat","horse","duck"],"jungle":["lion","tiger","monkey","elephant","snake","parrot","deer"],
 "sky":["bird","bee","butterfly","owl","parrot","peacock","ladybird"]}
HOME_Q = {"sea":"Which animal lives in the sea?","farm":"Which animal lives on a farm?","jungle":"Which animal lives in the jungle?","sky":"Which animal can fly?"}
LEGS = {"spider":8,"ant":6,"bee":6,"butterfly":6,"ladybird":6,"hen":2,"duck":2,"bird":2,"owl":2,"parrot":2,"peacock":2,"penguin":2,"cow":4,"dog":4,"cat":4,"horse":4,
 "goat":4,"sheep":4,"pig":4,"lion":4,"tiger":4,"elephant":4,"zebra":4,"giraffe":4,"camel":4,"rabbit":4,"frog":4,"bear":4,"mouse":4,"crocodile":4,"deer":4,"squirrel":4,"panda":4,"snake":0,"fish":0}
# Colour pop: emoji objects with a clear colour
OBJ_COLOUR = {"🍅":"red","🍓":"red","🍒":"red","🌹":"red","🚒":"red","🎈":"red","🍁":"red","🌶️":"red","🐞":"red","🦀":"red",
 "🍌":"yellow","🌻":"yellow","🌽":"yellow","🐥":"yellow","🍋":"yellow","⭐":"yellow","🧀":"yellow",
 "🐸":"green","🥦":"green","🥒":"green","🍀":"green","🌵":"green","🍏":"green","🐢":"green","🫑":"green","🥝":"green","🦜":"green","🐊":"green",
 "🐳":"blue","💙":"blue","🧢":"blue","🫐":"blue","💧":"blue","🐬":"blue","💎":"blue","🌊":"blue",
 "🐷":"pink","🌸":"pink","🦩":"pink","🎀":"pink","🍊":"orange","🥕":"orange","🎃":"orange","🦊":"orange","🏀":"orange","🔥":"orange",
 "🍆":"purple","🍇":"purple","💜":"purple","🐻":"brown","🥔":"brown","🍫":"brown","🪵":"brown","🐴":"brown","🥥":"brown","🌰":"brown",
 "🎱":"black","🕷️":"black","🖤":"black","🦍":"black","☁️":"white","🥚":"white","🐑":"white","🥛":"white","⛄":"white","🦷":"white","🤍":"white","❤️":"red","💛":"yellow","💚":"green","🧡":"orange"}
MIX = [("red","yellow","orange"),("blue","yellow","green"),("red","blue","purple"),("red","white","pink")]
COUNT_THINGS += ["🦆","🍓","🚀","🧸","🐠"]
SENT += "\n" + """
The baby is sleeping in the cradle.
We fly kites on Sankranti.
My father reads the newspaper every morning.
The children are playing in the garden.
Please wash your hands before lunch.
The elephant has a very long trunk.
I like to eat mangoes in summer.
Our teacher tells us interesting stories.
The cat jumped onto the wall.
We visited the zoo last Sunday.
My brother can ride a bicycle.
The flowers smell very sweet.
Grandma makes delicious laddoos.
The moon is bright tonight.
I keep my books in my bag.
The parrot is sitting on the branch.
We celebrate Diwali with lamps.
The baby laughs when I sing.
Our school bus is yellow.
The farmer has two cows.
I water the plants every evening.
The boy is flying a red kite.
My friend shared her lunch with me.
The rabbit is eating a carrot.
We wear raincoats in the monsoon.
The doctor checked my throat.
I help my mother in the kitchen.
The squirrel climbed up the tree.
The museum was full of old things.
Please switch off the fan.
The river is very wide here.
We made a card for our teacher.
The stars twinkle in the night sky.
My uncle lives in a big city.
The puppy is chasing its tail.
I finished my homework before dinner.
The children sang a happy song.
The train stopped at the station.
My sister is drawing a rainbow.
We planted a tree in our school.
The shopkeeper gave me the change.
It was cold and windy yesterday.
The chef cooked a spicy curry.
I can count from one to hundred.
The lion is sleeping under a tree.
Our neighbour has a friendly dog.
We went to the beach on holiday.
The rocket flew into space.
My grandfather grows tomatoes in his garden.
The pencil is under the chair.
I always tidy my room on Saturday.
The peacock danced in the rain.
We watched a cricket match on TV.
The ice cream melted in the sun.
Please speak softly in the library.
The cow is eating fresh grass.
My cousin is visiting us next week.
The baby duck follows its mother.
I brush my teeth before bed.
The players cheered after the game.
The clock on the wall is broken.
We buy vegetables at the market.
The butterfly landed on a flower.
My aunt bought me a storybook."""
CLOZE += "\n" + """accomplish|With hard work, you can accomplish your goals.
adapt|Animals adapt to the cold by growing thick fur.
adequate|Make sure you get adequate sleep before an exam.
advocate|She is an advocate for clean drinking water.
alternative|If the bridge is closed, take the alternative route.
ambiguous|The question was ambiguous, so many students misunderstood it.
apparent|It became apparent that the plan would not work.
assess|Teachers assess our progress at the end of each term.
authentic|This is an authentic recipe from our grandmother's village.
benefit|Regular exercise is a great benefit to your health.
candid|He gave a candid answer about his mistakes.
coherent|Your essay needs a coherent structure with clear paragraphs.
concise|Keep your summary concise: no more than five lines.
consensus|After a long discussion, the class reached a consensus.
controversial|The new rule was controversial, and many parents objected.
criteria|The judges explained the criteria for the competition.
deduce|From the muddy shoes, the detective could deduce where he had been.
dilemma|She faced a dilemma: study for the test or go to the party.
diverse|India is a diverse country with many languages.
elaborate|Could you elaborate on your second point?
emerge|Butterflies emerge from their cocoons in spring.
enhance|Good lighting can enhance a photograph.
evident|It was evident from her smile that she had won.
exaggerate|Don't exaggerate; the fish was not that big!
flexible|Our timetable is flexible during the holidays.
fundamental|Reading is a fundamental skill for every subject.
genuine|His apology seemed genuine.
hesitate|Don't hesitate to ask if you need help.
inevitable|With no rain for months, a drought seemed inevitable.
innovative|The team built an innovative robot from recycled parts.
legitimate|She had a legitimate reason for being absent.
meticulous|The artist was meticulous about every tiny detail.
notion|The notion that girls can't do science is completely wrong.
objective|A good judge must be objective and fair.
overcome|He worked hard to overcome his fear of speaking in public.
persevere|If you persevere, you will improve.
plausible|Her excuse sounded plausible, so the teacher believed her.
precise|A recipe needs precise measurements.
prejudice|We should judge people by their actions, not by prejudice.
priority|Safety is our first priority on the school trip.
profound|The book had a profound effect on how I see the world.
rational|Try to make a rational decision, not an emotional one.
relevant|Only include facts that are relevant to the question.
reliable|A reliable friend keeps their promises.
sceptical|Scientists are sceptical until they see the evidence.
subtle|There was a subtle change in the colour of the sky.
tolerance|Tolerance means respecting people who are different from us.
versatile|Rice is a versatile food that can be cooked in many ways.
eloquent|The eloquent speaker kept the audience listening.
initiative|She showed initiative by organising a cleanliness drive.
articulate|He is articulate and explains ideas clearly.
observe|We will observe the birds through binoculars.
drought|The farmers were worried about the long drought.
biodiversity|Rainforests have amazing biodiversity."""
# Fix the sentence: patterns that make many correct/incorrect sets
FIXGEN = []
for s, v, o in [("She","like","spinach"),("He","play","cricket"),("My sister","watch","cartoons"),("Rahul","eat","eggs"),("The baby","drink","coffee"),("Our cat","enjoy","baths"),("My father","drive","fast"),("Meera","read","comics"),("The teacher","give","homework on Sundays"),("My brother","wear","glasses")]:
    ok = f"{s} doesn't {v} {o}."; FIXGEN.append((ok, [f"{s} don't {v} {o}.", f"{s} doesn't {v}s {o}.", f"{s} not {v} {o}."]))
for s, ving, base, pl in [("They","playing","play","in the park"),("We","waiting","wait","at the gate"),("The boys","running","run","on the track"),("My friends","singing","sing","on stage"),("The dogs","barking","bark","all night"),("You","laughing","laugh","at the joke"),("The girls","dancing","dance","at the wedding"),("The players","practising","practise","on the field"),("My parents","cooking","cook","together"),("The birds","chirping","chirp","in the tree")]:
    FIXGEN.append((f"{s} were {ving} {pl} when it started to rain.", [f"{s} was {ving} {pl} when it started to rain.", f"{s} is {ving} {pl} when it started to rain.", f"{s} were {base} {pl} when it started to rain."]))
for b, pp, wrong in [("finish","finished","finishing"),("eat","eaten","ate"),("write","written","wrote"),("see","seen","saw"),("take","taken","took"),("break","broken","broke"),("give","given","gave"),("go","gone","went"),("forget","forgotten","forgot"),("choose","chosen","chose")]:
    FIXGEN.append((f"I have {pp} it already.", [f"I have {wrong} it already.", f"I has {pp} it already.", f"I have {b} it already."] if wrong != b else [f"I have {b}ed it already.", f"I has {pp} it already.", f"I have {b} it already."]))
for a, b2, adj, comp, sup in [("A cheetah","a horse","fast","faster","fastest"),("Mount Everest","K2","high","higher","highest"),("The Ganga","the Yamuna","long","longer","longest"),("My bag","yours","heavy","heavier","heaviest"),("This test","the last one","easy","easier","easiest"),("Summer","winter","hot","hotter","hottest"),("Gold","silver","valuable","more valuable","most valuable"),("This story","that one","interesting","more interesting","most interesting"),("Today","yesterday","good","better","best"),("This road","the old one","bad","worse","worst")]:
    wrong1 = f"more {comp}" if not comp.startswith("more") else f"{adj}er"
    FIXGEN.append((f"{a} is {comp} than {b2}.", [f"{a} is {wrong1} than {b2}.", f"{a} is {adj} than {b2}.", f"{a} is {sup} than {b2}."]))
for n, unit in [("2015","since"),("three years","for"),("last summer","since"),("two weeks","for"),("Monday","since"),("ten minutes","for"),("2020","since"),("a long time","for"),("morning","since"),("six months","for")]:
    other = "for" if unit == "since" else "since"
    FIXGEN.append((f"We have lived here {unit} {n}." if "minutes" not in n and n != "morning" else f"I have been waiting {unit} {n}.",
                   [f"We have lived here {other} {n}." if "minutes" not in n and n != "morning" else f"I have been waiting {other} {n}.",
                    f"We live here {unit} {n}." if "minutes" not in n and n != "morning" else f"I am waiting {unit} {n}.",
                    f"We are living here {unit} {n}." if "minutes" not in n and n != "morning" else f"I waiting {unit} {n}."]))
for thing in ["cars","people","mistakes","sweets","chairs","students","trees","books","questions","birds"]:
    FIXGEN.append((f"There are fewer {thing} here today.", [f"There are less {thing} here today.", f"There is fewer {thing} here today.", f"There are fewest {thing} here today."]))
for n in ["dog wagged its tail","bird built its nest","company changed its logo","school opened its gates","tree lost its leaves","car lost its wheel","phone lost its charge","team won its match","country celebrated its birthday","cat licked its paw"]:
    s1 = f"The {n}."; FIXGEN.append((s1, [s1.replace(" its ", " it's "), s1.replace(" its ", " its' "), s1.replace(" its ", " it ")]))
for who, what in [("The children","bags"),("My neighbours","car"),("The players","shoes"),("The twins","bikes"),("The girls","books"),("My cousins","house"),("The students","projects"),("The farmers","fields"),("The singers","songs"),("The pilots","uniforms")]:
    FIXGEN.append((f"{who} forgot their {what}.", [f"{who} forgot there {what}.", f"{who} forgot they're {what}.", f"{who} forgetted their {what}."]))
for b, p, obj in [("go","went","to the park"),("buy","bought","fresh mangoes"),("catch","caught","a big fish"),("teach","taught","Grandma a new game"),("think","thought","about the puzzle"),("swim","swam","in the lake"),("run","ran","to the bus stop"),("bring","brought","snacks for everyone"),("speak","spoke","to the principal"),("drive","drove","to Pune")]:
    wrongb = f"{b}d" if b.endswith("e") else f"{b}ed"
    FIXGEN.append((f"Yesterday we {p} {obj}.", [f"Yesterday we {wrongb} {obj}.", f"Yesterday we {p}ed {obj}.", f"Yesterday we {b} {obj}."]))
for grp, item in [("students","a laptop"),("players","a jersey"),("girls","a ticket"),("houses","a garden"),("boys","a bicycle"),("children","a lunchbox"),("teachers","a badge"),("rooms","a window"),("books","a cover"),("dancers","a costume")]:
    FIXGEN.append((f"Each of the {grp} has {item}.", [f"Each of the {grp} have {item}.", f"Each of the {grp[:-1] if not grp.endswith('ren') else 'child'} have {item}.", f"Each {grp} has {item}."]))
for v in ["meeting you","hearing from you","seeing the results","visiting Jaipur","playing the final","reading your book","working with you","joining the club","watching the film","starting school"]:
    base = v.split()[0][:-3]; base = {"meet":"meet","hear":"hear","see":"see","visit":"visit","play":"play","read":"read","work":"work","join":"join","watch":"watch","start":"start"}.get(base, base)
    rest = " ".join(v.split()[1:])
    FIXGEN.append((f"I look forward to {v}.", [f"I look forward to {base} {rest}.", f"I am look forward to {v}.", f"I look forward {v}."]))
for s in ["The news is good today.","Mathematics is my favourite subject.","The furniture is new.","The information was useful.","My luggage is very heavy.","The advice was helpful.","The scenery is beautiful.","Physics is not easy.","The equipment is expensive.","Her hair is long."]:
    bad = s.replace(" is ", " are ").replace(" was ", " were ")
    FIXGEN.append((s, [bad, s.replace(" is ", " were ").replace(" was ", " are "), s.replace("The ", "A ").replace("My ", "A ").replace("Her ", "A ") if s.startswith(("The ","My ","Her ")) else s.replace(" is ", " be ")]))
FIXGEN += [
 ("Neither Riya nor her friends were late.",["Neither Riya nor her friends was late.","Neither Riya or her friends were late.","Neither Riya nor her friends is late."]),
 ("I have two younger brothers.",["I have two youngers brothers.","I has two younger brothers.","I have two younger brother."]),
 ("She sings better than I do.",["She sings more better than I do.","She sings best than I do.","She sing better than I do."]),
 ("He apologised for being late.",["He apologised for be late.","He apologised to being late.","He apologise for being late."]),
 ("We discussed the problem in class.",["We discussed about the problem in class.","We discuss the problem in class yesterday.","We discussing the problem in class."]),
 ("The weather was lovely, so we went out.",["The weather was lovely, so we go out yesterday.","The whether was lovely, so we went out.","The weather were lovely, so we went out."]),
 ("Please let me know if you need anything.",["Please let me know if you will need anything.","Please let me to know if you need anything.","Please let me knowing if you need anything."]),
 ("It is the most beautiful place I have ever seen.",["It is the most beautifullest place I have ever seen.","It is the more beautiful place I have ever seen.","It is the most beautiful place I have ever saw."])]
_have={a for a,_ in FIX}
FIX += [x for x in FIXGEN if x[0] not in _have]
