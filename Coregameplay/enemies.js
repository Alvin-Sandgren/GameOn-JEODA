// Definierar en klass för fiender
class enemies {
    // Konstruktor för att skapa en fiende med namn, hälsa, skada, hastighet och position/storlek
    constructor(name, health, damage, speed, x , y, w, h) {
        this.name = name;     // Fiendens namn
        this.health = health; // Fiendens hälsa
        this.damage = damage; // Skada som fienden gör
        this.speed = speed;   // Fiendens hastighet
        this.x = x;           // Fiendens x-position
        this.y = y;           // Fiendens y-position
        this.w = w;           // Fiendens bredd
        this.h = h;           // Fiendens höjd
    }
}

// Definierar en klass för geten som är en typ av fiende
class goat extends enemies {
    // Konstruktor för att skapa en get
    constructor() {
        // Anropar basklassens konstruktor med specifika värden för geten
        super("Goat", 50, 10, 5,);
        // Skapar en bild för geten
        this.img = new Image();
        this.img.src = "goat.png"; // Sätter bildens källa till "goat.png"
    }
}
