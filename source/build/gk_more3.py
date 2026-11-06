# Top-up so every age group has 150+ GK and Word power questions. Exec'd by gk_src.py after gk_more2.py, with GK and EN in scope.
import random
R = random.Random(11)
def pick(pool, ans, n=3, avoid=()):
    c = [x for x in dict.fromkeys(pool) if x != ans and x not in avoid]; R.shuffle(c); assert len(c) >= n, (ans, c); return c[:n]
def addgk(st, items):
    have = {q for q, _, _ in GK[st]}
    for q, a, o in items:
        if q not in have: GK[st].append((q, a, o)); have.add(q)
addgk("Seeds", [
 ("What do bees make?","Honey",["Milk","Bread","Juice"]),("Which animal is very big and grey with big ears?","Elephant",["Mouse","Cat","Frog"]),
 ("What do we wear on our feet?","Shoes",["Hat","Gloves","Scarf"]),("What do we wear when it rains?","Raincoat",["Swimsuit","Crown","Apron"]),
 ("Which season is the hottest?","Summer",["Winter","Monsoon","Spring"]),("What falls from the clouds?","Rain",["Sand","Leaves","Stones"]),
 ("What shape is a ball?","Round",["Square","Triangle","Flat"]),("How many fingers are on one hand?","Five",["Four","Six","Ten"]),
 ("How many legs does a spider have?","Eight",["Six","Four","Two"]),("Which fruit is long and yellow?","Banana",["Apple","Grapes","Cherry"]),
 ("Which vegetable makes you cry when you cut it?","Onion",["Carrot","Potato","Peas"]),("Where do fish live?","In water",["In trees","In the sky","In the sand"]),
 ("What do we use to see?","Eyes",["Ears","Nose","Feet"]),("What do we use to hear?","Ears",["Eyes","Hands","Knees"]),
 ("What do we use to smell?","Nose",["Elbow","Ears","Toes"]),("What do we brush every morning?","Teeth",["Shoes","Plates","Books"]),
 ("Who flies an aeroplane?","Pilot",["Doctor","Farmer","Chef"]),("Who helps us when we are sick?","Doctor",["Pilot","Farmer","Painter"]),
 ("Who grows our food?","Farmer",["Pilot","Tailor","Driver"]),("What is the opposite of day?","Night",["Morning","Noon","Sun"]),
 ("What colour are most leaves?","Green",["Blue","Purple","Black"]),("What does a caterpillar turn into?","Butterfly",["Bee","Bird","Frog"]),
 ("Where does a bird live?","Nest",["Hive","Kennel","Stable"]),("Where does a pet dog sleep outside?","Kennel",["Nest","Hive","Pond"]),
 ("Where do bees live?","Hive",["Nest","Kennel","Stable"]),("Which month comes after January?","February",["March","December","June"]),
 ("What is frozen water called?","Ice",["Steam","Juice","Sand"]),("What do plants need to grow?","Water and sunlight",["Sweets and toys","Ice cream","Shoes"]),
 ("What do we use to cut paper?","Scissors",["Spoon","Comb","Pillow"]),("Which one floats on water?","Boat",["Stone","Key","Coin"]),
 ("Which one can fly?","Aeroplane",["Car","Bus","Train"]),("Which one is the coldest?","Ice",["Tea","Soup","Fire"]),
 ("How many wheels does a bicycle have?","Two",["Three","Four","One"]),("How many wheels does an auto-rickshaw have?","Three",["Two","Four","Six"]),
 ("On which festival do we play with colours?","Holi",["Diwali","Eid","Christmas"]),("Which festival has a decorated tree and Santa Claus?","Christmas",["Holi","Diwali","Pongal"]),
 ("What do we sleep on?","Bed",["Table","Plate","Bucket"]),("Which bird can copy what we say?","Parrot",["Crow","Sparrow","Owl"]),
 ("What do cows eat?","Grass",["Fish","Meat","Stones"]),("What do we see in the sky at night?","Moon and stars",["Rainbow","Butterflies","Kites"]),
 ("Which animal carries its baby in a pouch?","Kangaroo",["Lion","Dog","Horse"]),("What do we need to see in the dark?","A torch",["A spoon","A pillow","A shoe"]),
 ("What do we use to dry our hands?","Towel",["Plate","Book","Ball"]),("What do we use to eat rice?","Spoon or hand",["Comb","Pencil","Shoe"]),
 ("Which animal has a long tail and swings from trees?","Monkey",["Cow","Fish","Hen"]),("What do you put on a cut to keep it clean?","Bandage",["Sugar","Mud","Paint"]),
 ("Which number is the biggest?","Ten",["Two","Five","Seven"]),("What comes after Tuesday?","Wednesday",["Monday","Friday","Sunday"]),
])
addgk("Sprouts", [
 ("What is the capital of Andhra Pradesh?","Amaravati",["Visakhapatnam","Hyderabad","Tirupati"]),("What is the capital of West Bengal?","Kolkata",["Howrah","Siliguri","Durgapur"]),
 ("What is the capital of Gujarat?","Gandhinagar",["Ahmedabad","Surat","Vadodara"]),("What is the capital of Rajasthan?","Jaipur",["Jodhpur","Udaipur","Ajmer"]),
 ("What is the capital of Punjab?","Chandigarh",["Amritsar","Ludhiana","Jalandhar"]),("What is the capital of Uttar Pradesh?","Lucknow",["Kanpur","Varanasi","Agra"]),
 ("What is the capital of Bihar?","Patna",["Gaya","Bhagalpur","Muzaffarpur"]),("What is the capital of Odisha?","Bhubaneswar",["Cuttack","Puri","Rourkela"]),
 ("What is the capital of Madhya Pradesh?","Bhopal",["Indore","Gwalior","Jabalpur"]),("What is the capital of Goa?","Panaji",["Margao","Vasco da Gama","Mapusa"]),
 ("What is the capital of Japan?","Tokyo",["Osaka","Kyoto","Beijing"]),("Which is the largest continent?","Asia",["Africa","Europe","Australia"]),
 ("What do we call animals that eat only plants?","Herbivores",["Carnivores","Omnivores","Insects"]),("What do we call animals that eat only meat?","Carnivores",["Herbivores","Omnivores","Reptiles"]),
 ("What is it called when water vapour turns back into water?","Condensation",["Evaporation","Freezing","Melting"]),("What is it called when ice turns into water?","Melting",["Freezing","Boiling","Condensation"]),
 ("How many sides does a hexagon have?","Six",["Five","Seven","Eight"]),("How many days are in a leap year?","366",["365","364","360"]),
 ("What is 9 × 8?","72",["64","81","63"]),("What is half of 50?","25",["20","30","15"]),("Which of these is a prime number?","7",["8","9","10"]),
 ("What is the national fruit of India?","Mango",["Banana","Apple","Jackfruit"]),("Which festival celebrates the bond between brothers and sisters?","Raksha Bandhan",["Holi","Pongal","Onam"]),
 ("Which bird is a symbol of peace?","Dove",["Crow","Eagle","Parrot"]),("What is a group of lions called?","Pride",["Pack","Herd","Flock"]),
 ("What is a group of sheep called?","Flock",["Pride","Pack","School"]),("What is a group of fish called?","School",["Flock","Herd","Pride"]),
 ("What is a group of wolves called?","Pack",["Flock","Pride","Swarm"]),("What is a group of bees called?","Swarm",["Herd","Pack","Pride"]),
 ("Which instrument measures temperature?","Thermometer",["Barometer","Ruler","Compass"]),("Which is the hottest planet in our solar system?","Venus",["Mercury","Mars","Jupiter"]),
 ("Which game is played with a shuttlecock?","Badminton",["Tennis","Hockey","Golf"]),("In which city is the Taj Mahal?","Agra",["Delhi","Jaipur","Lucknow"]),
 ("Which famous tower is in Delhi?","Qutub Minar",["Charminar","Gateway of India","Hawa Mahal"]),("In which city is the Charminar?","Hyderabad",["Mumbai","Chennai","Kolkata"]),
 ("In which city is the Gateway of India?","Mumbai",["Delhi","Kolkata","Chennai"]),("Which city is called the Pink City?","Jaipur",["Jodhpur","Udaipur","Agra"]),
 ("Which city is known as the Silicon Valley of India?","Bengaluru",["Pune","Chennai","Kochi"]),("Which state is famous for tea gardens and the one-horned rhino?","Assam",["Kerala","Punjab","Goa"]),
 ("How many hours are in two days?","48",["24","36","72"]),("What is 1,000 minus 1?","999",["990","909","100"]),("Which shape has no corners?","Circle",["Square","Triangle","Rectangle"]),
 ("Which part of a plant takes in water from the soil?","Roots",["Leaves","Flowers","Fruits"]),("Which is the closest star to the Earth?","The Sun",["The Moon","Mars","The Pole Star"]),
 ("What is the boiling point of water at sea level?","100 °C",["50 °C","0 °C","212 °C"]),
])
addgk("Blooms", [
 ("What is the atomic number of carbon?","6",["12","8","14"]),("What is the chemical formula of common salt?","NaCl",["KCl","NaOH","HCl"]),
 ("What is the pH of pure water?","7",["0","14","1"]),("Which blood cells fight infection?","White blood cells",["Red blood cells","Platelets","Plasma"]),
 ("What is the study of earthquakes called?","Seismology",["Meteorology","Astronomy","Botany"]),("Roughly how fast does light travel?","300,000 km per second",["3,000 km per second","30,000 km per second","3 million km per second"]),
 ("Who is called the father of the Indian space programme?","Vikram Sarabhai",["Homi Bhabha","A. P. J. Abdul Kalam","Satish Dhawan"]),("In which year did India become a republic?","1950",["1947","1952","1949"]),
 ("Which House of Parliament is called the Upper House?","Rajya Sabha",["Lok Sabha","Vidhan Sabha","Gram Sabha"]),("What is the minimum voting age in India?","18",["16","21","25"]),
 ("Who appoints the Chief Justice of India?","The President",["The Prime Minister","Parliament","The Speaker"]),("Which is the largest hot desert in the world?","Sahara",["Thar","Gobi","Kalahari"]),
 ("Which country has the largest population in the world?","India",["China","USA","Indonesia"]),("Which is the smallest country in the world?","Vatican City",["Monaco","Maldives","San Marino"]),
 ("Which line divides the Earth into the Northern and Southern Hemispheres?","Equator",["Tropic of Cancer","Prime Meridian","Arctic Circle"]),("Which line passes through Greenwich in London?","Prime Meridian",["Equator","Tropic of Cancer","International Date Line"]),
 ("Which Indian state has the longest coastline?","Gujarat",["Tamil Nadu","Andhra Pradesh","Maharashtra"]),("Who wrote 'Wings of Fire'?","A. P. J. Abdul Kalam",["Arundhati Roy","Chetan Bhagat","Ruskin Bond"]),
 ("Who wrote 'Romeo and Juliet'?","William Shakespeare",["Charles Dickens","Jane Austen","Mark Twain"]),("Who painted the Mona Lisa?","Leonardo da Vinci",["Pablo Picasso","Vincent van Gogh","Michelangelo"]),
 ("Which dynasty built the Konark Sun Temple?","Eastern Ganga dynasty",["Mughals","Mauryas","Cholas"]),("Who founded the Maurya Empire?","Chandragupta Maurya",["Ashoka","Bindusara","Samudragupta"]),
 ("In which year was the Battle of Plassey fought?","1757",["1857","1764","1707"]),("In which year did the Revolt of 1857, India's first war of independence, begin?","1857",["1757","1905","1919"]),
 ("In which year did the Jallianwala Bagh massacre happen?","1919",["1920","1915","1930"]),("What does 'www' stand for?","World Wide Web",["World Web Window","Wide World Web","Web World Wide"]),
 ("Which number system do computers use?","Binary",["Decimal","Roman","Octagonal"]),("What is the square root of 144?","12",["14","11","16"]),
 ("What is 15% of 200?","30",["15","20","35"]),("What do the angles of a triangle add up to?","180°",["90°","360°","270°"]),
 ("What is π (pi) to two decimal places?","3.14",["3.41","3.12","3.16"]),("What is the largest organ of the human body?","Skin",["Liver","Heart","Brain"]),
 ("Which vitamin does our body make from sunlight?","Vitamin D",["Vitamin A","Vitamin C","Vitamin B12"]),("In which part of a plant does photosynthesis mainly happen?","Leaves",["Roots","Stem","Flowers"]),
 ("What is the currency of Japan?","Yen",["Yuan","Won","Ringgit"]),("What is the currency of the United Kingdom?","Pound sterling",["Euro","Dollar","Franc"]),
 ("Which country gave the Statue of Liberty to the USA?","France",["Britain","Spain","Italy"]),("Which planet has the Great Red Spot?","Jupiter",["Saturn","Mars","Neptune"]),
 ("Which organs filter the blood to make urine?","Kidneys",["Liver","Lungs","Heart"]),("What is the SI unit of electric current?","Ampere",["Volt","Ohm","Watt"]),
 ("What is the chemical symbol for gold?","Au",["Ag","Gd","Go"]),("Which gas do plants take in for photosynthesis?","Carbon dioxide",["Oxygen","Nitrogen","Hydrogen"]),
 ("Who discovered penicillin?","Alexander Fleming",["Louis Pasteur","Marie Curie","Edward Jenner"]),("Which is the longest river in India?","Ganga",["Godavari","Yamuna","Brahmaputra"]),
 ("What is 3 cubed (3 × 3 × 3)?","27",["9","18","81"]),("Which Indian classical dance comes from Kerala?","Kathakali",["Kathak","Bharatanatyam","Odissi"]),
])
addgk("Seeds", [
 ("What do we use to tell the time?","Clock",["Spoon","Shoe","Cup"]),("What do we carry our books to school in?","School bag",["Bucket","Pillow","Plate"]),
 ("Which one tastes sweet?","Sugar",["Salt","Chilli","Lemon"]),("Which one tastes sour?","Lemon",["Sugar","Honey","Milk"]),
 ("Which animal sleeps upside down?","Bat",["Cow","Dog","Duck"]),("What do we wear on our head to stay cool in the sun?","Cap",["Sock","Glove","Belt"]),
 ("Where do we keep milk to keep it cold?","Fridge",["Oven","Bookshelf","Washing machine"]),("What do we use to clean our teeth?","Toothbrush",["Comb","Spoon","Pencil"]),
 ("Which one is the smallest?","Ant",["Elephant","Horse","Cow"]),("Which animal is the tallest?","Giraffe",["Cat","Rabbit","Duck"]),
 ("What is a baby frog called?","Tadpole",["Puppy","Chick","Calf"]),("How many legs does a bird have?","Two",["Four","Six","Eight"]),
 ("What do we plant to grow a tree?","A seed",["A stone","A coin","A button"]),("What gives us light at home at night?","A bulb",["A pillow","A bucket","A spoon"]),
 ("What does the teacher write on the blackboard with?","Chalk",["Spoon","Paintbrush","Comb"]),("Which is the first day of the weekend?","Saturday",["Monday","Wednesday","Thursday"]),
 ("Which black and white animal eats bamboo?","Panda",["Zebra","Cow","Penguin"]),("Which one melts in the sun?","Ice cream",["Stone","Spoon","Book"]),
])
addgk("Sprouts", [
 ("What is the capital of Haryana?","Chandigarh",["Gurugram","Faridabad","Panipat"]),("What is the capital of Jharkhand?","Ranchi",["Jamshedpur","Dhanbad","Bokaro"]),
 ("What is the capital of Chhattisgarh?","Raipur",["Bilaspur","Durg","Bhilai"]),("What is the capital of Tripura?","Agartala",["Udaipur","Dharmanagar","Kailashahar"]),
 ("How many sides does an octagon have?","Eight",["Six","Seven","Ten"]),("What is 7 × 7?","49",["42","56","47"]),
 ("How many players does a football team have on the field?","Eleven",["Nine","Seven","Fifteen"]),
])
addgk("Blooms", [
 ("What is the chemical symbol for sodium?","Na",["So","Sd","S"]),("What is the SI unit of force?","Newton",["Joule","Pascal","Watt"]),
 ("Who proposed the three laws of planetary motion?","Johannes Kepler",["Nicolaus Copernicus","Galileo Galilei","Isaac Newton"]),("What is the freezing point of water in Fahrenheit?","32 °F",["0 °F","100 °F","212 °F"]),
 ("Which Indian mathematician, a Fellow of the Royal Society, is famous for number theory and infinite series?","Srinivasa Ramanujan",["Aryabhata","Bhaskara","C. R. Rao"]),
 ("Who wrote 'The Discovery of India'?","Jawaharlal Nehru",["Mahatma Gandhi","Sardar Patel","B. R. Ambedkar"]),("What is India's highest civilian award?","Bharat Ratna",["Padma Vibhushan","Padma Shri","Param Vir Chakra"]),
 ("Which Indian state was formed in 2014?","Telangana",["Uttarakhand","Jharkhand","Chhattisgarh"]),("What is the capital of Canada?","Ottawa",["Toronto","Vancouver","Montreal"]),
 ("What is the capital of Brazil?","Brasília",["Rio de Janeiro","São Paulo","Salvador"]),("Which ocean lies between Africa and Australia?","Indian Ocean",["Atlantic Ocean","Pacific Ocean","Arctic Ocean"]),
 ("What is 0.5 written as a fraction?","1/2",["1/5","2/5","1/4"]),("How many sides does a dodecagon have?","12",["10","11","20"]),
])
addgk("Blooms", [
 ("Which Indian mission orbited Mars on its first attempt in 2014?","Mangalyaan",["Chandrayaan-2","Aditya-L1","Gaganyaan"]),
 ("Which Indian mission was launched in 2023 to study the Sun?","Aditya-L1",["Mangalyaan","Chandrayaan-1","NISAR"]),
 ("In which city does South Africa's Parliament sit?","Cape Town",["Pretoria","Johannesburg","Durban"]),
 ("Which famous ancient university in Bihar was founded in the 5th century CE?","Nalanda",["Taxila","Ujjain","Kanchipuram"]),
 ("What is 12 squared?","144",["124","122","169"]),
])
# ---------------- Word power top-up ----------------
opp2=[("rich","poor"),("awake","asleep"),("front","back"),("top","bottom"),("inside","outside"),("laugh","cry"),("come","go"),("buy","sell"),("young","old"),("above","below"),("summer","winter"),("morning","evening")]
allw=[x for p in opp2 for x in p]
for a,b in opp2: EN["Seeds"].append((f"What is the opposite of '{a}'?",b,pick(allw,b,avoid=(a,))))
rhy2=[("rain","train"),("sock","clock"),("bat","mat"),("snail","tail"),("nose","rose"),("bear","chair"),("fox","box"),("bug","mug"),("duck","truck"),("kite","white"),("sand","hand"),("pin","tin")]
rw2=[y for _,y in rhy2]
for a,b in rhy2: EN["Seeds"].append((f"Which word rhymes with '{a}'?",b,pick([w for w in rw2 if w[-2:]!=b[-2:] and w[-3:]!=b[-3:]],b)))
letters=[("banana","b"),("monkey","m"),("sun","s"),("apple","a"),("tiger","t"),("duck","d"),("rabbit","r"),("goat","g"),("pencil","p"),("leaf","l"),("cake","c"),("kite","k"),("fish","f"),("horse","h"),("nest","n"),("van","v"),("window","w"),("yak","y"),("jug","j"),("zebra","z")]
for w,l in letters: EN["Seeds"].append((f"Which letter does '{w}' start with?",l,pick("abcdfghjklmnprstvwz",l)))
for w,a,o in [("bag","bags",["bages","bagies","bag"]),("star","stars",["stares","staries","star"]),("bench","benches",["benchs","benchies","bench"]),("glass","glasses",["glasss","glassies","glass"]),("lady","ladies",["ladys","ladyes","lady"])]:
    EN["Seeds"].append((f"What do we call more than one '{w}'?",a,o))
