import re

with open('data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Tirana
content = re.sub(
    r"description: {\s*en: 'The vibrant capital of Albania, known for its colorful buildings and lively atmosphere.',\s*sq: 'Kryeqyteti i gjallë i Shqipërisë, i njohur për ndërtesat e tij shumëngjyrëshe dhe atmosferën e gjallë.'\s*},",
    """description: {
            en: 'Tirana, the vibrant capital of Albania, is a fascinating mix of colorful Ottoman, Fascist, and Soviet-era architecture. At its heart lies the sprawling Skanderbeg Square, surrounded by key landmarks like the Et\\'hem Bey Mosque, the National History Museum with its massive socialist mural, and the striking Pyramid of Tirana. The city is famous for its lively cafe culture, buzzing nightlife in the Blloku district, and the Bunk\\'Art museums—converted Cold War bunkers offering a profound glimpse into the country\\'s past.',
            sq: 'Tirana, kryeqyteti i gjallë i Shqipërisë, është një përzierje magjepsëse e arkitekturës shumëngjyrëshe osmane, fashiste dhe të epokës sovjetike. Në zemër të saj shtrihet Sheshi i madh Skënderbej, i rrethuar nga pika kryesore si Xhamia e Et\\'hem Beut, Muzeu Historik Kombëtar me muralin e tij masiv socialist dhe Piramida e mrekullueshme e Tiranës. Qyteti është i famshëm për kulturën e tij të gjallë të kafeneve, jetën e zhurmshme të natës në zonën e Bllokut dhe muzetë Bunk\\'Art - bunkerë të konvertuar të Luftës së Ftohtë që ofrojnë një vështrim të thellë në të kaluarën e vendit.'
        },""",
    content
)
content = re.sub(
    r"moreInfoLink: 'https://en.wikipedia.org/wiki/Tirana',\s*bookingsLink: 'https://www.booking.com/city/al/tirana.html'",
    "moreInfoLink: 'https://visit-tirana.com/',\n        bookingsLink: 'https://www.albania.al/destinations/tirana/'",
    content
)

# Replace Berat
content = re.sub(
    r"description: {\s*en: 'A UNESCO World Heritage site, famous for its white Ottoman houses.',\s*sq: 'Një sit i Trashëgimisë Botërore të UNESCO-s, i famshëm për shtëpitë e bardha osmane.'\s*},",
    """description: {
            en: 'Berat, famously known as the "City of a Thousand Windows", is a remarkably preserved UNESCO World Heritage site. Its cascading white Ottoman houses climb up the steep hillsides, divided by the Osum River into the historic neighborhoods of Gorica and Mangalem. Above them sits the imposing Berat Castle, a still-inhabited fortress featuring ancient churches, mosques, and the renowned Onufri Iconography Museum, making it a living museum of Albania\\'s diverse religious and cultural history.',
            sq: 'Berati, i njohur gjerësisht si "Qyteti i Një Mijë Dritareve", është një sit jashtëzakonisht i ruajtur i Trashëgimisë Botërore të UNESCO-s. Shtëpitë e tij të bardha osmane ngjiten në shpatet e thepisura, të ndara nga lumi Osum në lagjet historike të Goricës dhe Mangalemit. Mbi to ndodhet Kalaja madhështore e Beratit, një kështjellë ende e banuar që përmban kisha, xhami të lashta dhe Muzeun e njohur të Ikonografisë Onufri, duke e bërë atë një muze të gjallë të historisë së larmishme fetare dhe kulturore të Shqipërisë.'
        },""",
    content
)
content = re.sub(
    r"moreInfoLink: 'https://en.wikipedia.org/wiki/Berat',\s*bookingsLink: 'https://www.booking.com/city/al/berat.html'",
    "moreInfoLink: 'https://whc.unesco.org/en/list/569/',\n        bookingsLink: 'https://albania.al/destinations/berat/'",
    content
)

# Replace Gjirokastër
content = re.sub(
    r"description: {\s*en: 'A well-preserved Ottoman town with a magnificent castle and stone houses.',\s*sq: 'Një qytet osman i ruajtur mirë me një kështjellë madhështore dhe shtëpi guri.'\s*},",
    """description: {
            en: 'Gjirokastër, the "City of Stone," is a UNESCO World Heritage site tumbling down the Drino Valley. Characterized by its unique, fortress-like Ottoman mansions with distinctive stone roofs, the steep cobblestone streets lead to a magnificent hilltop castle overlooking the valley. As the birthplace of both former communist dictator Enver Hoxha and globally acclaimed writer Ismail Kadare, Gjirokastër offers an unparalleled, immersive journey into Albania\\'s complex history and architectural grandeur.',
            sq: 'Gjirokastra, "Qyteti i Gurit", është një sit i Trashëgimisë Botërore të UNESCO-s që zbret në Luginën e Drinos. Karakterizohet nga banesat e saj unike, osmane si kështjella me çati të dallueshme guri, rrugët e pjerrëta me kalldrëm të çojnë në një kështjellë madhështore në majë të kodrës me pamje nga lugina. Si vendlindja e ish-diktatorit komunist Enver Hoxha dhe shkrimtarit të njohur botëror Ismail Kadare, Gjirokastra ofron një udhëtim të pashembullt dhe gjithëpërfshirës në historinë komplekse të Shqipërisë dhe madhështinë arkitekturore.'
        },""",
    content
)
content = re.sub(
    r"moreInfoLink: 'https://en.wikipedia.org/wiki/Gjirokastër',\s*bookingsLink: 'https://www.booking.com/city/al/gjirokaster.html'",
    "moreInfoLink: 'https://gjirokastra.org/',\n        bookingsLink: 'https://albania.al/destinations/gjirokaster/'",
    content
)


# Replace Albanian Riviera
content = re.sub(
    r"description: {\s*en: 'Stunning coastline with crystal clear waters and beautiful beaches.',\s*sq: 'Bregdeti mahnitës me ujëra të kristalta dhe plazhe të bukura.'\s*},",
    """description: {
            en: 'The Albanian Riviera is a breathtaking stretch of pristine coastline along the Ionian Sea, where rugged mountains drop steeply into vivid turquoise waters. Stretching from the Llogara Pass down to the Greek border, it boasts hidden coves, dramatic sea caves, and some of the most spectacular beaches in Europe, such as Dhërmi, Himara, and Jale. Dotted with ancient olive groves, quiet fishing villages, and vibrant summer nightlife, the Riviera is the crown jewel of Albanian tourism.',
            sq: 'Riviera Shqiptare është një shtrirje lëneshme e bregdetit të paprekur përgjatë detit Jon, ku malet e thyer bien thikë në ujërat e kaltra të ndezura. Duke u shtrirë nga Qafa e Llogarasë deri në kufirin grek, ajo krenohet me gjire të fshehura, shpella dramatike deti dhe disa nga plazhet më spektakolare në Evropë, si Dhërmi, Himara dhe Jalë. E mbushur me ullishte të lashta, fshatra të qetë peshkimi dhe jetë të gjallë nate verore, Riviera është xhevahiri i kurorës së turizmit shqiptar.'
        },""",
    content
)
content = re.sub(
    r"moreInfoLink: 'https://en.wikipedia.org/wiki/Albanian_Riviera',\s*bookingsLink: 'https://www.booking.com/region/al/albanian-riviera.html'",
    "moreInfoLink: 'https://albania.al/destinations/albanian-riviera/',\n        bookingsLink: 'https://www.lonelyplanet.com/albania/the-albanian-riviera'",
    content
)


# Replace Llogara Pass
content = re.sub(
    r"description: {\s*en: 'A spectacular mountain pass with breathtaking views of the Ionian coast.',\s*sq: 'Një kalim malor spektakolar me pamje mahnitëse të bregdetit Jon.'\s*},",
    """description: {
            en: 'The Llogara Pass is a spectacular, winding mountain road reaching over 1,000 meters above sea level within the Llogara National Park. Navigating its thrilling hairpin turns reveals jaw-dropping, panoramic vistas of the Ionian coast stretching far below. The dense pine forests along the pass are a haven for hikers, paragliders, and wildlife enthusiasts, making the journey from Vlorë to the Riviera an unforgettable adventure in itself.',
            sq: 'Qafa e Llogarasë është një rrugë malore spektakolare, dredha-dredha që arrin mbi 1000 metra mbi nivelin e detit brenda Parkut Kombëtar të Llogarasë. Lundrimi në kthesat e saj emocionuese zbulon pamje panoramike të bregdetit Jon që shtrihen shumë poshtë. Pyjet e dendura me pisha përgjatë kalimit janë një parajsë për alpinistët, paragliderët dhe të apasionuarit pas kafshëve të egra, duke e bërë udhëtimin nga Vlora në Rivierë një aventurë të paharrueshme në vetvete.'
        },""",
    content
)
content = re.sub(
    r"moreInfoLink: 'https://en.wikipedia.org/wiki/Llogara_Pass',\s*bookingsLink: 'https://www.booking.com/hotel/al/llogara-tourist-village.html'",
    "moreInfoLink: 'https://albania.al/destinations/national-parks/llogara-national-park/',\n        bookingsLink: 'https://www.dangerousroads.org/eastern-europe/albania/153-llogara-pass-albania.html'",
    content
)

# Replace Lake Ohrid
content = re.sub(
    r"description: {\s*en: 'One of Europe\\'s oldest and deepest lakes, a UNESCO World Heritage site.',\s*sq: 'Një nga liqenet më të vjetra dhe më të thella të Evropës, një sit i Trashëgimisë Botërore të UNESCO-s.'\s*},",
    """description: {
            en: 'Straddling the border between Albania and North Macedonia, Lake Ohrid is one of Europe\\'s oldest, deepest, and most majestic lakes, protected as a dual natural and cultural UNESCO World Heritage site. Its incredibly clear, spring-fed waters are home to hundreds of endemic species, including the rare Koran fish. The peaceful Albanian town of Pogradec sits on its shores, offering a tranquil retreat with beautiful promenades and nearby attractions like the picturesque village of Lin and the ancient Drilon springs.',
            sq: 'I shtrirë në kufirin midis Shqipërisë dhe Maqedonisë së Veriut, Liqeni i Ohrit është një nga liqenet më të vjetër, më të thellë dhe më madhështor në Evropë, i mbrojtur si një sit i dyfishtë natyror dhe kulturor i Trashëgimisë Botërore të UNESCO-s. Ujërat e tij jashtëzakonisht të pastër dhe të ushqyer nga burimet janë shtëpia e qindra specieve endemike, duke përfshirë peshkun e rrallë Koran. Qyteti i qetë shqiptar i Pogradecit ndodhet në brigjet e tij, duke ofruar një vendstrehim të qetë me shëtitore të bukura dhe atraksione aty pranë, si fshati piktoresk i Linit dhe burimet e lashta të Drilonit.'
        },""",
    content
)
content = re.sub(
    r"moreInfoLink: 'https://en.wikipedia.org/wiki/Lake_Ohrid',\s*bookingsLink: 'https://www.booking.com/city/al/pogradec.html'",
    "moreInfoLink: 'https://whc.unesco.org/en/list/99/',\n        bookingsLink: 'https://albania.al/destinations/pogradec/'",
    content
)

# Replace Theth National Park
content = re.sub(
    r"description: {\s*en: 'A stunningly beautiful area in the Albanian Alps, perfect for hiking.',\s*sq: 'Një zonë mahnitëse e bukur në Alpet Shqiptare, e përkryer për ecje.'\s*},",
    """description: {
            en: 'Nestled deep within the Accursed Mountains (Albanian Alps), Theth National Park is an isolated, breathtaking paradise of dramatic alpine landscapes. Accessible via a thrilling mountain pass, the remote village of Theth is encircled by towering limestone peaks, lush valleys, and crystal-clear streams. Visitors are drawn to its iconic stone-roofed church, the historic "Lock-in Tower" tied to ancient blood feuds, and extraordinary natural wonders like the Grunas Waterfall and the vivid Blue Eye spring of Kaprre.',
            sq: 'I fshehur thellë në Bjeshkët e Namuna (Alpet Shqiptare), Parku Kombëtar i Thethit është një parajsë e izoluar dhe lëneshme e peizazheve dramatike alpine. I arritshëm nëpërmjet një kalimi malor emocionues, fshati i largët i Thethit është i rrethuar nga maja të larta gëlqerore, lugina të harlisura dhe përrenj të pastër kristal. Vizitorët tërhiqen nga kisha e tij ikonike me çati guri, "Kulla e Ngujimit" historike e lidhur me gjakmarrjet e lashta dhe mrekullitë e jashtëzakonshme natyrore si Ujëvara e Grunasit dhe burimi i gjallë Syri i Kaltër i Kaprres.'
        },""",
    content
)
content = re.sub(
    r"moreInfoLink: 'https://en.wikipedia.org/wiki/Theth_National_Park',\s*bookingsLink: 'https://www.booking.com/city/al/theth.html'",
    "moreInfoLink: 'https://thethi-guide.com/',\n        bookingsLink: 'https://albania.al/destinations/theth/'",
    content
)

# Replace Ksamil
content = re.sub(
    r"description: {\s*en: 'A beautiful village with pristine beaches and four small islands.',\s*sq: 'Një fshat i bukur me plazhe të pacenuara dhe katër ishuj të vegjël.'\s*},",
    """description: {
            en: 'Often referred to as the "Maldives of Europe," Ksamil is a highly sought-after seaside village renowned for its white sandy beaches and impossibly clear, vibrant turquoise waters. Just offshore lie four idyllic, uninhabited islands covered in lush greenery, accessible by a short swim, pedal boat, or paddleboard. Located just south of Saranda and adjacent to the Butrint National Park, Ksamil offers a perfect blend of tropical-like relaxation and vibrant beachside energy.',
            sq: 'I referuar shpesh si "Maldivet e Evropës", Ksamili është një fshat bregdetar shumë i kërkuar i njohur për plazhet e tij me rërë të bardhë dhe ujërat jashtëzakonisht të pastër e të kaltër të ndezur. Vetëm në det të hapur shtrihen katër ishuj idilik, të pabanuar, të mbuluar me gjelbërim të harlisur, të arritshëm nga një not i shkurtër, varkë me pedale ose paddleboard. I ndodhur në jug të Sarandës dhe ngjitur me Parkun Kombëtar të Butrintit, Ksamili ofron një përzierje të përsosur të relaksimit tropikal dhe energjisë së gjallë të plazhit.'
        },""",
    content
)
content = re.sub(
    r"moreInfoLink: 'https://en.wikipedia.org/wiki/Ksamil',\s*bookingsLink: 'https://www.booking.com/city/al/ksamil.html'",
    "moreInfoLink: 'https://albania.al/destinations/ksamil/',\n        bookingsLink: 'https://www.lonelyplanet.com/albania/ksamil'",
    content
)


# Replace Rozafa Castle
content = re.sub(
    r"description: {\s*en: 'A legendary castle near Shkodër with panoramic views.',\s*sq: 'Një kështjellë legjendare pranë Shkodrës me pamje panoramike.'\s*},",
    """description: {
            en: 'Dominating the skyline above the northern city of Shkodër, Rozafa Castle is a massive, ancient fortress steeped in myth and history. According to a tragic legend, a woman named Rozafa was walled alive into its foundations to prevent the walls from collapsing during construction. Today, the expansive ruins offer breathtaking 360-degree views of Lake Shkodër, the convergence of the Buna and Drin rivers, and the distant Albanian Alps, making it an awe-inspiring site of strategic and cultural significance.',
            sq: 'Duke dominuar horizontin mbi qytetin verior të Shkodrës, Kalaja e Rozafës është një kështjellë e madhe, e lashtë e zhytur në mite dhe histori. Sipas një legjende tragjike, një grua e quajtur Rozafa u muros e gjallë në themelet e saj për të parandaluar shembjen e mureve gjatë ndërtimit. Sot, rrënojat e gjera ofrojnë pamje të lëneshme 360 gradë të Liqenit të Shkodrës, bashkimit të lumenjve Buna dhe Drin dhe Alpeve Shqiptare në distancë, duke e bërë atë një vend mahnitës me rëndësi strategjike dhe kulturore.'
        },""",
    content
)
content = re.sub(
    r"moreInfoLink: 'https://en.wikipedia.org/wiki/Rozafa_Castle',\s*bookingsLink: 'https://www.booking.com/city/al/shkoder.html'",
    "moreInfoLink: 'https://albania.al/destinations/shkoder/',\n        bookingsLink: 'https://intoalbania.com/attraction/rozafa-castle/'",
    content
)


# Replace Butrint
content = re.sub(
    r"description: {\s*en: 'An ancient Greek and Roman city, a UNESCO World Heritage site.',\s*sq: 'Një qytet i lashtë grek dhe romak, një sit i Trashëgimisë Botërore të UNESCO-s.'\s*},",
    """description: {
            en: 'Butrint is a mesmerizing archaeological park and UNESCO World Heritage site, offering a microcosm of Mediterranean history set within a lush national park. As you wander through its shaded ruins, you will uncover layers of civilizations, including an ancient Greek theater, a Roman forum, a Byzantine basilica with intricate mosaics, and Venetian defensive towers. Surrounded by wetlands and a tranquil lagoon, the site is not only a historical treasure but also a haven for diverse wildlife, creating a deeply atmospheric experience.',
            sq: 'Butrinti është një park arkeologjik magjepsës dhe një sit i Trashëgimisë Botërore të UNESCO-s, duke ofruar një mikrokozmos të historisë mesdhetare të vendosur brenda një parku kombëtar të harlisur. Ndërsa endeni nëpër rrënojat e tij të hijezuara, do të zbuloni shtresa qytetërimesh, duke përfshirë një teatër të lashtë grek, një forum romak, një bazilikë bizantine me mozaikë të ndërlikuar dhe kulla mbrojtëse veneciane. I rrethuar nga ligatinat dhe një lagunë e qetë, vendi nuk është vetëm një thesar historik por edhe një strehë për kafshë të egra të larmishme, duke krijuar një përvojë thellësisht atmosferike.'
        },""",
    content
)
content = re.sub(
    r"moreInfoLink: 'https://en.wikipedia.org/wiki/Butrint',\s*bookingsLink: 'https://www.booking.com/attraction/al/butrint-national-park.html'",
    "moreInfoLink: 'https://whc.unesco.org/en/list/570/',\n        bookingsLink: 'https://albania.al/destinations/butrint-national-park/'",
    content
)


with open('data.js', 'w', encoding='utf-8') as f:
    f.write(content)
