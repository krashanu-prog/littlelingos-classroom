# Little Lingos GK quiz: original general-knowledge questions by age group.
# Each: (question, correct answer, [three other options])
import json
GK = {
"Seeds": [
 ("What colour is a ripe banana?","Yellow",["Blue","Purple","Black"]),
 ("Which animal says 'moo'?","Cow",["Cat","Duck","Lion"]),
 ("How many legs does a spider have?","Eight",["Two","Four","Six"]),
 ("Which shape has three sides?","Triangle",["Circle","Square","Star"]),
 ("What do bees make?","Honey",["Milk","Bread","Juice"]),
 ("Which one can fly?","Bird",["Fish","Cow","Snail"]),
 ("What do we use to see?","Eyes",["Ears","Nose","Hands"]),
 ("What colour is grass?","Green",["Red","Orange","Pink"]),
 ("Where does a fish live?","Water",["Sky","Tree","Sand"]),
 ("What comes after Monday?","Tuesday",["Sunday","Friday","Saturday"]),
 ("How many days are in a week?","Seven",["Five","Ten","Three"]),
 ("Which fruit is red and round?","Apple",["Banana","Grapes","Coconut"]),
 ("What falls from clouds when it rains?","Water drops",["Sand","Leaves","Stones"]),
 ("Which animal is the king of the jungle in stories?","Lion",["Rabbit","Mouse","Goat"]),
 ("What do we wear on our feet?","Shoes",["Hats","Gloves","Scarves"]),
],
"Sprouts": [
 ("Which planet do we live on?","Earth",["Mars","Jupiter","Venus"]),
 ("What is the capital of India?","New Delhi",["Mumbai","Kolkata","Chennai"]),
 ("How many continents are there?","Seven",["Five","Six","Nine"]),
 ("Which is the largest ocean?","Pacific Ocean",["Indian Ocean","Atlantic Ocean","Arctic Ocean"]),
 ("What gas do plants take in from the air?","Carbon dioxide",["Oxygen","Helium","Nitrogen"]),
 ("Which is the national animal of India?","Tiger",["Elephant","Peacock","Lion"]),
 ("Which is the national bird of India?","Peacock",["Parrot","Crow","Sparrow"]),
 ("How many hours are in a day?","24",["12","20","48"]),
 ("Which is the biggest planet in our solar system?","Jupiter",["Earth","Mars","Saturn"]),
 ("What do caterpillars turn into?","Butterflies",["Bees","Frogs","Birds"]),
 ("Which organ pumps blood around the body?","Heart",["Lungs","Brain","Stomach"]),
 ("Water freezes into…","Ice",["Steam","Sand","Glass"]),
 ("Which direction does the sun rise from?","East",["West","North","South"]),
 ("How many sides does a hexagon have?","Six",["Five","Seven","Eight"]),
 ("Which is the tallest mountain in the world?","Mount Everest",["K2","Kangchenjunga","Mount Kilimanjaro"]),
 ("Which language has the most native speakers in the world?","Mandarin Chinese",["English","French","Russian"]),
],
"Blooms": [
 ("Who wrote the play 'Romeo and Juliet'?","William Shakespeare",["Charles Dickens","Jane Austen","Mark Twain"]),
 ("What is the chemical symbol for gold?","Au",["Ag","Gd","Go"]),
 ("Who is known as the 'Father of the Nation' in India?","Mahatma Gandhi",["Jawaharlal Nehru","B. R. Ambedkar","Subhas Chandra Bose"]),
 ("In which year did India become independent?","1947",["1950","1942","1935"]),
 ("What is the largest organ of the human body?","Skin",["Liver","Heart","Brain"]),
 ("Which planet is known as the Red Planet?","Mars",["Venus","Mercury","Neptune"]),
 ("What is the speed of light closest to?","300,000 km per second",["30,000 km per second","3,000 km per second","3 million km per second"]),
 ("Which is the longest river in the world?","The Nile",["The Ganga","The Mississippi","The Thames"]),
 ("Who wrote India's national anthem, 'Jana Gana Mana'?","Rabindranath Tagore",["Bankim Chandra Chattopadhyay","Sarojini Naidu","Premchand"]),
 ("What part of the cell contains DNA?","Nucleus",["Cell wall","Ribosome","Membrane"]),
 ("Which word is a synonym of 'enormous'?","Huge",["Tiny","Quick","Quiet"]),
 ("What is the plural of 'phenomenon'?","Phenomena",["Phenomenons","Phenomenas","Phenomenon"]),
 ("Which instrument measures air pressure?","Barometer",["Thermometer","Speedometer","Odometer"]),
 ("The Constitution of India came into effect on…","26 January 1950",["15 August 1947","2 October 1948","26 November 1949"]),
 ("Which is the smallest prime number?","2",["1","3","0"]),
 ("In 'She sings beautifully', what is 'beautifully'?","An adverb",["A noun","An adjective","A verb"]),
],
}
_m={};exec(open(__file__.rsplit("/",1)[0]+"/gk_more.py" if "/" in __file__ else "gk_more.py").read(),_m)
for k,v in _m["GK_MORE"].items():
    have={q for q,_,_ in GK[k]}
    GK[k]+= [x for x in v if x[0] not in have]
EN=_m["EN"]
for k,v in list(GK.items())+list(EN.items()):
    for q,a,o in v: assert len(o)==3 and a not in o, q
open("site/gk.js","w").write("/* Little Lingos GK quiz: original questions by age group. Free to use and adapt. */\nwindow.LL_GK = "+json.dumps({k:[{"q":q,"a":a,"o":o} for q,a,o in v] for k,v in GK.items()},ensure_ascii=False,separators=(",",":"))+";\nwindow.LL_EN = "+json.dumps({k:[{"q":q,"a":a,"o":o} for q,a,o in v] for k,v in EN.items()},ensure_ascii=False,separators=(",",":"))+";\n")
print({k:len(v) for k,v in GK.items()},{k:len(v) for k,v in EN.items()})