for b,a in [("fall","fell"),("grow","grew"),("know","knew"),("draw","drew"),("throw","threw"),("wear","wore"),("hide","hid"),("ring","rang"),("shake","shook"),("freeze","froze")]:
    ed=b+"d" if b.endswith("e") else b+"ed"
    EN["Sprouts"].append((f"Which is the past tense of '{b}'? (Yesterday I…)",a,[x for x in dict.fromkeys([ed,a+"ed",b+"s",b+"ing"]) if x!=a][:3]))
for b,c,s in [("cold","colder","coldest"),("young","younger","youngest"),("busy","busier","busiest"),("thin","thinner","thinnest"),("wet","wetter","wettest"),("strong","stronger","strongest")]:
    EN["Sprouts"].append((f"Complete: This one is ___ than that one. ({b})",c,[s,"more "+c,b+"er" if b+"er"!=c else "more "+b]))
syn2=[("quiet","silent"),("sad","unhappy"),("friend","pal"),("talk","speak"),("rock","stone"),("fix","mend"),("trip","journey"),("jump","hop")]
sa2=[a for a,_ in syn2]
for a,w in syn2: EN["Sprouts"].append((f"Which word means nearly the same as '{w}'?",a,pick(sa2,a)))
EN["Sprouts"] += [("The ___ is shining brightly.","sun",["son","sum","soon"]),("Please ___ here for a minute.","wait",["weight","wet","white"]),
 ("I can ___ the music.","hear",["here","hair","hare"]),("She bought a new ___ of shoes.","pair",["pear","pare","pier"]),
 ("We ate a juicy ___ after lunch.","pear",["pair","pare","peer"]),("The dog wagged its ___.","tail",["tale","tall","tell"])]
