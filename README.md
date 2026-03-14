# Belijdenis Quiz - React Native App

Een Android applicatie om spelenderwijs de Heidelbergse Catechismus, de Dordtse Leerregels en de Nederlandse Geloofsbelijdenis te leren via Multiple Choice vragen.

De app stuurt verdeeld over de dag meldingen/notificaties ("Tijd voor een nieuwe vraag!"), waarna je direct een willekeurige vraag krijgt voorgeschoteld met 4 keuzemogelijkheden. Door dit herhalend en gespreid over de dag te doen (Spaced Repetition-achtig) leer je de kernbegrippen veel sneller!

## Kenmerken
- **Lokale notificaties:** De app stuurt lokaal push-notificaties (geen internetverbinding nodig voor de reminders).
- **Multiple Choice:** Makkelijk instappen.
- **Score systeem:** Houdt bij hoeveel je er goed en fout hebt per sessie.
- **Uitbreidbaar:** Voeg in \`data/questions.json\` zelf gemakkelijk meer vragen of een andere vertaling toe.

## Ontwikkeling (Bouwen voor Android)
Dit is een [Expo](https://expo.dev) / React Native project.

1. Installeer afhankelijkheden:
   \`\`\`bash
   npm install
   \`\`\`
2. Start de ontwikkelomgeving:
   \`\`\`bash
   npx expo start
   \`\`\`
   Scan de QR code met de Expo Go app op je Android telefoon.

### Zelf een APK / AAB bouwen (voor Play Store of handmatige installatie)
Zorg dat je een (gratis) Expo account hebt.
\`\`\`bash
npm install -g eas-cli
eas build -p android --profile preview
\`\`\`
Hiermee krijg je direct een linkje naar een `.apk` bestand om op je Android toestel te zetten.

## Bijdragen
Voel je vrij om Pull Requests in te dienen, met name voor het toevoegen van alle Zondagen en Leerregels in \`data/questions.json\`.
