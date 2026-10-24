// Original clue wording authored for OctoCross; no scraped puzzle database.
const raw = [
['space','Cosmic curiosity','A small step for your brain.','✦',`ORBIT|Curved path of a satellite
COMET|Icy visitor with a glowing tail
PLANET|A world that circles a star
GALAXY|Vast family of stars
NEBULA|Cloud of gas and dust in space
ROCKET|Vehicle propelled by escaping gases
SATURN|Planet famous for its rings
MARS|The red planet
VENUS|Planet named for the Roman goddess of love
EARTH|Our home planet
MOON|Earth's natural satellite
LUNAR|Relating to the Moon
SOLAR|Relating to the Sun
STAR|Luminous ball of plasma
METEOR|Streak of light from a space rock in our sky
CRATER|Bowl-shaped impact scar
ECLIPSE|When one celestial body obscures another
GRAVITY|Force that keeps planets in orbit
COSMOS|The universe as an ordered whole
ASTEROID|Rocky body smaller than a planet
QUASAR|Extremely bright active galactic core
PULSAR|Spinning stellar remnant with regular pulses
NOVA|A star's sudden brightening
PLUTO|Dwarf planet once counted as the ninth planet
URANUS|Planet that rotates almost on its side
NEPTUNE|Outermost of the eight planets
MERCURY|Planet closest to the Sun
APOLLO|NASA program that landed humans on the Moon
PROBE|Uncrewed craft sent to investigate space
VACUUM|Space containing very little matter
ZENITH|Point directly overhead
AXIS|Imaginary line around which a planet spins`],
['ocean','Under the surface','Dive into a sea of little discoveries.','≈',`CORAL|Tiny marine animals build this reef material
REEF|Underwater ridge built by coral or rock
SHARK|Cartilaginous fish with rows of replaceable teeth
WHALE|Large marine mammal that breathes air
DOLPHIN|Marine mammal known for echolocation
OCTOPUS|Eight-armed marine mollusc
SQUID|Marine mollusc with eight arms and two tentacles
TURTLE|Shelled reptile that may nest on beaches
SEAL|Flippered marine mammal
OTTER|Furry swimmer that may crack shells with stones
KELP|Large brown seaweed
ALGAE|Simple photosynthetic aquatic organisms
PLANKTON|Organisms that drift with water currents
TIDE|Regular rise and fall of sea level
WAVE|Moving ridge on the water's surface
CURRENT|Flowing stream within the ocean
LAGOON|Shallow water separated from the sea
ATOLL|Ring-shaped coral island
ISLAND|Land surrounded by water
COAST|Land along the edge of the sea
BEACH|Shore covered in sand or pebbles
SHELL|Hard outer covering of a mollusc
PEARL|Smooth gem formed inside some molluscs
CRAB|Crustacean that often walks sideways
LOBSTER|Large marine crustacean with a muscular tail
SHRIMP|Small swimming crustacean
ANEMONE|Marine animal named after a flower
URCHIN|Spiny round sea creature
SALMON|Fish that often returns upriver to spawn
ANCHOR|Heavy device used to hold a boat in place
SAIL|Fabric that catches wind to drive a boat
ABYSS|Very deep part of the ocean`],
['kitchen','Kitchen stories','A fresh batch of food for thought.','♨',`BASIL|Aromatic herb often used in pesto
THYME|Small-leaved herb that sounds like a duration
ROSEMARY|Woody herb with needle-like leaves
SAGE|Herb whose name also means a wise person
MINT|Herb that gives a cool taste
PEPPER|Seasoning ground from peppercorns
SALT|Seasoning made mainly of sodium chloride
SUGAR|Sweet crystals used in baking
FLOUR|Finely ground grain used in bread
YEAST|Microorganism that helps bread rise
DOUGH|Mixture kneaded before baking bread
PASTA|Italian food shaped from dough
RICE|Grain often served with curry
LENTIL|Small lens-shaped edible pulse
BEAN|Edible seed often found in a pod
CARROT|Orange root vegetable
ONION|Layered bulb that may make you cry
GARLIC|Pungent bulb divided into cloves
GINGER|Spicy rhizome used fresh or ground
LEMON|Sour yellow citrus fruit
OLIVE|Small fruit pressed to make cooking oil
TOMATO|Red fruit commonly used in savoury sauces
CHEESE|Food made by curdling milk
BUTTER|Dairy fat churned from cream
CREAM|Rich fatty layer of milk
WHISK|Tool for beating eggs or cream
LADLE|Deep spoon for serving soup
SIEVE|Mesh tool for straining ingredients
OVEN|Enclosed chamber used for baking
ROAST|Cook using dry heat
SIMMER|Cook gently just below boiling
STEAM|Cook with water vapour`],
['nature','Into the wild','Take the scenic route through words.','❋',`FOREST|Large area covered in trees
JUNGLE|Dense tropical vegetation
DESERT|Region with very little rainfall
TUNDRA|Cold treeless landscape
SAVANNA|Grassland with scattered trees
MEADOW|Open field of grasses and flowers
RIVER|Natural flowing watercourse
STREAM|Small natural watercourse
LAKE|Large inland body of water
POND|Small body of still water
VALLEY|Low land between hills
CANYON|Deep narrow valley with steep sides
SUMMIT|Highest point of a mountain
GLACIER|Slow-moving mass of ice
VOLCANO|Opening through which lava can erupt
LAVA|Molten rock at the surface
MAGMA|Molten rock beneath the surface
MOSS|Small non-flowering plant forming soft mats
FERN|Plant with fronds that reproduces by spores
LICHEN|Partnership of a fungus and a photosynthetic organism
PETAL|Often colourful part of a flower
POLLEN|Fine grains carrying plant reproductive cells
NECTAR|Sweet liquid made by flowers
ROOT|Plant part that absorbs water from soil
BRANCH|Woody limb growing from a tree trunk
BARK|Protective outer layer of a tree
SEED|Structure from which a new plant can grow
ACORN|Nut of an oak tree
MAPLE|Tree known for its syrup
CEDAR|Evergreen tree with aromatic wood
BIRCH|Tree often recognised by its peeling bark
WILLOW|Tree often seen with drooping branches`],
['music','Find your rhythm','Every clue has a little groove.','♫',`MELODY|Sequence of notes heard as a tune
RHYTHM|Pattern of beats in music
HARMONY|Notes combined to sound together
TEMPO|Speed of a piece of music
BEAT|Regular pulse in music
CHORD|Several notes sounded together
SCALE|Ordered sequence of musical pitches
OCTAVE|Interval spanning eight diatonic scale notes
TREBLE|Higher part of the musical range
BASS|Lower part of the musical range
CLEF|Symbol that identifies pitches on a staff
STAFF|Five parallel lines used to write music
REST|Written sign for a musical silence
NOTE|Symbol representing a musical sound
PIANO|Keyboard instrument with hammers and strings
GUITAR|String instrument often played with a pick
VIOLIN|Small bowed instrument held beneath the chin
CELLO|Bowed instrument played between the knees
HARP|String instrument with a triangular frame
FLUTE|Woodwind commonly held sideways
OBOE|Woodwind with a double reed
TRUMPET|Brass instrument with three valves in its common form
TROMBONE|Brass instrument usually played with a slide
DRUM|Percussion instrument with a stretched membrane
CYMBAL|Metal percussion disc
CHOIR|Group of singers
SOLO|Performance by one musician
DUET|Piece performed by two musicians
OPERA|Drama sung with orchestral accompaniment
BALLET|Stage dance often set to orchestral music
CHORUS|Repeated section of a song
VERSE|Song section whose words change between repetitions`],
['science','Bright ideas','A little experiment in curiosity.','⚛',`ATOM|Smallest unit retaining an element's chemical identity
PROTON|Positively charged particle in an atomic nucleus
NEUTRON|Uncharged particle in an atomic nucleus
ELECTRON|Negatively charged subatomic particle
MOLECULE|Two or more atoms chemically bonded
ELEMENT|Substance defined by its atomic number
CARBON|Element central to organic chemistry
OXYGEN|Element needed for human respiration
HYDROGEN|Lightest chemical element
NITROGEN|Most abundant gas in Earth's atmosphere
HELIUM|Light noble gas used in balloons
NEON|Noble gas associated with glowing signs
IRON|Metal with the chemical symbol Fe
COPPER|Reddish metal widely used in electrical wiring
SILVER|Precious metal with symbol Ag
GOLD|Precious metal with symbol Au
ENERGY|Capacity to do work
FORCE|A push or pull
MASS|Measure of an object's inertia
SPEED|Distance travelled per unit time
LIGHT|Electromagnetic radiation visible to humans
SOUND|Vibration travelling through a medium
HEAT|Energy transferred due to a temperature difference
LASER|Device producing a narrow coherent beam of light
PRISM|Optical solid that can split white light
LENS|Transparent object that focuses or spreads light
MAGNET|Object that produces a magnetic field
CIRCUIT|Complete path for electric current
VOLTAGE|Electrical potential difference
CELL|Basic structural unit of living organisms
GENE|Unit of heredity encoded in DNA
ENZYME|Biological catalyst`],
['travel','Little escapes','Pack your curiosity. Leave the rush.','⌁',`PASSPORT|Official document used for international travel
TICKET|Proof of a purchased journey or admission
LUGGAGE|Bags carried on a trip
SUITCASE|Rectangular case for travel belongings
BACKPACK|Bag carried on the shoulders
MAP|Representation of an area
COMPASS|Instrument with a needle pointing north
GUIDE|Person who leads visitors around a place
HOTEL|Establishment offering rooms to travellers
HOSTEL|Budget lodging often with shared rooms
CAMP|Place to stay in tents
TENT|Portable fabric shelter
CABIN|Small simple dwelling or room on a ship
TRAIN|Rail vehicle made of connected carriages
TRAM|Rail vehicle commonly running along city streets
FERRY|Boat carrying people across a stretch of water
PLANE|Powered fixed-wing aircraft
AIRPORT|Place where aircraft take off and land
STATION|Place where trains stop for passengers
PLATFORM|Raised area beside a railway track
HARBOR|Sheltered area where ships can anchor
BRIDGE|Structure carrying a route across an obstacle
TUNNEL|Passage built through or under something
ROUTE|Path taken to a destination
JOURNEY|Act of travelling from one place to another
VOYAGE|Long journey, especially by sea
DETOUR|Alternative route around an obstruction
BORDER|Boundary between countries
VISA|Permission allowing entry under specified conditions
CUSTOMS|Authority checking goods crossing a border
SOUVENIR|Object kept as a reminder of a trip
POSTCARD|Picture card sent without an envelope`],
['workshop','Made of ideas','A playful nod to the workshop.','⚙',`LATHE|Machine that rotates a workpiece for cutting
MILLING|Machining process using a rotating cutter
DRILL|Tool for making round holes
CHUCK|Device that grips a tool or workpiece
SPINDLE|Rotating shaft that holds a tool or workpiece
COLLET|Sleeve that tightens around a cylindrical part
VISE|Clamping device with two jaws
CLAMP|Device used to hold parts firmly together
GAUGE|Instrument used to check a dimension
CALIPER|Instrument with jaws for measuring dimensions
MICROMETER|Precision measuring instrument with a calibrated screw
TOLERANCE|Permitted variation in a dimension
DATUM|Reference used for measurement
BEVEL|Sloping edge that is not a right angle
CHAMFER|Flat angled surface cut across an edge
FILLET|Rounded internal corner
THREAD|Helical ridge on a screw
BOLT|Threaded fastener often used with a nut
RIVET|Permanent fastener formed by deforming its end
WASHER|Flat ring placed beneath a nut or bolt head
GEAR|Toothed wheel that transmits motion
SHAFT|Rod that transmits rotation
BEARING|Component supporting motion with reduced friction
PULLEY|Grooved wheel used with a belt or rope
PISTON|Sliding component inside a cylinder
VALVE|Device that controls fluid flow
TORQUE|Turning effect of a force
ALLOY|Metallic mixture of elements
STEEL|Iron alloy containing carbon
BRASS|Alloy mainly of copper and zinc
BRONZE|Alloy traditionally of copper and tin
WELD|Join materials by fusion`]
];
export const themes=raw.map(([id,title,description,icon,words])=>({id,title,description,icon,entries:words.split('\n').map(line=>{const [answer,clue]=line.split('|');return {answer,clue};})}));