adv=[("quickly",["quick","quicker","quickest"]),("slowly",["slow","slower","slowest"]),("loudly",["loud","louder","loudest"]),("happily",["happy","happier","happiest"]),("carefully",["careful","care","carefuller"])]
for a,o in adv: EN["Sprouts"].append((f"Which word tells us how something is done (an adverb)? ({a[:3]}…)",a,o))
bsyn2=[("candid","frank"),("concise","brief"),("genuine","real"),("precise","exact"),("evident","clear"),("hesitate","pause"),("profound","deep"),("benefit","advantage"),("diverse","varied"),("persevere","keep going")]
bb=[b for _,b in bsyn2]
for w,a in bsyn2: EN["Blooms"].append((f"Which word or phrase is a synonym of '{w}'?",a,pick(bb,a)))
bant2=[("flexible","rigid"),("genuine","fake"),("reluctant","eager"),("humble","arrogant"),("concise","wordy"),("precise","vague"),("frequent","rare"),("innocent","guilty")]
bn2=[b for _,b in bant2]
for w,a in bant2: EN["Blooms"].append((f"Which word is an antonym of '{w}'?",a,pick(bn2,a)))
EN["Blooms"] += [(f"What is the noun form of '{w}'?",a,o) for w,a,o in [("assess","assessment",["assessation","assessive","assessing"]),("analyse","analysis",["analysation","analytic","analysement"]),("persuade","persuasion",["persuadement","persuasive","persuadation"]),("tolerate","tolerance",["toleration","tolerant","tolerating"]),("prove","proof",["provement","proven","provable"]),("deep","depth",["deepness","deeply","deepth"]),("wide","width",["wideness","widely","widenth"]),("brave","bravery",["braveness","bravely","bravity"])]]
def misspell(w):
    out=[];V="aeiou";rr=random.Random(w)
    for _ in range(300):
        if len(out)>=3: break
        k=rr.randrange(4); i=rr.randrange(1,len(w)-1)
        if k==0: x=w[:i]+w[i+1]+w[i]+w[i+2:]
        elif k==1: x=w[:i]+w[i+1:]
        elif k==2:
            vs=[j for j,c in enumerate(w) if c in V]; j=rr.choice(vs); x=w[:j]+rr.choice(V.replace(w[j],""))+w[j+1:]
        else: x=w[:i]+w[i]+w[i:]
        if x!=w and x not in out: out.append(x)
    return out
for w,m in [("necessary","needed"),("separate","apart; not together"),("definitely","without any doubt"),("accommodate","to provide space for"),("rhythm","a regular beat in music"),("committee","a group chosen to make decisions")]:
    EN["Blooms"].append((f"Which is the correct spelling of the word meaning '{m}'?",w,misspell(w)))
idi2=[("hit the nail on the head","say exactly the right thing"),("once bitten, twice shy","careful after a bad experience"),("burn the midnight oil","work late into the night"),("see eye to eye","agree with someone"),("in hot water","in trouble"),("a drop in the ocean","a tiny amount compared with what is needed")]
im2=[m for _,m in idi2]+["feel very sleepy","be very rich"]
for p,m in idi2: EN["Blooms"].append((f"What does the idiom '{p}' mean?",m,pick(im2,m)))
