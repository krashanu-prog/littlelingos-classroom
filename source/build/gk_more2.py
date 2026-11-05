# More GK and Word power questions so every age group has 100+ in each quiz. Exec'd by gk_src.py with GK and EN in scope.
import random
R = random.Random(7)
def pick(pool, ans, n=3, avoid=()):
    c = [x for x in dict.fromkeys(pool) if x != ans and x not in avoid]
    R.shuffle(c); assert len(c) >= n, (ans, c); return c[:n]

GK["Seeds"] += [
 ("What colour is a ripe tomato?","Red",["Blue","Purple","White"]),
 ("Which animal says 'oink'?","Pig",["Cow","Duck","Cat"]),
 ("Which animal says 'baa'?","Sheep",["Dog","Hen","Lion"]),
 ("How many eyes do you have?","Two",["One","Three","Four"]),
 ("How many legs does a cow have?","Four",["Two","Six","Eight"]),
 ("Which one is a vegetable?","Potato",["Apple","Banana","Mango"]),
 ("Which one do we drink?","Water",["Bread","Rice","Stone"]),
 ("What do we use to write?","Pencil",["Spoon","Shoe","Cup"]),
 ("What colour is snow?","White",["Black","Red","Green"]),
 ("Which animal lives in water and has fins?","Fish",["Cat","Dog","Cow"]),
 ("Which one is very hot?","Fire",["Ice","Snow","Ice cream"]),
 ("Which one is a toy?","Ball",["Apple","Chair","Bed"]),
 ("What do we use to eat soup?","Spoon",["Comb","Pencil","Shoe"]),
 ("Which day comes after Saturday?","Sunday",["Monday","Friday","Tuesday"]),
 ("Which number comes after 3?","4",["2","5","7"]),
 ("Which animal has a shell and moves very slowly?","Tortoise",["Rabbit","Horse","Cheetah"]),
 ("What colour is a crow?","Black",["White","Pink","Yellow"]),
 ("Where do we cook food at home?","Kitchen",["Bathroom","Garden","Bedroom"]),
 ("What do we use to tidy our hair?","Comb",["Spoon","Plate","Cup"]),
 ("Which animal gives us milk?","Cow",["Lion","Fish","Parrot"]),
 ("What do we call the meal we eat in the morning?","Breakfast",["Dinner","Lunch","Supper"]),
 ("How many ears do you have?","Two",["One","Three","Five"]),
]
GK["Sprouts"] += [
 ("Which is the smallest planet in our solar system?","Mercury",["Mars","Venus","Earth"]),
 ("What is the capital of Karnataka?","Bengaluru",["Mysuru","Chennai","Hyderabad"]),
 ("What is the capital of Tamil Nadu?","Chennai",["Madurai","Coimbatore","Kochi"]),
 ("What is the capital of Kerala?","Thiruvananthapuram",["Kochi","Kozhikode","Chennai"]),
 ("What is the capital of Telangana?","Hyderabad",["Warangal","Vijayawada","Bengaluru"]),
 ("What is the capital of Maharashtra?","Mumbai",["Pune","Nagpur","Nashik"]),
 ("How many states does India have?","28",["25","29","32"]),
 ("Which festival is the harvest festival of Tamil Nadu?","Pongal",["Onam","Bihu","Lohri"]),
 ("Onam is mainly celebrated in which state?","Kerala",["Punjab","Assam","Gujarat"]),
 ("Which is the largest state of India by area?","Rajasthan",["Madhya Pradesh","Maharashtra","Uttar Pradesh"]),
 ("What is a baby kangaroo called?","Joey",["Cub","Kid","Calf"]),
 ("Which is the largest land animal?","Elephant",["Giraffe","Rhinoceros","Hippopotamus"]),
 ("How many legs does an insect have?","Six",["Eight","Four","Ten"]),
 ("Which planet is often called the Morning Star?","Venus",["Mars","Jupiter","Saturn"]),
 ("What is 12 × 12?","144",["124","132","154"]),
 ("How many centimetres are in a metre?","100",["10","1000","50"]),
 ("How many grams are in a kilogram?","1000",["100","10","500"]),
 ("Which sense do we use our skin for?","Touch",["Taste","Smell","Hearing"]),
 ("Which is the longest bone in the human body?","Thigh bone",["Arm bone","Rib","Backbone"]),
 ("What is the capital of the United States?","Washington, D.C.",["New York","Los Angeles","Chicago"]),
 ("Which sea lies to the west of India?","Arabian Sea",["Bay of Bengal","Red Sea","Caspian Sea"]),
 ("Which bay lies to the east of India?","Bay of Bengal",["Arabian Sea","Red Sea","Persian Gulf"]),
]
GK["Blooms"] += [
 ("What is the chemical symbol for iron?","Fe",["Ir","In","I"]),
 ("What is the chemical symbol for silver?","Ag",["Si","Sv","Au"]),
 ("Who gave the three laws of motion?","Isaac Newton",["Galileo Galilei","Albert Einstein","Nikola Tesla"]),
 ("Which part of the brain controls balance?","Cerebellum",["Cerebrum","Medulla","Hypothalamus"]),
 ("How many chromosomes do humans usually have?","46",["23","44","48"]),
 ("Who wrote 'Gitanjali'?","Rabindranath Tagore",["Premchand","R. K. Narayan","Kalidasa"]),
 ("Who wrote 'Malgudi Days'?","R. K. Narayan",["Ruskin Bond","Vikram Seth","Mulk Raj Anand"]),
 ("In which year did the First World War begin?","1914",["1918","1939","1905"]),
 ("In which year did the Second World War end?","1945",["1939","1950","1942"]),
 ("Which Article of the Indian Constitution abolishes untouchability?","Article 17",["Article 21","Article 14","Article 370"]),
 ("How many Fundamental Duties are listed in the Indian Constitution?","11",["6","10","12"]),
 ("Which gas makes up most of the Sun?","Hydrogen",["Oxygen","Nitrogen","Carbon dioxide"]),
 ("What is the SI unit of energy?","Joule",["Watt","Newton","Pascal"]),
 ("What is the SI unit of power?","Watt",["Joule","Volt","Ohm"]),
 ("What is 2 to the power 10?","1024",["1000","512","2048"]),
 ("What is the next prime number after 7?","11",["9","13","10"]),
 ("Which Mughal emperor built the Taj Mahal?","Shah Jahan",["Akbar","Aurangzeb","Babur"]),
 ("Who was the first woman Prime Minister of India?","Indira Gandhi",["Pratibha Patil","Sarojini Naidu","Sushma Swaraj"]),
 ("Which mission made India the first country to land near the Moon's south pole?","Chandrayaan-3",["Chandrayaan-1","Mangalyaan","Gaganyaan"]),
 ("What is the capital of Germany?","Berlin",["Munich","Frankfurt","Hamburg"]),
 ("Which organ produces insulin?","Pancreas",["Liver","Kidney","Stomach"]),
 ("What does 'CPU' stand for?","Central Processing Unit",["Computer Personal Unit","Central Program Utility","Core Power Unit"]),
]

