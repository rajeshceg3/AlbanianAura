const attractionsData = [
    {
        name: 'Tirana',
        lat: 41.3275,
        lng: 19.8187,
        type: 'city',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Skanderbeg_square_tirana_2016.jpg/500px-Skanderbeg_square_tirana_2016.jpg',
        description: {
            en: 'Tirana, the vibrant capital of Albania, is a fascinating mix of colorful Ottoman, Fascist, and Soviet-era architecture. At its heart lies the sprawling Skanderbeg Square, surrounded by key landmarks like the Et\'hem Bey Mosque, the National History Museum with its massive socialist mural, and the striking Pyramid of Tirana. The city is famous for its lively cafe culture, buzzing nightlife in the Blloku district, and the Bunk\'Art museums—converted Cold War bunkers offering a profound glimpse into the country\'s past.',
            sq: 'Tirana, kryeqyteti i gjallë i Shqipërisë, është një përzierje magjepsëse e arkitekturës shumëngjyrëshe osmane, fashiste dhe të epokës sovjetike. Në zemër të saj shtrihet Sheshi i madh Skënderbej, i rrethuar nga pika kryesore si Xhamia e Et\'hem Beut, Muzeu Historik Kombëtar me muralin e tij masiv socialist dhe Piramida e mrekullueshme e Tiranës. Qyteti është i famshëm për kulturën e tij të gjallë të kafeneve, jetën e zhurmshme të natës në zonën e Bllokut dhe muzetë Bunk\'Art - bunkerë të konvertuar të Luftës së Ftohtë që ofrojnë një vështrim të thellë në të kaluarën e vendit.'
        },
        trivia: {
            en: 'Tirana is one of the few European capitals without a McDonald\'s restaurant.',
            sq: 'Tirana është një nga kryeqytetet e pakta evropiane pa një restorant McDonald\'s.'
        },
        crowdStats: {
            maxDensity: 0.8,
            peakHour: 19,
            duration: 120
        },
        sigint: {
            frequency: 108.5,
            type: 'AUDIO',
            encryption: 1,
            intel: {
                en: "INTERCEPT: Cold War bunker network map partially recovered. Entrance suspected near Skanderbeg Square.",
                sq: "INTERCEPTIM: Harta e rrjetit të bunkerëve të Luftës së Ftohtë pjesërisht e rikuperuar. Hyrja dyshohet pranë Sheshit Skënderbej."
            }
        },
        moreInfoLink: 'https://visit-tirana.com/',
        bookingsLink: 'https://www.albania.al/destinations/tirana/'
    },
    {
        name: 'Berat',
        lat: 40.7050,
        lng: 19.9522,
        type: 'city',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Berat_57.jpg/500px-Berat_57.jpg',
        description: {
            en: 'Berat, famously known as the "City of a Thousand Windows", is a remarkably preserved UNESCO World Heritage site. Its cascading white Ottoman houses climb up the steep hillsides, divided by the Osum River into the historic neighborhoods of Gorica and Mangalem. Above them sits the imposing Berat Castle, a still-inhabited fortress featuring ancient churches, mosques, and the renowned Onufri Iconography Museum, making it a living museum of Albania\'s diverse religious and cultural history.',
            sq: 'Berati, i njohur gjerësisht si "Qyteti i Një Mijë Dritareve", është një sit jashtëzakonisht i ruajtur i Trashëgimisë Botërore të UNESCO-s. Shtëpitë e tij të bardha osmane ngjiten në shpatet e thepisura, të ndara nga lumi Osum në lagjet historike të Goricës dhe Mangalemit. Mbi to ndodhet Kalaja madhështore e Beratit, një kështjellë ende e banuar që përmban kisha, xhami të lashta dhe Muzeun e njohur të Ikonografisë Onufri, duke e bërë atë një muze të gjallë të historisë së larmishme fetare dhe kulturore të Shqipërisë.'
        },
        trivia: {
            en: 'Berat is known as the "City of a Thousand Windows" due to the appearance of its houses.',
            sq: 'Berati njihet si "Qyteti i një mijë dritareve" për shkak të pamjes së shtëpive të tij.'
        },
        crowdStats: {
            maxDensity: 0.7,
            peakHour: 18,
            duration: 90
        },
        sigint: {
            frequency: 442.1,
            type: 'DATA',
            encryption: 2,
            intel: {
                en: "ARCHIVE: Ottoman tax records indicate a hidden cellar beneath the main citadel used for storing spice reserves.",
                sq: "ARKIV: Regjistrimet e taksave osmane tregojnë një bodrum të fshehur nën kështjellën kryesore të përdorur për ruajtjen e rezervave të erëzave."
            }
        },
        moreInfoLink: 'https://whc.unesco.org/en/list/569/',
        bookingsLink: 'https://albania.al/destinations/berat/'
    },
    {
        name: 'Gjirokastër',
        lat: 40.0755,
        lng: 20.1397,
        type: 'city',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Gjirokaster_2016-2017.jpg/500px-Gjirokaster_2016-2017.jpg',
        description: {
            en: 'Gjirokastër, the "City of Stone," is a UNESCO World Heritage site tumbling down the Drino Valley. Characterized by its unique, fortress-like Ottoman mansions with distinctive stone roofs, the steep cobblestone streets lead to a magnificent hilltop castle overlooking the valley. As the birthplace of both former communist dictator Enver Hoxha and globally acclaimed writer Ismail Kadare, Gjirokastër offers an unparalleled, immersive journey into Albania\'s complex history and architectural grandeur.',
            sq: 'Gjirokastra, "Qyteti i Gurit", është një sit i Trashëgimisë Botërore të UNESCO-s që zbret në Luginën e Drinos. Karakterizohet nga banesat e saj unike, osmane si kështjella me çati të dallueshme guri, rrugët e pjerrëta me kalldrëm të çojnë në një kështjellë madhështore në majë të kodrës me pamje nga lugina. Si vendlindja e ish-diktatorit komunist Enver Hoxha dhe shkrimtarit të njohur botëror Ismail Kadare, Gjirokastra ofron një udhëtim të pashembullt dhe gjithëpërfshirës në historinë komplekse të Shqipërisë dhe madhështinë arkitekturore.'
        },
        trivia: {
            en: 'Gjirokastër\'s name means "Silver Fortress" in Greek, and it is also known as the "City of Stone".',
            sq: 'Emri Gjirokastër do të thotë "Kalaja e Argjendtë" në greqisht, dhe njihet gjithashtu si "Qyteti i Gurit".'
        },
        crowdStats: {
            maxDensity: 0.6,
            peakHour: 11,
            duration: 120
        },
        sigint: {
            frequency: 155.3,
            type: 'MORSE',
            encryption: 2,
            intel: {
                en: "SIGNAL: Local folklore mentions a secret tunnel connecting the castle to the river valley below.",
                sq: "SINJAL: Folklori vendas përmend një tunel sekret që lidh kalanë me luginën e lumit poshtë."
            }
        },
        moreInfoLink: 'https://gjirokastra.org/',
        bookingsLink: 'https://albania.al/destinations/gjirokaster/'
    },
    {
        name: 'Albanian Riviera',
        lat: 40.1500,
        lng: 19.7833,
        type: 'beach',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Karte_Albanische_Riviera.png/500px-Karte_Albanische_Riviera.png',
        description: {
            en: 'The Albanian Riviera is a breathtaking stretch of pristine coastline along the Ionian Sea, where rugged mountains drop steeply into vivid turquoise waters. Stretching from the Llogara Pass down to the Greek border, it boasts hidden coves, dramatic sea caves, and some of the most spectacular beaches in Europe, such as Dhërmi, Himara, and Jale. Dotted with ancient olive groves, quiet fishing villages, and vibrant summer nightlife, the Riviera is the crown jewel of Albanian tourism.',
            sq: 'Riviera Shqiptare është një shtrirje lëneshme e bregdetit të paprekur përgjatë detit Jon, ku malet e thyer bien thikë në ujërat e kaltra të ndezura. Duke u shtrirë nga Qafa e Llogarasë deri në kufirin grek, ajo krenohet me gjire të fshehura, shpella dramatike deti dhe disa nga plazhet më spektakolare në Evropë, si Dhërmi, Himara dhe Jalë. E mbushur me ullishte të lashta, fshatra të qetë peshkimi dhe jetë të gjallë nate verore, Riviera është xhevahiri i kurorës së turizmit shqiptar.'
        },
        trivia: {
            en: 'The Albanian Riviera has some of the finest beaches in Europe, often compared to those in Italy and Greece.',
            sq: 'Riviera Shqiptare ka disa nga plazhet më të bukura në Evropë, shpesh të krahasuara me ato në Itali dhe Greqi.'
        },
        crowdStats: {
            maxDensity: 0.9,
            peakHour: 14,
            duration: 180
        },
        sigint: {
            frequency: 112.9,
            type: 'AUDIO',
            encryption: 1,
            intel: {
                en: "BROADCAST: Submarine base coordinates detected. Abandoned naval facility remnants visible at low tide.",
                sq: "TRANSMETIM: Koordinatat e bazës së nëndetëseve u zbuluan. Mbetjet e braktisura të objektit detar të dukshme në baticë të ulët."
            }
        },
        moreInfoLink: 'https://albania.al/destinations/albanian-riviera/',
        bookingsLink: 'https://www.lonelyplanet.com/albania/the-albanian-riviera'
    },
    {
        name: 'Llogara Pass',
        lat: 40.2000,
        lng: 19.5833,
        type: 'nature',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Parku_Komb%C3%ABtar_Llogara.svg/500px-Parku_Komb%C3%ABtar_Llogara.svg.png',
        description: {
            en: 'The Llogara Pass is a spectacular, winding mountain road reaching over 1,000 meters above sea level within the Llogara National Park. Navigating its thrilling hairpin turns reveals jaw-dropping, panoramic vistas of the Ionian coast stretching far below. The dense pine forests along the pass are a haven for hikers, paragliders, and wildlife enthusiasts, making the journey from Vlorë to the Riviera an unforgettable adventure in itself.',
            sq: 'Qafa e Llogarasë është një rrugë malore spektakolare, dredha-dredha që arrin mbi 1000 metra mbi nivelin e detit brenda Parkut Kombëtar të Llogarasë. Lundrimi në kthesat e saj emocionuese zbulon pamje panoramike të bregdetit Jon që shtrihen shumë poshtë. Pyjet e dendura me pisha përgjatë kalimit janë një parajsë për alpinistët, paragliderët dhe të apasionuarit pas kafshëve të egra, duke e bërë udhëtimin nga Vlora në Rivierë një aventurë të paharrueshme në vetvete.'
        },
        trivia: {
            en: 'Julius Caesar\'s troops passed through Llogara Pass in 48 B.C. to chase his rival Pompey.',
            sq: 'Trupat e Jul Çezarit kaluan nëpër Qafën e Llogarasë në vitin 48 para Krishtit për të ndjekur rivalin e tij Pompeun.'
        },
        crowdStats: {
            maxDensity: 0.4,
            peakHour: 12,
            duration: 30
        },
        sigint: {
            frequency: 98.2,
            type: 'DATA',
            encryption: 3,
            intel: {
                en: "HISTORIC: Caesar's path confirmed via geo-scan. Ancient roman coins found in nearby crevice.",
                sq: "HISTORIKE: Rruga e Cezarit u konfirmua përmes gjeo-skanimit. Monedha të lashta romake të gjetura në një të çarë afër."
            }
        },
        moreInfoLink: 'https://albania.al/destinations/national-parks/llogara-national-park/',
        bookingsLink: 'https://www.dangerousroads.org/eastern-europe/albania/153-llogara-pass-albania.html'
    },
    {
        name: 'Lake Ohrid (Albanian side)',
        lat: 41.0000,
        lng: 20.7000,
        type: 'nature',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Lake_Ohrid%2C_Macedonia-Albania_viewed_from_a_NASA_satellite.jpg/500px-Lake_Ohrid%2C_Macedonia-Albania_viewed_from_a_NASA_satellite.jpg',
        description: {
            en: 'Straddling the border between Albania and North Macedonia, Lake Ohrid is one of Europe\'s oldest, deepest, and most majestic lakes, protected as a dual natural and cultural UNESCO World Heritage site. Its incredibly clear, spring-fed waters are home to hundreds of endemic species, including the rare Koran fish. The peaceful Albanian town of Pogradec sits on its shores, offering a tranquil retreat with beautiful promenades and nearby attractions like the picturesque village of Lin and the ancient Drilon springs.',
            sq: 'I shtrirë në kufirin midis Shqipërisë dhe Maqedonisë së Veriut, Liqeni i Ohrit është një nga liqenet më të vjetër, më të thellë dhe më madhështor në Evropë, i mbrojtur si një sit i dyfishtë natyror dhe kulturor i Trashëgimisë Botërore të UNESCO-s. Ujërat e tij jashtëzakonisht të pastër dhe të ushqyer nga burimet janë shtëpia e qindra specieve endemike, duke përfshirë peshkun e rrallë Koran. Qyteti i qetë shqiptar i Pogradecit ndodhet në brigjet e tij, duke ofruar një vendstrehim të qetë me shëtitore të bukura dhe atraksione aty pranë, si fshati piktoresk i Linit dhe burimet e lashta të Drilonit.'
        },
        trivia: {
            en: 'Lake Ohrid is over 3 million years old and is home to more than 200 endemic species.',
            sq: 'Liqeni i Ohrit është mbi 3 milionë vjet i vjetër dhe është shtëpia e më shumë se 200 specieve endemike.'
        },
        crowdStats: {
            maxDensity: 0.6,
            peakHour: 13,
            duration: 120
        },
        sigint: {
            frequency: 220.5,
            type: 'SONAR',
            encryption: 2,
            intel: {
                en: "SONAR: Unidentified submerged structure detected at depth 150m. Possible neolithic settlement remains.",
                sq: "SONAR: Strukturë e zhytur e paidentifikuar u zbulua në thellësi 150m. Mbetje të mundshme të vendbanimeve neolitike."
            }
        },
        moreInfoLink: 'https://whc.unesco.org/en/list/99/',
        bookingsLink: 'https://albania.al/destinations/pogradec/'
    },
    {
        name: 'Theth National Park',
        lat: 42.3950,
        lng: 19.7736,
        type: 'nature',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Theth_Church_Albania.jpg/500px-Theth_Church_Albania.jpg',
        description: {
            en: 'Nestled deep within the Accursed Mountains (Albanian Alps), Theth National Park is an isolated, breathtaking paradise of dramatic alpine landscapes. Accessible via a thrilling mountain pass, the remote village of Theth is encircled by towering limestone peaks, lush valleys, and crystal-clear streams. Visitors are drawn to its iconic stone-roofed church, the historic "Lock-in Tower" tied to ancient blood feuds, and extraordinary natural wonders like the Grunas Waterfall and the vivid Blue Eye spring of Kaprre.',
            sq: 'I fshehur thellë në Bjeshkët e Namuna (Alpet Shqiptare), Parku Kombëtar i Thethit është një parajsë e izoluar dhe lëneshme e peizazheve dramatike alpine. I arritshëm nëpërmjet një kalimi malor emocionues, fshati i largët i Thethit është i rrethuar nga maja të larta gëlqerore, lugina të harlisura dhe përrenj të pastër kristal. Vizitorët tërhiqen nga kisha e tij ikonike me çati guri, "Kulla e Ngujimit" historike e lidhur me gjakmarrjet e lashta dhe mrekullitë e jashtëzakonshme natyrore si Ujëvara e Grunasit dhe burimi i gjallë Syri i Kaltër i Kaprres.'
        },
        trivia: {
            en: 'Theth is home to the "Lock-in Tower", a historical form of protection for families involved in blood feuds.',
            sq: 'Thethi është shtëpia e "Kullës së Ngujimit", një formë historike e mbrojtjes për familjet e përfshira në gjakmarrje.'
        },
        crowdStats: {
            maxDensity: 0.5,
            peakHour: 10,
            duration: 240
        },
        sigint: {
            frequency: 88.8,
            type: 'AUDIO',
            encryption: 1,
            intel: {
                en: "ECHO: Traditional polyphonic songs recorded in the valley contain coded messages about mountain passes.",
                sq: "ECHO: Këngët tradicionale polifonike të regjistruara në luginë përmbajnë mesazhe të koduara për qafat malore."
            }
        },
        moreInfoLink: 'https://thethi-guide.com/',
        bookingsLink: 'https://albania.al/destinations/theth/'
    },
    {
        name: 'Ksamil',
        lat: 39.7667,
        lng: 20.0000,
        type: 'beach',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Ksamill-1.jpg/500px-Ksamill-1.jpg',
        description: {
            en: 'Often referred to as the "Maldives of Europe," Ksamil is a highly sought-after seaside village renowned for its white sandy beaches and impossibly clear, vibrant turquoise waters. Just offshore lie four idyllic, uninhabited islands covered in lush greenery, accessible by a short swim, pedal boat, or paddleboard. Located just south of Saranda and adjacent to the Butrint National Park, Ksamil offers a perfect blend of tropical-like relaxation and vibrant beachside energy.',
            sq: 'I referuar shpesh si "Maldivet e Evropës", Ksamili është një fshat bregdetar shumë i kërkuar i njohur për plazhet e tij me rërë të bardhë dhe ujërat jashtëzakonisht të pastër e të kaltër të ndezur. Vetëm në det të hapur shtrihen katër ishuj idilik, të pabanuar, të mbuluar me gjelbërim të harlisur, të arritshëm nga një not i shkurtër, varkë me pedale ose paddleboard. I ndodhur në jug të Sarandës dhe ngjitur me Parkun Kombëtar të Butrintit, Ksamili ofron një përzierje të përsosur të relaksimit tropikal dhe energjisë së gjallë të plazhit.'
        },
        trivia: {
            en: 'The four rocky islands in Ksamil are uninhabited and can be reached by boat or even by swimming.',
            sq: 'Katër ishujt shkëmborë në Ksamil janë të pabanuar dhe mund të arrihen me varkë apo edhe me not.'
        },
        crowdStats: {
            maxDensity: 0.95,
            peakHour: 13,
            duration: 240
        },
        sigint: {
            frequency: 303.3,
            type: 'DATA',
            encryption: 1,
            intel: {
                en: "LOG: Smuggler's cove identified on the smallest island. Hidden cache of vintage maps reported.",
                sq: "LOG: Gjiri i kontrabandistëve u identifikua në ishullin më të vogël. U raportua një arkë e fshehur me harta të vjetra."
            }
        },
        moreInfoLink: 'https://albania.al/destinations/ksamil/',
        bookingsLink: 'https://www.lonelyplanet.com/albania/ksamil'
    },
    {
        name: 'Rozafa Castle',
        lat: 42.0469,
        lng: 19.4928,
        type: 'history',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Rozafa_Castle_in_July_2013_%285%29.JPG/500px-Rozafa_Castle_in_July_2013_%285%29.JPG',
        description: {
            en: 'Dominating the skyline above the northern city of Shkodër, Rozafa Castle is a massive, ancient fortress steeped in myth and history. According to a tragic legend, a woman named Rozafa was walled alive into its foundations to prevent the walls from collapsing during construction. Today, the expansive ruins offer breathtaking 360-degree views of Lake Shkodër, the convergence of the Buna and Drin rivers, and the distant Albanian Alps, making it an awe-inspiring site of strategic and cultural significance.',
            sq: 'Duke dominuar horizontin mbi qytetin verior të Shkodrës, Kalaja e Rozafës është një kështjellë e madhe, e lashtë e zhytur në mite dhe histori. Sipas një legjende tragjike, një grua e quajtur Rozafa u muros e gjallë në themelet e saj për të parandaluar shembjen e mureve gjatë ndërtimit. Sot, rrënojat e gjera ofrojnë pamje të lëneshme 360 gradë të Liqenit të Shkodrës, bashkimit të lumenjve Buna dhe Drin dhe Alpeve Shqiptare në distancë, duke e bërë atë një vend mahnitës me rëndësi strategjike dhe kulturore.'
        },
        trivia: {
            en: 'The castle\'s legend tells of a woman who was walled up in the foundations as a sacrifice for its construction.',
            sq: 'Legjenda e kalasë tregon për një grua që u murosua në themele si një sakrificë për ndërtimin e saj.'
        },
        crowdStats: {
            maxDensity: 0.7,
            peakHour: 17, // Sunset views
            duration: 90
        },
        sigint: {
            frequency: 121.2,
            type: 'AUDIO',
            encryption: 2,
            intel: {
                en: "LEGEND: Analysis of wall structure reveals a hollow chamber near the main gate. Myth or reality?",
                sq: "LEGJENDA: Analiza e strukturës së murit zbulon një dhomë boshe pranë portës kryesore. Mit apo realitet?"
            }
        },
        moreInfoLink: 'https://albania.al/destinations/shkoder/',
        bookingsLink: 'https://intoalbania.com/attraction/rozafa-castle/'
    },
    {
        name: 'Butrint',
        lat: 39.7464,
        lng: 20.0194,
        type: 'history',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Amphitheatre_of_Butrint_2009.jpg/500px-Amphitheatre_of_Butrint_2009.jpg',
        description: {
            en: 'Butrint is a mesmerizing archaeological park and UNESCO World Heritage site, offering a microcosm of Mediterranean history set within a lush national park. As you wander through its shaded ruins, you will uncover layers of civilizations, including an ancient Greek theater, a Roman forum, a Byzantine basilica with intricate mosaics, and Venetian defensive towers. Surrounded by wetlands and a tranquil lagoon, the site is not only a historical treasure but also a haven for diverse wildlife, creating a deeply atmospheric experience.',
            sq: 'Butrinti është një park arkeologjik magjepsës dhe një sit i Trashëgimisë Botërore të UNESCO-s, duke ofruar një mikrokozmos të historisë mesdhetare të vendosur brenda një parku kombëtar të harlisur. Ndërsa endeni nëpër rrënojat e tij të hijezuara, do të zbuloni shtresa qytetërimesh, duke përfshirë një teatër të lashtë grek, një forum romak, një bazilikë bizantine me mozaikë të ndërlikuar dhe kulla mbrojtëse veneciane. I rrethuar nga ligatinat dhe një lagunë e qetë, vendi nuk është vetëm një thesar historik por edhe një strehë për kafshë të egra të larmishme, duke krijuar një përvojë thellësisht atmosferike.'
        },
        trivia: {
            en: 'Butrint was abandoned in the late Middle Ages after marshes and malaria-carrying mosquitos took over the area.',
            sq: 'Butrinti u braktis në Mesjetën e vonë pasi kënetat dhe mushkonjat që mbanin malarien pushtuan zonën.'
        },
        crowdStats: {
            maxDensity: 0.6,
            peakHour: 11,
            duration: 180
        },
        sigint: {
            frequency: 450.0,
            type: 'DATA',
            encryption: 3,
            intel: {
                en: "ARCHAEOLOGY: Ground Penetrating Radar indicates extensive unexcavated ruins beneath the western swamp.",
                sq: "ARKEOLOGJI: Radari depërtues në tokë tregon rrënoja të gjera të pa gërmuara nën kënetën perëndimore."
            }
        },
        moreInfoLink: 'https://whc.unesco.org/en/list/570/',
        bookingsLink: 'https://albania.al/destinations/butrint-national-park/'
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { attractionsData };
}
