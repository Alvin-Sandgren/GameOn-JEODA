Planering:
Idéer för GameOn: "The Missing Variable"

FÖRSTA PLATS ÄR VAD VI SKA HA
gör du inte ditt jobb får du kicken
Var inte rädd att testa saker.
Dokumentera och sätt kommenterar i koden
tydlig koppling till fysik/matematik
Vikingatema? Fantasy influence


Pixelart är tanken



Gruppledare
Alvin Sandgren Sigma



Roller
(Ej specificerade – fylls i senare)
Oliver – Designer, Spel-ideèr
Erik - Logik
Alvin - Gruppledare, Logik 
Jeffrey - Lore, koppla tankar för design och logiken
Damien - Designer

Bedömning
Lärare


hålla er till regler


underhållning (roligt att spela)


håller temat


tydlig redovisning (tutorial)


samarbete konstant


struktur


filformat och dokumentation


OOP viktigt


varför, hur och när ingår detta?


spelbart



IDE – General Innehåll
parkour med en gnutta av turn based


2D


Banor
PixelArt



Inspiration
Metroid


Hollow Knight


Expedition 33
Slay the Spire



Spelidé
Plocka upp abilities så att de i slutändan blir komplett.


Slay the Spire-esque: man slänger in egna variabler i sina kort för att döda enemies.


Hittar CARDS (med slots) i kartan.


Sen så hittar man VARIABLES för att låsa upp abilities & lägga in sina kort i en COMBAT ENCOUNTER.


Encounters:
Spelet blir inspirerat av Pokémon typ – när spelaren rör sig i världen finns det en chans att bli "encountered" av ett monster.
 Det vill säga: varje gång spelaren tar ett steg eller rör sig genom ett visst område, finns en slumpmässig sannolikhet att ett monster möter (eller attackerar) spelaren, vilket triggar en fight.
Gamestate-system?
Spelet använder ett gamestate-system där olika tillstånd (states) representerar olika delar av spelet.
 Exempel:
Overworld State: Spelaren rör sig fritt i världen. Här kan encounters ske.


Combat State: Om ett encounter triggas byter spelet till en separat "combat canvas" (eller scen) där striden sker.


Game Over State: Om spelaren förlorar i combat övergår spelet till en game over-screen, som sedan leder tillbaka till frontpage-canvasen (menyn).


Victory State: Om spelaren vinner i combat återgår spelet till overworld-läget igen.

Mechanics/Movement:

Normala keys, wasd, cooldown bar som beeswarm? För hopp dash etc. Används med t.ex 1 2 3 eller E.




Koncept:

base movement, jump vänster höger, crouch
unlockable movement, dash, doublejump, wallglide etc
enemies, basic först en enda typ
unlockables, abilities/movement
spawn, tryck play och så faedar man in med en dialogruta över en. 
stats?
platformer map inte oändlig map
menu, tutorial controls på sidan
combat, kort? börja med, basic attack block heal
musik, menu music https://www.shutterstock.com/sv/music/search/viking 
combat music: ?
victory music: ?
gameover music: ? 
sound effects: dash, jump
Map: sidescroller, miljö? nordiskt, Biomes, skog, berg, gruva och by. fuck minimap
friction: man rör sig snabbare 
gravitation: dras mot marken
game states
viking character, ripped/fet rund med abs stora armar, börjar halvnaken bara byxor, lås upp tröja det första man gör, blond, blåa ögon, arisk. Namn: Rullande fet viking/köttbulle.

Attack = rulla in i dem
Block = Fosterställning
Heal = Be om aloevera av gudarna (Odin kompis)

Bergsgetter är base enemy


KONCEPT LÅST======














ALVIN
KATEGORI: Core Gameplay / Rörelse
 TYP: System / Design
 INNEHÅLL:
Base movement: gå vänster/höger, hoppa, ducka


Unlockable movement: dash, double jump, wall glide


Friction: man rör sig snabbare


Gravitation: dras mot marken



KATEGORI: Progression / System
 TYP: System
 INNEHÅLL:
Unlockables: abilities, rörelser, utrustning


Stats: HP, stamina, movement speed, defense (förslag)


Game states: menu, play, dialog, combat, victory, gameover



ERIK
KATEGORI: Combat System
 TYP: System
 INNEHÅLL:
Basic attacks:
 – Attack = rulla in i fienden
 – Block = fosterställning
 – Heal = be om mjöd av gudarna (Odin kompis)


Start combat mechanics: kortbaserat (attack, block, heal)


Enemies: bergsgetter (base enemy)


Unlockables: abilities och nya rörelser



DAMIEN
KATEGORI: Karaktär
 TYP: Design
 INNEHÅLL:
Namn: Rullande fet viking / köttbulle


Utseende: rund men muskulös (fet med abs, stora armar)


Start: halvnaken (bara byxor)


Första upplåsning: tröja


Hår/ögon: blond, blå ögon, nordiskt utseende



KATEGORI: Värld / Map
 TYP: Design / System
 INNEHÅLL:
Typ: sidescroller, inte oändlig


Biomes: skog, berg, gruva, by


Miljö: nordiskt tema


Ingen minimap



OLIVER
KATEGORI: Värld / Map
 TYP: Design / System
 INNEHÅLL:
(Delat ansvar med Damien och Jeffery)


Typ: sidescroller, inte oändlig


Biomes: skog, berg, gruva, by


Miljö: nordiskt tema



KATEGORI: UI / Menyer
 TYP: Design / System
 INNEHÅLL:
Main menu: play-knapp


Tutorial: kontroller visas på sidan


Spawn sequence: tryck “Play” → fade in med dialogruta över karaktären



JEFFERY
KATEGORI: Värld / Map
 TYP: Design / System
 INNEHÅLL:
(Delat ansvar med Damien och Oliver)


Typ: sidescroller, inte oändlig


Biomes: skog, berg, gruva, by


Miljö: nordiskt tema


Ingen minimap



KATEGORI: Ljud / Musik, Extra
 TYP: Audio / Design
 INNEHÅLL:
Menu music: viking-tema (Shutterstock-länk)


Combat music: ?


Victory music: ?


Gameover music: ?


Sound effects: dash, jump



KATEGORI: Lore
 TYP: Narrative
 INNEHÅLL:
(Ej specificerat än – ska utvecklas)