# ---------------- Word power: Seeds ----------------
opp = [("tall","short"),("wet","dry"),("full","empty"),("soft","hard"),("in","out"),("clean","dirty"),("loud","quiet"),("left","right"),("light","dark"),("near","far"),("first","last"),("high","low"),("push","pull"),("win","lose"),("give","take"),("sweet","sour"),("thick","thin"),("long","short")]
seen=set()
for a,b in opp:
    q=f"What is the opposite of '{a}'?"
    if q in seen: continue
    seen.add(q); EN["Seeds"].append((q,b,pick([y for _,y in opp]+[x for x,_ in opp],b,avoid=(a,))))
rhy = [("dog","log"),("moon","spoon"),("ball","wall"),("bed","red"),("fish","dish"),("goat","boat"),("pig","wig"),("book","cook"),("ring","king"),("mouse","house"),("fan","pan"),("bell","well"),("toy","boy"),("hen","pen"),("frog","jog")]
rw=[y for _,y in rhy]
for a,b in rhy:
    EN["Seeds"].append((f"Which word rhymes with '{a}'?",b,pick([w for w in rw if w[-2:]!=b[-2:]],b)))
start=[("a","apple"),("c","cat"),("d","dog"),("e","egg"),("f","fish"),("g","goat"),("h","hat"),("i","ink"),("j","jam"),("k","kite"),("l","lion"),("n","nest"),("o","owl"),("p","pen"),("r","rain"),("t","tree"),("u","umbrella"),("v","van"),("w","water"),("z","zebra")]
sw=[w for _,w in start]
for l,w in start:
    EN["Seeds"].append((f"Which word starts with the letter '{l.upper()}'?",w,pick(sw,w)))
