import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import questionsData from './data/questions.json';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });

  useEffect(() => {
    registerForPushNotificationsAsync();
    loadStats();
    pickRandomQuestion();

    // Setup listener for foreground notifications
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      // Whenever notification is tapped, generate a new question
      pickRandomQuestion();
    });

    return () => subscription.remove();
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    // Schedule daily reminders (e.g., 3 times a day)
    await scheduleNotifications();
  }

  async function scheduleNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // We schedule 3 random times during the day, or just repeating every 4 hours
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📚 Belijdenis Quiz",
        body: "Tijd voor een nieuwe vraag! Weet jij het antwoord?",
      },
      trigger: {
        seconds: 4 * 60 * 60, // Every 4 hours
        repeats: true,
      },
    });
  }

  async function loadStats() {
    try {
      const stored = await AsyncStorage.getItem('@quiz_stats');
      if (stored) {
        setStats(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function saveStats(newStats) {
    try {
      await AsyncStorage.setItem('@quiz_stats', JSON.stringify(newStats));
      setStats(newStats);
    } catch (e) {
      console.error(e);
    }
  }

  function pickRandomQuestion() {
    setSelectedOption(null);
    setIsCorrect(null);
    
    const randomIdx = Math.floor(Math.random() * questionsData.length);
    const q = questionsData[randomIdx];
    
    // Shuffle options
    const allOptions = [q.correctAnswer, ...q.wrongAnswers];
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }
    
    setOptions(allOptions);
    setCurrentQuestion(q);
  }

  function handleAnswer(opt) {
    if (selectedOption !== null) return; // Prevent double tap
    
    setSelectedOption(opt);
    const correct = opt === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      saveStats({ ...stats, correct: stats.correct + 1 });
    } else {
      saveStats({ ...stats, wrong: stats.wrong + 1 });
    }
  }

  if (!currentQuestion) return null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Belijdenis Quiz</Text>
          <Text style={styles.stats}>✅ {stats.correct}   ❌ {stats.wrong}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.source}>{currentQuestion.source}</Text>
          <Text style={styles.question}>{currentQuestion.question}</Text>
        </View>

        <View style={styles.options}>
          {options.map((opt, idx) => {
            let bgColor = '#fff';
            let borderColor = '#ddd';
            let textColor = '#333';

            if (selectedOption !== null) {
              if (opt === currentQuestion.correctAnswer) {
                bgColor = '#d4edda';
                borderColor = '#28a745';
                textColor = '#155724';
              } else if (opt === selectedOption) {
                bgColor = '#f8d7da';
                borderColor = '#dc3545';
                textColor = '#721c24';
              }
            }

            return (
              <TouchableOpacity
                key={idx}
                style={[styles.optionBtn, { backgroundColor: bgColor, borderColor }]}
                onPress={() => handleAnswer(opt)}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedOption !== null && (
          <View style={styles.feedbackContainer}>
            <Text style={[styles.feedbackText, { color: isCorrect ? '#28a745' : '#dc3545' }]}>
              {isCorrect ? "Helemaal goed! 🎉" : "Helaas, dat is onjuist."}
            </Text>
            
            <TouchableOpacity style={styles.nextBtn} onPress={pickRandomQuestion}>
              <Text style={styles.nextBtnText}>Volgende Vraag ➔</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scroll: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  stats: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
  },
  source: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
    lineHeight: 28,
  },
  options: {
    gap: 12,
  },
  optionBtn: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 2,
    minHeight: 60,
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  feedbackContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  nextBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});