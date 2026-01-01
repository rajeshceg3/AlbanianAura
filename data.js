const attractionsData = [
    {
        name: 'Tirana',
        lat: 41.3275,
        lng: 19.8187,
        type: 'city',
        description: {
            en: 'The vibrant capital of Albania, known for its colorful buildings and lively atmosphere.',
            sq: 'Kryeqyteti i gjallë i Shqipërisë, i njohur për ndërtesat e tij shumëngjyrëshe dhe atmosferën e gjallë.'
        },
        trivia: {
            en: 'Tirana is one of the few European capitals without a McDonald\'s restaurant.',
            sq: 'Tirana është një nga kryeqytetet e pakta evropiane pa një restorant McDonald\'s.'
        },
        moreInfoLink: 'https://en.wikipedia.org/wiki/Tirana',
        bookingsLink: 'https://www.booking.com/city/al/tirana.html'
    },
    {
        name: 'Berat',
        lat: 40.7050,
        lng: 19.9522,
        type: 'city',
        description: {
            en: 'A UNESCO World Heritage site, famous for its white Ottoman houses.',
            sq: 'Një sit i Trashëgimisë Botërore të UNESCO-s, i famshëm për shtëpitë e bardha osmane.'
        },
        trivia: {
            en: 'Berat is known as the "City of a Thousand Windows" due to the appearance of its houses.',
            sq: 'Berati njihet si "Qyteti i një mijë dritareve" për shkak të pamjes së shtëpive të tij.'
        },
        moreInfoLink: 'https://en.wikipedia.org/wiki/Berat',
        bookingsLink: 'https://www.booking.com/city/al/berat.html'
    },
    {
        name: 'Gjirokastër',
        lat: 40.0755,
        lng: 20.1397,
        type: 'city',
        description: {
            en: 'A well-preserved Ottoman town with a magnificent castle and stone houses.',
            sq: 'Një qytet osman i ruajtur mirë me një kështjellë madhështore dhe shtëpi guri.'
        },
        trivia: {
            en: 'Gjirokastër\'s name means "Silver Fortress" in Greek, and it is also known as the "City of Stone".',
            sq: 'Emri Gjirokastër do të thotë "Kalaja e Argjendtë" në greqisht, dhe njihet gjithashtu si "Qyteti i Gurit".'
        },
        moreInfoLink: 'https://en.wikipedia.org/wiki/Gjirokastër',
        bookingsLink: 'https://www.booking.com/city/al/gjirokaster.html'
    },
    {
        name: 'Albanian Riviera',
        lat: 40.1500,
        lng: 19.7833,
        type: 'beach',
        description: {
            en: 'Stunning coastline with crystal clear waters and beautiful beaches.',
            sq: 'Bregdeti mahnitës me ujëra të kristalta dhe plazhe të bukura.'
        },
        trivia: {
            en: 'The Albanian Riviera has some of the finest beaches in Europe, often compared to those in Italy and Greece.',
            sq: 'Riviera Shqiptare ka disa nga plazhet më të bukura në Evropë, shpesh të krahasuara me ato në Itali dhe Greqi.'
        },
        moreInfoLink: 'https://en.wikipedia.org/wiki/Albanian_Riviera',
        bookingsLink: 'https://www.booking.com/region/al/albanian-riviera.html'
    },
    {
        name: 'Llogara Pass',
        lat: 40.2000,
        lng: 19.5833,
        type: 'nature',
        description: {
            en: 'A spectacular mountain pass with breathtaking views of the Ionian coast.',
            sq: 'Një kalim malor spektakolar me pamje mahnitëse të bregdetit Jon.'
        },
        trivia: {
            en: 'Julius Caesar\'s troops passed through Llogara Pass in 48 B.C. to chase his rival Pompey.',
            sq: 'Trupat e Jul Çezarit kaluan nëpër Qafën e Llogarasë në vitin 48 para Krishtit për të ndjekur rivalin e tij Pompeun.'
        },
        moreInfoLink: 'https://en.wikipedia.org/wiki/Llogara_Pass',
        bookingsLink: 'https://www.booking.com/hotel/al/llogara-tourist-village.html'
    },
    {
        name: 'Lake Ohrid (Albanian side)',
        lat: 41.0000,
        lng: 20.7000,
        type: 'nature',
        description: {
            en: 'One of Europe\'s oldest and deepest lakes, a UNESCO World Heritage site.',
            sq: 'Një nga liqenet më të vjetra dhe më të thella të Evropës, një sit i Trashëgimisë Botërore të UNESCO-s.'
        },
        trivia: {
            en: 'Lake Ohrid is over 3 million years old and is home to more than 200 endemic species.',
            sq: 'Liqeni i Ohrit është mbi 3 milionë vjet i vjetër dhe është shtëpia e më shumë se 200 specieve endemike.'
        },
        moreInfoLink: 'https://en.wikipedia.org/wiki/Lake_Ohrid',
        bookingsLink: 'https://www.booking.com/city/al/pogradec.html'
    },
    {
        name: 'Theth National Park',
        lat: 42.3950,
        lng: 19.7736,
        type: 'nature',
        description: {
            en: 'A stunningly beautiful area in the Albanian Alps, perfect for hiking.',
            sq: 'Një zonë mahnitëse e bukur në Alpet Shqiptare, e përkryer për ecje.'
        },
        trivia: {
            en: 'Theth is home to the "Lock-in Tower", a historical form of protection for families involved in blood feuds.',
            sq: 'Thethi është shtëpia e "Kullës së Ngujimit", një formë historike e mbrojtjes për familjet e përfshira në gjakmarrje.'
        },
        moreInfoLink: 'https://en.wikipedia.org/wiki/Theth_National_Park',
        bookingsLink: 'https://www.booking.com/city/al/theth.html'
    },
    {
        name: 'Ksamil',
        lat: 39.7667,
        lng: 20.0000,
        type: 'beach',
        description: {
            en: 'A beautiful village with pristine beaches and four small islands.',
            sq: 'Një fshat i bukur me plazhe të pacenuara dhe katër ishuj të vegjël.'
        },
        trivia: {
            en: 'The four rocky islands in Ksamil are uninhabited and can be reached by boat or even by swimming.',
            sq: 'Katër ishujt shkëmborë në Ksamil janë të pabanuar dhe mund të arrihen me varkë apo edhe me not.'
        },
        moreInfoLink: 'https://en.wikipedia.org/wiki/Ksamil',
        bookingsLink: 'https://www.booking.com/city/al/ksamil.html'
    },
    {
        name: 'Rozafa Castle',
        lat: 42.0469,
        lng: 19.4928,
        type: 'history',
        description: {
            en: 'A legendary castle near Shkodër with panoramic views.',
            sq: 'Një kështjellë legjendare pranë Shkodrës me pamje panoramike.'
        },
        trivia: {
            en: 'The castle\'s legend tells of a woman who was walled up in the foundations as a sacrifice for its construction.',
            sq: 'Legjenda e kalasë tregon për një grua që u murosua në themele si një sakrificë për ndërtimin e saj.'
        },
        moreInfoLink: 'https://en.wikipedia.org/wiki/Rozafa_Castle',
        bookingsLink: 'https://www.booking.com/city/al/shkoder.html'
    },
    {
        name: 'Butrint',
        lat: 39.7464,
        lng: 20.0194,
        type: 'history',
        description: {
            en: 'An ancient Greek and Roman city, a UNESCO World Heritage site.',
            sq: 'Një qytet i lashtë grek dhe romak, një sit i Trashëgimisë Botërore të UNESCO-s.'
        },
        trivia: {
            en: 'Butrint was abandoned in the late Middle Ages after marshes and malaria-carrying mosquitos took over the area.',
            sq: 'Butrinti u braktis në Mesjetën e vonë pasi kënetat dhe mushkonjat që mbanin malarien pushtuan zonën.'
        },
        moreInfoLink: 'https://en.wikipedia.org/wiki/Butrint',
        bookingsLink: 'https://www.booking.com/attraction/al/butrint-national-park.html'
    }
];