plur=[("cup","cups",["cupes","cupies","cup"]),("bus","buses",["buss","busies","bus"]),("fox","foxes",["foxs","foxies","fox"]),("dish","dishes",["dishs","dishies","dish"]),("toy","toys",["toies","toyes","toy"]),("man","men",["mans","manes","mens"]),("foot","feet",["foots","feets","footes"]),("sheep","sheep",["sheeps","sheepes","shoop"]),("pen","pens",["penes","penies","pen"]),("bird","birds",["birdes","birdies","bird"])]
for w,a,o in plur: EN["Seeds"].append((f"What do we call more than one '{w}'?",a,o))
babies=[("hen","chick"),("sheep","lamb"),("duck","duckling"),("horse","foal"),("goat","kid"),("lion","cub")]
for an,b in babies: EN["Seeds"].append((f"A baby {an} is called a…",b,pick([y for _,y in babies]+["puppy","kitten"],b)))

# ---------------- Word power: Sprouts ----------------
past=[("fly","flew"),("take","took"),("give","gave"),("come","came"),("buy","bought"),("think","thought"),("teach","taught"),("drink","drank"),("speak","spoke"),("break","broke"),("drive","drove"),("sleep","slept"),("tell","told"),("make","made"),("feel","felt"),("keep","kept"),("leave","left"),("win","won"),("sit","sat")]
for b,a in past:
    ed=b+"d" if b.endswith("e") else b+"ed"
    o=[x for x in dict.fromkeys([ed,a+"ed",b+"s",b+"ing"]) if x!=a][:3]
    EN["Sprouts"].append((f"Which is the past tense of '{b}'? (Yesterday I…)",a,o))
comp=[("tall","taller","tallest"),("big","bigger","biggest"),("happy","happier","happiest"),("small","smaller","smallest"),("fast","faster","fastest"),("hot","hotter","hottest"),("good","better","best"),("bad","worse","worst"),("funny","funnier","funniest"),("long","longer","longest"),("heavy","heavier","heaviest"),("far","farther","farthest")]
for b,c,s in comp:
    wrong=b+"er" if b+"er"!=c else "more "+b
    EN["Sprouts"].append((f"Complete: This one is ___ than that one. ({b})",c,[s,"more "+c,wrong if wrong not in (c,s) else "most "+b]))
syn=[("little","small"),("cross","angry"),("afraid","scared"),("clever","smart"),("finish","end"),("present","gift"),("ill","sick"),("yell","shout"),("simple","easy"),("sleepy","tired"),("wealthy","rich")]
sa=[a for a,_ in syn]
for a,w in syn:
    EN["Sprouts"].append((f"Which word means nearly the same as '{w}'?",a,pick(sa,a)))
homo=[("I can ___ the sea from here.","see",["sea","say","seed"]),("The wind ___ the leaves away.","blew",["blue","blow","blown"]),("I ___ the answer!","know",["no","now","knew"]),("Put your bag over ___.","there",["their","they're","three"]),("We ___ pizza for dinner last night.","ate",["eight","eat","eaten"]),("I have ___ hands.","two",["to","too","tow"]),("Can you ___ me the book?","pass",["past","passed","pas"]),("She bought a new pair of shoes ___ the shop.","from",["form","for","frame"])]
EN["Sprouts"] += homo
nouns=["table","river","teacher","apple","city","mountain","rabbit","pencil"]; verbs=["write","eat","bring","think","carry","build","choose","forget"]; adjs=["happy","tall","shiny","quiet","heavy","kind","tiny","brave"]
for i,n in enumerate(nouns): EN["Sprouts"].append((f"Which of these is a noun (a naming word)?",n,[verbs[i],adjs[i],verbs[(i+3)%8]]))
for i,v in enumerate(verbs): EN["Sprouts"].append((f"Which of these is a verb (a doing word)?",v,[nouns[i],adjs[i],adjs[(i+3)%8]]))
for i,a in enumerate(adjs): EN["Sprouts"].append((f"Which of these is an adjective (a describing word)?",a,[nouns[i],verbs[i],nouns[(i+3)%8]]))

# ---------------- Word power: Blooms ----------------
bsyn=[("abundant","plentiful"),("scarce","rare"),("fragile","delicate"),("crucial","vital"),("frequent","happening often"),("obvious","clear"),("diligent","hard-working"),("commence","begin"),("terminate","end"),("assist","help"),("purchase","buy"),("demonstrate","show"),("attempt","try"),("sufficient","enough"),("exhausted","very tired"),("hilarious","very funny"),("vacant","empty"),("conceal","hide")]
ba=[b for _,b in bsyn]
for w,a in bsyn: EN["Blooms"].append((f"Which word or phrase is a synonym of '{w}'?",a,pick(ba,a)))
bant=[("temporary","permanent"),("ancient","modern"),("accept","reject"),("include","exclude"),("maximum","minimum"),("increase","decrease"),("victory","defeat"),("artificial","natural"),("scarce","abundant"),("complex","simple"),("praise","criticise"),("encourage","discourage"),("visible","invisible"),("import","export"),("ascend","descend")]
bn=[b for _,b in bant]
for w,a in bant: EN["Blooms"].append((f"Which word is an antonym of '{w}'?",a,pick(bn,a)))
forms=[("explain","explanation",["explaination","explainment","explanatory"]),("describe","description",["describtion","descriptive","describement"]),("succeed","success",["succession","successful","succeedment"]),("argue","argument",["arguement","arguable","argued"]),("develop","development",["developement","developed","developable"]),("react","reaction",["reactive","reactment","reacted"]),("believe","belief",["believable","believement","beleif"]),("choose","choice",["chosen","choosement","choosy"]),("free","freedom",["freely","freeness","freedem"]),("able","ability",["ablement","ably","ableness"]),("strong","strength",["strongness","strongly","strenth"]),("long","length",["longness","lenght","longly"])]
for w,a,o in forms: EN["Blooms"].append((f"What is the noun form of '{w}'?",a,o))
def misspell(w):
    out=[];V="aeiou";rr=random.Random(w)
    for _ in range(200):
        if len(out)>=3: break
        k=rr.randrange(4); i=rr.randrange(1,len(w)-1)
        if k==0: x=w[:i]+w[i+1]+w[i]+w[i+2:]
        elif k==1: x=w[:i]+w[i+1:]
        elif k==2:
            vs=[j for j,c in enumerate(w) if c in V]; j=rr.choice(vs); x=w[:j]+rr.choice(V.replace(w[j],""))+w[j+1:]
        else: x=w[:i]+w[i]+w[i:]
        if x!=w and x not in out: out.append(x)
    return out
spell=[("receive","to get something"),("believe","to think something is true"),("government","the people who run a country"),("environment","the natural world around us"),("beginning","the start of something"),("embarrass","to make someone feel shy or silly"),("occasion","a special event"),("tomorrow","the day after today"),("immediately","straight away"),("independent","free; not controlled by others"),("conscience","the inner sense of right and wrong"),("restaurant","a place where you pay to eat a meal"),("business","the work of buying and selling"),("calendar","a chart of the days and months"),("library","a place full of books to borrow")]
for w,m in spell: EN["Blooms"].append((f"Which is the correct spelling of the word meaning '{m}'?",w,misspell(w)))
idi=[("cost an arm and a leg","be very expensive"),("on cloud nine","extremely happy"),("spill the beans","tell a secret"),("hit the books","study hard"),("let the cat out of the bag","reveal a secret by mistake"),("a blessing in disguise","something good that first seemed bad"),("call it a day","stop working for now"),("the ball is in your court","it is your turn to decide"),("bite off more than you can chew","take on too much"),("every cloud has a silver lining","something good can come from a bad situation")]
im=[m for _,m in idi]+["feel very cold","be very angry"]
for p,m in idi: EN["Blooms"].append((f"What does the idiom '{p}' mean?",m,pick(im,m)))
